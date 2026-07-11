/**
 * Domain Component Library
 * ------------------------
 * Native, editable, deterministic, theme-aware presentation components for the
 * major technical/product domains (Security, AI, SaaS, Mobile, Cloud, Data,
 * Finance).
 *
 * These are NOT a new engine. Every component is a pure function that composes
 * the *existing* ResolvedElement vocabulary (shape / text / code / table /
 * chart / icon) into recognizable product chrome — a VS Code editor, a
 * terminal, a GitHub pull request, a CI/CD pipeline, an AI model pipeline, a
 * SaaS dashboard, a phone frame, a cloud topology, and so on.
 *
 * Contract for every renderer:
 *   (spec, frame, tokens) => ResolvedElement[]
 *   • Deterministic  — pure function of its inputs (no Date/Math.random).
 *   • Theme-aware    — colors/spacing/type resolve from DesignTokens.
 *   • Editable       — all copy is emitted as `text`/`code` elements with
 *                      stable ids, so downstream editors can mutate it.
 *   • Layout-safe    — everything is drawn inside the provided frame.
 *
 * The materializer invokes these when a slide carries a `visual.component`
 * directive produced by the visualization plugins, so plugins compose these
 * domain components instead of generic rectangles and text boxes.
 */

import type { Frame, ResolvedElement, ResolvedTextStyle } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import { resolveTextStyle, styleOnFill } from "../typography/apply";
import { luminance, parseColor } from "../color/engine";
import { splitColumns, splitGrid } from "../constraints/geometry";

// ---------------------------------------------------------------------------
// Domain + component identifiers
// ---------------------------------------------------------------------------

export type DomainId =
  | "security"
  | "ai"
  | "saas"
  | "mobile"
  | "cloud"
  | "data"
  | "finance"
  | "generic";

export type DomainComponentId =
  // Security / developer surfaces
  | "code-editor"
  | "terminal"
  | "git-pr"
  | "cve-alert"
  | "cicd-pipeline"
  | "owasp-badge"
  // AI surfaces
  | "model-pipeline"
  | "token-flow"
  | "gpu-cluster"
  | "attention-block"
  // SaaS / Data / Finance surfaces
  | "browser-window"
  | "dashboard"
  | "kpi-widget"
  | "data-table"
  // Mobile surfaces
  | "phone-frame"
  | "app-notification"
  // Cloud surfaces
  | "cloud-architecture";

export interface DomainMetric {
  value: string;
  label: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}

export interface DomainNode {
  label: string;
  sublabel?: string;
  group?: string;
}

/** Coordinate-free content extracted from a semantic slide for a component. */
export interface DomainSpec {
  baseId: string;
  domain: DomainId;
  variant?: string;
  title?: string;
  intent?: string;
  code?: { language: string; code: string; caption?: string };
  bullets: string[];
  metrics: DomainMetric[];
  table?: { headers: string[]; rows: string[][] };
  chart?: {
    chartType:
      | "bar"
      | "line"
      | "area"
      | "pie"
      | "doughnut"
      | "radar"
      | "scatter";
    title?: string;
    categories: string[];
    series: Array<{ name: string; data: number[] }>;
  };
  nodes: DomainNode[];
}

// ---------------------------------------------------------------------------
// Deterministic color helpers (theme-aware where it matters, brand-authentic
// chrome where a domain has a strong convention — e.g. dark IDE/terminal)
// ---------------------------------------------------------------------------

const TRAFFIC = { red: "#ff5f57", amber: "#febc2e", green: "#28c840" } as const;

/** VS Code / GitHub-dark inspired chrome — recognizable across any deck theme. */
const IDE = {
  bg: "#1e1e1e",
  bar: "#323233",
  gutter: "#1e1e1e",
  text: "#d4d4d4",
  muted: "#858585",
  accent: "#4ec9b0",
  keyword: "#569cd6",
} as const;

const TERMINAL = {
  bg: "#0c0c14",
  bar: "#1b1b28",
  text: "#e4e4ef",
  muted: "#8a8aa3",
  prompt: "#3fb950",
} as const;

const DIFF = {
  addBg: "rgba(63,185,80,0.16)",
  addText: "#56d364",
  delBg: "rgba(248,81,73,0.16)",
  delText: "#f85149",
  open: "#238636",
} as const;

const SEVERITY: Record<string, string> = {
  critical: "#d1242f",
  high: "#e5534b",
  medium: "#d29922",
  low: "#3fb950",
};

function isDark(color: string): boolean {
  const rgba = parseColor(color);
  return rgba ? luminance(rgba) < 0.28 : false;
}

