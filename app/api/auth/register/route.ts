import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createRoute } from "@/lib/supabase/server";
import { sendVerificationEmail } from "@/lib/email";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  validateAndSanitize,
  registrationSchema,
  detectSqlInjection,
  sanitizeInput,
} from "@/lib/validation";

function jsonResponse(payload: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getValidationStatus(error: unknown) {
  if (error instanceof SyntaxError) return 400;
  if (error instanceof Error && error.message.startsWith("Validation failed:"))
    return 422;
  return null;
}

function getSafeUtmData(utmData: unknown) {
  if (!utmData || typeof utmData !== "object" || Array.isArray(utmData)) {
    return {};
  }

  return utmData as Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    // 1. Extract utmData from the body
    const { name, email, password, referralCode, utmData } = rawBody;

    // Validate and sanitize input
    const validated = validateAndSanitize(registrationSchema, {
      name,
      email,
      password,
    });
    const sanitizedName = sanitizeInput(validated.name);
    const sanitizedEmail = sanitizeInput(validated.email);
    const trimmedReferralCode = referralCode
      ? String(referralCode).toUpperCase().trim()
      : "";
    const sanitizedReferralCode =
      trimmedReferralCode === "" ? null : trimmedReferralCode;

    // Additional security checks
    if (
      detectSqlInjection(sanitizedName) ||
      detectSqlInjection(sanitizedEmail)
    ) {
      return jsonResponse({ error: "Invalid input detected" }, 400);
    }

    const supabase = await createRoute();

    const origin = (() => {
      try {
        const url = new URL((request as any).url);
        return url.origin.replace(/\/+$/, "");
      } catch {
        return (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
      }
    })();

    const finalRedirectUrl = origin ? `${origin}/auth/callback` : undefined;

    // 2. Inject utmData into the Supabase user metadata
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: validated.password,
      options: {
        emailRedirectTo: finalRedirectUrl,
        data: {
          ...getSafeUtmData(utmData), // This saves marketing tags permanently to the DB.
          name: sanitizedName,
          email: sanitizedEmail,
          referral_code: sanitizedReferralCode,
        },
      },
    });

    if (error) {
      logger.error(
        { route: "app/api/auth/register/route.ts" },
        "Signup error:",
        error,
      );
      // ... (keep your existing error handling logic for 422/user_already_exists here)
      const status =
        error.status && error.status >= 400 && error.status < 500
          ? error.status
          : 500;
      return jsonResponse({ error: error.message }, status);
    }

    // ... (keep your existing success return logic)
    const requiresVerification = !data.session;
    return jsonResponse(
      { message: "Registration successful!", requiresVerification },
      201,
    );
  } catch (error: any) {
    const validationStatus = getValidationStatus(error);
    if (validationStatus) {
      return jsonResponse(
        { error: error.message || "Invalid request body" },
        validationStatus,
      );
    }

    logger.error(
      { route: "app/api/auth/register/route.ts" },
      "Unexpected error in registration:",
      error,
    );
    return jsonResponse(
      { error: error.message || "An unexpected error occurred" },
      500,
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
