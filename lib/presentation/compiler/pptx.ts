/**
 * Presentation Compiler — PPTX target.
 *
 * Compiles Resolved IR into a fully NATIVE PowerPoint file via pptxgenjs:
 * real text boxes, real shapes, native charts and tables. No screenshots,
 * no rasterization — every object is editable in PowerPoint/Keynote/Slides.
 *
 * Client-side module (pptxgenjs writeFile). Import dynamically from UI code.
 */

import PptxGenJS from "pptxgenjs";
import {
  CANVAS,
  type ResolvedElement,
  type ResolvedIR,
  type ResolvedSlide,
  type ResolvedTextStyle,
} from "../ir/schema";
import { pxToInches, fontPxToPt } from "../constraints/geometry";
import { parseColor, composite } from "../color/engine";

// ---------------------------------------------------------------------------
// Color helpers: pptx wants opaque hex (no #, no alpha) + transparency %
// ---------------------------------------------------------------------------

interface PptxColor {
  hex: string;
  transparency?: number;
}

function toPptxColor(input: string, backdrop?: string): PptxColor | null {
  const parsed = parseColor(input);
  if (!parsed) return null;
  let { r, g, b } = parsed;
  let transparency: number | undefined;
  if (parsed.a < 1) {
    if (backdrop) {
      const bd = parseColor(backdrop);
      if (bd) {
        const flat = composite(parsed, bd);
        r = flat.r;
        g = flat.g;
        b = flat.b;
      }
    } else {
      transparency = Math.round((1 - parsed.a) * 100);
    }
  }
  const hex = [r, g, b]
    .map((v) =>
      Math.round(Math.max(0, Math.min(255, v)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
  return { hex: hex.toUpperCase(), transparency };
}

function frameToInches(frame: { x: number; y: number; w: number; h: number }) {
  return {
    x: pxToInches(frame.x),
    y: pxToInches(frame.y),
    w: pxToInches(frame.w),
    h: pxToInches(frame.h),
  };
}

function textOptions(
  style: ResolvedTextStyle,
  background: string,
): Record<string, unknown> {
  const color = toPptxColor(style.color, background);
  return {
    fontFace: style.fontFamily.split(",")[0].replace(/['"]/g, "").trim(),
    fontSize: fontPxToPt(style.fontSize),
    bold: style.fontWeight >= 600,
    color: color?.hex ?? "000000",
    align: style.align,
    charSpacing: style.letterSpacing
      ? Math.round(style.letterSpacing * 0.75 * 100) / 100
      : undefined,
    lineSpacingMultiple: style.lineHeight,
  };
}

const SHADOW: Record<string, object | undefined> = {
  none: undefined,
  sm: { type: "outer", blur: 4, offset: 1, angle: 90, opacity: 0.18 },
  md: { type: "outer", blur: 8, offset: 2, angle: 90, opacity: 0.22 },
  lg: { type: "outer", blur: 16, offset: 4, angle: 90, opacity: 0.28 },
};

// ---------------------------------------------------------------------------
// Element writers
// ---------------------------------------------------------------------------

function addText(
  pptxSlide: PptxGenJS.Slide,
  el: Extract<ResolvedElement, { kind: "text" }>,
  background: string,
) {
  const opts = textOptions(el.style, background);
  const pos = frameToInches(el.frame);
  const boxFill = el.box?.fill ? toPptxColor(el.box.fill, background) : null;

  const base: Record<string, unknown> = {
    ...pos,
    ...opts,
    valign: "top",
    ...(boxFill
      ? {
          fill: { color: boxFill.hex, transparency: boxFill.transparency },
          rectRadius: el.box?.radius ? pxToInches(el.box.radius) : undefined,
        }
      : {}),
    ...(el.box?.borderColor
      ? {
          line: {
            color: toPptxColor(el.box.borderColor, background)?.hex,
            width: (el.box.borderWidth ?? 1) * 0.75,
          },
        }
      : {}),
    shadow: el.box?.shadow ? SHADOW[el.box.shadow] : undefined,
    ...(el.style.textTransform === "uppercase" ? {} : {}),
  };

  const content =
    el.style.textTransform === "uppercase"
      ? el.content.toUpperCase()
      : el.content;

  if (el.items && el.items.length > 0) {
    const runs: PptxGenJS.TextProps[] = [];
    if (content) {
      runs.push({ text: content, options: { breakLine: true } });
    }
    for (const item of el.items) {
      runs.push({
        text: item,
        options: { bullet: { indent: 12 }, breakLine: true },
      });
    }
    pptxSlide.addText(runs, base);
  } else {
    pptxSlide.addText(content, base);
  }
}

function addImage(
  pptxSlide: PptxGenJS.Slide,
  el: Extract<ResolvedElement, { kind: "image" }>,
) {
  const pos = frameToInches(el.frame);
  pptxSlide.addImage({
    path: el.src,
    ...pos,
    sizing: {
      type: el.fit === "cover" ? "cover" : "contain",
      w: pos.w,
      h: pos.h,
    },
    rounding: (el.box?.radius ?? 0) > 0,
    altText: el.alt,
  });
}

function addShape(
  pptxSlide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  el: Extract<ResolvedElement, { kind: "shape" }>,
  background: string,
) {
  const pos = frameToInches(el.frame);
  const fill = el.box.fill ? toPptxColor(el.box.fill, background) : null;
  const line = el.box.borderColor
    ? {
        color: toPptxColor(el.box.borderColor, background)?.hex,
        width: (el.box.borderWidth ?? 1) * 0.75,
      }
    : el.shape === "line" || el.shape === "arrow"
      ? { color: fill?.hex ?? "888888", width: 1.5 }
      : undefined;

  if (el.shape === "line" || el.shape === "arrow") {
    pptxSlide.addShape(pptx.ShapeType.line, {
      ...pos,
      line: {
        ...line,
        ...(el.shape === "arrow" ? { endArrowType: "triangle" } : {}),
      },
      flipV: el.points ? el.points.y2 < el.points.y1 : false,
    });
    return;
  }

  const shapeType =
    el.shape === "ellipse"
      ? pptx.ShapeType.ellipse
      : el.shape === "roundRect"
        ? pptx.ShapeType.roundRect
        : el.shape === "chevron"
          ? pptx.ShapeType.chevron
          : el.shape === "triangle"
            ? pptx.ShapeType.triangle
            : pptx.ShapeType.rect;

  const opts: Record<string, unknown> = {
    ...pos,
    fill: fill
      ? { color: fill.hex, transparency: fill.transparency }
      : { color: "FFFFFF", transparency: 100 },
    line,
    shadow: SHADOW[el.box.shadow],
    ...(el.shape === "roundRect"
      ? { rectRadius: Math.min(pxToInches(el.box.radius), pos.h / 2) }
      : {}),
  };

  if (el.label && el.labelStyle) {
    const labelOpts = textOptions(el.labelStyle, el.box.fill ?? background);
    const text = el.sublabel
      ? [
          { text: el.label, options: { breakLine: true, bold: true } },
          {
            text: el.sublabel,
            options: {
              fontSize: Math.max(8, fontPxToPt(el.labelStyle.fontSize * 0.78)),
            },
          },
        ]
      : el.label;
    pptxSlide.addText(text as string | PptxGenJS.TextProps[], {
      ...opts,
      ...labelOpts,
      shape: shapeType,
      align: "center",
      valign: "middle",
    });
  } else {
    pptxSlide.addShape(shapeType, opts as PptxGenJS.ShapeProps);
  }
}

function addChart(
  pptxSlide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  el: Extract<ResolvedElement, { kind: "chart" }>,
  background: string,
) {
  const pos = frameToInches(el.frame);
  const typeMap: Record<string, PptxGenJS.CHART_NAME> = {
    bar: pptx.ChartType.bar,
    line: pptx.ChartType.line,
    area: pptx.ChartType.area,
    pie: pptx.ChartType.pie,
    doughnut: pptx.ChartType.doughnut,
    radar: pptx.ChartType.radar,
    scatter: pptx.ChartType.scatter,
  };
  const labelColor = toPptxColor(el.labelStyle.color, background)?.hex;
  const gridColor = toPptxColor(el.gridColor, background)?.hex;
  const palette = el.palette
    .map((c) => toPptxColor(c, background)?.hex)
    .filter((c): c is string => Boolean(c));

  const data =
    el.chartType === "pie" || el.chartType === "doughnut"
      ? [
          {
            name: el.series[0]?.name ?? "Series",
            labels: el.categories,
            values: el.series[0]?.data ?? [],
          },
        ]
      : el.series.map((s) => ({
          name: s.name,
          labels: el.categories,
          values: s.data,
        }));

  pptxSlide.addChart(typeMap[el.chartType] ?? pptx.ChartType.bar, data, {
    ...pos,
    chartColors: palette,
    showLegend: el.series.length > 1,
    legendPos: "b",
    legendColor: labelColor,
    showTitle: Boolean(el.title),
    title: el.title,
    titleColor: labelColor,
    titleFontSize: fontPxToPt(el.labelStyle.fontSize * 1.2),
    catAxisLabelColor: labelColor,
    valAxisLabelColor: labelColor,
    catAxisLabelFontSize: fontPxToPt(el.labelStyle.fontSize),
    valAxisLabelFontSize: fontPxToPt(el.labelStyle.fontSize),
    valGridLine: gridColor
      ? { color: gridColor, style: "solid", size: 0.5 }
      : { style: "none" },
    catGridLine: { style: "none" },
    barDir: "col",
    holeSize: el.chartType === "doughnut" ? 60 : undefined,
  });
}

function addTable(
  pptxSlide: PptxGenJS.Slide,
  el: Extract<ResolvedElement, { kind: "table" }>,
  background: string,
) {
  const pos = frameToInches(el.frame);
  const headerFill = toPptxColor(el.headerFill, background);
  const altFill = el.rowFillAlt ? toPptxColor(el.rowFillAlt, background) : null;
  const borderColor = toPptxColor(el.borderColor, background)?.hex ?? "DDDDDD";
  const headerOpts = textOptions(el.headerStyle, el.headerFill);
  const cellOpts = textOptions(el.cellStyle, background);

  const rows: PptxGenJS.TableRow[] = [
    el.headers.map((h) => ({
      text: h,
      options: {
        ...headerOpts,
        bold: true,
        fill: { color: headerFill?.hex ?? "222222" },
      },
    })),
    ...el.rows.map((row, i) =>
      row.map((cell) => ({
        text: cell,
        options: {
          ...cellOpts,
          fill: altFill && i % 2 === 1 ? { color: altFill.hex } : undefined,
        },
      })),
    ),
  ];

  pptxSlide.addTable(rows, {
    ...pos,
    border: { type: "solid", color: borderColor, pt: 0.5 },
    autoPage: false,
    valign: "middle",
  });
}

function addCode(
  pptxSlide: PptxGenJS.Slide,
  el: Extract<ResolvedElement, { kind: "code" }>,
  background: string,
) {
  const pos = frameToInches(el.frame);
  const fill = el.box.fill ? toPptxColor(el.box.fill, background) : null;
  pptxSlide.addText(el.code, {
    ...pos,
    ...textOptions(el.style, el.box.fill ?? background),
    fontFace: "Courier New",
    align: "left",
    valign: "top",
    fill: fill ? { color: fill.hex } : undefined,
    rectRadius: pxToInches(el.box.radius),
    margin: 8,
  });
}

// ---------------------------------------------------------------------------
// Compiler entry
// ---------------------------------------------------------------------------

function compileSlide(pptx: PptxGenJS, slide: ResolvedSlide): void {
  const pptxSlide = pptx.addSlide();
  const bg = toPptxColor(slide.background);
  if (bg) pptxSlide.background = { color: bg.hex };

  const ordered = [...slide.elements].sort((a, b) => a.z - b.z);
  for (const el of ordered) {
    switch (el.kind) {
      case "text":
        addText(pptxSlide, el, slide.background);
        break;
      case "image":
        addImage(pptxSlide, el);
        break;
      case "shape":
        addShape(pptxSlide, pptx, el, slide.background);
        break;
      case "chart":
        addChart(pptxSlide, pptx, el, slide.background);
        break;
      case "table":
        addTable(pptxSlide, el, slide.background);
        break;
      case "code":
        addCode(pptxSlide, el, slide.background);
        break;
      case "icon": {
        // icons compile to a small labeled circle (native shape) for now;
        // an IconPlugin can upgrade this to SVG-path shapes later.
        addShape(
          pptxSlide,
          pptx,
          {
            id: el.id,
            kind: "shape",
            shape: "ellipse",
            frame: el.frame,
            emphasis: el.emphasis,
            z: el.z,
            box: { fill: el.color, radius: 0, shadow: "none" },
          },
          slide.background,
        );
        break;
      }
    }
  }
  if (slide.speakerNotes) pptxSlide.addNotes(slide.speakerNotes);
}

export function buildPptx(ir: ResolvedIR): PptxGenJS {
  const pptx = new PptxGenJS();
  pptx.defineLayout({
    name: "V2_16x9",
    width: CANVAS.width / 128,
    height: CANVAS.height / 128,
  });
  pptx.layout = "V2_16x9";
  pptx.title = ir.title;
  for (const slide of ir.slides) compileSlide(pptx, slide);
  return pptx;
}

/** Browser: trigger a .pptx download. */
export async function downloadPptx(
  ir: ResolvedIR,
  fileName?: string,
): Promise<void> {
  const pptx = buildPptx(ir);
  await pptx.writeFile({
    fileName:
      fileName ?? `${ir.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pptx`,
  });
}
