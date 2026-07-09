/**
 * Server-side slide renderer — Resolved IR → SVG → PNG (via sharp).
 *
 * Used by the vision Design Critic to "see" the deck the way a human would.
 * Deterministic: pure function of the Resolved IR. Charts are drawn as
 * simplified native marks (bars/lines), images as labeled placeholders —
 * fidelity is sufficient for judging hierarchy, spacing, and balance.
 */

import sharp from "sharp";
import type {
  ResolvedElement,
  ResolvedIR,
  ResolvedSlide,
  ResolvedTextStyle,
} from "../ir/schema";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function textAnchor(align: ResolvedTextStyle["align"]): string {
  return align === "center" ? "middle" : align === "right" ? "end" : "start";
}

function anchorX(frame: { x: number; w: number }, align: string): number {
  return align === "center"
    ? frame.x + frame.w / 2
    : align === "right"
      ? frame.x + frame.w
      : frame.x;
}

/** naive greedy wrap by estimated character width */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const charW = fontSize * 0.55;
  const maxChars = Math.max(4, Math.floor(maxWidth / charW));
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function renderTextBlock(
  frame: { x: number; y: number; w: number; h: number },
  content: string,
  style: ResolvedTextStyle,
  items?: string[],
): string {
  const parts: string[] = [];
  const lh = style.fontSize * style.lineHeight;
  const anchor = textAnchor(style.align);
  const x = anchorX(frame, style.align);
  const common = `font-family="sans-serif" font-size="${style.fontSize}" font-weight="${style.fontWeight}" fill="${style.color}" text-anchor="${anchor}"${style.textTransform === "uppercase" ? ' style="text-transform:uppercase"' : ""}`;

  let y = frame.y + style.fontSize;
  if (items && items.length > 0) {
    for (const item of items) {
      for (const line of wrapText(item, frame.w - 20, style.fontSize)) {
        if (y > frame.y + frame.h + lh) break;
        parts.push(
          `<circle cx="${frame.x + 4}" cy="${y - style.fontSize * 0.32}" r="3" fill="${style.color}"/>`,
          `<text x="${frame.x + 16}" y="${y}" ${common.replace(`text-anchor="${anchor}"`, 'text-anchor="start"')}>${esc(line)}</text>`,
        );
        y += lh;
      }
      y += lh * 0.25;
    }
  } else if (content) {
    const transformed =
      style.textTransform === "uppercase" ? content.toUpperCase() : content;
    for (const line of wrapText(transformed, frame.w, style.fontSize)) {
      if (y > frame.y + frame.h + lh) break;
      parts.push(`<text x="${x}" y="${y}" ${common}>${esc(line)}</text>`);
      y += lh;
    }
  }
  return parts.join("");
}

