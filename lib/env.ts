/**
 * lib/env.ts  —  Fix #5 (hardcoded secrets) + Fix #20 (startup validation)
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[env] Required env var "${key}" is not set.`);
    }
    console.warn(`[env] WARNING: "${key}" is not set.`);
    return '';
  }
  return value.trim();
}
function optionalEnv(key: string, defaultValue = ''): string {
  return (process.env[key] ?? defaultValue).trim();
}
export const SUPABASE_URL            = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON_KEY       = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
export const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
export const GEMINI_API_KEY          = requireEnv('GEMINI_API_KEY');
export const MISTRAL_API_KEY         = optionalEnv('MISTRAL_API_KEY');
export const OPENAI_API_KEY          = optionalEnv('OPENAI_API_KEY');
export const STRIPE_SECRET_KEY       = optionalEnv('STRIPE_SECRET_KEY');
export const STRIPE_WEBHOOK_SECRET   = optionalEnv('STRIPE_WEBHOOK_SECRET');
export const SMTP_HOST               = optionalEnv('SMTP_HOST', 'smtp.gmail.com');
export const SMTP_PORT               = parseInt(optionalEnv('SMTP_PORT', '587'), 10);
export const SMTP_USER               = optionalEnv('SMTP_USER');
export const SMTP_PASS               = optionalEnv('SMTP_PASS');
export const APP_URL                 = optionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
export const APP_NAME                = optionalEnv('NEXT_PUBLIC_APP_NAME', 'DraftDeckAI');
export const NODE_ENV                = optionalEnv('NODE_ENV', 'development');
export const IS_PRODUCTION           = NODE_ENV === 'production';
export const RAPIDAPI_KEY            = optionalEnv('RAPIDAPI_KEY');
export const PEXELS_API_KEY          = optionalEnv('PEXELS_API_KEY');
export const env = {
  SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY, MISTRAL_API_KEY, OPENAI_API_KEY,
  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
  APP_URL, APP_NAME, NODE_ENV, IS_PRODUCTION,
  RAPIDAPI_KEY, PEXELS_API_KEY,
} as const;
