-- ENUMS

CREATE TYPE showcase_post_type      AS ENUM ('resume', 'presentation');
CREATE TYPE showcase_visibility     AS ENUM ('public', 'unlisted', 'private');
CREATE TYPE showcase_post_status    AS ENUM ('published', 'under_review', 'hidden');
CREATE TYPE showcase_exp_level      AS ENUM ('junior', 'mid', 'senior');
CREATE TYPE showcase_event_type     AS ENUM ('view', 'like', 'save', 'share', 'dwell');
CREATE TYPE showcase_report_status  AS ENUM ('pending', 'reviewed', 'dismissed');

-- Create the table showcase_posts
CREATE TABLE showcase_posts (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type              showcase_post_type    NOT NULL,
  visibility        showcase_visibility   NOT NULL DEFAULT 'public',
  status            showcase_post_status  NOT NULL DEFAULT 'published',
  title             text          NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  content_ref       text          NOT NULL,
  role              text          NOT NULL CHECK (char_length(role) BETWEEN 2 AND 80),
  experience_level  showcase_exp_level    NOT NULL,
  template_used     text,
  quality_score     real          NOT NULL DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 1),
  report_count      integer       NOT NULL DEFAULT 0,
  created_at        timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_showcase_posts_status     ON showcase_posts (status);
CREATE INDEX idx_showcase_posts_created_at ON showcase_posts (created_at DESC);
CREATE INDEX idx_showcase_posts_user_id    ON showcase_posts (user_id);
CREATE INDEX idx_showcase_posts_visibility ON showcase_posts (visibility);

-- Create the table showcase_post_tags

CREATE TABLE showcase_post_tags (
  post_id  uuid   NOT NULL REFERENCES showcase_posts(id) ON DELETE CASCADE,
  tag      text   NOT NULL CHECK (char_length(tag) BETWEEN 1 AND 32),
  PRIMARY KEY (post_id, tag)
);

CREATE INDEX idx_showcase_post_tags_tag ON showcase_post_tags (tag);

-- Create the table showcase_engagement_events

CREATE TABLE showcase_engagement_events (
  id          uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid              NOT NULL REFERENCES showcase_posts(id) ON DELETE CASCADE,
  user_id     uuid              REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash     text,
  event_type  showcase_event_type  NOT NULL,
  dwell_ms    integer           CHECK (dwell_ms IS NULL OR dwell_ms >= 0),
  created_at  timestamptz       NOT NULL DEFAULT now()
);

CREATE INDEX idx_showcase_events_post_id    ON showcase_engagement_events (post_id);
CREATE INDEX idx_showcase_events_created_at ON showcase_engagement_events (created_at DESC);

-- Partial index used by ranking job (only last 30 days matter for engagement)
-- CREATE INDEX idx_showcase_events_recent ON showcase_engagement_events (post_id, created_at DESC)
--   WHERE created_at > now() - interval '30 days';

CREATE INDEX idx_showcase_events_post_recent 
  ON showcase_engagement_events (post_id, created_at DESC);

-- Create the table showcase_post_scores

