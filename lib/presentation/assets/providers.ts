/**
 * Asset providers for the Asset Intelligence Engine.
 * Unsplash-backed provider reusing the project's existing UNSPLASH_ACCESS_KEY.
 */

import type {
  AssetCandidate,
  AssetProvider,
  AssetRequest,
} from "./intelligence";

const UNSPLASH_API_URL = "https://api.unsplash.com";

interface UnsplashResult {
  id: string;
  urls: { regular: string; small: string };
  alt_description: string | null;
  description: string | null;
  width: number;
  height: number;
  color: string | null;
  user: { name: string };
}

export const unsplashProvider: AssetProvider = {
  id: "unsplash",
  async search(
    request: AssetRequest,
    limit: number,
  ): Promise<AssetCandidate[]> {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) return [];
    const orientation =
      request.aspect === "tall"
        ? "portrait"
        : request.aspect === "square"
          ? "squarish"
          : "landscape";
    try {
      const res = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(request.query)}&per_page=${limit}&orientation=${orientation}`,
        {
          headers: {
            Authorization: `Client-ID ${key}`,
            "Accept-Version": "v1",
          },
        },
      );
      if (!res.ok) return [];
      const data = (await res.json()) as { results?: UnsplashResult[] };
      return (data.results ?? []).map((r, i) => ({
        id: `unsplash-${r.id}`,
        url: r.urls.regular,
        thumbUrl: r.urls.small,
        description: r.alt_description ?? r.description,
        width: r.width,
        height: r.height,
        dominantColor: r.color ?? undefined,
        providerRank: i,
        license: "attribution" as const,
        attribution: `Photo by ${r.user.name} on Unsplash`,
      }));
    } catch {
      return [];
    }
  },
};

export const defaultAssetProviders: AssetProvider[] = [unsplashProvider];
