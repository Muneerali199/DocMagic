/**
 * Design Languages — named, cohesive visual systems.
 * Each language fully composes a DesignTokens object. The Design Engine
 * selects one based on strategy (tone, audience, goal) or an explicit request.
 */

import type { DesignTokens, TypeScaleStep } from "./tokens";

export interface DesignLanguage {
  id: string;
  name: string;
  description: string;
  /** tones this language pairs well with — used for automatic selection */
  affinity: {
    tones: string[];
    keywords: string[];
  };
  tokens: DesignTokens;
}

function step(
  size: number,
  weight: number,
  lineHeight: number,
  letterSpacing = 0,
): TypeScaleStep {
  return { size, weight, lineHeight, letterSpacing };
}

function baseScale(overrides?: Partial<Record<string, TypeScaleStep>>) {
  return {
    display: step(64, 700, 1.05, -1.5),
    title: step(40, 700, 1.1, -0.5),
    subtitle: step(22, 400, 1.4),
    heading: step(24, 600, 1.2),
    body: step(17, 400, 1.5),
    bullet: step(17, 400, 1.5),
    caption: step(13, 400, 1.4),
    label: step(13, 600, 1.3, 0.3),
    kicker: step(13, 600, 1.2, 1.5),
    metricValue: step(48, 700, 1.05, -1),
    code: step(14, 400, 1.55),
    ...overrides,
  };
}

const SANS = "Inter";
const MONO = "JetBrains Mono";

