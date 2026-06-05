import { describe, it, expect, afterEach, beforeEach, jest } from '@jest/globals';

const env = process.env as Record<string, string | undefined>;
const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  jest.resetModules();
  Object.keys(env).forEach((k) => { originalEnv[k] = env[k]; });
});

afterEach(() => {
  Object.keys(env).forEach((k) => { delete env[k]; });
  Object.assign(env, originalEnv);
});

describe('developer credit bypass', () => {
  it('returns not_configured when DEVELOPER_BYPASS_EMAILS is unset', async () => {
    delete env.DEVELOPER_BYPASS_EMAILS;
    env.NODE_ENV = 'development';

    const { isDeveloperBypassAllowed, hasUnlimitedDeveloperCredits } = await import('../../lib/developer-credit-bypass');

    expect(isDeveloperBypassAllowed('dev@example.com')).toEqual({
      allowed: false,
      reason: 'not_configured',
    });
    expect(hasUnlimitedDeveloperCredits('dev@example.com')).toBe(false);
  });

  it('allows bypass only in development for normalized comma-separated emails', async () => {
    env.NODE_ENV = 'development';
    env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com, ADMIN@Example.COM , test@example.com';

    const { isDeveloperBypassAllowed, hasUnlimitedDeveloperCredits } = await import('../../lib/developer-credit-bypass');

    expect(isDeveloperBypassAllowed('  admin@example.com  ')).toEqual({
      allowed: true,
      reason: 'allowed',
    });
    expect(hasUnlimitedDeveloperCredits('  test@example.com ')).toBe(true);
    expect(hasUnlimitedDeveloperCredits('other@example.com')).toBe(false);
  });

  it('returns missing_email when no user email is provided', async () => {
    env.NODE_ENV = 'development';
    env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    const { isDeveloperBypassAllowed } = await import('../../lib/developer-credit-bypass');

    expect(isDeveloperBypassAllowed(undefined)).toEqual({
      allowed: false,
      reason: 'missing_email',
    });
  });

  it('does not allow bypass when NODE_ENV is not development', async () => {
    env.NODE_ENV = 'staging';
    env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    const { isDeveloperBypassAllowed, hasUnlimitedDeveloperCredits } = await import('../../lib/developer-credit-bypass');

    expect(isDeveloperBypassAllowed('dev@example.com')).toEqual({
      allowed: false,
      reason: 'not_development',
    });
    expect(hasUnlimitedDeveloperCredits('dev@example.com')).toBe(false);
  });

  it('does not allow bypass when Docker runtime env is production', async () => {
    env.NODE_ENV = 'development';
    env.DRAFTDECK_RUNTIME_ENV = 'production';
    env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    await expect(import('../../lib/developer-credit-bypass')).rejects.toThrow(
      /Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production/i,
    );
  });

  it('does not allow bypass when runtime env is staging', async () => {
    env.NODE_ENV = 'development';
    env.DRAFTDECK_RUNTIME_ENV = 'staging';
    env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    await expect(import('../../lib/developer-credit-bypass')).rejects.toThrow(
      /Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production/i,
    );
  });

  it('does not allow bypass when running the production start script', async () => {
    env.NODE_ENV = 'development';
    env.npm_lifecycle_event = 'start';
    env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    await expect(import('../../lib/developer-credit-bypass')).rejects.toThrow(
      /Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production/i,
    );
  });

  it('throws during module import when bypass is configured outside development', async () => {
    env.NODE_ENV = 'production';
    env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    await expect(import('../../lib/developer-credit-bypass')).rejects.toThrow(
      /Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production/i,
    );
  });

  it('does not let DRAFTDECK_RUNTIME_ENV downgrade production NODE_ENV', async () => {
    env.NODE_ENV = 'production';
    env.DRAFTDECK_RUNTIME_ENV = 'development';
    env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    await expect(import('../../lib/developer-credit-bypass')).rejects.toThrow(
      /Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production/i,
    );
  });

  it('logs structured audit details when a developer bypass is used', async () => {
    env.NODE_ENV = 'development';
    env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { logDeveloperCreditBypass } = await import('../../lib/developer-credit-bypass');

    logDeveloperCreditBypass({
      userId: 'user-123',
      email: 'dev@example.com',
      action: 'resume',
    });

    const logLine = String(warnSpy.mock.calls[0]?.[0] ?? '');
    expect(logLine).toContain('SECURITY_EVENT');
    expect(logLine).toContain('developer_credit_bypass_used');
    expect(logLine).toContain('user-123');
    expect(logLine).toContain('dev@example.com');
    expect(logLine).toContain('resume');

    warnSpy.mockRestore();
  });
});
