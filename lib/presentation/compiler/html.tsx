/**
 * Presentation Compiler — HTML target.
 *
 * Renders Resolved IR slides as absolutely-positioned DOM on the 1280x720
 * canvas (scaled to fit its container). Used for the live preview AND as the
 * print surface for the PDF target.
 *
 * This is a pure "compiler": no layout decisions happen here. Every frame,
 * color, and font size comes straight from the Resolved IR.
 */

"use client";

import type React from "react";
import type {
  ResolvedElement,
  ResolvedIR,
  ResolvedSlide,
  ResolvedTextStyle,
} from "../ir/schema";
import { CANVAS } from "../ir/schema";

const SHADOWS: Record<string, string> = {
  none: "none",
  sm: "0 1px 4px rgba(0,0,0,0.14)",
  md: "0 2px 10px rgba(0,0,0,0.16)",
  lg: "0 6px 24px rgba(0,0,0,0.2)",
};

function textCss(style: ResolvedTextStyle): React.CSSProperties {
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    color: style.color,
    textAlign: style.align,
    textTransform: style.textTransform,
  };
}

function frameCss(el: ResolvedElement): React.CSSProperties {
  return {
    position: "absolute",
    left: el.frame.x,
    top: el.frame.y,
    width: el.frame.w,
    height: el.frame.h,
    zIndex: el.z,
  };
}

