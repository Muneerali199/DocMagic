const DEFAULT_REDIRECT_PATH = "/";

/**
 * Restrict post-auth redirects to the current application origin.
 * Falls back to "/" when the provided target is blank, malformed, or external.
 */
export function getSafeRedirectPath(
  next: string | null | undefined,
  origin: string,
  fallbackPath: string = DEFAULT_REDIRECT_PATH,
): string {
  if (!next) {
    return fallbackPath;
  }

  const trimmedNext = next.trim();
  if (!trimmedNext) {
    return fallbackPath;
  }

  try {
    const appUrl = new URL(origin);
    const candidateUrl = new URL(trimmedNext, appUrl);

    if (candidateUrl.origin !== appUrl.origin) {
      return fallbackPath;
    }

    if (!candidateUrl.pathname.startsWith("/")) {
      return fallbackPath;
    }

    return `${candidateUrl.pathname}${candidateUrl.search}${candidateUrl.hash}`;
  } catch {
    return fallbackPath;
  }
}

export { DEFAULT_REDIRECT_PATH };
