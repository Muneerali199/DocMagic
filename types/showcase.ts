// Enums

export type PostType        = "resume" | "presentation";
export type Visibility      = "public" | "unlisted" | "private";
export type PostStatus      = "published" | "under_review" | "hidden";
export type ExperienceLevel = "junior" | "mid" | "senior";
export type EngagementEventType = "view" | "like" | "save" | "share" | "dwell";
export type FeedType        = "trending" | "latest" | "for-you";
export type ReportStatus    = "pending" | "reviewed" | "dismissed";

// Database row shapes

export interface ShowcasePost {
  id:               string;
  user_id:          string;
  type:             PostType;
  visibility:       Visibility;
  status:           PostStatus;
  title:            string;
  content_ref:      string;
  role:             string;
  experience_level: ExperienceLevel;
  template_used:    string | null;
  quality_score:    number;
  report_count:     number;
  created_at:       string;
}

export interface ShowcasePostTag {
  post_id: string;
  tag:     string;
}

export interface ShowcaseEngagementEvent {
  id:         string;
  post_id:    string;
  user_id:    string | null;
  ip_hash:    string | null;
  event_type: EngagementEventType;
  dwell_ms:   number | null;
  created_at: string;
}

export interface ShowcasePostScore {
  post_id:          string;
  quality_score:    number;
  engagement_score: number;
  freshness_score:  number;
  relevance_score:  number | null;
  final_score:      number;
  score_breakdown:  ScoreBreakdown;
  updated_at:       string;
}

export interface ShowcaseReport {
  id:          string;
  post_id:     string;
  reporter_id: string;
  reason:      string;
  status:      ReportStatus;
  created_at:  string;
}

export interface ShowcaseFollow {
  follower_id: string;
  followee_id: string;
}

export interface UserShowcasePreferences {
  user_id:    string;
  pref_tags:  string[];
  pref_role:  string | null;
  updated_at: string;
}

// Score breakdown (stored as JSONB — surfaced for explainability)

export interface ScoreBreakdown {
  quality: {
    score:        number;
    weight:       number;
    contribution: number;
  };
  engagement: {
    score:        number;
    weight:       number;
    contribution: number;
    raw: {
      likes:       number;
      saves:       number;
      shares:      number;
      views:       number;
      dwell_score: number;
    };
    burst_penalised: boolean;
  };
  freshness: {
    score:        number;
    weight:       number;
    contribution: number;
    age_hours:    number;
  };
  relevance: {
    score:        number;
    weight:       number;
    contribution: number;
    tag_overlap:  number;
    role_match:   boolean;
  } | null;
  final_score:  number;
  computed_at:  string;
}

// API request / response shapes 

export interface PublishPostRequest {
  type:             PostType;
  title:            string;
  content_ref:      string;
  visibility:       Visibility;
  role:             string;
  experience_level: ExperienceLevel;
  tags:             string[];
  template_used?:   string;
}

export interface PublishPostResponse {
  post_id:       string;
  final_score:   number;
  quality_score: number;
}

export interface FeedItem extends ShowcasePost {
  tags:            string[];
  score_breakdown: ScoreBreakdown | null;
  final_score:     number;
  author_name:     string | null;
  author_avatar:   string | null;
}

export interface FeedResponse {
  items:       FeedItem[];
  next_cursor: string | null;
  total_hint:  number | null;
}

export interface EngageRequest {
  event_type: EngagementEventType;
  dwell_ms?:  number;
}

export interface ReportRequest {
  reason: string;
}

// Tag helpers

export const MAX_TAGS_PER_POST = 8;

export function normaliseTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 32);
}