/** Linear blend between two colors at ratio t (0..1). Returns "#rrggbb". */
function mix(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return a;
  const to = (n: number) => Math.round(Math.max(0, Math.min(255, n)));
  const c = (k: "r" | "g" | "b") => to(ca[k] + (cb[k] - ca[k]) * t);
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(c("r"))}${hex(c("g"))}${hex(c("b"))}`;
}

// ---------------------------------------------------------------------------
// Element factories — terse, correct ResolvedElement builders
// ---------------------------------------------------------------------------

function rect(
  id: string,
  frame: Frame,
  fill: string,
  z = 0,
  opts: {
    border?: string;
    borderWidth?: number;
    radius?: number;
    shadow?: "none" | "sm" | "md" | "lg";
    shape?: "rect" | "roundRect" | "ellipse";
  } = {},
): ResolvedElement {
  return {
    kind: "shape",
    id,
    frame,
    emphasis: "tertiary",
    z,
    shape: opts.shape ?? (opts.radius ? "roundRect" : "rect"),
    box: {
      fill,
      borderColor: opts.border,
      borderWidth: opts.borderWidth ?? (opts.border ? 1 : 0),
      radius: opts.radius ?? 0,
      shadow: opts.shadow ?? "none",
    },
  };
}

function text(
  id: string,
  frame: Frame,
  content: string,
  style: ResolvedTextStyle,
  z = 2,
): ResolvedElement {
  return {
    kind: "text",
    id,
    frame,
    emphasis: "secondary",
    z,
    role: "body",
    content,
    style,
  };
}

function monoStyle(
  tokens: DesignTokens,
  color: string,
  size: number,
  weight = 400,
): ResolvedTextStyle {
  return {
    fontFamily: tokens.typography.monoFamily,
    fontSize: size,
    fontWeight: weight,
    lineHeight: 1.5,
    letterSpacing: 0,
    color,
    align: "left",
    textTransform: "none",
  };
}

function labelStyle(
  tokens: DesignTokens,
  color: string,
  size = 12,
  weight = 600,
): ResolvedTextStyle {
  return {
    fontFamily: tokens.typography.bodyFamily,
    fontSize: size,
    fontWeight: weight,
    lineHeight: 1.3,
    letterSpacing: 0.2,
    color,
    align: "left",
    textTransform: "none",
  };
}

function codeEl(
  id: string,
  frame: Frame,
  code: string,
  language: string,
  style: ResolvedTextStyle,
  fill: string,
  radius = 0,
  z = 2,
): ResolvedElement {
  return {
    kind: "code",
    id,
    frame,
    emphasis: "secondary",
    z,
    language,
    code,
    style,
    box: { fill, radius, shadow: "none" },
  };
}

/** Three macOS-style window dots at the given origin. */
function trafficDots(baseId: string, x: number, y: number): ResolvedElement[] {
  return [TRAFFIC.red, TRAFFIC.amber, TRAFFIC.green].map((fill, i) =>
    rect(`${baseId}:dot-${i}`, { x: x + i * 20, y, w: 12, h: 12 }, fill, 3, {
      shape: "ellipse",
      radius: 6,
    }),
  );
}

interface Chrome {
  elements: ResolvedElement[];
  body: Frame;
}

/**
 * A window shell: rounded panel + title bar with traffic dots and an optional
 * title/URL pill. Returns the shell elements and the inner content frame.
 */
function windowChrome(
  baseId: string,
  frame: Frame,
  opts: {
    bg: string;
    bar: string;
    barText: string;
    title?: string;
    url?: string;
    border?: string;
    radius: number;
    tokens: DesignTokens;
  },
): Chrome {
  const barH = 34;
  const out: ResolvedElement[] = [];
  out.push(
    rect(`${baseId}:panel`, frame, opts.bg, 0, {
      radius: opts.radius,
      border: opts.border,
      borderWidth: opts.border ? 1 : 0,
      shadow: "lg",
    }),
  );
  out.push(
    rect(
      `${baseId}:bar`,
      { x: frame.x, y: frame.y, w: frame.w, h: barH },
      opts.bar,
      1,
      { radius: opts.radius },
    ),
  );
  // square off the bottom of the rounded bar so it meets the body cleanly
  out.push(
    rect(
      `${baseId}:bar-foot`,
      {
        x: frame.x,
        y: frame.y + barH - opts.radius,
        w: frame.w,
        h: opts.radius,
      },
      opts.bar,
      1,
    ),
  );
  out.push(...trafficDots(baseId, frame.x + 16, frame.y + (barH - 12) / 2));

  if (opts.url) {
    const pillX = frame.x + 92;
    const pillW = Math.min(frame.w - 120, 460);
    out.push(
      rect(
        `${baseId}:urlpill`,
        { x: pillX, y: frame.y + 7, w: pillW, h: 20 },
        mix(opts.bar, "#ffffff", isDark(opts.bar) ? 0.12 : 0.5),
        2,
        { radius: 10 },
      ),
    );
    out.push(
      text(
        `${baseId}:url`,
        { x: pillX + 12, y: frame.y + 9, w: pillW - 24, h: 16 },
        opts.url,
        monoStyle(opts.tokens, opts.barText, 11),
        3,
      ),
    );
  } else if (opts.title) {
    out.push(
      text(
        `${baseId}:title`,
        { x: frame.x + 84, y: frame.y + 9, w: frame.w - 168, h: 18 },
        opts.title,
        { ...labelStyle(opts.tokens, opts.barText, 12, 600), align: "center" },
        3,
      ),
    );
  }

  return {
    elements: out,
    body: {
      x: frame.x,
      y: frame.y + barH,
      w: frame.w,
      h: frame.h - barH,
    },
  };
}

/** Small status pill (rounded chip with centered label). */
function pill(
  id: string,
  frame: Frame,
  fill: string,
  label: string,
  textColor: string,
  tokens: DesignTokens,
  z = 3,
): ResolvedElement[] {
  return [
    rect(id, frame, fill, z, { radius: frame.h / 2 }),
    text(
      `${id}:t`,
      { x: frame.x, y: frame.y + (frame.h - 13) / 2, w: frame.w, h: 14 },
      label,
      { ...labelStyle(tokens, textColor, 11, 600), align: "center" },
      z + 1,
    ),
  ];
}

// ---------------------------------------------------------------------------
// Deterministic fallbacks — keep components meaningful even on sparse slides
// ---------------------------------------------------------------------------

/** Stable pseudo-value in [0,1) from a string+index; no randomness. */
function seeded(seed: string, i: number): number {
  let h = 2166136261 ^ i;
  for (let k = 0; k < seed.length; k++) {
    h = Math.imul(h ^ seed.charCodeAt(k), 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function fallbackCode(language: string): string {
  if (["bash", "sh", "shell", "console", "zsh"].includes(language))
    return "$ npm run build\n✓ compiled successfully\n$ npm test\n✓ 128 passing (2.4s)";
  return [
    "export async function handler(req: Request) {",
    "  const session = await auth(req)",
    "  if (!session) return unauthorized()",
    "  return json({ ok: true, user: session.user })",
    "}",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// SECURITY / DEVELOPER SURFACES
// ---------------------------------------------------------------------------

/** VS Code style editor: title bar, file tab, line-number gutter, code body. */
export function renderCodeEditor(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const language = spec.code?.language ?? "typescript";
  const source = spec.code?.code?.trim() || fallbackCode(language);
  const fileName = spec.code?.caption ?? `${languageFile(language)}`;
  const shell = windowChrome(b, frame, {
    bg: IDE.bg,
    bar: IDE.bar,
    barText: IDE.muted,
    title: spec.title,
    border: mix(IDE.bg, "#ffffff", 0.08),
    radius: 10,
    tokens,
  });
  const out = [...shell.elements];
  const body = shell.body;

  // active file tab
  out.push(
    rect(`${b}:tab`, { x: body.x, y: body.y, w: 176, h: 30 }, IDE.bg, 2),
    rect(
      `${b}:tab-accent`,
      { x: body.x, y: body.y, w: 176, h: 2 },
      tokens.colors.primary,
      3,
    ),
    text(
      `${b}:tab-name`,
      { x: body.x + 14, y: body.y + 7, w: 150, h: 16 },
      fileName,
      monoStyle(tokens, IDE.text, 12),
      3,
    ),
    rect(
      `${b}:tabbar`,
      { x: body.x, y: body.y + 30, w: body.w, h: 1 },
      mix(IDE.bg, "#ffffff", 0.08),
      2,
    ),
  );

  const codeTop = body.y + 30;
  const codeH = body.h - 30;
  const gutterW = 44;
  const lines = source.split("\n");
  const numbers = lines.map((_, i) => String(i + 1)).join("\n");
  const mono = monoStyle(tokens, IDE.text, tokens.typography.scale.code.size);

  out.push(
    rect(
      `${b}:gutter`,
      { x: body.x, y: codeTop, w: gutterW, h: codeH },
      IDE.gutter,
      2,
    ),
    codeEl(
      `${b}:linenos`,
      { x: body.x, y: codeTop, w: gutterW, h: codeH },
      numbers,
      "text",
      {
        ...monoStyle(tokens, IDE.muted, tokens.typography.scale.code.size),
        align: "right",
      },
      IDE.gutter,
      0,
      3,
    ),
    codeEl(
      `${b}:code`,
      {
        x: body.x + gutterW + 8,
        y: codeTop,
        w: body.w - gutterW - 12,
        h: codeH,
      },
      source,
      language,
      mono,
      IDE.bg,
      0,
      3,
    ),
  );
  return out;
}

function languageFile(language: string): string {
  const map: Record<string, string> = {
    typescript: "handler.ts",
    javascript: "index.js",
    python: "main.py",
    go: "server.go",
    rust: "lib.rs",
    java: "App.java",
    sql: "query.sql",
    tsx: "App.tsx",
    jsx: "App.jsx",
  };
  return map[language.toLowerCase()] ?? `snippet.${language.toLowerCase()}`;
}

/** Terminal / CLI session with a titled bar and a prompt-prefixed transcript. */
export function renderTerminal(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const shell = windowChrome(b, frame, {
    bg: TERMINAL.bg,
    bar: TERMINAL.bar,
    barText: TERMINAL.muted,
    title: spec.title ? `${truncate(spec.title, 40)} — zsh` : "zsh — 80×24",
    border: mix(TERMINAL.bg, "#ffffff", 0.1),
    radius: 10,
    tokens,
  });
  const out = [...shell.elements];
  const body = shell.body;
  const raw = spec.code?.code?.trim();
  const lines = (raw || fallbackCode("bash")).split("\n");

  const mono = monoStyle(
    tokens,
    TERMINAL.text,
    tokens.typography.scale.code.size,
  );
  const promptMono = monoStyle(
    tokens,
    TERMINAL.prompt,
    tokens.typography.scale.code.size,
    600,
  );
  const lineH = tokens.typography.scale.code.size * 1.55;
  let y = body.y + 14;
  lines.slice(0, Math.floor((body.h - 24) / lineH)).forEach((line, i) => {
    const isCmd = !raw || /^\s*\$/.test(line) || i === 0;
    const clean = line.replace(/^\s*\$\s?/, "");
    if (isCmd) {
      out.push(
        text(
          `${b}:pr-${i}`,
          { x: body.x + 16, y, w: 14, h: lineH },
          "$",
          promptMono,
          3,
        ),
        text(
          `${b}:ln-${i}`,
          { x: body.x + 32, y, w: body.w - 44, h: lineH },
          clean,
          mono,
          3,
        ),
      );
    } else {
      out.push(
        text(
          `${b}:ln-${i}`,
          { x: body.x + 32, y, w: body.w - 44, h: lineH },
          clean,
          monoStyle(tokens, TERMINAL.muted, tokens.typography.scale.code.size),
          3,
        ),
      );
    }
    y += lineH;
  });
  // blinking-cursor block (static)
  out.push(
    rect(
      `${b}:cursor`,
      { x: body.x + 32, y: y + 2, w: 9, h: lineH * 0.7 },
      TERMINAL.prompt,
      3,
    ),
  );
  return out;
}

/** GitHub-style pull request with an open badge, branch ref, and a diff hunk. */
export function renderGitPr(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const surface = tokens.colors.surface;
  const out: ResolvedElement[] = [
    rect(`${b}:panel`, frame, surface, 0, {
      radius: 12,
      border: tokens.colors.border,
      borderWidth: 1,
      shadow: "lg",
    }),
  ];
  const pad = 20;
  const prTitle = spec.title ?? "Harden auth middleware";
  out.push(
    ...pill(
      `${b}:open`,
      { x: frame.x + pad, y: frame.y + pad, w: 74, h: 24 },
      DIFF.open,
      "Open",
      "#ffffff",
      tokens,
    ),
    text(
      `${b}:prtitle`,
      {
        x: frame.x + pad + 86,
        y: frame.y + pad + 2,
        w: frame.w - pad * 2 - 86,
        h: 22,
      },
      prTitle,
      { ...labelStyle(tokens, tokens.colors.foreground, 17, 700) },
    ),
    text(
      `${b}:branch`,
      { x: frame.x + pad, y: frame.y + pad + 32, w: frame.w - pad * 2, h: 16 },
      "feature/secure-session  →  main",
      monoStyle(tokens, tokens.colors.mutedForeground, 12),
    ),
  );

  // diff file header
  const diffTop = frame.y + pad + 58;
  out.push(
    rect(
      `${b}:diffhead`,
      { x: frame.x + pad, y: diffTop, w: frame.w - pad * 2, h: 26 },
      tokens.colors.surfaceAlt,
      1,
      { radius: 6, border: tokens.colors.border, borderWidth: 1 },
    ),
    text(
      `${b}:diffname`,
      {
        x: frame.x + pad + 12,
        y: diffTop + 6,
        w: frame.w - pad * 2 - 24,
        h: 14,
      },
      spec.code?.caption ?? "middleware/auth.ts",
      monoStyle(tokens, tokens.colors.foreground, 12, 600),
    ),
  );

  // diff rows: classify code lines by leading +/-, or synthesize from bullets
  const lines = diffLines(spec);
  const rowH = 22;
  let y = diffTop + 30;
  const maxRows = Math.max(1, Math.floor((frame.y + frame.h - pad - y) / rowH));
  lines.slice(0, maxRows).forEach((row, i) => {
    const bg =
      row.type === "add"
        ? DIFF.addBg
        : row.type === "del"
          ? DIFF.delBg
          : "transparent";
    const fg =
      row.type === "add"
        ? DIFF.addText
        : row.type === "del"
          ? DIFF.delText
          : tokens.colors.mutedForeground;
    const sign = row.type === "add" ? "+" : row.type === "del" ? "-" : " ";
    if (bg !== "transparent")
      out.push(
        rect(
          `${b}:row-${i}`,
          { x: frame.x + pad, y, w: frame.w - pad * 2, h: rowH },
          bg,
          1,
        ),
      );
    out.push(
      text(
        `${b}:sign-${i}`,
        { x: frame.x + pad + 8, y: y + 3, w: 12, h: 16 },
        sign,
        monoStyle(tokens, fg, 12, 700),
        2,
      ),
      text(
        `${b}:diff-${i}`,
        { x: frame.x + pad + 26, y: y + 3, w: frame.w - pad * 2 - 34, h: 16 },
        row.text,
        monoStyle(
          tokens,
          row.type === "ctx" ? tokens.colors.foreground : fg,
          12,
        ),
        2,
      ),
    );
    y += rowH;
  });
  return out;
}

function diffLines(
  spec: DomainSpec,
): Array<{ type: "add" | "del" | "ctx"; text: string }> {
  const raw = spec.code?.code?.trim();
  if (raw) {
    const parsed = raw.split("\n").map((l) => {
      if (l.startsWith("+"))
        return { type: "add" as const, text: l.slice(1).trim() };
      if (l.startsWith("-"))
        return { type: "del" as const, text: l.slice(1).trim() };
      return { type: "ctx" as const, text: l.trim() };
    });
    if (parsed.some((p) => p.type !== "ctx")) return parsed;
  }
  const bullets = spec.bullets.slice(0, 5);
  if (bullets.length)
    return bullets.map((t, i) => ({
      type: i % 2 === 0 ? ("add" as const) : ("ctx" as const),
      text: t,
    }));
  return [
    { type: "del", text: "const token = req.cookies.session" },
    { type: "add", text: "const token = await verifySession(req)" },
    { type: "ctx", text: "if (!token) return unauthorized()" },
    { type: "add", text: "rateLimit(req.ip)" },
  ];
}

/** CVE security alert card: severity bar, id, CVSS score, description. */
export function renderCveAlert(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const sevWord = detectSeverity(spec);
  const sev = SEVERITY[sevWord] ?? SEVERITY.high;
  const cveId = matchPattern(spec, /CVE-\d{4}-\d{3,7}/i) ?? "CVE-2024-31337";
  const cvss =
    matchPattern(spec, /\b(?:10(?:\.0)?|[0-9]\.[0-9])\b/) ??
    spec.metrics[0]?.value ??
    "9.8";
  const out: ResolvedElement[] = [
    rect(`${b}:panel`, frame, tokens.colors.surface, 0, {
      radius: 12,
      border: tokens.colors.border,
      borderWidth: 1,
      shadow: "lg",
    }),
    rect(`${b}:sevbar`, { x: frame.x, y: frame.y, w: 6, h: frame.h }, sev, 1, {
      radius: 3,
    }),
  ];
  const pad = 24;
  const x = frame.x + pad + 6;
  out.push(
    ...pill(
      `${b}:sev`,
      { x, y: frame.y + pad, w: 96, h: 26 },
      sev,
      sevWord.toUpperCase(),
      "#ffffff",
      tokens,
    ),
    text(
      `${b}:cve`,
      { x: x + 108, y: frame.y + pad + 3, w: frame.w - pad * 2 - 108, h: 20 },
      cveId,
      monoStyle(tokens, tokens.colors.foreground, 15, 700),
    ),
    text(
      `${b}:title`,
      { x, y: frame.y + pad + 40, w: frame.w - pad * 2 - 6, h: 26 },
      spec.title ?? "Authentication bypass in session handler",
      {
        ...labelStyle(tokens, tokens.colors.foreground, 18, 700),
        lineHeight: 1.3,
      },
    ),
  );
  // Metadata grid: fills the vertical space between the header and the score
  // block so the advisory card reads like a real CVE detail view rather than a
  // sparse card with a big empty middle.
  const metaTop = frame.y + pad + 78;
  const scoreY = frame.y + frame.h - pad - 58;
  const metaGap = 12;
  const metaW = frame.w - pad * 2 - 6;
  const attackVector =
    matchPattern(spec, /\b(network|remote|local|physical|adjacent)\b/i) ??
    "Network";
  const affected =
    spec.nodes[0]?.label ??
    matchPattern(spec, /[\w.-]+@[\w.-]+|[\w-]+\/[\w-]+/) ??
    "app-core / session handler";
  const metaRows: Array<[string, string]> = [
    ["Affected component", affected],
    ["Attack vector", attackVector],
    ["Vector string", `CVSS:3.1 / severity ${sevWord}`],
    ["Remediation", spec.bullets[1] ?? "Patch available — upgrade recommended"],
  ];
  const metaAvail = scoreY - metaTop - 16;
  if (metaAvail > 40) {
    const rowH = Math.min(
      52,
      Math.max(
        28,
        (metaAvail - metaGap * (metaRows.length - 1)) / metaRows.length,
      ),
    );
    metaRows.forEach(([k, v], i) => {
      const ry = metaTop + i * (rowH + metaGap);
      if (ry + rowH > scoreY - 12) return;
      out.push(
        rect(
          `${b}:metarow${i}`,
          { x, y: ry, w: metaW, h: rowH },
          tokens.colors.surfaceAlt,
          0,
          { radius: 6 },
        ),
        text(
          `${b}:metakey${i}`,
          { x: x + 12, y: ry + rowH / 2 - 8, w: 180, h: 16 },
          k,
          {
            ...labelStyle(tokens, tokens.colors.mutedForeground, 11, 600),
            textTransform: "uppercase",
          },
        ),
        text(
          `${b}:metaval${i}`,
          { x: x + 200, y: ry + rowH / 2 - 9, w: metaW - 212, h: 18 },
          v,
          monoStyle(tokens, tokens.colors.foreground, 13, 500),
        ),
      );
    });
  }
  // CVSS score block
  out.push(
    rect(
      `${b}:scorebox`,
      { x, y: scoreY, w: 120, h: 58 },
      tokens.colors.surfaceAlt,
      1,
      { radius: 8, border: tokens.colors.border, borderWidth: 1 },
    ),
    text(`${b}:score`, { x, y: scoreY + 6, w: 120, h: 34 }, String(cvss), {
      ...labelStyle(tokens, sev, 30, 800),
      align: "center",
    }),
    text(`${b}:scorelabel`, { x, y: scoreY + 40, w: 120, h: 14 }, "CVSS v3.1", {
      ...labelStyle(tokens, tokens.colors.mutedForeground, 10, 600),
      align: "center",
      textTransform: "uppercase",
    }),
  );
  const desc =
    spec.bullets[0] ??
    spec.intent ??
    "Unauthenticated requests can forge a valid session token, exposing protected routes. Patch available.";
  out.push(
    text(
      `${b}:desc`,
      { x: x + 136, y: scoreY, w: frame.w - pad * 2 - 6 - 136, h: 58 },
      desc,
      styleOnFill(
        resolveTextStyle("body", "secondary", tokens),
        tokens.colors.surface,
        tokens,
      ),
    ),
  );
  return out;
}

function detectSeverity(spec: DomainSpec): string {
  const hay =
    `${spec.title ?? ""} ${spec.intent ?? ""} ${spec.bullets.join(" ")}`.toLowerCase();
  if (hay.includes("critical")) return "critical";
  if (hay.includes("medium")) return "medium";
  if (hay.includes("low")) return "low";
  return "high";
}

function matchPattern(spec: DomainSpec, re: RegExp): string | null {
  const hay = `${spec.title ?? ""} ${spec.intent ?? ""} ${spec.bullets.join(" ")} ${spec.code?.code ?? ""}`;
  const m = hay.match(re);
  return m ? m[0] : null;
}

/** CI/CD pipeline: horizontal stages with status dots and connectors. */
export function renderCicdPipeline(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const stages = pipelineStages(spec, ["Build", "Test", "Scan", "Deploy"]);
  return renderStageRail(spec.baseId, frame, tokens, stages, {
    accent: tokens.colors.primary,
    statusColor: (i, n) => (i < n - 1 ? DIFF.open : tokens.colors.primary),
    title: spec.title,
  });
}

/** AI model pipeline: Input → Tokenize → Model → Decode → Output stages. */
export function renderModelPipeline(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const stages = pipelineStages(spec, [
    "Input",
    "Tokenize",
    "Embed",
    "Transformer",
    "Decode",
    "Output",
  ]);
  return renderStageRail(spec.baseId, frame, tokens, stages, {
    accent: tokens.colors.accent,
    statusColor: () => tokens.colors.accent,
    title: spec.title,
  });
}

interface Stage {
  label: string;
  sublabel?: string;
}

function pipelineStages(spec: DomainSpec, fallback: string[]): Stage[] {
  if (spec.nodes.length >= 2)
    return spec.nodes
      .slice(0, 6)
      .map((n) => ({ label: n.label, sublabel: n.sublabel }));
  if (spec.bullets.length >= 2)
    return spec.bullets.slice(0, 6).map((t) => ({ label: t }));
  return fallback.map((label) => ({ label }));
}

function renderStageRail(
  baseId: string,
  frame: Frame,
  tokens: DesignTokens,
  stages: Stage[],
  opts: {
    accent: string;
    statusColor: (i: number, n: number) => string;
    title?: string;
  },
): ResolvedElement[] {
  const b = baseId;
  const out: ResolvedElement[] = [];
  const n = Math.max(1, stages.length);
  const gap = 16;
  const chipH = Math.min(96, frame.h * 0.6);
  const cy = frame.y + frame.h / 2;
  const cols = splitColumns(frame, n, gap);
  cols.forEach((col, i) => {
    // connector to next
    if (i < n - 1) {
      out.push(
        rect(
          `${b}:conn-${i}`,
          { x: col.x + col.w, y: cy - 1.5, w: gap, h: 3 },
          mix(tokens.colors.border, opts.accent, 0.4),
          1,
        ),
      );
    }
    const chip: Frame = { x: col.x, y: cy - chipH / 2, w: col.w, h: chipH };
    const active = i === 0;
    out.push(
      rect(
        `${b}:chip-${i}`,
        chip,
        active
          ? mix(tokens.colors.surface, opts.accent, 0.12)
          : tokens.colors.surface,
        2,
        {
          radius: 12,
          border: active ? opts.accent : tokens.colors.border,
          borderWidth: active ? 2 : 1,
          shadow: "sm",
        },
      ),
      rect(
        `${b}:status-${i}`,
        { x: chip.x + 14, y: chip.y + 14, w: 10, h: 10 },
        opts.statusColor(i, n),
        3,
        { shape: "ellipse", radius: 5 },
      ),
      text(
        `${b}:step-${i}`,
        { x: chip.x + 14, y: chip.y + 30, w: chip.w - 28, h: 20 },
        `0${i + 1}`,
        { ...labelStyle(tokens, tokens.colors.mutedForeground, 12, 700) },
        3,
      ),
      text(
        `${b}:label-${i}`,
        { x: chip.x + 14, y: chip.y + chipH - 34, w: chip.w - 28, h: 22 },
        truncate(stages[i].label, 22),
        styleOnFill(
          resolveTextStyle("label", "primary", tokens),
          tokens.colors.surface,
          tokens,
        ),
        3,
      ),
    );
  });
  return out;
}

/** GPU cluster: a grid of accelerator cards with utilization bars. */
export function renderGpuCluster(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const count = clamp(spec.metrics.length || spec.nodes.length || 8, 4, 8);
  const cols = count <= 4 ? count : 4;
  const rows = Math.ceil(count / cols);
  const cells = splitGrid(frame, rows, cols, 14);
  const out: ResolvedElement[] = [];
  for (let i = 0; i < count; i++) {
    const cell = cells[i];
    if (!cell) break;
    const util = spec.metrics[i]?.value
      ? parseFloat(spec.metrics[i].value) / 100
      : 0.4 + seeded(b, i) * 0.55;
    const clampedUtil = clamp(util, 0.05, 1);
    const name = spec.metrics[i]?.label ?? spec.nodes[i]?.label ?? `GPU ${i}`;
    out.push(
      rect(`${b}:gpu-${i}`, cell, tokens.colors.surface, 1, {
        radius: 10,
        border: tokens.colors.border,
        borderWidth: 1,
        shadow: "sm",
      }),
      rect(
        `${b}:gpu-icon-${i}`,
        { x: cell.x + 12, y: cell.y + 12, w: 22, h: 22 },
        mix(tokens.colors.surface, tokens.colors.accent, 0.25),
        2,
        { radius: 5 },
      ),
      text(
        `${b}:gpu-name-${i}`,
        { x: cell.x + 42, y: cell.y + 14, w: cell.w - 54, h: 18 },
        truncate(name, 14),
        labelStyle(tokens, tokens.colors.foreground, 13, 600),
        2,
      ),
      // utilization track + fill
      rect(
        `${b}:gpu-track-${i}`,
        { x: cell.x + 12, y: cell.y + cell.h - 26, w: cell.w - 24, h: 8 },
        tokens.colors.surfaceAlt,
        2,
        { radius: 4 },
      ),
      rect(
        `${b}:gpu-fill-${i}`,
        {
          x: cell.x + 12,
          y: cell.y + cell.h - 26,
          w: (cell.w - 24) * clampedUtil,
          h: 8,
        },
        tokens.colors.accent,
        3,
        { radius: 4 },
      ),
      text(
        `${b}:gpu-util-${i}`,
        { x: cell.x + 12, y: cell.y + cell.h - 46, w: cell.w - 24, h: 16 },
        `${Math.round(clampedUtil * 100)}% util`,
        monoStyle(tokens, tokens.colors.mutedForeground, 11),
        2,
      ),
    );
  }
  return out;
}

/** Attention block: an NxN heatmap of weights (deterministic pattern). */
export function renderAttentionBlock(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const n = 6;
  const out: ResolvedElement[] = [];
  const size = Math.min(frame.w, frame.h);
  const grid: Frame = {
    x: frame.x + (frame.w - size) / 2,
    y: frame.y + (frame.h - size) / 2,
    w: size,
    h: size,
  };
  const cells = splitGrid(grid, n, n, 4);
  const base = tokens.colors.surfaceAlt;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const idx = r * n + c;
      // diagonal-dominant deterministic attention weights
      const diag = 1 - Math.min(1, Math.abs(r - c) / 2);
      const w = clamp(diag * 0.75 + seeded(b, idx) * 0.25, 0, 1);
      out.push(
        rect(
          `${b}:cell-${idx}`,
          cells[idx],
          mix(base, tokens.colors.primary, w),
          1,
          { radius: 3 },
        ),
      );
    }
  }
  return out;
}

/** Token flow: a sequence of token chips with attention weight bars. */
export function renderTokenFlow(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const tokensList = tokenList(spec);
  const n = tokensList.length;
  const cols = splitColumns(frame, n, 10);
  const out: ResolvedElement[] = [];
  cols.forEach((col, i) => {
    const w = clamp(0.25 + seeded(b, i) * 0.7, 0.1, 1);
    const chipH = 40;
    const cy = frame.y + frame.h / 2;
    out.push(
      rect(
        `${b}:tok-${i}`,
        { x: col.x, y: cy - chipH, w: col.w, h: chipH },
        mix(tokens.colors.surface, tokens.colors.accent, 0.1),
        2,
        { radius: 8, border: tokens.colors.border, borderWidth: 1 },
      ),
      text(
        `${b}:toklabel-${i}`,
        { x: col.x, y: cy - chipH + 11, w: col.w, h: 18 },
        truncate(tokensList[i], 10),
        {
          ...labelStyle(tokens, tokens.colors.foreground, 13, 600),
          align: "center",
        },
        3,
      ),
      // weight bar below
      rect(
        `${b}:toktrack-${i}`,
        { x: col.x + 4, y: cy + 8, w: col.w - 8, h: 40 },
        tokens.colors.surfaceAlt,
        2,
        { radius: 4 },
      ),
      rect(
        `${b}:tokfill-${i}`,
        { x: col.x + 4, y: cy + 8 + 40 * (1 - w), w: col.w - 8, h: 40 * w },
        tokens.colors.accent,
        3,
        { radius: 4 },
      ),
    );
  });
  return out;
}

function tokenList(spec: DomainSpec): string[] {
  if (spec.nodes.length >= 3) return spec.nodes.slice(0, 8).map((n) => n.label);
  const words = (
    spec.title ??
    spec.bullets[0] ??
    "The model attends to prior context tokens"
  )
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 8);
}

// ---------------------------------------------------------------------------
// SAAS / DATA / FINANCE SURFACES
// ---------------------------------------------------------------------------

/** Browser window chrome wrapping a product screen (chart/list/metrics). */
export function renderBrowserWindow(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const bar = tokens.colors.surfaceAlt;
  const shell = windowChrome(b, frame, {
    bg: tokens.colors.surface,
    bar,
    barText: tokens.colors.mutedForeground,
    url: browserUrl(spec),
    border: tokens.colors.border,
    radius: 12,
    tokens,
  });
  const out = [...shell.elements];
  out.push(...renderScreenContent(`${b}:screen`, shell.body, tokens, spec));
  return out;
}

function browserUrl(spec: DomainSpec): string {
  const slug =
    (spec.title ?? "dashboard")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) || "app";
  return `https://app.example.com/${slug}`;
}