CREATE TABLE showcase_post_scores (
  post_id           uuid   PRIMARY KEY REFERENCES showcase_posts(id) ON DELETE CASCADE,
  quality_score     real   NOT NULL DEFAULT 0,
  engagement_score  real   NOT NULL DEFAULT 0,
  freshness_score   real   NOT NULL DEFAULT 0,
  relevance_score   real,
  final_score       real   NOT NULL DEFAULT 0,
  score_breakdown   jsonb  NOT NULL DEFAULT '{}',
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_showcase_scores_final ON showcase_post_scores (final_score DESC);

-- Create the table showcase_reports

CREATE TABLE showcase_reports (
  id           uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid                  NOT NULL REFERENCES showcase_posts(id) ON DELETE CASCADE,
  reporter_id  uuid                  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason       text                  NOT NULL CHECK (char_length(reason) >= 5),
  status       showcase_report_status NOT NULL DEFAULT 'pending',
  created_at   timestamptz           NOT NULL DEFAULT now(),
  UNIQUE (post_id, reporter_id)
);

CREATE INDEX idx_showcase_reports_post_id ON showcase_reports (post_id);
CREATE INDEX idx_showcase_reports_status  ON showcase_reports (status);

-- Create the table showcase_follows

CREATE TABLE showcase_follows (
  follower_id  uuid  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id  uuid  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);

-- Create the table user_showcase_preferences
-- Stores tag/role preferences for "For You" feed personalisation

CREATE TABLE user_showcase_preferences (
  user_id    uuid   PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pref_tags  text[] NOT NULL DEFAULT '{}',
  pref_role  text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
 
CREATE OR REPLACE FUNCTION increment_report_count(
  post_id_arg uuid,
  threshold integer
) RETURNS void AS $$
BEGIN
  UPDATE showcase_posts
  SET
    report_count = report_count + 1,
    status = CASE
      WHEN report_count + 1 >= threshold AND status = 'published'
      THEN 'under_review'::showcase_post_status
      ELSE status
    END
  WHERE id = post_id_arg;
END;
$$ LANGUAGE plpgsql;

-- RANKING VIEW
-- Used by the trending feed query directly.
-- Freshness is computed live so it's always accurate.

CREATE OR REPLACE VIEW showcase_ranked_feed AS
SELECT
  p.*,
  COALESCE(s.engagement_score, 0)                                        AS eng_score,
  COALESCE(s.quality_score, p.quality_score)                             AS qual_score,
  EXP(-0.02 * EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600.0)      AS fresh_score,
  COALESCE(s.score_breakdown, '{}')                                      AS breakdown,
  (
    0.40 * COALESCE(s.quality_score, p.quality_score) +
    0.35 * COALESCE(s.engagement_score, 0) +
    0.10 * EXP(-0.02 * EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600.0)
    -- relevance (0.15) is viewer-specific, added at query time in for-you feed
  )                                                                       AS base_score
FROM showcase_posts p
LEFT JOIN showcase_post_scores s ON s.post_id = p.id
WHERE p.visibility = 'public'
  AND p.status = 'published';

-- ROW LEVEL SECURITY 

ALTER TABLE showcase_posts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_post_tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_engagement_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_post_scores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_reports             ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_follows             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_showcase_preferences    ENABLE ROW LEVEL SECURITY;

-- showcase_posts
CREATE POLICY "Public posts viewable by all"
  ON showcase_posts FOR SELECT
  USING (visibility = 'public' AND status = 'published');

CREATE POLICY "Unlisted posts viewable by direct link"
  ON showcase_posts FOR SELECT
  USING (visibility = 'unlisted' AND status = 'published');

CREATE POLICY "Owner can view all their posts"
  ON showcase_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts"
  ON showcase_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON showcase_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- showcase_post_tags
CREATE POLICY "Tags readable with post"
  ON showcase_post_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM showcase_posts p
      WHERE p.id = post_id
        AND (
          (p.visibility IN ('public','unlisted') AND p.status = 'published')
          OR p.user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can insert tags for their posts"
  ON showcase_post_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM showcase_posts p
      WHERE p.id = post_id AND p.user_id = auth.uid()
    )
  );

-- showcase_post_scores (public read for explainability)
CREATE POLICY "Scores publicly readable"
  ON showcase_post_scores FOR SELECT USING (true);

-- showcase_engagement_events
CREATE POLICY "Anyone can insert engagement events"
  ON showcase_engagement_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own engagement events"
  ON showcase_engagement_events FOR SELECT
  USING (auth.uid() = user_id);

-- showcase_reports
CREATE POLICY "Auth users can submit reports"
  ON showcase_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read their own reports"
  ON showcase_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- showcase_follows
CREATE POLICY "Users manage their own follows"
  ON showcase_follows FOR ALL
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- user_showcase_preferences
CREATE POLICY "Users manage their own preferences"
  ON user_showcase_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);