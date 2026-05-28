import { logger } from '@/lib/logger';
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60; // Allow 60 seconds for AI generation (Vercel Hobby limit)

import { NextResponse } from "next/server";
import {
  generateLetterWithMistral,
  generateCoverLetterFromJob,
} from "@/lib/mistral";
import { createClient } from "@supabase/supabase-js";
import {
  ACTION_COSTS,
  calculateRemainingCredits,
  hasUnlimitedDeveloperCredits,
} from "@/lib/credits-service";
import {
  reserveCredits,
  refundCredits,
  creditReservationConflictResponse,
} from "@/lib/credit-operations";
import {
  letterGenerationSchema,
  RequestValidationError,
  safeParseBody,
} from "@/lib/validation";
import { getCachedUserCredits, invalidateUserCredits } from "@/lib/cached-queries";

// Service role client for credit operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    // ✅ AUTHENTICATION CHECK
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to create letters." },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to create letters." },
        { status: 401 },
      );
    }
    const hasUnlimitedCredits = hasUnlimitedDeveloperCredits(user.email);

    let body;
    try {
      body = await safeParseBody(request, letterGenerationSchema);
    } catch (validationError) {
      if (!(validationError instanceof RequestValidationError)) {
        throw validationError;
      }
      return NextResponse.json(
        { error: validationError.message, details: validationError.details },
        { status: 400 },
      );
    }

    const {
      prompt,
      fromName,
      fromAddress,
      toName,
      toAddress,
      letterType,
      // For job-based cover letter generation
      jobDescription,
      jobUrl,
      fromEmail,
      skills,
      experience,
      tone,
      length,
      lockedSections,
    } = body;

    // Determine which action type to use for credit calculation
    // Cover letters require both job description and sender name to be present
    const isCoverLetter = jobDescription && fromName;
    const actionType = isCoverLetter ? "cover_letter" : "letter";

    // Validate required fields for the standard-letter branch BEFORE
    // touching credits — getCachedUserCredits can lazy-create/reset the
    // user_credits row, so a malformed request must be rejected first.
    if (!isCoverLetter && (!prompt || !fromName || !toName || !letterType)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check user credits
    const creditCost = ACTION_COSTS[actionType];

    // Get or create user credits (cached, 15 s TTL)
    const userCredits = await getCachedUserCredits(supabaseAdmin, user.id);
    if (!userCredits) {
      return NextResponse.json(
        { error: "Failed to initialize credits" },
        { status: 500 },
      );
    }

    // Check if user has enough credits
    const creditsRemaining = hasUnlimitedCredits
      ? Number.MAX_SAFE_INTEGER
      : calculateRemainingCredits(
          userCredits.credits_total,
          userCredits.credits_used,
        );

    if (!hasUnlimitedCredits && creditsRemaining < creditCost) {
      return NextResponse.json(
        {
          error: "Not enough credits",
          message: `You need ${creditCost} credits to generate a ${isCoverLetter ? "cover letter" : "letter"}. You have ${creditsRemaining} credits remaining.`,
          needsUpgrade: true,
          currentTier: userCredits.tier,
          creditsRemaining,
        },
        { status: 402 },
      );
    }

    // Atomically reserve credits BEFORE generation to prevent the
    // TOCTOU race documented in issue #477.
    if (!hasUnlimitedCredits) {
      const reserved = await reserveCredits(
        supabaseAdmin,
        user.id,
        userCredits.credits_used,
        creditCost,
      );
      invalidateUserCredits(user.id);
      if (!reserved) {
        return NextResponse.json(
          creditReservationConflictResponse(creditCost, userCredits.tier),
          { status: 402 },
        );
      }
    }

    // Cover-letter branch
    if (isCoverLetter) {
      // console.log(
        "📝 Generating cover letter from job description with Mistral...",
      );

      const coverJobDescription = jobDescription as string;
      const coverFromName = fromName as string;

      let coverLetter;
      try {
        coverLetter = await generateCoverLetterFromJob({
          jobDescription: coverJobDescription,
          jobUrl,
          fromName: coverFromName,
          fromEmail,
          fromAddress,
          skills,
          experience,
          tone,
          length,
          lockedSections,
        });
      } catch (err) {
        if (!hasUnlimitedCredits) {
          await refundCredits(supabaseAdmin, user.id, creditCost);
          invalidateUserCredits(user.id);
        }
        throw err;
      }

      // Fire-and-forget: log write does not block the response
      if (!hasUnlimitedCredits) {
        supabaseAdmin
          .from("credit_usage_log")
          .insert({ user_id: user.id, action_type: actionType, credits_used: creditCost, metadata: { type: "cover_letter", has_job_description: true } })
          .then(({ error }) => { if (error) console.error("Failed to log credit usage:", error); });
      }

      return NextResponse.json(coverLetter);
    }

    // Standard letter generation
    // console.log(`📝 Generating ${letterType} letter with Mistral...`);
    const standardPrompt = prompt as string;
    const standardFromName = fromName as string;
    const standardToName = toName as string;
    const standardLetterType = letterType as string;

    let letter;
    try {
      letter = await generateLetterWithMistral({
        prompt: standardPrompt,
        fromName: standardFromName,
        fromAddress,
        toName: standardToName,
        toAddress,
        letterType: standardLetterType,
      });
    } catch (err) {
      if (!hasUnlimitedCredits) {
        await refundCredits(supabaseAdmin, user.id, creditCost);
        invalidateUserCredits(user.id);
      }
      throw err;
    }

    // Format the response to ensure it has the expected structure
    const formattedResponse = {
      from: {
        name: letter.from?.name || standardFromName,
        address: letter.from?.address || fromAddress || "",
      },
      to: {
        name: letter.to?.name || standardToName,
        address: letter.to?.address || toAddress || "",
      },
      date:
        letter.date ||
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      subject: letter.subject || "Re: " + standardPrompt.substring(0, 30) + "...",
      content: letter.content || "Letter content not available.",
    };

    // console.log("✅ Letter generated successfully with Mistral");

    // Fire-and-forget: log write does not block the response
    if (!hasUnlimitedCredits) {
      supabaseAdmin
        .from("credit_usage_log")
        .insert({ user_id: user.id, action_type: actionType, credits_used: creditCost, metadata: { letter_type: standardLetterType, prompt_length: standardPrompt.length } })
        .then(({ error }) => { if (error) console.error("Failed to log credit usage:", error); });
    }

    return NextResponse.json(formattedResponse);
  } catch (error) {
    logger.error({ route: 'app/api/generate/letter/route.ts' }, "Error generating letter:", error);
    return NextResponse.json(
      {
        error: "Failed to generate letter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