/** SaaS/analytics/finance dashboard: sidebar + KPI row + chart + list. */
export function renderDashboard(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const out: ResolvedElement[] = [
    rect(`${b}:frame`, frame, tokens.colors.surface, 0, {
      radius: 12,
      border: tokens.colors.border,
      borderWidth: 1,
      shadow: "lg",
    }),
  ];
  const sidebarW = Math.min(140, frame.w * 0.16);
  const sidebar: Frame = { x: frame.x, y: frame.y, w: sidebarW, h: frame.h };
  out.push(
    rect(`${b}:sidebar`, sidebar, tokens.colors.surfaceAlt, 1, { radius: 12 }),
  );
  out.push(
    rect(
      `${b}:sidebar-foot`,
      { x: sidebar.x + sidebar.w - 12, y: sidebar.y, w: 12, h: sidebar.h },
      tokens.colors.surfaceAlt,
      1,
    ),
  );
  // brand dot + nav items
  out.push(
    rect(
      `${b}:brand`,
      { x: sidebar.x + 16, y: sidebar.y + 18, w: 20, h: 20 },
      tokens.colors.primary,
      2,
      { radius: 6 },
    ),
  );
  const navItems = ["Overview", "Reports", "Customers", "Settings"];
  navItems.forEach((item, i) => {
    const y = sidebar.y + 58 + i * 34;
    const active = i === 0;
    if (active)
      out.push(
        rect(
          `${b}:navbg-${i}`,
          { x: sidebar.x + 10, y: y - 6, w: sidebar.w - 20, h: 28 },
          mix(tokens.colors.surfaceAlt, tokens.colors.primary, 0.16),
          2,
          { radius: 6 },
        ),
      );
    out.push(
      rect(
        `${b}:navdot-${i}`,
        { x: sidebar.x + 18, y: y, w: 8, h: 8 },
        active ? tokens.colors.primary : tokens.colors.mutedForeground,
        3,
        { radius: 2 },
      ),
      text(
        `${b}:nav-${i}`,
        { x: sidebar.x + 34, y: y - 3, w: sidebar.w - 44, h: 16 },
        item,
        labelStyle(
          tokens,
          active ? tokens.colors.foreground : tokens.colors.mutedForeground,
          12,
          active ? 600 : 500,
        ),
        3,
      ),
    );
  });

  const pad = 20;
  const main: Frame = {
    x: sidebar.x + sidebarW + pad,
    y: frame.y + pad,
    w: frame.w - sidebarW - pad * 2,
    h: frame.h - pad * 2,
  };
  // header
  out.push(
    text(
      `${b}:dtitle`,
      { x: main.x, y: main.y, w: main.w * 0.7, h: 24 },
      truncate(spec.title ?? "Overview", 40),
      labelStyle(tokens, tokens.colors.foreground, 18, 700),
      2,
    ),
  );
  // KPI widget row
  const metrics = ensureMetrics(spec, 3);
  const kpiRow: Frame = { x: main.x, y: main.y + 36, w: main.w, h: 78 };
  const kpiCols = splitColumns(kpiRow, metrics.length, 14);
  metrics.forEach((m, i) =>
    out.push(...kpiWidget(`${b}:kpi-${i}`, kpiCols[i], tokens, m, i)),
  );
  // main chart card
  const chartTop = kpiRow.y + kpiRow.h + 16;
  const chartCard: Frame = {
    x: main.x,
    y: chartTop,
    w: main.w,
    h: main.y + main.h - chartTop,
  };
  out.push(
    rect(`${b}:chartcard`, chartCard, tokens.colors.surface, 1, {
      radius: 10,
      border: tokens.colors.border,
      borderWidth: 1,
      shadow: "sm",
    }),
  );
  out.push(
    chartElement(
      `${b}:chart`,
      {
        x: chartCard.x + 16,
        y: chartCard.y + 14,
        w: chartCard.w - 32,
        h: chartCard.h - 28,
      },
      tokens,
      spec,
    ),
  );
  return out;
}

