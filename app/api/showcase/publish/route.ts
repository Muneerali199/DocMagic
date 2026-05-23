import { NextRequest } from "next/server";
import { createRoute } from "@/lib/supabase/server";
import { computeQualityScore } from "@/lib/showcase/quality";
import { computeFinalScore, defaultEngagement } from "@/lib/showcase/ranking";
import { normaliseTag, MAX_TAGS_PER_POST } from "@/types/showcase";
import type { PublishPostRequest, PublishPostResponse } from "@/types/showcase";


const VALID_VISIBILITIES = ["public", "unlisted", "private"];
const VALID_TYPES        = ["resume", "presentation"];
const VALID_LEVELS       = ["junior", "mid", "senior"];

export async function POST(req: NextRequest) {
  // Auth
  const supabase = await createRoute();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Parse body
  let body: PublishPostRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    type, title, content_ref, visibility,
    role, experience_level, tags = [], template_used,
  } = body;

  // Validate
  if (!type || !title || !content_ref || !visibility || !role || !experience_level) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!VALID_VISIBILITIES.includes(visibility)) {
    return Response.json({ error: "Invalid visibility" }, { status: 400 });
  }
  if (!VALID_LEVELS.includes(experience_level)) {
    return Response.json({ error: "Invalid experience_level" }, { status: 400 });
  }

  // Normalise tags — lowercase, slugified, max 8
  const normalisedTags = tags
    .map(normaliseTag)
    .filter(Boolean)
    .slice(0, MAX_TAGS_PER_POST);

  // Compute quality score 
  const quality_score = computeQualityScore({
    type,
    title,
    role,
    tags: normalisedTags,
    template_used: template_used ?? null,
    content_ref,
  });

  // Insert post
  const { data: post, error: postError } = await supabase
    .from("showcase_posts")
    .insert({
      user_id:          user.id,
      type,
      visibility,
      status:           "published",
      title:            title.trim(),
      content_ref,
      role:             role.trim(),
      experience_level,
      template_used:    template_used ?? null,
      quality_score,
      report_count:     0,
    })
    .select("id, created_at")
    .single();

  if (postError || !post) {
    console.error("[showcase/publish] insert error:", postError);
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }

  // Insert tags
  if (normalisedTags.length > 0) {
    const { error: tagError } = await supabase
      .from("showcase_post_tags")
      .insert(normalisedTags.map((tag) => ({ post_id: post.id, tag })));

    if (tagError) {
      console.error("[showcase/publish] tag insert error:", tagError);
      // Non-fatal — post is still published
    }
  }

  // Compute and store initial score
  const breakdown = computeFinalScore({
    quality_score,
    engagement: defaultEngagement(),
    created_at: new Date(post.created_at),
  });

  const { error: scoreError } = await supabase
    .from("showcase_post_scores")
    .upsert({
      post_id:          post.id,
      quality_score,
      engagement_score: breakdown.engagement.score,
      freshness_score:  breakdown.freshness.score,
      relevance_score:  null,
      final_score:      breakdown.final_score,
      score_breakdown: JSON.parse(JSON.stringify(breakdown)),
      updated_at:       new Date().toISOString(),
    });

  if (scoreError) {
    console.error("[showcase/publish] score upsert error:", scoreError);
    // Non-fatal
  }

  const response: PublishPostResponse = {
    post_id:       post.id,
    final_score:   breakdown.final_score,
    quality_score,
  };

  return Response.json(response, { status: 201 });
}