export const DESIGN_LANGUAGES: DesignLanguage[] = [
  {
    id: "apple-keynote",
    name: "Apple Keynote",
    description:
      "Ultra-minimal, huge type, generous whitespace, near-black canvas",
    affinity: {
      tones: ["minimal", "bold", "inspirational"],
      keywords: ["apple", "keynote", "product launch", "premium", "elegant"],
    },
    tokens: {
      typography: {
        headingFamily: SANS,
        bodyFamily: SANS,
        monoFamily: MONO,
        scale: baseScale({
          display: step(76, 700, 1.02, -2),
          title: step(46, 700, 1.06, -1),
        }),
      },
      colors: {
        background: "#000000",
        surface: "#111113",
        surfaceAlt: "#1a1a1e",
        foreground: "#f5f5f7",
        mutedForeground: "#86868b",
        primary: "#ffffff",
        primaryForeground: "#000000",
        accent: "#2997ff",
        border: "#2d2d31",
        chartPalette: ["#2997ff", "#f5f5f7", "#86868b", "#64d2ff"],
        positive: "#30d158",
        negative: "#ff453a",
      },
      spacing: {
        unit: 8,
        safeMargin: 96,
        sectionGap: 48,
        itemGap: 24,
        cardPadding: 32,
      },
      shape: { radius: 16, radiusLg: 24, borderWidth: 1, shadow: "none" },
      grid: { columns: 12, gutter: 24 },
      iconography: { size: 24, sizeLg: 40, strokeWidth: 1.5, style: "outline" },
      illustration: { treatment: "photo", overlayOpacity: 0.5 },
      motion: {
        duration: 500,
        easing: "cubic-bezier(0.4,0,0.2,1)",
        entrance: "fade",
      },
    },
  },
  {
    id: "stripe",
    name: "Stripe",
    description:
      "Clean light canvas, indigo primary, crisp cards, fintech precision",
    affinity: {
      tones: ["professional", "technical"],
      keywords: ["stripe", "fintech", "saas", "developer", "api", "payments"],
    },
    tokens: {
      typography: {
        headingFamily: SANS,
        bodyFamily: SANS,
        monoFamily: MONO,
        scale: baseScale(),
      },
      colors: {
        background: "#ffffff",
        surface: "#f6f9fc",
        surfaceAlt: "#eef2f7",
        foreground: "#0a2540",
        mutedForeground: "#425466",
        primary: "#635bff",
        primaryForeground: "#ffffff",
        accent: "#00d4ff",
        border: "#e3e8ee",
        chartPalette: ["#635bff", "#00d4ff", "#0a2540", "#7a73ff"],
        positive: "#15803d",
        negative: "#b91c1c",
      },
      spacing: {
        unit: 8,
        safeMargin: 80,
        sectionGap: 40,
        itemGap: 20,
        cardPadding: 28,
      },
      shape: { radius: 8, radiusLg: 16, borderWidth: 1, shadow: "md" },
      grid: { columns: 12, gutter: 24 },
      iconography: {
        size: 22,
        sizeLg: 36,
        strokeWidth: 1.75,
        style: "outline",
      },
      illustration: { treatment: "geometric", overlayOpacity: 0.1 },
      motion: { duration: 350, easing: "ease-out", entrance: "rise" },
    },
  },
  {
    id: "google",
    name: "Google",
    description:
      "Friendly white canvas, rounded shapes, primary blue with warm accents",
    affinity: {
      tones: ["friendly", "professional"],
      keywords: ["google", "material", "education", "workshop", "playful"],
    },
    tokens: {
      typography: {
        headingFamily: SANS,
        bodyFamily: SANS,
        monoFamily: MONO,
        scale: baseScale({ title: step(38, 600, 1.15) }),
      },
      colors: {
        background: "#ffffff",
        surface: "#f8f9fa",
        surfaceAlt: "#f1f3f4",
        foreground: "#202124",
        mutedForeground: "#5f6368",
        primary: "#1a73e8",
        primaryForeground: "#ffffff",
        accent: "#fbbc04",
        border: "#dadce0",
        chartPalette: ["#1a73e8", "#ea4335", "#fbbc04", "#34a853"],
        positive: "#188038",
        negative: "#d93025",
      },
      spacing: {
        unit: 8,
        safeMargin: 72,
        sectionGap: 36,
        itemGap: 20,
        cardPadding: 24,
      },
      shape: { radius: 12, radiusLg: 24, borderWidth: 1, shadow: "sm" },
      grid: { columns: 12, gutter: 24 },
      iconography: { size: 24, sizeLg: 40, strokeWidth: 2, style: "outline" },
      illustration: { treatment: "geometric", overlayOpacity: 0.08 },
      motion: {
        duration: 300,
        easing: "cubic-bezier(0.2,0,0,1)",
        entrance: "rise",
      },
    },
  },
  {
    id: "notion",
    name: "Notion",
    description: "Warm off-white, serif-feel headings, calm document aesthetic",
    affinity: {
      tones: ["friendly", "minimal", "professional"],
      keywords: ["notion", "docs", "knowledge", "internal", "notes", "calm"],
    },
    tokens: {
      typography: {
        headingFamily: "Georgia",
        bodyFamily: SANS,
        monoFamily: MONO,
        scale: baseScale({
          display: step(58, 700, 1.1, -1),
          title: step(38, 700, 1.15, -0.5),
        }),
      },
      colors: {
        background: "#ffffff",
        surface: "#f7f6f3",
        surfaceAlt: "#f1f0ec",
        foreground: "#37352f",
        mutedForeground: "#787774",
        primary: "#2e2e2c",
        primaryForeground: "#ffffff",
        accent: "#d9730d",
        border: "#e9e8e4",
        chartPalette: ["#2e2e2c", "#d9730d", "#787774", "#448361"],
        positive: "#448361",
        negative: "#d44c47",
      },
      spacing: {
        unit: 8,
        safeMargin: 88,
        sectionGap: 40,
        itemGap: 20,
        cardPadding: 24,
      },
      shape: { radius: 6, radiusLg: 10, borderWidth: 1, shadow: "none" },
      grid: { columns: 12, gutter: 24 },
      iconography: {
        size: 22,
        sizeLg: 32,
        strokeWidth: 1.75,
        style: "outline",
      },
      illustration: { treatment: "none", overlayOpacity: 0 },
      motion: { duration: 250, easing: "ease-out", entrance: "fade" },
    },
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    description:
      "Deep gradient-free dark canvas with frosted translucent cards",
    affinity: {
      tones: ["bold", "inspirational"],
      keywords: ["glass", "futuristic", "web3", "modern", "immersive"],
    },
    tokens: {
      typography: {
        headingFamily: SANS,
        bodyFamily: SANS,
        monoFamily: MONO,
        scale: baseScale(),
      },
      colors: {
        background: "#0b1120",
        surface: "rgba(255,255,255,0.06)",
        surfaceAlt: "rgba(255,255,255,0.1)",
        foreground: "#f1f5f9",
        mutedForeground: "#94a3b8",
        primary: "#38bdf8",
        primaryForeground: "#0b1120",
        accent: "#818cf8",
        border: "rgba(255,255,255,0.14)",
        chartPalette: ["#38bdf8", "#818cf8", "#f1f5f9", "#22d3ee"],
        positive: "#34d399",
        negative: "#fb7185",
      },
      spacing: {
        unit: 8,
        safeMargin: 80,
        sectionGap: 40,
        itemGap: 20,
        cardPadding: 28,
      },
      shape: { radius: 16, radiusLg: 24, borderWidth: 1, shadow: "lg" },
      grid: { columns: 12, gutter: 24 },
      iconography: { size: 24, sizeLg: 40, strokeWidth: 1.5, style: "outline" },
      illustration: { treatment: "duotone", overlayOpacity: 0.35 },
      motion: { duration: 400, easing: "ease-out", entrance: "rise" },
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description:
      "Black on white, typographic, zero decoration, maximum whitespace",
    affinity: {
      tones: ["minimal", "professional"],
      keywords: [
        "minimal",
        "typographic",
        "studio",
        "portfolio",
        "architecture",
      ],
    },
    tokens: {
      typography: {
        headingFamily: SANS,
        bodyFamily: SANS,
        monoFamily: MONO,
        scale: baseScale({
          display: step(72, 600, 1.02, -2),
          title: step(44, 600, 1.08, -1),
        }),
      },
      colors: {
        background: "#ffffff",
        surface: "#fafafa",
        surfaceAlt: "#f4f4f5",
        foreground: "#09090b",
        mutedForeground: "#71717a",
        primary: "#09090b",
        primaryForeground: "#ffffff",
        accent: "#dc2626",
        border: "#e4e4e7",
        chartPalette: ["#09090b", "#71717a", "#dc2626", "#a1a1aa"],
        positive: "#16a34a",
        negative: "#dc2626",
      },
      spacing: {
        unit: 8,
        safeMargin: 104,
        sectionGap: 56,
        itemGap: 28,
        cardPadding: 32,
      },
      shape: { radius: 0, radiusLg: 0, borderWidth: 1, shadow: "none" },
      grid: { columns: 12, gutter: 32 },
      iconography: { size: 20, sizeLg: 32, strokeWidth: 1.5, style: "outline" },
      illustration: { treatment: "none", overlayOpacity: 0 },
      motion: { duration: 200, easing: "linear", entrance: "none" },
    },
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Navy and slate, structured grids, boardroom-ready authority",
    affinity: {
      tones: ["professional"],
      keywords: [
        "corporate",
        "enterprise",
        "board",
        "quarterly",
        "finance",
        "report",
      ],
    },
    tokens: {
      typography: {
        headingFamily: SANS,
        bodyFamily: SANS,
        monoFamily: MONO,
        scale: baseScale({ display: step(56, 700, 1.08, -1) }),
      },
      colors: {
        background: "#ffffff",
        surface: "#f8fafc",
        surfaceAlt: "#f1f5f9",
        foreground: "#0f172a",
        mutedForeground: "#475569",
        primary: "#1e3a8a",
        primaryForeground: "#ffffff",
        accent: "#0e7490",
        border: "#e2e8f0",
        chartPalette: ["#1e3a8a", "#0e7490", "#475569", "#64748b"],
        positive: "#15803d",
        negative: "#b91c1c",
      },
      spacing: {
        unit: 8,
        safeMargin: 72,
        sectionGap: 32,
        itemGap: 16,
        cardPadding: 24,
      },
      shape: { radius: 4, radiusLg: 8, borderWidth: 1, shadow: "sm" },
      grid: { columns: 12, gutter: 20 },
      iconography: {
        size: 22,
        sizeLg: 36,
        strokeWidth: 1.75,
        style: "outline",
      },
      illustration: { treatment: "photo", overlayOpacity: 0.25 },
      motion: { duration: 250, easing: "ease-out", entrance: "fade" },
    },
  },
  {
    id: "startup",
    name: "Startup",
    description:
      "Energetic, bold color pops, rounded cards, pitch-deck momentum",
    affinity: {
      tones: ["bold", "friendly", "inspirational"],
      keywords: [
        "startup",
        "pitch",
        "seed",
        "launch",
        "growth",
        "vc",
        "demo day",
      ],
    },
    tokens: {
      typography: {
        headingFamily: SANS,
        bodyFamily: SANS,
        monoFamily: MONO,
        scale: baseScale({
          display: step(68, 800, 1.02, -1.5),
          title: step(42, 800, 1.08, -0.5),
        }),
      },
      colors: {
        background: "#fffdf8",
        surface: "#ffffff",
        surfaceAlt: "#fef3e2",
        foreground: "#1c1917",
        mutedForeground: "#57534e",
        primary: "#ea580c",
        primaryForeground: "#ffffff",
        accent: "#0d9488",
        border: "#e7e5e4",
        chartPalette: ["#ea580c", "#0d9488", "#1c1917", "#f59e0b"],
        positive: "#0d9488",
        negative: "#dc2626",
      },
      spacing: {
        unit: 8,
        safeMargin: 72,
        sectionGap: 36,
        itemGap: 20,
        cardPadding: 28,
      },
      shape: { radius: 16, radiusLg: 28, borderWidth: 2, shadow: "md" },
      grid: { columns: 12, gutter: 24 },
      iconography: { size: 24, sizeLg: 44, strokeWidth: 2, style: "outline" },
      illustration: { treatment: "photo", overlayOpacity: 0.2 },
      motion: {
        duration: 350,
        easing: "cubic-bezier(0.34,1.56,0.64,1)",
        entrance: "rise",
      },
    },
  },
  {
    id: "dark-premium",
    name: "Dark Premium",
    description: "Charcoal canvas, gold accent, refined luxury presentation",
    affinity: {
      tones: ["bold", "professional", "inspirational"],
      keywords: [
        "luxury",
        "premium",
        "exclusive",
        "brand",
        "fashion",
        "executive",
      ],
    },
    tokens: {
      typography: {
        headingFamily: "Georgia",
        bodyFamily: SANS,
        monoFamily: MONO,
        scale: baseScale({
          display: step(66, 700, 1.05, -1),
          title: step(42, 700, 1.1, -0.5),
          kicker: step(13, 600, 1.2, 2.5),
        }),
      },
      colors: {
        background: "#141414",
        surface: "#1d1d1d",
        surfaceAlt: "#262626",
        foreground: "#fafaf9",
        mutedForeground: "#a8a29e",
        primary: "#d4af6a",
        primaryForeground: "#141414",
        accent: "#8a7550",
        border: "#333330",
        chartPalette: ["#d4af6a", "#fafaf9", "#a8a29e", "#8a7550"],
        positive: "#4ade80",
        negative: "#f87171",
      },
      spacing: {
        unit: 8,
        safeMargin: 88,
        sectionGap: 44,
        itemGap: 24,
        cardPadding: 32,
      },
      shape: { radius: 2, radiusLg: 4, borderWidth: 1, shadow: "none" },
      grid: { columns: 12, gutter: 28 },
      iconography: {
        size: 22,
        sizeLg: 36,
        strokeWidth: 1.25,
        style: "outline",
      },
      illustration: { treatment: "duotone", overlayOpacity: 0.5 },
      motion: { duration: 450, easing: "ease-in-out", entrance: "fade" },
    },
  },
];

export function getDesignLanguage(id: string): DesignLanguage | undefined {
  return DESIGN_LANGUAGES.find((l) => l.id === id);
}
