-- Verify Payment System Migration
-- Run this in Supabase SQL Editor to check if everything is set up correctly

-- 1. Check if tables exist
SELECT 'Tables Check' as test_category, 
       EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_plans') as subscription_plans_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') as user_subscriptions_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_history') as payment_history_exists,
       EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_tracking') as usage_tracking_exists;

-- 2. Check if default plans were inserted
SELECT 'Plans Check' as test_category, 
       COUNT(*) as total_plans,
       COUNT(*) FILTER (WHERE plan_type = 'individual') as individual_plans,
       COUNT(*) FILTER (WHERE plan_type = 'organization') as organization_plans
FROM public.subscription_plans;

-- 3. List all plans with their Stripe Price IDs
SELECT 'Plan Details' as test_category,
       name,
       plan_type,
       billing_period,
       price,
       stripe_price_id,
       is_active
FROM public.subscription_plans
ORDER BY plan_type, billing_period;

-- 4. Check if the check_user_limit function exists
SELECT 'Function Check' as test_category,
       EXISTS (
         SELECT FROM pg_proc 
         WHERE proname = 'check_user_limit'
       ) as function_exists;

-- 5. Check RLS policies
SELECT 'RLS Policies' as test_category,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd
FROM pg_policies
WHERE tablename IN ('subscription_plans', 'user_subscriptions', 'payment_history', 'usage_tracking')
ORDER BY tablename, policyname;

-- 6. Check indexes
SELECT 'Indexes' as test_category,
       tablename,
       indexname,
       indexdef
FROM pg_indexes
WHERE tablename IN ('subscription_plans', 'user_subscriptions', 'payment_history', 'usage_tracking')
ORDER BY tablename, indexname;