function ElementView({
  el,
  background,
}: {
  el: ResolvedElement;
  background: string;
}) {
  switch (el.kind) {
    case "text": {
      const boxStyles: React.CSSProperties = el.box?.fill
        ? {
            background: el.box.fill,
            borderRadius: el.box.radius,
            boxShadow: SHADOWS[el.box.shadow ?? "none"],
            border: el.box.borderColor
              ? `${el.box.borderWidth ?? 1}px solid ${el.box.borderColor}`
              : undefined,
            padding: 16,
          }
        : {};
      return (
        <div
          style={{
            ...frameCss(el),
            ...textCss(el.style),
            ...boxStyles,
            overflow: "hidden",
          }}
        >
          {el.content && <div>{el.content}</div>}
          {el.items && el.items.length > 0 && (
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.2em",
                display: "flex",
                flexDirection: "column",
                gap: "0.35em",
                listStyleType: "disc",
              }}
            >
              {el.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={el.src || "/placeholder.svg"}
          alt={el.alt}
          style={{
            ...frameCss(el),
            objectFit: el.fit,
            borderRadius: el.box?.radius ?? 0,
            boxShadow: SHADOWS[el.box?.shadow ?? "none"],
          }}
          crossOrigin="anonymous"
        />
      );
    case "shape": {
      if (el.shape === "line" || el.shape === "arrow") {
        const p = el.points ?? {
          x1: 0,
          y1: el.frame.h / 2,
          x2: el.frame.w,
          y2: el.frame.h / 2,
        };
        const stroke = el.box.borderColor ?? el.box.fill ?? "#888";
        return (
          <svg
            style={frameCss(el)}
            viewBox={`0 0 ${el.frame.w} ${el.frame.h}`}
            aria-hidden="true"
          >
            {el.shape === "arrow" && (
              <defs>
                <marker
                  id={`arr-${el.id}`}
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill={stroke} />
                </marker>
              </defs>
            )}
            <line
              x1={p.x1}
              y1={p.y1}
              x2={p.x2}
              y2={p.y2}
              stroke={stroke}
              strokeWidth={el.box.borderWidth ?? 2}
              markerEnd={
                el.shape === "arrow" ? `url(#arr-${el.id})` : undefined
              }
            />
          </svg>
        );
      }
      const radius =
        el.shape === "ellipse"
          ? "50%"
          : el.shape === "roundRect"
            ? el.box.radius
            : 0;
      const clip =
        el.shape === "chevron"
          ? "polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%, 15% 50%)"
          : el.shape === "triangle"
            ? "polygon(50% 0, 100% 100%, 0 100%)"
            : undefined;
      return (
        <div
          style={{
            ...frameCss(el),
            background: el.box.fill,
            borderRadius: radius,
            clipPath: clip,
            border: el.box.borderColor
              ? `${el.box.borderWidth ?? 1}px solid ${el.box.borderColor}`
              : undefined,
            boxShadow: SHADOWS[el.box.shadow],
            display: el.label ? "flex" : undefined,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            overflow: "hidden",
            padding: el.label ? 8 : 0,
          }}
        >
          {el.label && el.labelStyle && (
            <>
              <span style={{ ...textCss(el.labelStyle), textAlign: "center" }}>
                {el.label}
              </span>
              {el.sublabel && (
                <span
                  style={{
                    ...textCss(el.labelStyle),
                    fontSize: el.labelStyle.fontSize * 0.78,
                    fontWeight: 400,
                    opacity: 0.85,
                    textAlign: "center",
                  }}
                >
                  {el.sublabel}
                </span>
              )}
            </>
          )}
        </div>
      );
    }
    case "chart":
      return <ChartView el={el} />;
    case "table":
      return (
        <div style={{ ...frameCss(el), overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {el.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      ...textCss(el.headerStyle),
                      background: el.headerFill,
                      padding: "8px 12px",
                      border: `1px solid ${el.borderColor}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {el.rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={
                    ri % 2 === 1 && el.rowFillAlt
                      ? { background: el.rowFillAlt }
                      : undefined
                  }
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        ...textCss(el.cellStyle),
                        padding: "6px 12px",
                        border: `1px solid ${el.borderColor}`,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return (
        <pre
          style={{
            ...frameCss(el),
            ...textCss(el.style),
            background: el.box.fill,
            borderRadius: el.box.radius,
            padding: 16,
            margin: 0,
            overflow: "hidden",
            whiteSpace: "pre-wrap",
          }}
        >
          {el.code}
        </pre>
      );
    case "icon":
      return (
        <div
          aria-hidden="true"
          style={{
            ...frameCss(el),
            background: el.color,
            borderRadius: "50%",
          }}
        />
      );
    default:
      return null;
  }
}

/** Minimal native SVG chart rendering driven entirely by resolved values. */
function ChartView({
  el,
}: {
  el: Extract<ResolvedElement, { kind: "chart" }>;
}) {
  const { w, h } = el.frame;
  const pad = { top: el.title ? 28 : 10, right: 10, bottom: 24, left: 36 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const allValues = el.series.flatMap((s) => s.data);
  const max = Math.max(1, ...allValues);

  const isPie = el.chartType === "pie" || el.chartType === "doughnut";

  return (
    <svg
      style={frameCss(el)}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={el.title ?? "chart"}
    >
      {el.title && (
        <text
          x={w / 2}
          y={16}
          textAnchor="middle"
          fill={el.labelStyle.color}
          fontSize={el.labelStyle.fontSize * 1.1}
          fontWeight={600}
          fontFamily={el.labelStyle.fontFamily}
        >
          {el.title}
        </text>
      )}
      {isPie ? (
        <PieSlices
          el={el}
          cx={w / 2}
          cy={pad.top + plotH / 2}
          r={Math.min(plotW, plotH) / 2}
        />
      ) : (
        <>
          {[0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={pad.left}
              x2={w - pad.right}
              y1={pad.top + plotH * (1 - t)}
              y2={pad.top + plotH * (1 - t)}
              stroke={el.gridColor}
              strokeWidth={1}
            />
          ))}
          {el.chartType === "bar" && (
            <Bars el={el} pad={pad} plotW={plotW} plotH={plotH} max={max} />
          )}
          {(el.chartType === "line" ||
            el.chartType === "area" ||
            el.chartType === "scatter" ||
            el.chartType === "radar") && (
            <Lines el={el} pad={pad} plotW={plotW} plotH={plotH} max={max} />
          )}
          {el.categories.map((cat, i) => (
            <text
              key={i}
              x={pad.left + (plotW / el.categories.length) * (i + 0.5)}
              y={h - 8}
              textAnchor="middle"
              fill={el.labelStyle.color}
              fontSize={el.labelStyle.fontSize}
              fontFamily={el.labelStyle.fontFamily}
            >
              {cat}
            </text>
          ))}
        </>
      )}
    </svg>
  );
}

function Bars({
  el,
  pad,
  plotW,
  plotH,
  max,
}: {
  el: Extract<ResolvedElement, { kind: "chart" }>;
  pad: { top: number; left: number };
  plotW: number;
  plotH: number;
  max: number;
}) {
  const groupW = plotW / el.categories.length;
  const barW = (groupW * 0.7) / el.series.length;
  return (
    <>
      {el.categories.map((_, ci) =>
        el.series.map((s, si) => {
          const v = s.data[ci] ?? 0;
          const bh = (v / max) * plotH;
          return (
            <rect
              key={`${ci}-${si}`}
              x={pad.left + ci * groupW + groupW * 0.15 + si * barW}
              y={pad.top + plotH - bh}
              width={barW - 2}
              height={bh}
              rx={2}
              fill={el.palette[si % el.palette.length]}
            />
          );
        }),
      )}
    </>
  );
}

function Lines({
  el,
  pad,
  plotW,
  plotH,
  max,
}: {
  el: Extract<ResolvedElement, { kind: "chart" }>;
  pad: { top: number; left: number };
  plotW: number;
  plotH: number;
  max: number;
}) {
  return (
    <>
      {el.series.map((s, si) => {
        const pts = s.data.map((v, i) => ({
          x: pad.left + (plotW / Math.max(1, s.data.length - 1)) * i,
          y: pad.top + plotH - (v / max) * plotH,
        }));
        const path = pts
          .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
          .join(" ");
        const color = el.palette[si % el.palette.length];
        if (el.chartType === "scatter") {
          return pts.map((p, i) => (
            <circle key={`${si}-${i}`} cx={p.x} cy={p.y} r={4} fill={color} />
          ));
        }
        return (
          <g key={si}>
            {el.chartType === "area" && (
              <path
                d={`${path} L${pts[pts.length - 1]?.x ?? 0},${pad.top + plotH} L${pts[0]?.x ?? 0},${pad.top + plotH} Z`}
                fill={color}
                opacity={0.18}
              />
            )}
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </>
  );
}

function PieSlices({
  el,
  cx,
  cy,
  r,
}: {
  el: Extract<ResolvedElement, { kind: "chart" }>;
  cx: number;
  cy: number;
  r: number;
}) {
  const data = el.series[0]?.data ?? [];
  const total = data.reduce((a, b) => a + b, 0) || 1;
  let angle = -Math.PI / 2;
  const inner = el.chartType === "doughnut" ? r * 0.6 : 0;
  return (
    <>
      {data.map((v, i) => {
        const sweep = (v / total) * Math.PI * 2;
        const a0 = angle;
        const a1 = angle + sweep;
        angle = a1;
        const large = sweep > Math.PI ? 1 : 0;
        const p0 = { x: cx + r * Math.cos(a0), y: cy + r * Math.sin(a0) };
        const p1 = { x: cx + r * Math.cos(a1), y: cy + r * Math.sin(a1) };
        let d: string;
        if (inner > 0) {
          const q0 = {
            x: cx + inner * Math.cos(a1),
            y: cy + inner * Math.sin(a1),
          };
          const q1 = {
            x: cx + inner * Math.cos(a0),
            y: cy + inner * Math.sin(a0),
          };
          d = `M${p0.x},${p0.y} A${r},${r} 0 ${large} 1 ${p1.x},${p1.y} L${q0.x},${q0.y} A${inner},${inner} 0 ${large} 0 ${q1.x},${q1.y} Z`;
        } else {
          d = `M${cx},${cy} L${p0.x},${p0.y} A${r},${r} 0 ${large} 1 ${p1.x},${p1.y} Z`;
        }
        return <path key={i} d={d} fill={el.palette[i % el.palette.length]} />;
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Slide + deck views
// ---------------------------------------------------------------------------

export function SlideView({
  slide,
  scale = 1,
}: {
  slide: ResolvedSlide;
  scale?: number;
}) {
  return (
    <div
      style={{
        width: CANVAS.width * scale,
        height: CANVAS.height * scale,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: CANVAS.width,
          height: CANVAS.height,
          background: slide.background,
          position: "relative",
          overflow: "hidden",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {[...slide.elements]
          .sort((a, b) => a.z - b.z)
          .map((el) => (
            <ElementView key={el.id} el={el} background={slide.background} />
          ))}
      </div>
    </div>
  );
}

/** Print-ready full deck: one slide per page. Used by the PDF target. */
export function PrintDeck({ ir }: { ir: ResolvedIR }) {
  return (
    <div className="print-deck">
      {ir.slides.map((slide) => (
        <div
          key={slide.id}
          className="print-slide"
          style={{ pageBreakAfter: "always" }}
        >
          <SlideView slide={slide} scale={1} />
        </div>
      ))}
      <style>{`
        @media print {
          @page { size: 1280px 720px; margin: 0; }
          body { margin: 0; }
          .print-slide { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