function kpiWidget(
  id: string,
  frame: Frame,
  tokens: DesignTokens,
  m: DomainMetric,
  index: number,
): ResolvedElement[] {
  const trendColor =
    m.trend === "down" ? tokens.colors.negative : tokens.colors.positive;
  const out: ResolvedElement[] = [
    rect(`${id}:bg`, frame, tokens.colors.surface, 1, {
      radius: 10,
      border: tokens.colors.border,
      borderWidth: 1,
      shadow: "sm",
    }),
    rect(
      `${id}:accent`,
      { x: frame.x, y: frame.y + 12, w: 3, h: frame.h - 24 },
      index === 0 ? tokens.colors.primary : tokens.colors.accent,
      2,
      { radius: 2 },
    ),
    text(
      `${id}:label`,
      { x: frame.x + 16, y: frame.y + 12, w: frame.w - 28, h: 14 },
      truncate(m.label, 22),
      labelStyle(tokens, tokens.colors.mutedForeground, 11, 600),
      2,
    ),
    text(
      `${id}:value`,
      { x: frame.x + 16, y: frame.y + 28, w: frame.w - 28, h: 34 },
      m.value,
      {
        ...labelStyle(tokens, tokens.colors.foreground, 26, 800),
        letterSpacing: -0.5,
      },
      2,
    ),
  ];
  if (m.delta)
    out.push(
      text(
        `${id}:delta`,
        { x: frame.x + 16, y: frame.y + frame.h - 20, w: frame.w - 28, h: 14 },
        `${m.trend === "down" ? "▼" : "▲"} ${m.delta}`,
        labelStyle(tokens, trendColor, 11, 600),
        2,
      ),
    );
  return out;
}

