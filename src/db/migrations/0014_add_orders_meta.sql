-- Add orders_meta table for fulfillment metadata.
-- NOTE: backfills 18M order rows in one transaction.
CREATE TABLE orders_meta (
  order_id BIGINT PRIMARY KEY,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_meta_created_at ON orders_meta (created_at);
