import { logger } from './logger';

const LOCAL_DEVELOPMENT_ENV = 'development';
const PRODUCTION_ENV = 'production';

export const DEVELOPER_BYPASS_PRODUCTION_ERROR =
  'Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production. Use auditable grants instead.';

export type DeveloperBypassCheckReason =
  | 'not_configured'
  | 'not_development'
  | 'missing_email'
  | 'email_not_allowed'
  | 'allowed';

export type DeveloperBypassCheckResult = {
  allowed: boolean;
  reason: DeveloperBypassCheckReason;
};

export type DeveloperCreditBypassAuditEvent = {
  userId: string;
  email?: string | null;
  action: string;
};

function currentEnvironment(): string {
  return (
    process.env.NODE_ENV?.trim()
    || process.env.DRAFTDECK_RUNTIME_ENV?.trim()
    || LOCAL_DEVELOPMENT_ENV
  );
}

function bypassEmailConfig(): string {
  return process.env.DEVELOPER_BYPASS_EMAILS?.trim() ?? '';
}

function isNextProductionServer(): boolean {
  return process.env.npm_lifecycle_event === 'start';
}

function isLocalDevelopmentRuntime(): boolean {
  const runtimeEnv = process.env.DRAFTDECK_RUNTIME_ENV?.trim();

  return (
    !isNextProductionServer()
    && (!runtimeEnv || runtimeEnv === LOCAL_DEVELOPMENT_ENV)
    && (process.env.NODE_ENV?.trim() ?? LOCAL_DEVELOPMENT_ENV) === LOCAL_DEVELOPMENT_ENV
  );
}

function isProductionLikeRuntime(): boolean {
  const runtimeEnv = process.env.DRAFTDECK_RUNTIME_ENV?.trim();

  return (
    process.env.NODE_ENV?.trim() === PRODUCTION_ENV
    || (!!runtimeEnv && runtimeEnv !== LOCAL_DEVELOPMENT_ENV)
    || isNextProductionServer()
  );
}

function configuredBypassEmails(): Set<string> {
  return new Set(
    bypassEmailConfig()
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function validateDeveloperBypassConfiguration() {
  if (isProductionLikeRuntime() && bypassEmailConfig()) {
    throw new Error(DEVELOPER_BYPASS_PRODUCTION_ERROR);
  }
}

validateDeveloperBypassConfiguration();

export function isDeveloperBypassAllowed(email?: string | null): DeveloperBypassCheckResult {
  validateDeveloperBypassConfiguration();

  if (!bypassEmailConfig()) {
    return { allowed: false, reason: 'not_configured' };
  }

  if (!isLocalDevelopmentRuntime()) {
    return { allowed: false, reason: 'not_development' };
  }

  if (!email?.trim()) {
    return { allowed: false, reason: 'missing_email' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  return configuredBypassEmails().has(normalizedEmail)
    ? { allowed: true, reason: 'allowed' }
    : { allowed: false, reason: 'email_not_allowed' };
}

export function hasUnlimitedDeveloperCredits(email?: string | null): boolean {
  return isDeveloperBypassAllowed(email).allowed;
}

export function logDeveloperCreditBypass({ userId, email, action }: DeveloperCreditBypassAuditEvent) {
  logger.warn(
    {
      userId,
      route: 'developer-credit-bypass',
    },
    'SECURITY_EVENT',
    {
      type: 'developer_credit_bypass_used',
      userId,
      email: email ?? 'unknown',
      action,
      environment: currentEnvironment(),
      timestamp: new Date().toISOString(),
    }
  );
}