function renderElement(el: ResolvedElement, palette: string[]): string {
  const f = el.frame;
  switch (el.kind) {
    case "text": {
      const box = el.box?.fill
        ? `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="${el.box.radius}" fill="${el.box.fill}"${el.box.borderColor ? ` stroke="${el.box.borderColor}" stroke-width="${el.box.borderWidth ?? 1}"` : ""}/>`
        : "";
      return box + renderTextBlock(f, el.content, el.style, el.items);
    }
    case "shape": {
      const { box } = el;
      const stroke = box.borderColor
        ? ` stroke="${box.borderColor}" stroke-width="${box.borderWidth ?? 1}"`
        : "";
      const fill = box.fill ?? "none";
      let body = "";
      if (el.shape === "ellipse") {
        body = `<ellipse cx="${f.x + f.w / 2}" cy="${f.y + f.h / 2}" rx="${f.w / 2}" ry="${f.h / 2}" fill="${fill}"${stroke}/>`;
      } else if (el.shape === "line" || el.shape === "arrow") {
        const p = el.points ?? { x1: 0, y1: f.h / 2, x2: f.w, y2: f.h / 2 };
        body = `<line x1="${f.x + p.x1}" y1="${f.y + p.y1}" x2="${f.x + p.x2}" y2="${f.y + p.y2}" stroke="${box.borderColor ?? fill}" stroke-width="${box.borderWidth ?? 2}"${el.shape === "arrow" ? ' marker-end="url(#ah)"' : ""}/>`;
      } else if (el.shape === "triangle" || el.shape === "chevron") {
        body = `<polygon points="${f.x},${f.y + f.h} ${f.x + f.w / 2},${f.y} ${f.x + f.w},${f.y + f.h}" fill="${fill}"${stroke}/>`;
      } else {
        body = `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="${box.radius}" fill="${fill}"${stroke}/>`;
      }
      let label = "";
      if (el.label && el.labelStyle) {
        const ls = el.labelStyle;
        const cy =
          f.y +
          f.h / 2 +
          ls.fontSize * 0.35 -
          (el.sublabel ? ls.fontSize * 0.7 : 0);
        label = `<text x="${f.x + f.w / 2}" y="${cy}" font-family="sans-serif" font-size="${ls.fontSize}" font-weight="${ls.fontWeight}" fill="${ls.color}" text-anchor="middle">${esc(el.label)}</text>`;
        if (el.sublabel) {
          label += `<text x="${f.x + f.w / 2}" y="${cy + ls.fontSize * 1.3}" font-family="sans-serif" font-size="${ls.fontSize * 0.8}" fill="${ls.color}" fill-opacity="0.75" text-anchor="middle">${esc(el.sublabel)}</text>`;
        }
      }
      return body + label;
    }
    case "image":
      return `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="${el.box?.radius ?? 0}" fill="#d0d5dd"/><text x="${f.x + f.w / 2}" y="${f.y + f.h / 2}" font-family="sans-serif" font-size="13" fill="#475467" text-anchor="middle">[image: ${esc(el.alt.slice(0, 40))}]</text>`;
    case "icon":
      return `<circle cx="${f.x + f.w / 2}" cy="${f.y + f.h / 2}" r="${Math.min(f.w, f.h) / 2}" fill="none" stroke="${el.color}" stroke-width="2"/>`;
    case "chart": {
      // simplified native marks — enough for visual balance judgment
      const parts = [
        `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="none" stroke="${el.gridColor}" stroke-width="1"/>`,
      ];
      const s = el.series[0]?.data ?? [];
      const max = Math.max(1, ...s);
      const bw = f.w / Math.max(1, s.length);
      s.forEach((v, i) => {
        const h = (v / max) * (f.h - 24);
        parts.push(
          `<rect x="${f.x + i * bw + bw * 0.2}" y="${f.y + f.h - h - 4}" width="${bw * 0.6}" height="${h}" fill="${el.palette[i % el.palette.length] ?? palette[0]}"/>`,
        );
      });
      if (el.title) {
        parts.push(
          `<text x="${f.x}" y="${f.y - 8}" font-family="sans-serif" font-size="${el.labelStyle.fontSize}" font-weight="600" fill="${el.labelStyle.color}">${esc(el.title)}</text>`,
        );
      }
      return parts.join("");
    }
    case "table": {
      const rows = [el.headers, ...el.rows];
      const rh = f.h / rows.length;
      const cw = f.w / el.headers.length;
      const parts: string[] = [];
      rows.forEach((row, ri) => {
        const fill =
          ri === 0
            ? el.headerFill
            : ri % 2 === 0
              ? (el.rowFillAlt ?? "none")
              : "none";
        if (fill !== "none")
          parts.push(
            `<rect x="${f.x}" y="${f.y + ri * rh}" width="${f.w}" height="${rh}" fill="${fill}"/>`,
          );
        row.forEach((cell, ci) => {
          const st = ri === 0 ? el.headerStyle : el.cellStyle;
          parts.push(
            `<text x="${f.x + ci * cw + 8}" y="${f.y + ri * rh + rh / 2 + st.fontSize * 0.35}" font-family="sans-serif" font-size="${st.fontSize}" font-weight="${st.fontWeight}" fill="${st.color}">${esc(cell.slice(0, 24))}</text>`,
          );
        });
      });
      parts.push(
        `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="none" stroke="${el.borderColor}"/>`,
      );
      return parts.join("");
    }
    case "code":
      return (
        `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="${el.box.radius}" fill="${el.box.fill ?? "#1e1e1e"}"/>` +
        renderTextBlock(
          { x: f.x + 16, y: f.y + 12, w: f.w - 32, h: f.h - 24 },
          el.code.slice(0, 400),
          { ...el.style, align: "left" },
        )
      );
    default:
      return "";
  }
}

/** Render one resolved slide to a complete SVG document string. */
export function slideToSvg(
  slide: ResolvedSlide,
  canvas: { width: number; height: number },
): string {
  const sorted = [...slide.elements].sort((a, b) => a.z - b.z);
  const body = sorted.map((el) => renderElement(el, ["#4b5563"])).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#667085"/></marker></defs>
<rect width="${canvas.width}" height="${canvas.height}" fill="${slide.background}"/>
${body}
</svg>`;
}

/**
 * Rasterize selected slides to PNG buffers for the vision critic.
 * Downscaled to 800px wide — plenty for design judgment, cheap on tokens.
 */
export async function rasterizeSlides(
  ir: ResolvedIR,
  slideIndices: number[],
  width = 800,
): Promise<Buffer[]> {
  const jobs = slideIndices
    .filter((i) => i >= 0 && i < ir.slides.length)
    .map((i) =>
      sharp(Buffer.from(slideToSvg(ir.slides[i], ir.canvas)))
        .resize(width)
        .png()
        .toBuffer(),
    );
  return Promise.all(jobs);
}

/** Pick representative slides: first, densest middle slide, and last. */
export function representativeSlideIndices(ir: ResolvedIR, max = 3): number[] {
  const n = ir.slides.length;
  if (n <= max) return ir.slides.map((_, i) => i);
  let densest = 1;
  let best = -1;
  for (let i = 1; i < n - 1; i++) {
    const count = ir.slides[i].elements.length;
    if (count > best) {
      best = count;
      densest = i;
    }
  }
  return Array.from(new Set([0, densest, n - 1])).sort((a, b) => a - b);
}
