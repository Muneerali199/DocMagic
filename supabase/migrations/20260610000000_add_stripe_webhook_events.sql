CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  stripe_event_id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(255) NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at
  ON public.stripe_webhook_events(processed_at);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage stripe webhook events"
  ON public.stripe_webhook_events
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