/** Standalone KPI widget (single metric card with sparkline). */
export function renderKpiWidget(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const metrics = ensureMetrics(
    spec,
    Math.min(4, Math.max(1, spec.metrics.length || 3)),
  );
  const cols = splitColumns(frame, metrics.length, 16);
  const out: ResolvedElement[] = [];
  metrics.forEach((m, i) => {
    out.push(...kpiWidget(`${b}:w-${i}`, cols[i], tokens, m, i));
    // sparkline
    const spark: Frame = {
      x: cols[i].x + 16,
      y: cols[i].y + cols[i].h - 34,
      w: cols[i].w - 32,
      h: 18,
    };
    const bars = 7;
    const bw = spark.w / bars;
    for (let k = 0; k < bars; k++) {
      const h = spark.h * clamp(0.2 + seeded(b, i * 10 + k) * 0.8, 0.15, 1);
      out.push(
        rect(
          `${b}:spark-${i}-${k}`,
          { x: spark.x + k * bw, y: spark.y + spark.h - h, w: bw - 2, h },
          mix(
            tokens.colors.surfaceAlt,
            i === 0 ? tokens.colors.primary : tokens.colors.accent,
            0.7,
          ),
          3,
          { radius: 1 },
        ),
      );
    }
  });
  return out;
}

