export interface EnvVar {
  key: string;
  required: boolean;
  description: string;
  secrets?: boolean;
}

const REQUIRED_VARS: EnvVar[] = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anonymous key' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase service role key', secrets: true },
  { key: 'NEXT_PUBLIC_APP_URL', required: false, description: 'Application base URL' },
  { key: 'NEXT_PUBLIC_APP_NAME', required: false, description: 'Application display name' },
  { key: 'GEMINI_API_KEY', required: false, description: 'Google Gemini AI API key', secrets: true },
  { key: 'MISTRAL_API_KEY', required: false, description: 'Mistral AI API key', secrets: true },
  { key: 'OPENAI_API_KEY', required: false, description: 'OpenAI API key', secrets: true },
  { key: 'NEXT_PUBLIC_ENABLE_STRIPE', required: false, description: 'Enable Stripe payments' },
  { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', required: false, description: 'Stripe publishable key' },
  { key: 'STRIPE_SECRET_KEY', required: false, description: 'Stripe secret key', secrets: true },
  { key: 'STRIPE_WEBHOOK_SECRET', required: false, description: 'Stripe webhook signing secret', secrets: true },
  { key: 'NEXTAUTH_SECRET', required: false, description: 'NextAuth.js secret for session encryption', secrets: true },
  { key: 'SENTRY_DSN', required: false, description: 'Sentry error tracking DSN', secrets: true },
  { key: 'NEXT_PUBLIC_SENTRY_DSN', required: false, description: 'Sentry client-side DSN' },
  { key: 'UPSTASH_REDIS_REST_URL', required: false, description: 'Upstash Redis REST URL', secrets: true },
  { key: 'UPSTASH_REDIS_REST_TOKEN', required: false, description: 'Upstash Redis REST token', secrets: true },
];

export function validateEnv(): { valid: boolean; missing: EnvVar[] } {
  if (typeof window !== 'undefined') {
    return { valid: true, missing: [] };
  }

  const missing: EnvVar[] = [];

  for (const v of REQUIRED_VARS) {
    if (v.required && !process.env[v.key]) {
      missing.push(v);
    }
  }

  return { valid: missing.length === 0, missing };
}

export function logEnvStatus(): void {
  const { valid, missing } = validateEnv();

  if (valid) {
    console.log('[env] All required environment variables are set');
    return;
  }

  console.warn('[env] Missing required environment variables:');
  for (const v of missing) {
    console.warn(`  - ${v.key}: ${v.description}`);
  }

  const optional = REQUIRED_VARS.filter((v) => !v.required && !process.env[v.key]);
  if (optional.length > 0) {
    console.log(`[env] ${optional.length} optional variable(s) not set (non-blocking)`);
  }
}
