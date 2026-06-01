import { describe, it, expect, afterEach, beforeEach, jest } from '@jest/globals';

const originalEnv = { ...process.env };

function restoreEnv() {
  Object.keys(process.env).forEach((key) => delete process.env[key]);
  Object.assign(process.env, originalEnv);
}

describe('developer credit bypass', () => {
  beforeEach(() => {
    jest.resetModules();
    restoreEnv();
  });

  afterEach(() => {
    restoreEnv();
  });

  it('returns not_configured when DEVELOPER_BYPASS_EMAILS is unset', async () => {
    delete process.env.DEVELOPER_BYPASS_EMAILS;
    process.env.NODE_ENV = 'development';

    const { isDeveloperBypassAllowed, hasUnlimitedDeveloperCredits } = await import('../../lib/developer-credit-bypass');

    expect(isDeveloperBypassAllowed('dev@example.com')).toEqual({
      allowed: false,
      reason: 'not_configured',
    });
    expect(hasUnlimitedDeveloperCredits('dev@example.com')).toBe(false);
  });

  it('allows bypass only in development for normalized comma-separated emails', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com, ADMIN@Example.COM , test@example.com';

    const { isDeveloperBypassAllowed, hasUnlimitedDeveloperCredits } = await import('../../lib/developer-credit-bypass');

    expect(isDeveloperBypassAllowed('  admin@example.com  ')).toEqual({
      allowed: true,
      reason: 'allowed',
    });
    expect(hasUnlimitedDeveloperCredits('  test@example.com ')).toBe(true);
    expect(hasUnlimitedDeveloperCredits('other@example.com')).toBe(false);
  });

  it('returns missing_email when no user email is provided', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    const { isDeveloperBypassAllowed } = await import('../../lib/developer-credit-bypass');

    expect(isDeveloperBypassAllowed(undefined)).toEqual({
      allowed: false,
      reason: 'missing_email',
    });
  });

  it('does not allow bypass when NODE_ENV is not development', async () => {
    process.env.NODE_ENV = 'staging';
    process.env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    const { isDeveloperBypassAllowed, hasUnlimitedDeveloperCredits } = await import('../../lib/developer-credit-bypass');

    expect(isDeveloperBypassAllowed('dev@example.com')).toEqual({
      allowed: false,
      reason: 'not_development',
    });
    expect(hasUnlimitedDeveloperCredits('dev@example.com')).toBe(false);
  });

  it('does not allow bypass when Docker runtime env is production', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DRAFTDECK_RUNTIME_ENV = 'production';
    process.env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    await expect(import('../../lib/developer-credit-bypass')).rejects.toThrow(
      /Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production/i,
    );
  });

  it('does not allow bypass when runtime env is staging', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DRAFTDECK_RUNTIME_ENV = 'staging';
    process.env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    await expect(import('../../lib/developer-credit-bypass')).rejects.toThrow(
      /Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production/i,
    );
  });

  it('does not allow bypass when running the production start script', async () => {
    process.env.NODE_ENV = 'development';
    process.env.npm_lifecycle_event = 'start';
    process.env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    await expect(import('../../lib/developer-credit-bypass')).rejects.toThrow(
      /Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production/i,
    );
  });

  it('throws during module import when bypass is configured outside development', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    await expect(import('../../lib/developer-credit-bypass')).rejects.toThrow(
      /Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production/i,
    );
  });

  it('does not let DRAFTDECK_RUNTIME_ENV downgrade production NODE_ENV', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DRAFTDECK_RUNTIME_ENV = 'development';
    process.env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';

    await expect(import('../../lib/developer-credit-bypass')).rejects.toThrow(
      /Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production/i,
    );
  });

  it('logs structured audit details when a developer bypass is used', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DEVELOPER_BYPASS_EMAILS = 'dev@example.com';
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
