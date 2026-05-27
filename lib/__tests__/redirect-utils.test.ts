import {
  DEFAULT_REDIRECT_PATH,
  getSafeRedirectPath,
} from "../redirect-utils";

describe("getSafeRedirectPath", () => {
  const origin = "https://draftdeckai.com";

  it("allows internal relative paths", () => {
    expect(getSafeRedirectPath("/workspace?tab=recent", origin)).toBe(
      "/workspace?tab=recent",
    );
  });

  it("allows same-origin absolute URLs", () => {
    expect(
      getSafeRedirectPath("https://draftdeckai.com/profile#billing", origin),
    ).toBe("/profile#billing");
  });

  it("falls back for external absolute URLs", () => {
    expect(getSafeRedirectPath("https://example.com/phish", origin)).toBe(
      DEFAULT_REDIRECT_PATH,
    );
  });

  it("falls back for protocol-relative external URLs", () => {
    expect(getSafeRedirectPath("//example.com/phish", origin)).toBe(
      DEFAULT_REDIRECT_PATH,
    );
  });

  it("falls back for malformed URLs", () => {
    expect(getSafeRedirectPath("http://[invalid-url", origin)).toBe(
      DEFAULT_REDIRECT_PATH,
    );
  });

  it("falls back when the redirect is blank", () => {
    expect(getSafeRedirectPath("   ", origin)).toBe(DEFAULT_REDIRECT_PATH);
  });

  it("falls back for non-root relative paths", () => {
    expect(getSafeRedirectPath("dashboard", origin)).toBe(
      DEFAULT_REDIRECT_PATH,
    );
  });
});
