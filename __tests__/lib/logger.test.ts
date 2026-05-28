/**
 * Unit tests for lib/logger.ts
 *
 * The logger captures IS_PROD and IS_TEST as module-level constants, so tests
 * that need a different NODE_ENV must isolate the module via
 * jest.isolateModules() to get a fresh instance with the desired environment.
 */

// The top-level import gives us the IS_TEST=true instance (Jest default).
import { logger as testModeLogger } from '@/lib/logger';

// Helper to load a fresh logger with a specific NODE_ENV.
function loadLoggerWithEnv(env: string) {
  let loggerModule: typeof import('@/lib/logger');
  jest.isolateModules(() => {
    const original = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: env,
      writable: true,
      configurable: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    loggerModule = require('@/lib/logger');
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: original,
      writable: true,
      configurable: true,
    });
  });
  return loggerModule!;
}

afterEach(() => jest.restoreAllMocks());

// ──────────────────────────────────────────────────────────────
// Test-mode suppression
// ──────────────────────────────────────────────────────────────
describe('logger - test mode suppression', () => {
  it('does not throw when called in test mode', () => {
    expect(() => testModeLogger.info(null, 'silent')).not.toThrow();
    expect(() => testModeLogger.warn(null, 'silent')).not.toThrow();
    expect(() => testModeLogger.error(null, 'silent')).not.toThrow();
    expect(() => testModeLogger.debug(null, 'silent')).not.toThrow();
  });

  it('does not write to console in test mode', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    testModeLogger.info(null, 'should be swallowed');
    expect(spy).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────────────────
// Development-mode output
// ──────────────────────────────────────────────────────────────
describe('logger - development mode output', () => {
  it('calls console.info for info level and includes the message', () => {
    const { logger } = loadLoggerWithEnv('development');
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});

    logger.info(null, 'hello world');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('INFO');
    expect(spy.mock.calls[0][0]).toContain('hello world');
  });

  it('calls console.warn for warn level', () => {
    const { logger } = loadLoggerWithEnv('development');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    logger.warn(null, 'a warning');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('WARN');
  });

  it('calls console.error for error level', () => {
    const { logger } = loadLoggerWithEnv('development');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger.error(null, 'boom');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('ERROR');
  });

  it('calls console.debug for debug level', () => {
    const { logger } = loadLoggerWithEnv('development');
    const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    logger.debug(null, 'dbg');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('DEBUG');
  });

  it('includes context fields in the log entry', () => {
    const { logger } = loadLoggerWithEnv('development');
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});

    logger.info({ requestId: 'req-abc', userId: 'usr-xyz' }, 'ctx test');

    const output: string = spy.mock.calls[0][0];
    expect(output).toContain('req-abc');
    expect(output).toContain('usr-xyz');
  });

  it('serializes Error objects to include the message', () => {
    const { logger } = loadLoggerWithEnv('development');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger.error(null, new Error('err-msg'));

    expect(spy.mock.calls[0][0]).toContain('err-msg');
  });
});

// ──────────────────────────────────────────────────────────────
// Production-mode output
// ──────────────────────────────────────────────────────────────
describe('logger - production mode output', () => {
  it('outputs a valid JSON string for info level', () => {
    const { logger } = loadLoggerWithEnv('production');
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});

    logger.info(null, 'prod message');

    const raw: string = spy.mock.calls[0][0];
    const parsed = JSON.parse(raw);
    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toContain('prod message');
    expect(parsed.timestamp).toBeTruthy();
  });

  it('includes context in the JSON output', () => {
    const { logger } = loadLoggerWithEnv('production');
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});

    logger.info({ requestId: 'r1' }, 'with context');

    const parsed = JSON.parse(spy.mock.calls[0][0]);
    expect(parsed.requestId).toBe('r1');
  });

  it('suppresses debug output in production', () => {
    const { logger } = loadLoggerWithEnv('production');
    const spy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    logger.debug(null, 'hidden');

    expect(spy).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────────────────
// withContext helper
// ──────────────────────────────────────────────────────────────
describe('logger.withContext', () => {
  it('binds context to all subsequent log calls', () => {
    const { logger } = loadLoggerWithEnv('development');
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});

    const bound = logger.withContext({ requestId: 'bound-id' });
    bound.info('from bound logger');

    const output: string = spy.mock.calls[0][0];
    expect(output).toContain('bound-id');
  });

  it('exposes all four log levels', () => {
    const bound = testModeLogger.withContext({ requestId: 'x' });
    expect(typeof bound.debug).toBe('function');
    expect(typeof bound.info).toBe('function');
    expect(typeof bound.warn).toBe('function');
    expect(typeof bound.error).toBe('function');
  });
});
