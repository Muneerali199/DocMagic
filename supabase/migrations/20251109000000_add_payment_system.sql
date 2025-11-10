-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('individual', 'organization')),
  billing_period VARCHAR(20) NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
  price DECIMAL(10, 2) NOT NULL,
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create payment history table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_invoice_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  payment_method VARCHAR(100),
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('presentation', 'resume', 'cv', 'letter', 'diagram', 'website')),
  resource_id UUID,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'edit', 'delete', 'export', 'share')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage summary view
CREATE OR REPLACE VIEW public.user_usage_summary AS
SELECT 
  user_id,
  resource_type,
  COUNT(*) FILTER (WHERE action = 'create') as total_created,
  COUNT(*) FILTER (WHERE action = 'export') as total_exported,
  DATE_TRUNC('month', created_at) as month
FROM public.usage_tracking
GROUP BY user_id, resource_type, DATE_TRUNC('month', created_at);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, plan_type, billing_period, price, stripe_price_id, features, limits) VALUES
-- Individual Plans
('Individual Monthly', 'Perfect for individuals and freelancers', 'individual', 'monthly', 9.99, 'price_individual_monthly', 
 '["Unlimited presentations", "Unlimited resumes & CVs", "Unlimited letters", "AI-powered generation", "Premium templates", "Export to PDF/PPTX/DOCX", "Priority support"]'::jsonb,
 '{"presentations": 999, "resumes": 999, "cvs": 999, "letters": 999, "diagrams": 999, "websites": 999, "exports_per_month": 999}'::jsonb),

('Individual Yearly', 'Save 20% with annual billing', 'individual', 'yearly', 95.88, 'price_individual_yearly',
 '["Unlimited presentations", "Unlimited resumes & CVs", "Unlimited letters", "AI-powered generation", "Premium templates", "Export to PDF/PPTX/DOCX", "Priority support", "20% savings"]'::jsonb,
 '{"presentations": 999, "resumes": 999, "cvs": 999, "letters": 999, "diagrams": 999, "websites": 999, "exports_per_month": 999}'::jsonb),

-- Organization Plans
('Organization Monthly', 'For teams and organizations', 'organization', 'monthly', 49.99, 'price_organization_monthly',
 '["Everything in Individual", "Unlimited team members", "Team collaboration", "Brand customization", "Advanced analytics", "API access", "Dedicated support", "Custom templates"]'::jsonb,
 '{"presentations": 9999, "resumes": 9999, "cvs": 9999, "letters": 9999, "diagrams": 9999, "websites": 9999, "exports_per_month": 9999, "team_members": 999}'::jsonb),

('Organization Yearly', 'Save 20% with annual billing', 'organization', 'yearly', 479.88, 'price_organization_yearly',
 '["Everything in Individual", "Unlimited team members", "Team collaboration", "Brand customization", "Advanced analytics", "API access", "Dedicated support", "Custom templates", "20% savings"]'::jsonb,
 '{"presentations": 9999, "resumes": 9999, "cvs": 9999, "letters": 9999, "diagrams": 9999, "websites": 9999, "exports_per_month": 9999, "team_members": 999}'::jsonb);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource_type ON public.usage_tracking(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON public.usage_tracking(created_at);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for payment_history
CREATE POLICY "Users can view their own payment history"
  ON public.payment_history FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view their own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION public.check_user_limit(
  p_user_id UUID,
  p_resource_type VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
  v_subscription RECORD;
  v_usage_count INTEGER;
  v_limit INTEGER;
  v_result JSONB;
BEGIN
  -- Get user's active subscription
  SELECT us.*, sp.limits INTO v_subscription
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active'
  LIMIT 1;

  -- If no active subscription, return free tier limits
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'limit', 3,
      'current_usage', (
        SELECT COUNT(*)
        FROM public.usage_tracking
        WHERE user_id = p_user_id 
          AND resource_type = p_resource_type
          AND action = 'create'
          AND created_at > NOW() - INTERVAL '30 days'
      ),
      'message', 'Free tier: 3 documents per month. Subscribe for unlimited access.'
    );
  END IF;

  -- Get the limit for this resource type
  v_limit := (v_subscription.limits->>p_resource_type)::INTEGER;

  -- Count current usage this month
  SELECT COUNT(*) INTO v_usage_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id 
    AND resource_type = p_resource_type
    AND action = 'create'
    AND created_at >= DATE_TRUNC('month', NOW());

  -- Check if under limit
  IF v_usage_count < v_limit THEN
    v_result := jsonb_build_object(
      'allowed', true,
      'limit', v_limit,
      'current_usage', v_usage_count,
      'remaining', v_limit - v_usage_count
    );
  ELSE
    v_result := jsonb_build_object(
      'allowed', false,
      'limit', v_limit,
      'current_usage', v_usage_count,
      'remaining', 0,
      'message', 'Monthly limit reached. Upgrade your plan for more capacity.'
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT SELECT, UPDATE ON public.user_subscriptions TO authenticated;
GRANT SELECT ON public.payment_history TO authenticated;
GRANT SELECT, INSERT ON public.usage_tracking TO authenticated;
GRANT SELECT ON public.user_usage_summary TO authenticated;
