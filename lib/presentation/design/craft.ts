/**
 * Craft Layer — the "designer's hand".
 *
 * Adds the compositional details that distinguish professionally designed
 * decks from template output: eyebrow accent bars, hairline rules, page
 * footers, ghost section numerals, corner marks, and background rhythm.
 *
 * Every element is a native, editable shape or text run driven by design
 * tokens. Fully deterministic: the same deck + design language always
 * produces the same craft. Never images.
 */

import {
  CANVAS,
  type ResolvedElement,
  type ResolvedSlide,
  type ResolvedTextStyle,
} from "../ir/schema";
import type { DesignTokens } from "../design/tokens";

const W = CANVAS.width;
const H = CANVAS.height;

// ---------------------------------------------------------------------------
// color helpers (local, tiny — avoids new deps)
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h.split("").map((c) => c + c)
      : [h.slice(0, 2), h.slice(2, 4), h.slice(4, 6)];
  return [
    Number.parseInt(v[0], 16),
    Number.parseInt(v[1], 16),
    Number.parseInt(v[2], 16),
  ];
}

/** Mix `fg` into `bg` at ratio t (0..1). Returns hex. */
export function mixHex(fg: string, bg: string, t: number): string {
  try {
    const a = hexToRgb(fg);
    const b = hexToRgb(bg);
    const m = a.map((c, i) => Math.round(c * t + b[i] * (1 - t)));
    return `#${m.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  } catch {
    return bg;
  }
}

// ---------------------------------------------------------------------------
// motifs — each design language gets a consistent decorative personality
// ---------------------------------------------------------------------------

export type CraftMotif = "editorial" | "geometric" | "minimal";

/** Deterministic motif per design language. */
export function motifForLanguage(languageId: string): CraftMotif {
  const MAP: Record<string, CraftMotif> = {
    stripe: "editorial",
    keynote: "minimal",
    swiss: "editorial",
    editorial: "editorial",
    "neo-brutalist": "geometric",
    corporate: "editorial",
    vibrant: "geometric",
    terminal: "geometric",
    pastel: "minimal",
  };
  if (MAP[languageId]) return MAP[languageId];
  // stable hash fallback for custom languages
  let h = 0;
  for (let i = 0; i < languageId.length; i++)
    h = (h * 31 + languageId.charCodeAt(i)) | 0;
  return (["editorial", "geometric", "minimal"] as const)[Math.abs(h) % 3];
}

// ---------------------------------------------------------------------------
// element factories
// ---------------------------------------------------------------------------

let seq = 0;
function cid(slideId: string, name: string): string {
  return `craft:${slideId}:${name}:${seq++}`;
}

function textStyle(
  tokens: DesignTokens,
  size: number,
  weight: number,
  color: string,
  opts?: Partial<ResolvedTextStyle>,
): ResolvedTextStyle {
  return {
    fontFamily: tokens.typography.bodyFamily,
    fontSize: size,
    fontWeight: weight,
    lineHeight: 1.2,
    letterSpacing: 0,
    color,
    align: "left",
    textTransform: "none",
    ...opts,
  };
}

function rule(
  slideId: string,
  name: string,
  frame: { x: number; y: number; w: number; h: number },
  color: string,
): ResolvedElement {
  return {
    kind: "shape",
    id: cid(slideId, name),
    frame,
    emphasis: "tertiary",
    z: 0,
    shape: "rect",
    box: { fill: color, radius: 0, shadow: "none" },
  };
}

// ---------------------------------------------------------------------------
// per-slide craft
// ---------------------------------------------------------------------------

interface CraftContext {
  deckTitle: string;
  slideIndex: number; // 0-based
  slideTotal: number;
  sectionIndex: number; // 1-based index among section slides (0 = not section)
  motif: CraftMotif;
  tokens: DesignTokens;
}

const FOOTER_Y = H - 34;

/** Footer: hairline + deck title (left) + page number (right). */
function footer(slide: ResolvedSlide, ctx: CraftContext): ResolvedElement[] {
  const { tokens, motif } = ctx;
  const m = tokens.spacing.safeMargin;
  const hairline = mixHex(tokens.colors.foreground, slide.background, 0.16);
  const metaColor = mixHex(tokens.colors.foreground, slide.background, 0.45);
  const out: ResolvedElement[] = [];

  if (motif !== "minimal") {
    out.push(
      rule(
        slide.id,
        "footer-rule",
        { x: m, y: FOOTER_Y, w: W - m * 2, h: 1 },
        hairline,
      ),
    );
  }
  // small accent tick on the rule
  out.push(
    rule(
      slide.id,
      "footer-tick",
      { x: m, y: FOOTER_Y - 1, w: 24, h: 3 },
      tokens.colors.primary,
    ),
  );
  out.push({
    kind: "text",
    id: cid(slide.id, "footer-title"),
    frame: { x: m + 36, y: FOOTER_Y + 6, w: W * 0.5, h: 18 },
    emphasis: "tertiary",
    z: 1,
    role: "caption",
    content: ctx.deckTitle,
    style: textStyle(tokens, 10, 500, metaColor, {
      letterSpacing: 1.2,
      textTransform: "uppercase",
    }),
  });
  out.push({
    kind: "text",
    id: cid(slide.id, "footer-num"),
    frame: { x: W - m - 80, y: FOOTER_Y + 6, w: 80, h: 18 },
    emphasis: "tertiary",
    z: 1,
    role: "caption",
    content: `${String(ctx.slideIndex + 1).padStart(2, "0")} / ${String(ctx.slideTotal).padStart(2, "0")}`,
    style: textStyle(tokens, 10, 500, metaColor, {
      align: "right",
      letterSpacing: 1.2,
    }),
  });
  return out;
}

/** Hero/closing: strong asymmetric accent geometry, no footer. */
function heroCraft(slide: ResolvedSlide, ctx: CraftContext): ResolvedElement[] {
  const { tokens, motif } = ctx;
  const m = tokens.spacing.safeMargin;
  const hairline = mixHex(tokens.colors.foreground, slide.background, 0.16);
  const ghost = mixHex(tokens.colors.primary, slide.background, 0.1);
  const out: ResolvedElement[] = [];

  if (motif === "geometric") {
    // corner block bleeding off-canvas + small counter square
    out.push(
      rule(
        slide.id,
        "corner-block",
        { x: W - 220, y: -80, w: 300, h: 300 },
        ghost,
      ),
      rule(
        slide.id,
        "corner-square",
        { x: W - 260, y: 180, w: 18, h: 18 },
        tokens.colors.primary,
      ),
    );
  } else if (motif === "editorial") {
    // top meta row: tick + rules framing the composition
    out.push(
      rule(slide.id, "top-tick", { x: m, y: m, w: 48, h: 4 }, tokens.colors.primary),
      rule(
        slide.id,
        "top-rule",
        { x: m + 64, y: m + 1.5, w: W - m * 2 - 64, h: 1 },
        hairline,
      ),
      // left vertical hairline anchoring the title block
      rule(
        slide.id,
        "left-rule",
        { x: m, y: H * 0.34, w: 2, h: H * 0.3 },
        tokens.colors.primary,
      ),
    );
  } else {
    // minimal: single precise dot + baseline hairline
    out.push({
      kind: "shape",
      id: cid(slide.id, "dot"),
      frame: { x: m, y: m, w: 10, h: 10 },
      emphasis: "primary",
      z: 0,
      shape: "ellipse",
      box: { fill: tokens.colors.primary, radius: 5, shadow: "none" },
    });
  }

  // bottom meta line (all motifs): deck meta anchors the composition
  const metaColor = mixHex(tokens.colors.foreground, slide.background, 0.45);
  out.push(
    rule(
      slide.id,
      "hero-baseline",
      { x: m, y: H - m, w: 64, h: 1 },
      hairline,
    ),
    {
      kind: "text",
      id: cid(slide.id, "hero-meta"),
      frame: { x: m + 80, y: H - m - 7, w: W * 0.5, h: 16 },
      emphasis: "tertiary",
      z: 1,
      role: "caption",
      content: ctx.deckTitle,
      style: textStyle(tokens, 10, 500, metaColor, {
        letterSpacing: 1.6,
        textTransform: "uppercase",
      }),
    },
  );
  return out;
}

/** Section: oversized ghost numeral + index caption. */
function sectionCraft(
  slide: ResolvedSlide,
  ctx: CraftContext,
): ResolvedElement[] {
  const { tokens, motif } = ctx;
  const m = tokens.spacing.safeMargin;
  const num = String(ctx.sectionIndex).padStart(2, "0");
  const ghost = mixHex(tokens.colors.primary, slide.background, motif === "geometric" ? 0.12 : 0.08);
  const out: ResolvedElement[] = [];

  // giant ghost numeral, right-aligned, behind content
  out.push({
    kind: "text",
    id: cid(slide.id, "ghost-num"),
    frame: { x: W * 0.52, y: H * 0.12, w: W * 0.44, h: H * 0.76 },
    emphasis: "tertiary",
    z: 0,
    role: "title",
    content: num,
    style: textStyle(tokens, 420, 800, ghost, {
      fontFamily: tokens.typography.headingFamily,
      align: "right",
      letterSpacing: -12,
    }),
  });

  // index caption with accent tick, top-left
  out.push(
    rule(slide.id, "sec-tick", { x: m, y: m + 4, w: 32, h: 4 }, tokens.colors.primary),
    {
      kind: "text",
      id: cid(slide.id, "sec-caption"),
      frame: { x: m + 44, y: m - 2, w: 300, h: 18 },
      emphasis: "tertiary",
      z: 1,
      role: "caption",
      content: `Section ${num}`,
      style: textStyle(
        tokens,
        11,
        600,
        mixHex(tokens.colors.foreground, slide.background, 0.5),
        { letterSpacing: 2, textTransform: "uppercase" },
      ),
    },
  );
  return out;
}

/** Quote: oversized ghost quotation mark. */
function quoteCraft(slide: ResolvedSlide, ctx: CraftContext): ResolvedElement[] {
  const { tokens } = ctx;
  const m = tokens.spacing.safeMargin;
  const ghost = mixHex(tokens.colors.primary, slide.background, 0.12);
  return [
    {
      kind: "text",
      id: cid(slide.id, "ghost-quote"),
      frame: { x: m - 10, y: 20, w: 300, h: 260 },
      emphasis: "tertiary",
      z: 0,
      role: "title",
      content: "\u201C",
      style: textStyle(tokens, 280, 800, ghost, {
        fontFamily: tokens.typography.headingFamily,
      }),
    },
    rule(
      slide.id,
      "quote-tick",
      { x: W / 2 - 24, y: H - m - 4, w: 48, h: 4 },
      tokens.colors.primary,
    ),
  ];
}

/** Content-family slides: eyebrow accent above the title zone. */
function contentCraft(
  slide: ResolvedSlide,
  ctx: CraftContext,
): ResolvedElement[] {
  const { tokens, motif } = ctx;
  const m = tokens.spacing.safeMargin;
  const out: ResolvedElement[] = [];

  if (motif === "geometric") {
    // solid index square with slide number, top-right
    out.push(
      rule(
        slide.id,
        "idx-square",
        { x: W - m - 34, y: m, w: 34, h: 34 },
        tokens.colors.primary,
      ),
      {
        kind: "text",
        id: cid(slide.id, "idx-num"),
        frame: { x: W - m - 34, y: m + 8, w: 34, h: 18 },
        emphasis: "primary",
        z: 1,
        role: "caption",
        content: String(ctx.slideIndex + 1).padStart(2, "0"),
        style: textStyle(tokens, 11, 700, tokens.colors.primaryForeground, {
          align: "center",
          letterSpacing: 0.5,
        }),
      },
    );
  } else {
    // eyebrow accent bar above the title block
    out.push(
      rule(slide.id, "eyebrow", { x: m, y: m - 12, w: 40, h: 4 }, tokens.colors.primary),
    );
  }
  return out;
}

// ---------------------------------------------------------------------------
// public API
// ---------------------------------------------------------------------------

/**
 * Apply the craft layer to all slides in place. Decorations are PREPENDED
 * so they render behind content regardless of renderer z handling; meta
 * text uses z:1 but sits in margin zones no layout places content in.
 */
export function applyCraftLayer(
  slides: ResolvedSlide[],
  tokens: DesignTokens,
  languageId: string,
  deckTitle: string,
): void {
  seq = 0;
  const motif = motifForLanguage(languageId);
  const altBg = tokens.colors.surfaceAlt;
  let sectionCounter = 0;

  slides.forEach((slide, i) => {
    const isSection = slide.type === "section";
    if (isSection) sectionCounter++;

    // background rhythm: sections + quotes sit on the alt surface
    if (isSection || slide.type === "quote") {
      slide.background = altBg;
    }

    const ctx: CraftContext = {
      deckTitle,
      slideIndex: i,
      slideTotal: slides.length,
      sectionIndex: sectionCounter,
      motif,
      tokens,
    };

    const craft: ResolvedElement[] = [];
    switch (slide.type) {
      case "hero":
      case "closing":
        craft.push(...heroCraft(slide, ctx));
        break;
      case "section":
        craft.push(...sectionCraft(slide, ctx), ...footer(slide, ctx));
        break;
      case "quote":
        craft.push(...quoteCraft(slide, ctx), ...footer(slide, ctx));
        break;
      default:
        craft.push(...contentCraft(slide, ctx), ...footer(slide, ctx));
        break;
    }

    slide.elements.unshift(...craft);
  });
}
