import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

const originalEnv = { ...process.env };

async function importLoggerWithEnv(env: Record<string, string | undefined>) {
  jest.resetModules();
  process.env = { ...originalEnv, ...env };
  return import("@/lib/logger");
}

describe("structured logger redaction and levels", () => {
  let infoSpy: jest.SpiedFunction<typeof console.info>;
  let warnSpy: jest.SpiedFunction<typeof console.warn>;
  let errorSpy: jest.SpiedFunction<typeof console.error>;
  let debugSpy: jest.SpiedFunction<typeof console.debug>;

  beforeEach(() => {
    infoSpy = jest.spyOn(console, "info").mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    debugSpy = jest.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it("redacts sensitive keys in context and payload objects", async () => {
    const { logger } = await importLoggerWithEnv({
      NODE_ENV: "production",
      LOG_LEVEL: "debug",
    });

    logger.info(
      {
        requestId: "req-1",
        authorization: "Bearer secret-token",
        route: "/api/test",
      },
      "login attempt",
      {
        email: "user@example.com",
        password: "plain-text",
        nested: { apiKey: "sk-test" },
      },
    );

    const line = String(infoSpy.mock.calls[0]?.[0] ?? "");
    expect(line).toContain('"authorization":"[REDACTED]"');
    expect(line).toContain("[REDACTED]");
    expect(line).not.toContain("plain-text");
    expect(line).not.toContain("sk-test");
    expect(line).not.toContain("secret-token");
  });

  it("honors LOG_LEVEL by suppressing lower-priority entries", async () => {
    const { logger } = await importLoggerWithEnv({
      NODE_ENV: "production",
      LOG_LEVEL: "warn",
    });

    logger.debug(null, "debug hidden");
    logger.info(null, "info hidden");
    logger.warn(null, "warn shown");
    logger.error(null, "error shown");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it("defaults to info level when LOG_LEVEL is invalid", async () => {
    const { logger } = await importLoggerWithEnv({
      NODE_ENV: "production",
      LOG_LEVEL: "verbose",
    });

    logger.debug(null, "debug hidden");
    logger.info(null, "info shown");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledTimes(1);
  });
});