/** Data table card with a toolbar and a styled table element. */
export function renderDataTable(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const out: ResolvedElement[] = [
    rect(`${b}:card`, frame, tokens.colors.surface, 0, {
      radius: 12,
      border: tokens.colors.border,
      borderWidth: 1,
      shadow: "lg",
    }),
  ];
  const pad = 16;
  const toolbarH = 40;
  out.push(
    text(
      `${b}:title`,
      { x: frame.x + pad, y: frame.y + 12, w: frame.w * 0.5, h: 20 },
      truncate(spec.title ?? "Records", 40),
      labelStyle(tokens, tokens.colors.foreground, 15, 700),
      2,
    ),
    rect(
      `${b}:search`,
      { x: frame.x + frame.w - pad - 150, y: frame.y + 10, w: 150, h: 22 },
      tokens.colors.surfaceAlt,
      2,
      { radius: 11, border: tokens.colors.border, borderWidth: 1 },
    ),
    text(
      `${b}:searchph`,
      { x: frame.x + frame.w - pad - 138, y: frame.y + 13, w: 130, h: 16 },
      "Search…",
      monoStyle(tokens, tokens.colors.mutedForeground, 11),
      3,
    ),
    rect(
      `${b}:divider`,
      { x: frame.x, y: frame.y + toolbarH, w: frame.w, h: 1 },
      tokens.colors.border,
      1,
    ),
  );
  const table = spec.table ?? fallbackTable(spec);
  out.push({
    kind: "table",
    id: `${b}:table`,
    frame: {
      x: frame.x + pad,
      y: frame.y + toolbarH + 10,
      w: frame.w - pad * 2,
      h: frame.h - toolbarH - pad - 10,
    },
    emphasis: "secondary",
    z: 2,
    headers: table.headers,
    rows: table.rows,
    headerStyle: styleOnFill(
      resolveTextStyle("label", "primary", tokens),
      tokens.colors.surfaceAlt,
      tokens,
    ),
    cellStyle: resolveTextStyle("body", "secondary", tokens),
    headerFill: tokens.colors.surfaceAlt,
    rowFillAlt: mix(tokens.colors.surface, tokens.colors.surfaceAlt, 0.5),
    borderColor: tokens.colors.border,
  });
  return out;
}

function fallbackTable(spec: DomainSpec): {
  headers: string[];
  rows: string[][];
} {
  if (spec.bullets.length)
    return {
      headers: ["Item", "Status"],
      rows: spec.bullets
        .slice(0, 5)
        .map((b, i) => [b, i === 0 ? "Active" : "Pending"]),
    };
  return {
    headers: ["Customer", "Plan", "MRR", "Status"],
    rows: [
      ["Acme Inc", "Enterprise", "$4,200", "Active"],
      ["Globex", "Growth", "$1,800", "Active"],
      ["Initech", "Starter", "$290", "Trial"],
    ],
  };
}

// ---------------------------------------------------------------------------
// MOBILE SURFACES
// ---------------------------------------------------------------------------

/** Phone frame with notch, status bar, and an app screen (list/notification). */
export function renderPhoneFrame(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  // keep a phone aspect ratio (~19.5:9) centered in the frame
  const targetRatio = 0.49;
  let w = frame.h * targetRatio;
  let h = frame.h;
  if (w > frame.w) {
    w = frame.w;
    h = w / targetRatio;
  }
  const phone: Frame = {
    x: frame.x + (frame.w - w) / 2,
    y: frame.y + (frame.h - h) / 2,
    w,
    h,
  };
  const bezel = mix(tokens.colors.foreground, "#000000", 0.2);
  const out: ResolvedElement[] = [
    rect(`${b}:bezel`, phone, bezel, 1, { radius: 40, shadow: "lg" }),
  ];
  const screen: Frame = {
    x: phone.x + 8,
    y: phone.y + 8,
    w: phone.w - 16,
    h: phone.h - 16,
  };
  out.push(
    rect(`${b}:screen`, screen, tokens.colors.surface, 2, { radius: 34 }),
  );
  // notch
  out.push(
    rect(
      `${b}:notch`,
      { x: screen.x + screen.w / 2 - 38, y: screen.y + 6, w: 76, h: 20 },
      bezel,
      4,
      { radius: 10 },
    ),
  );
  // status bar
  out.push(
    text(
      `${b}:time`,
      { x: screen.x + 20, y: screen.y + 8, w: 50, h: 16 },
      "9:41",
      labelStyle(tokens, tokens.colors.foreground, 12, 700),
      4,
    ),
    rect(
      `${b}:battery`,
      { x: screen.x + screen.w - 44, y: screen.y + 11, w: 22, h: 11 },
      tokens.colors.foreground,
      4,
      { radius: 3 },
    ),
  );
  // app header
  const contentTop = screen.y + 40;
  out.push(
    rect(
      `${b}:apphead`,
      { x: screen.x, y: contentTop, w: screen.w, h: 52 },
      tokens.colors.primary,
      3,
    ),
    text(
      `${b}:appname`,
      { x: screen.x + 20, y: contentTop + 16, w: screen.w - 40, h: 22 },
      truncate(spec.title ?? "Inbox", 20),
      { ...labelStyle(tokens, tokens.colors.primaryForeground, 17, 700) },
      4,
    ),
  );
  // list rows from bullets
  const rowsTop = contentTop + 52 + 12;
  const items = spec.bullets.length
    ? spec.bullets
    : [
        "New sign-in from Chrome",
        "Payment received — $49",
        "3 tasks due today",
      ];
  const rowH = 56;
  items
    .slice(0, Math.floor((screen.y + screen.h - rowsTop) / rowH))
    .forEach((item, i) => {
      const y = rowsTop + i * rowH;
      out.push(
        rect(
          `${b}:avatar-${i}`,
          { x: screen.x + 16, y: y + 8, w: 36, h: 36 },
          mix(
            tokens.colors.surface,
            i % 2 ? tokens.colors.accent : tokens.colors.primary,
            0.3,
          ),
          4,
          { radius: 18, shape: "ellipse" },
        ),
        text(
          `${b}:row-${i}`,
          { x: screen.x + 64, y: y + 12, w: screen.w - 80, h: 18 },
          truncate(item, 28),
          labelStyle(tokens, tokens.colors.foreground, 13, 600),
          4,
        ),
        text(
          `${b}:rowsub-${i}`,
          { x: screen.x + 64, y: y + 30, w: screen.w - 80, h: 14 },
          "now",
          labelStyle(tokens, tokens.colors.mutedForeground, 11, 500),
          4,
        ),
        rect(
          `${b}:rowdiv-${i}`,
          { x: screen.x + 64, y: y + rowH - 1, w: screen.w - 80, h: 1 },
          tokens.colors.border,
          4,
        ),
      );
    });
  return out;
}

