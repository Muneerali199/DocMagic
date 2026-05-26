// Ranking formula weights 
// final_score = QUALITY*quality + ENGAGEMENT*engagement + RELEVANCE*relevance + FRESHNESS*freshness
// All four weights must sum to 1.0

export const RANKING_WEIGHTS = {
  QUALITY:    parseFloat(process.env.RANK_W_QUALITY    ?? "0.40"),
  ENGAGEMENT: parseFloat(process.env.RANK_W_ENGAGEMENT ?? "0.35"),
  RELEVANCE:  parseFloat(process.env.RANK_W_RELEVANCE  ?? "0.15"),
  FRESHNESS:  parseFloat(process.env.RANK_W_FRESHNESS  ?? "0.10"),
} as const;

// Engagement sub-weights

export const ENGAGEMENT_WEIGHTS = {
  LIKE:  3,
  SAVE:  5,
  SHARE: 4,
  VIEW:  0.5,
  DWELL: 2,
} as const;

// Normalisation ceiling — raise once you have real traffic data
export const ENGAGEMENT_MAX_RAW = parseFloat(
  process.env.RANK_ENGAGEMENT_MAX_RAW ?? "5000"
);

// Freshness decay
// freshness = exp(−LAMBDA × age_hours)
// LAMBDA = 0.02 → half-life ≈ 35 hours

export const FRESHNESS_LAMBDA = parseFloat(
  process.env.RANK_FRESHNESS_LAMBDA ?? "0.02"
);

// Anti-gaming

// View dedup window in minutes (Postgres interval)
export const VIEW_DEDUP_MINUTES = parseInt(
  process.env.RANK_VIEW_DEDUP_MINUTES ?? "30"
);

// Burst: if a post gets more than N likes in M minutes, flag it
export const BURST_LIKE_THRESHOLD = parseInt(
  process.env.RANK_BURST_THRESHOLD ?? "50"
);
export const BURST_WINDOW_MINUTES = parseInt(
  process.env.RANK_BURST_WINDOW_MINUTES ?? "5"
);

// How much to de-weight engagement when burst is detected
export const BURST_ENGAGEMENT_PENALTY = parseFloat(
  process.env.RANK_BURST_PENALTY ?? "0.5"
);

// Moderation

export const REPORT_AUTO_HIDE_THRESHOLD = parseInt(
  process.env.MODERATION_REPORT_THRESHOLD ?? "5"
);

// Feed pagination

export const FEED_DEFAULT_LIMIT = 20;
export const FEED_MAX_LIMIT     = 50;

// Relevance weights (For You feed) 

export const RELEVANCE_TAG_WEIGHT  = 0.7;
export const RELEVANCE_ROLE_WEIGHT = 0.3;