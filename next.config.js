import withPWACore from "next-pwa";
import { withSentryConfig } from "@sentry/nextjs";
import { CSP_HEADER } from "./lib/csp.mjs";
import bundleAnalyzer from "@next/bundle-analyzer";

// --- Runtime & Security Checks ---
const draftdeckRuntimeEnv = process.env.DRAFTDECK_RUNTIME_ENV?.trim();
const isProductionLikeRuntime =
  (!!draftdeckRuntimeEnv && draftdeckRuntimeEnv !== "development") ||
  process.env.NODE_ENV === "production" ||
  process.env.npm_lifecycle_event === "start";

if (isProductionLikeRuntime && process.env.DEVELOPER_BYPASS_EMAILS?.trim()) {
  throw new Error(
    "Security misconfiguration: DEVELOPER_BYPASS_EMAILS must not be set in production. Use auditable grants instead.",
  );
}

// --- Bundle Analyzer Configuration ---
/**
 * To run the bundle analyzer, use the following command:
 * npm run analyze
 * This will generate HTML reports in the .next/analyze/ directory.
 * It has zero impact on standard production builds when ANALYZE is not set.
 */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const NEXT_SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "Content-Security-Policy", value: CSP_HEADER },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

// --- Next.js Base Configuration ---
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["https://kindlier-tawna-nontypographic.ngrok-free.dev"],
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "**.pexels.com" },
      { protocol: "https", hostname: "**.pixabay.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.nebius.cloud" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  trailingSlash: false,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizeCss: process.env.NODE_ENV !== "development",
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: NEXT_SECURITY_HEADERS,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    tsconfigPath: "./tsconfig.build.json",
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Aliases added from the main branch update
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      jsdom: false,
      "jsdom/lib/jsdom/living/generated/utils": false,
      "jsdom/lib/jsdom/utils": false,
    };

    config.module.rules.push({
      test: /\.pdf$/,
      type: "asset/resource",
      generator: {
        filename: "static/files/[name][ext]",
      },
    });

    // Bundle size optimizations
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          maxInitialRequests: 25,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: "framework",
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              chunks: "all",
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: "lib",
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: "commons",
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name: "shared",
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
};

// --- PWA Configuration ---
const withPWA = withPWACore({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  fallbacks: {
    document: "/offline.html",
  },
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: ({ url, request }) =>
        request.method === "GET" &&
        url.origin === self.location.origin &&
        /^\/(documents|templates|editor|resume|presentation|cv|letter)(\/.*)?$/.test(
          url.pathname,
        ),
      handler: "NetworkFirst",
      options: {
        cacheName: "draftdeck-pages",
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 24 * 60 * 60 * 7,
        },
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /^https?.*\.(png|jpe?g|webp|svg|gif|tiff|js|css)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 30,
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "gstatic-fonts-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "apis-cache",
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "others-cache",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

// Chain the wrappers: Analyzer -> PWA -> Sentry
const analyzedConfig = withBundleAnalyzer(nextConfig);
const pwaConfig = withPWA(analyzedConfig);

export default withSentryConfig(pwaConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  hideSourceMaps: true,
  disableLogger: true,
});