/** A single push-notification banner (app icon, title, body, timestamp). */
export function renderAppNotification(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const bannerH = Math.min(96, frame.h);
  const banner: Frame = {
    x: frame.x,
    y: frame.y + (frame.h - bannerH) / 2,
    w: frame.w,
    h: bannerH,
  };
  const out: ResolvedElement[] = [
    rect(
      `${b}:banner`,
      banner,
      mix(tokens.colors.surface, tokens.colors.background, 0.2),
      1,
      {
        radius: 18,
        border: tokens.colors.border,
        borderWidth: 1,
        shadow: "lg",
      },
    ),
    rect(
      `${b}:icon`,
      { x: banner.x + 16, y: banner.y + 18, w: 44, h: 44 },
      tokens.colors.primary,
      2,
      { radius: 12 },
    ),
    text(
      `${b}:app`,
      { x: banner.x + 74, y: banner.y + 16, w: banner.w - 150, h: 14 },
      "NOTIFICATION",
      labelStyle(tokens, tokens.colors.mutedForeground, 10, 700),
      2,
    ),
    text(
      `${b}:title`,
      { x: banner.x + 74, y: banner.y + 32, w: banner.w - 150, h: 18 },
      truncate(spec.title ?? "You have a new message", 40),
      labelStyle(tokens, tokens.colors.foreground, 15, 700),
      2,
    ),
    text(
      `${b}:body`,
      { x: banner.x + 74, y: banner.y + 52, w: banner.w - 150, h: 30 },
      truncate(
        spec.bullets[0] ??
          spec.intent ??
          "Tap to open the app and review the details.",
        70,
      ),
      styleOnFill(
        resolveTextStyle("body", "secondary", tokens),
        tokens.colors.surface,
        tokens,
      ),
      2,
    ),
    text(
      `${b}:time`,
      { x: banner.x + banner.w - 70, y: banner.y + 16, w: 54, h: 14 },
      "now",
      {
        ...labelStyle(tokens, tokens.colors.mutedForeground, 11, 500),
        align: "right",
      },
      2,
    ),
  ];
  return out;
}

// ---------------------------------------------------------------------------
// CLOUD SURFACES
// ---------------------------------------------------------------------------

/** Cloud architecture: dashed region containers holding service chips. */
export function renderCloudArchitecture(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const out: ResolvedElement[] = [];
  const groups = groupNodes(spec);
  const cols = splitColumns(frame, groups.length, 20);
  groups.forEach((group, gi) => {
    const col = cols[gi];
    out.push(
      rect(
        `${b}:region-${gi}`,
        col,
        mix(tokens.colors.surface, tokens.colors.surfaceAlt, 0.5),
        1,
        {
          radius: 12,
          border: mix(tokens.colors.border, tokens.colors.accent, 0.4),
          borderWidth: 1,
        },
      ),
      text(
        `${b}:region-label-${gi}`,
        { x: col.x + 14, y: col.y + 12, w: col.w - 28, h: 16 },
        truncate(group.name, 24),
        labelStyle(tokens, tokens.colors.mutedForeground, 11, 700),
        2,
      ),
    );
    const inner: Frame = {
      x: col.x + 14,
      y: col.y + 38,
      w: col.w - 28,
      h: col.h - 52,
    };
    const nodeRows = splitRowsSafe(inner, group.nodes.length, 10);
    group.nodes.forEach((node, ni) => {
      const nf = nodeRows[ni];
      const primary = gi === 0 && ni === 0;
      out.push(
        rect(
          `${b}:svc-${gi}-${ni}`,
          nf,
          primary
            ? mix(tokens.colors.surface, tokens.colors.primary, 0.14)
            : tokens.colors.surface,
          2,
          {
            radius: 8,
            border: primary ? tokens.colors.primary : tokens.colors.border,
            borderWidth: primary ? 2 : 1,
            shadow: "sm",
          },
        ),
        rect(
          `${b}:svc-icon-${gi}-${ni}`,
          { x: nf.x + 10, y: nf.y + (nf.h - 22) / 2, w: 22, h: 22 },
          mix(tokens.colors.surface, tokens.colors.accent, 0.3),
          3,
          { radius: 5 },
        ),
        text(
          `${b}:svc-label-${gi}-${ni}`,
          { x: nf.x + 40, y: nf.y + (nf.h - 30) / 2, w: nf.w - 50, h: 16 },
          truncate(node.label, 20),
          styleOnFill(
            resolveTextStyle("label", "primary", tokens),
            tokens.colors.surface,
            tokens,
          ),
          3,
        ),
      );
      if (node.sublabel)
        out.push(
          text(
            `${b}:svc-sub-${gi}-${ni}`,
            { x: nf.x + 40, y: nf.y + nf.h / 2 + 2, w: nf.w - 50, h: 14 },
            truncate(node.sublabel, 24),
            labelStyle(tokens, tokens.colors.mutedForeground, 10, 500),
            3,
          ),
        );
    });
    // connector arrow to next region
    if (gi < groups.length - 1) {
      const midY = col.y + col.h / 2;
      out.push({
        kind: "shape",
        id: `${b}:flow-${gi}`,
        frame: { x: col.x + col.w, y: midY - 6, w: 20, h: 12 },
        emphasis: "secondary",
        z: 2,
        shape: "arrow",
        points: { x1: 0, y1: 6, x2: 20, y2: 6 },
        box: {
          borderColor: mix(tokens.colors.border, tokens.colors.accent, 0.6),
          borderWidth: 2,
          radius: 0,
          shadow: "none",
        },
      });
    }
  });
  return out;
}

function groupNodes(
  spec: DomainSpec,
): Array<{ name: string; nodes: DomainNode[] }> {
  const nodes: DomainNode[] = spec.nodes.length
    ? spec.nodes
    : spec.bullets.length
      ? spec.bullets.map((label) => ({ label }))
      : [
          { label: "API Gateway", group: "Edge" },
          { label: "App Service", group: "Compute" },
          { label: "Postgres", group: "Data" },
          { label: "Object Store", group: "Data" },
        ];
  const byGroup = new Map<string, DomainNode[]>();
  nodes.forEach((n, i) => {
    const key =
      n.group ??
      ["Edge", "Compute", "Data"][
        Math.min(2, Math.floor(i / Math.ceil(nodes.length / 3)))
      ];
    const list = byGroup.get(key) ?? [];
    list.push(n);
    byGroup.set(key, list);
  });
  return [...byGroup.entries()]
    .slice(0, 4)
    .map(([name, ns]) => ({ name, nodes: ns.slice(0, 4) }));
}

// ---------------------------------------------------------------------------
// Shared content renderers + registry
// ---------------------------------------------------------------------------

/** A generic product screen used inside a browser window. */
function renderScreenContent(
  baseId: string,
  body: Frame,
  tokens: DesignTokens,
  spec: DomainSpec,
): ResolvedElement[] {
  const out: ResolvedElement[] = [];
  const pad = 18;
  // top app bar
  out.push(
    rect(
      `${baseId}:appbar`,
      { x: body.x, y: body.y, w: body.w, h: 44 },
      tokens.colors.surfaceAlt,
      1,
    ),
    rect(
      `${baseId}:brand`,
      { x: body.x + pad, y: body.y + 13, w: 18, h: 18 },
      tokens.colors.primary,
      2,
      { radius: 5 },
    ),
    text(
      `${baseId}:brandname`,
      { x: body.x + pad + 26, y: body.y + 14, w: 200, h: 18 },
      truncate(spec.title ?? "Product", 28),
      labelStyle(tokens, tokens.colors.foreground, 14, 700),
      2,
    ),
  );
  const content: Frame = {
    x: body.x + pad,
    y: body.y + 44 + pad,
    w: body.w - pad * 2,
    h: body.h - 44 - pad * 2,
  };
  const metrics = ensureMetrics(spec, 3);
  const kpiRow: Frame = { x: content.x, y: content.y, w: content.w, h: 70 };
  const cols = splitColumns(kpiRow, metrics.length, 14);
  metrics.forEach((m, i) =>
    out.push(...kpiWidget(`${baseId}:kpi-${i}`, cols[i], tokens, m, i)),
  );
  const chartTop = kpiRow.y + kpiRow.h + 14;
  out.push(
    chartElement(
      `${baseId}:chart`,
      {
        x: content.x,
        y: chartTop,
        w: content.w,
        h: content.y + content.h - chartTop,
      },
      tokens,
      spec,
    ),
  );
  return out;
}

/** Build a chart ResolvedElement from spec data or a deterministic fallback. */
function chartElement(
  id: string,
  frame: Frame,
  tokens: DesignTokens,
  spec: DomainSpec,
): ResolvedElement {
  const chart = spec.chart ?? {
    chartType: "bar" as const,
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    series: [
      {
        name: "Series",
        data: [4, 6, 5, 8, 7, 9].map(
          (v, i) => v + Math.round(seeded(spec.baseId, i) * 3),
        ),
      },
    ],
  };
  return {
    kind: "chart",
    id,
    frame,
    emphasis: "secondary",
    z: 2,
    chartType: chart.chartType,
    title: chart.title,
    categories: chart.categories,
    series: chart.series,
    palette: tokens.colors.chartPalette,
    gridColor: tokens.colors.border,
    labelStyle: resolveTextStyle("caption", "tertiary", tokens),
  };
}

function ensureMetrics(spec: DomainSpec, count: number): DomainMetric[] {
  if (spec.metrics.length >= 1) return spec.metrics.slice(0, count);
  const defaults: DomainMetric[] = [
    { value: "12.4k", label: "Active Users", delta: "8.2%", trend: "up" },
    { value: "98.9%", label: "Uptime", delta: "0.1%", trend: "up" },
    { value: "$48k", label: "MRR", delta: "12%", trend: "up" },
    { value: "1.2s", label: "P95 Latency", delta: "5%", trend: "down" },
  ];
  return defaults.slice(0, count);
}

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function splitRowsSafe(frame: Frame, n: number, gap: number): Frame[] {
  const count = Math.max(1, n);
  const h = (frame.h - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_, i) => ({
    x: frame.x,
    y: frame.y + i * (h + gap),
    w: frame.w,
    h,
  }));
}

// ---------------------------------------------------------------------------
// Registry — maps component id → renderer. Extensible without engine edits.
// ---------------------------------------------------------------------------

export type DomainRenderer = (
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
) => ResolvedElement[];

export const DOMAIN_COMPONENTS: Record<DomainComponentId, DomainRenderer> = {
  "code-editor": renderCodeEditor,
  terminal: renderTerminal,
  "git-pr": renderGitPr,
  "cve-alert": renderCveAlert,
  "cicd-pipeline": renderCicdPipeline,
  "owasp-badge": renderOwaspBadge,
  "model-pipeline": renderModelPipeline,
  "token-flow": renderTokenFlow,
  "gpu-cluster": renderGpuCluster,
  "attention-block": renderAttentionBlock,
  "browser-window": renderBrowserWindow,
  dashboard: renderDashboard,
  "kpi-widget": renderKpiWidget,
  "data-table": renderDataTable,
  "phone-frame": renderPhoneFrame,
  "app-notification": renderAppNotification,
  "cloud-architecture": renderCloudArchitecture,
};

export function isDomainComponent(id: string): id is DomainComponentId {
  return Object.prototype.hasOwnProperty.call(DOMAIN_COMPONENTS, id);
}

/**
 * Render a domain component by id. Returns null when the id is unknown or the
 * frame is too small to compose a legible surface (caller then falls back to
 * the standard materializer path).
 */
export function renderDomainComponent(
  componentId: string,
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] | null {
  if (!isDomainComponent(componentId)) return null;
  if (frame.w < 240 || frame.h < 120) return null;
  return DOMAIN_COMPONENTS[componentId](spec, frame, tokens);
}

/** OWASP Top 10 verification badge with covered categories. */
export function renderOwaspBadge(
  spec: DomainSpec,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  const b = spec.baseId;
  const out: ResolvedElement[] = [
    rect(`${b}:panel`, frame, tokens.colors.surface, 0, {
      radius: 12,
      border: tokens.colors.border,
      borderWidth: 1,
      shadow: "lg",
    }),
  ];
  const pad = 22;
  // shield badge
  const shieldW = Math.min(120, frame.w * 0.22);
  out.push(
    rect(
      `${b}:shield`,
      { x: frame.x + pad, y: frame.y + pad, w: shieldW, h: shieldW * 1.1 },
      mix(tokens.colors.surface, DIFF.open, 0.16),
      1,
      { radius: 14, border: DIFF.open, borderWidth: 2 },
    ),
    text(
      `${b}:check`,
      {
        x: frame.x + pad,
        y: frame.y + pad + shieldW * 0.28,
        w: shieldW,
        h: 40,
      },
      "✓",
      { ...labelStyle(tokens, DIFF.open, 38, 800), align: "center" },
      2,
    ),
    text(
      `${b}:owasp`,
      {
        x: frame.x + pad,
        y: frame.y + pad + shieldW * 0.78,
        w: shieldW,
        h: 16,
      },
      "OWASP",
      {
        ...labelStyle(tokens, tokens.colors.foreground, 12, 800),
        align: "center",
        textTransform: "uppercase",
      },
      2,
    ),
  );
  const listX = frame.x + pad + shieldW + 24;
  out.push(
    text(
      `${b}:title`,
      { x: listX, y: frame.y + pad, w: frame.w - pad - listX + frame.x, h: 24 },
      truncate(spec.title ?? "OWASP Top 10 — Verified", 40),
      labelStyle(tokens, tokens.colors.foreground, 18, 700),
      2,
    ),
  );
  const categories = spec.bullets.length
    ? spec.bullets
    : [
        "Broken Access Control",
        "Cryptographic Failures",
        "Injection",
        "Insecure Design",
        "Security Misconfiguration",
      ];
  const listTop = frame.y + pad + 34;
  const rowH = Math.min(
    30,
    (frame.y + frame.h - pad - listTop) /
      Math.max(1, categories.slice(0, 5).length),
  );
  categories.slice(0, 5).forEach((cat, i) => {
    const y = listTop + i * rowH;
    out.push(
      rect(
        `${b}:tick-${i}`,
        { x: listX, y: y + 3, w: 16, h: 16 },
        DIFF.open,
        3,
        { radius: 8, shape: "ellipse" },
      ),
      text(
        `${b}:cat-${i}`,
        {
          x: listX + 26,
          y: y + 2,
          w: frame.w - pad - (listX + 26) + frame.x,
          h: 18,
        },
        truncate(cat, 44),
        styleOnFill(
          resolveTextStyle("body", "secondary", tokens),
          tokens.colors.surface,
          tokens,
        ),
        3,
      ),
    );
  });
  return out;
}
