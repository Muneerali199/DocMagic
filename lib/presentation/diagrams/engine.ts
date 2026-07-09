/**
 * Diagram engine — deterministic conversion of semantic diagram specs into
 * positioned NATIVE shapes (nodes, edges, labels). Output is fully editable
 * in every compiler target — never rasterized.
 *
 * Registered as the built-in DiagramPlugin.
 */

import type { ResolvedElement, Frame } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import type { SemanticDiagram, DiagramLayoutFn } from "./types";
import { emphasisFill } from "../color/engine";
import { resolveTextStyle, styleOnFill } from "../typography/apply";
import { splitColumns, splitRows, splitGrid } from "../constraints/geometry";
import type { DiagramPlugin } from "../plugins/types";

let uid = 0;
function id(diagramId: string, part: string): string {
  return `${diagramId}:${part}:${uid++}`;
}

function nodeShape(
  diagram: SemanticDiagram,
  node: SemanticDiagram["nodes"][number],
  frame: Frame,
  tokens: DesignTokens,
  z: number,
): ResolvedElement {
  const { fill, text } = emphasisFill(node.emphasis, tokens.colors);
  const base = resolveTextStyle("label", node.emphasis, tokens);
  // Diagram nodes carry the story — labels must read at presentation
  // distance. Semibold, slightly larger than form labels.
  const label = {
    ...styleOnFill(base, fill, tokens),
    fontSize: Math.max(base.fontSize, 15),
    fontWeight: 600,
  };
  return {
    kind: "shape",
    id: id(diagram.id, `node-${node.id}`),
    frame,
    emphasis: node.emphasis,
    z,
    shape: tokens.shape.radius > 0 ? "roundRect" : "rect",
    box: {
      fill,
      // primary nodes get a self-colored border so they read as solid
      // chips; secondary nodes get the hairline token border
      borderColor: node.emphasis === "primary" ? fill : tokens.colors.border,
      borderWidth: tokens.shape.borderWidth,
      radius: tokens.shape.radius,
      shadow: tokens.shape.shadow,
    },
    label: node.label,
    sublabel: node.sublabel,
    labelStyle: label,
  };
}

function arrow(
  diagram: SemanticDiagram,
  from: Frame,
  to: Frame,
  tokens: DesignTokens,
  z: number,
): ResolvedElement {
  const x1 = from.x + from.w;
  const y1 = from.y + from.h / 2;
  const x2 = to.x;
  const y2 = to.y + to.h / 2;
  const frame: Frame = {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.max(2, Math.abs(x2 - x1)),
    h: Math.max(2, Math.abs(y2 - y1)),
  };
  return {
    kind: "shape",
    id: id(diagram.id, "edge"),
    frame,
    emphasis: "tertiary",
    z,
    shape: "arrow",
    points: {
      x1: x1 - frame.x,
      y1: y1 - frame.y,
      x2: x2 - frame.x,
      y2: y2 - frame.y,
    },
    box: {
      borderColor: tokens.colors.mutedForeground,
      borderWidth: 2,
      radius: 0,
      shadow: "none",
    },
  };
}

// ---------------------------------------------------------------------------
// Layouts per diagram type
// ---------------------------------------------------------------------------

const flowLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const gap = tokens.spacing.itemGap * 1.6;
  const rows = nodes.length > 5 ? 2 : 1;
  const perRow = Math.ceil(nodes.length / rows);
  const rowFrames =
    rows === 1 ? [frame] : splitRows(frame, 2, tokens.spacing.sectionGap);
  const nodeFrames: Frame[] = [];
  for (let r = 0; r < rows; r++) {
    const slice = nodes.slice(r * perRow, (r + 1) * perRow);
    const cols = splitColumns(rowFrames[r], Math.max(1, slice.length), gap);
    // limit node height for visual balance
    cols.forEach((c) => {
      const h = Math.min(c.h, 120);
      nodeFrames.push({ ...c, y: c.y + (c.h - h) / 2, h });
    });
  }
  nodes.forEach((node, i) =>
    out.push(nodeShape(diagram, node, nodeFrames[i], tokens, 1)),
  );
  // arrows follow node order within rows
  for (let i = 0; i < nodes.length - 1; i++) {
    const sameRow = Math.floor(i / perRow) === Math.floor((i + 1) / perRow);
    if (sameRow)
      out.push(arrow(diagram, nodeFrames[i], nodeFrames[i + 1], tokens, 0));
  }
  return out;
};

const timelineLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const lineY = frame.y + frame.h * 0.42;
  // spine
  out.push({
    kind: "shape",
    id: id(diagram.id, "spine"),
    frame: { x: frame.x, y: lineY - 1, w: frame.w, h: 2 },
    emphasis: "tertiary",
    z: 0,
    shape: "line",
    points: { x1: 0, y1: 1, x2: frame.w, y2: 1 },
    box: {
      borderColor: tokens.colors.border,
      borderWidth: 2,
      radius: 0,
      shadow: "none",
    },
  });
  const stepW = frame.w / nodes.length;
  nodes.forEach((node, i) => {
    const cx = frame.x + stepW * i + stepW / 2;
    const dotSize = 14;
    out.push({
      kind: "shape",
      id: id(diagram.id, `dot-${node.id}`),
      frame: {
        x: cx - dotSize / 2,
        y: lineY - dotSize / 2,
        w: dotSize,
        h: dotSize,
      },
      emphasis: node.emphasis,
      z: 2,
      shape: "ellipse",
      box: {
        fill:
          node.emphasis === "primary"
            ? tokens.colors.primary
            : tokens.colors.accent,
        radius: dotSize / 2,
        shadow: "none",
      },
    });
    const labelStyle = resolveTextStyle("label", node.emphasis, tokens, {
      align: "center",
    });
    const subStyle = resolveTextStyle("caption", "tertiary", tokens, {
      align: "center",
    });
    const labelW = Math.min(stepW - tokens.spacing.unit, 220);
    out.push({
      kind: "text",
      id: id(diagram.id, `label-${node.id}`),
      frame: { x: cx - labelW / 2, y: lineY + 20, w: labelW, h: 28 },
      emphasis: node.emphasis,
      z: 1,
      role: "label",
      content: node.label,
      style: labelStyle,
    });
    if (node.sublabel) {
      out.push({
        kind: "text",
        id: id(diagram.id, `sub-${node.id}`),
        frame: {
          x: cx - labelW / 2,
          y: lineY + 50,
          w: labelW,
          h: Math.max(24, frame.y + frame.h - lineY - 50),
        },
        emphasis: "tertiary",
        z: 1,
        role: "caption",
        content: node.sublabel,
        style: subStyle,
      });
    }
  });
  return out;
};

const cycleLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const cx = frame.x + frame.w / 2;
  const cy = frame.y + frame.h / 2;
  const nodeW = Math.min(200, frame.w / 3.2);
  const nodeH = 76;
  const rx = Math.max(1, frame.w / 2 - nodeW / 2);
  const ry = Math.max(1, frame.h / 2 - nodeH / 2);
  const frames: Frame[] = nodes.map((_, i) => {
    const angle = (Math.PI * 2 * i) / nodes.length - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * rx - nodeW / 2,
      y: cy + Math.sin(angle) * ry - nodeH / 2,
      w: nodeW,
      h: nodeH,
    };
  });
  nodes.forEach((node, i) =>
    out.push(nodeShape(diagram, node, frames[i], tokens, 1)),
  );
  return out;
};

const pyramidLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const rows = splitRows(frame, nodes.length, tokens.spacing.unit);
  nodes.forEach((node, i) => {
    const widthFactor = 0.4 + (0.6 * (i + 1)) / nodes.length; // narrow top → wide base
    const w = frame.w * widthFactor;
    const rowFrame: Frame = {
      x: frame.x + (frame.w - w) / 2,
      y: rows[i].y,
      w,
      h: rows[i].h,
    };
    out.push(nodeShape(diagram, node, rowFrame, tokens, 1));
  });
  return out;
};

const funnelLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const rows = splitRows(frame, nodes.length, tokens.spacing.unit);
  nodes.forEach((node, i) => {
    const widthFactor = 1 - (0.55 * i) / Math.max(1, nodes.length - 1); // wide top → narrow bottom
    const w = frame.w * widthFactor;
    const rowFrame: Frame = {
      x: frame.x + (frame.w - w) / 2,
      y: rows[i].y,
      w,
      h: rows[i].h,
    };
    out.push(nodeShape(diagram, node, rowFrame, tokens, 1));
  });
  return out;
};

const comparisonLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const cols = splitColumns(frame, 2, tokens.spacing.sectionGap);
  const left = nodes.filter((_, i) => i % 2 === 0);
  const right = nodes.filter((_, i) => i % 2 === 1);
  const place = (list: typeof nodes, col: Frame) => {
    const rows = splitRows(
      col,
      Math.max(1, list.length),
      tokens.spacing.itemGap,
    );
    list.forEach((node, i) =>
      out.push(nodeShape(diagram, node, rows[i], tokens, 1)),
    );
  };
  place(left, cols[0]);
  place(right, cols[1]);
  return out;
};

const swotLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes.slice(0, 4);
  const out: ResolvedElement[] = [];
  const cells = splitGrid(frame, 2, 2, tokens.spacing.itemGap);
  nodes.forEach((node, i) =>
    out.push(nodeShape(diagram, node, cells[i], tokens, 1)),
  );
  return out;
};

const architectureLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  // layered: group nodes into tiers by incoming-edge depth; tiers become rows
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const depth = new Map<string, number>();
  const incoming = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of diagram.edges) incoming.get(e.to)?.push(e.from);

  const resolveDepth = (nodeId: string, seen: Set<string>): number => {
    if (depth.has(nodeId)) return depth.get(nodeId)!;
    if (seen.has(nodeId)) return 0;
    seen.add(nodeId);
    const parents = incoming.get(nodeId) ?? [];
    const d =
      parents.length === 0
        ? 0
        : 1 + Math.max(...parents.map((p) => resolveDepth(p, seen)));
    depth.set(nodeId, d);
    return d;
  };
  for (const n of nodes) resolveDepth(n.id, new Set());

  const maxDepth = Math.max(0, ...Array.from(depth.values()));
  const tiers: (typeof nodes)[] = Array.from(
    { length: maxDepth + 1 },
    () => [],
  );
  for (const n of nodes) tiers[depth.get(n.id) ?? 0].push(n);

  const rows = splitRows(frame, tiers.length, tokens.spacing.sectionGap);
  const frameById = new Map<string, Frame>();
  tiers.forEach((tier, r) => {
    const cols = splitColumns(
      rows[r],
      Math.max(1, tier.length),
      tokens.spacing.itemGap,
    );
    tier.forEach((node, i) => {
      const h = Math.min(cols[i].h, 96);
      const f: Frame = { ...cols[i], y: cols[i].y + (cols[i].h - h) / 2, h };
      frameById.set(node.id, f);
      out.push(nodeShape(diagram, node, f, tokens, 1));
    });
  });
  // vertical connectors
  for (const e of diagram.edges) {
    const from = frameById.get(e.from);
    const to = frameById.get(e.to);
    if (!from || !to) continue;
    const x1 = from.x + from.w / 2;
    const y1 = from.y + from.h;
    const x2 = to.x + to.w / 2;
    const y2 = to.y;
    if (y2 <= y1) continue;
    const f: Frame = {
      x: Math.min(x1, x2),
      y: y1,
      w: Math.max(2, Math.abs(x2 - x1)),
      h: Math.max(2, y2 - y1),
    };
    out.push({
      kind: "shape",
      id: id(diagram.id, "edge"),
      frame: f,
      emphasis: "tertiary",
      z: 0,
      shape: "arrow",
      points: { x1: x1 - f.x, y1: 0, x2: x2 - f.x, y2: f.h },
      box: {
        borderColor: tokens.colors.mutedForeground,
        borderWidth: 2,
        radius: 0,
        shadow: "none",
      },
    });
  }
  return out;
};

/**
 * Org chart — hierarchy tree, root(s) at top. Depth is derived from edges
 * (parent -> child). Nodes at the same depth share a row; children are
 * connected to parents with vertical elbow connectors.
 */
const orgChartLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  // reuse the layered depth resolution, but center each tier and connect
  // parent->child with straight connectors (drawn as lines, not arrows)
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const depth = new Map<string, number>();
  const incoming = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of diagram.edges) incoming.get(e.to)?.push(e.from);

  const resolveDepth = (nodeId: string, seen: Set<string>): number => {
    if (depth.has(nodeId)) return depth.get(nodeId)!;
    if (seen.has(nodeId)) return 0;
    seen.add(nodeId);
    const parents = incoming.get(nodeId) ?? [];
    const d =
      parents.length === 0
        ? 0
        : 1 + Math.max(...parents.map((p) => resolveDepth(p, seen)));
    depth.set(nodeId, d);
    return d;
  };
  for (const n of nodes) resolveDepth(n.id, new Set());

  const maxDepth = Math.max(0, ...Array.from(depth.values()));
  const tiers: (typeof nodes)[] = Array.from(
    { length: maxDepth + 1 },
    () => [],
  );
  for (const n of nodes) tiers[depth.get(n.id) ?? 0].push(n);

  const rows = splitRows(frame, tiers.length, tokens.spacing.sectionGap);
  const frameById = new Map<string, Frame>();
  tiers.forEach((tier, r) => {
    // center the tier: each node gets an equal share, but the whole tier is
    // capped so single-node tiers (the root) don't span the full width
    const maxNodeW = Math.min(260, rows[r].w / Math.max(1, tier.length));
    const gap = tokens.spacing.itemGap;
    const tierW = maxNodeW * tier.length + gap * Math.max(0, tier.length - 1);
    const startX = rows[r].x + (rows[r].w - tierW) / 2;
    tier.forEach((node, i) => {
      const h = Math.min(rows[r].h, 84);
      const f: Frame = {
        x: startX + i * (maxNodeW + gap),
        y: rows[r].y + (rows[r].h - h) / 2,
        w: maxNodeW,
        h,
      };
      frameById.set(node.id, f);
      out.push(nodeShape(diagram, node, f, tokens, 1));
    });
  });
  // parent -> child connectors (plain lines)
  for (const e of diagram.edges) {
    const from = frameById.get(e.from);
    const to = frameById.get(e.to);
    if (!from || !to) continue;
    const x1 = from.x + from.w / 2;
    const y1 = from.y + from.h;
    const x2 = to.x + to.w / 2;
    const y2 = to.y;
    if (y2 <= y1) continue;
    const f: Frame = {
      x: Math.min(x1, x2),
      y: y1,
      w: Math.max(2, Math.abs(x2 - x1)),
      h: Math.max(2, y2 - y1),
    };
    out.push({
      kind: "shape",
      id: id(diagram.id, "connector"),
      frame: f,
      emphasis: "tertiary",
      z: 0,
      shape: "line",
      points: { x1: x1 - f.x, y1: 0, x2: x2 - f.x, y2: f.h },
      box: {
        borderColor: tokens.colors.border,
        borderWidth: 2,
        radius: 0,
        shadow: "none",
      },
    });
  }
  return out;
};

/**
 * Roadmap — swim-lanes derived from node.group (falls back to a single lane).
 * Each lane is a labeled horizontal track; items are placed left-to-right in
 * node order, so the planner controls sequencing.
 */
const roadmapLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const laneNames: string[] = [];
  for (const n of nodes) {
    const g = n.group ?? "Roadmap";
    if (!laneNames.includes(g)) laneNames.push(g);
  }
  const laneLabelW = laneNames.some((l) => l !== "Roadmap") ? 130 : 0;
  const lanesFrame: Frame = {
    x: frame.x + laneLabelW,
    y: frame.y,
    w: frame.w - laneLabelW,
    h: frame.h,
  };
  const lanes = splitRows(lanesFrame, laneNames.length, tokens.spacing.unit);
  const maxPerLane = Math.max(
    1,
    ...laneNames.map(
      (l) => nodes.filter((n) => (n.group ?? "Roadmap") === l).length,
    ),
  );
  laneNames.forEach((laneName, li) => {
    const lane = lanes[li];
    // lane background track
    out.push({
      kind: "shape",
      id: id(diagram.id, `lane-${li}`),
      frame: lane,
      emphasis: "tertiary",
      z: 0,
      shape: tokens.shape.radius > 0 ? "roundRect" : "rect",
      box: {
        fill: tokens.colors.surfaceAlt,
        radius: tokens.shape.radius,
        shadow: "none",
      },
    });
    if (laneLabelW > 0) {
      out.push({
        kind: "text",
        id: id(diagram.id, `lane-label-${li}`),
        frame: {
          x: frame.x,
          y: lane.y + lane.h / 2 - 14,
          w: laneLabelW - tokens.spacing.unit,
          h: 28,
        },
        emphasis: "tertiary",
        z: 1,
        role: "label",
        content: laneName,
        style: resolveTextStyle("label", "tertiary", tokens),
      });
    }
    const laneNodes = nodes.filter((n) => (n.group ?? "Roadmap") === laneName);
    const slotW = lane.w / maxPerLane;
    laneNodes.forEach((node, i) => {
      const pad = tokens.spacing.unit;
      const f: Frame = {
        x: lane.x + slotW * i + pad,
        y: lane.y + pad,
        w: slotW - pad * 2,
        h: lane.h - pad * 2,
      };
      out.push(nodeShape(diagram, node, f, tokens, 2));
    });
  });
  return out;
};

/**
 * Flowchart — edge-aware branching flow, laid out left-to-right by depth.
 * Unlike the linear flow layout, columns are derived from the edge graph so
 * branches and merges render correctly with horizontal arrows.
 */
const flowchartLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const depth = new Map<string, number>();
  const incoming = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of diagram.edges) incoming.get(e.to)?.push(e.from);

  const resolveDepth = (nodeId: string, seen: Set<string>): number => {
    if (depth.has(nodeId)) return depth.get(nodeId)!;
    if (seen.has(nodeId)) return 0;
    seen.add(nodeId);
    const parents = incoming.get(nodeId) ?? [];
    const d =
      parents.length === 0
        ? 0
        : 1 + Math.max(...parents.map((p) => resolveDepth(p, seen)));
    depth.set(nodeId, d);
    return d;
  };
  for (const n of nodes) resolveDepth(n.id, new Set());

  const maxDepth = Math.max(0, ...Array.from(depth.values()));
  const columns: (typeof nodes)[] = Array.from(
    { length: maxDepth + 1 },
    () => [],
  );
  for (const n of nodes) columns[depth.get(n.id) ?? 0].push(n);

  const cols = splitColumns(
    frame,
    columns.length,
    tokens.spacing.sectionGap * 1.4,
  );
  const frameById = new Map<string, Frame>();
  columns.forEach((column, ci) => {
    const rows = splitRows(
      cols[ci],
      Math.max(1, column.length),
      tokens.spacing.itemGap,
    );
    column.forEach((node, i) => {
      const h = Math.min(rows[i].h, 96);
      const f: Frame = { ...rows[i], y: rows[i].y + (rows[i].h - h) / 2, h };
      frameById.set(node.id, f);
      out.push(nodeShape(diagram, node, f, tokens, 1));
    });
  });
  // horizontal arrows along edges, with optional edge labels
  diagram.edges.forEach((e, ei) => {
    const from = frameById.get(e.from);
    const to = frameById.get(e.to);
    if (!from || !to) return;
    out.push(arrow(diagram, from, to, tokens, 0));
    if (e.label) {
      // Chip-style edge label: pill background keeps the caption legible
      // where it crosses connector lines; placed at the connector midpoint
      // in the gap between columns so it never sits on a node.
      const gapCenterX = (from.x + from.w + to.x) / 2;
      const midY = (from.y + from.h / 2 + to.y + to.h / 2) / 2;
      const chipW = Math.min(112, Math.max(64, e.label.length * 7 + 16));
      const chipH = 22;
      const chip: Frame = {
        x: gapCenterX - chipW / 2,
        y: midY - chipH / 2,
        w: chipW,
        h: chipH,
      };
      out.push({
        kind: "shape",
        id: id(diagram.id, `edge-chip-${ei}`),
        frame: chip,
        emphasis: "tertiary",
        z: 2,
        shape: "roundRect",
        box: {
          fill: tokens.colors.background,
          borderColor: tokens.colors.border,
          borderWidth: 1,
          radius: chipH / 2,
          shadow: "none",
        },
      });
      out.push({
        kind: "text",
        id: id(diagram.id, `edge-label-${ei}`),
        frame: { x: chip.x, y: chip.y + 3, w: chip.w, h: chip.h - 6 },
        emphasis: "tertiary",
        z: 3,
        role: "caption",
        content: e.label,
        style: {
          ...resolveTextStyle("caption", "tertiary", tokens, {
            align: "center",
          }),
          fontSize: 11,
        },
      });
    }
  });
  return out;
};

/**
 * Vertical stepped process — numbered badge + step card per node, stacked
 * top-to-bottom with a connector spine. Best for narrow/tall frames or
 * step-heavy processes where horizontal boxes would be cramped.
 */
const verticalProcessLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const rows = splitRows(frame, nodes.length, tokens.spacing.itemGap);
  const badge = 36;
  const badgeX = frame.x + badge / 2;
  // connector spine behind the badges
  if (nodes.length > 1) {
    out.push({
      kind: "shape",
      id: id(diagram.id, "spine"),
      frame: {
        x: badgeX - 1,
        y: rows[0].y + rows[0].h / 2,
        w: 2,
        h:
          rows[rows.length - 1].y +
          rows[rows.length - 1].h / 2 -
          (rows[0].y + rows[0].h / 2),
      },
      emphasis: "tertiary",
      z: 0,
      shape: "line",
      points: {
        x1: 1,
        y1: 0,
        x2: 1,
        y2:
          rows[rows.length - 1].y +
          rows[rows.length - 1].h / 2 -
          (rows[0].y + rows[0].h / 2),
      },
      box: {
        borderColor: tokens.colors.border,
        borderWidth: 2,
        radius: 0,
        shadow: "none",
      },
    });
  }
  nodes.forEach((node, i) => {
    const row = rows[i];
    const cy = row.y + row.h / 2;
    // numbered badge
    out.push({
      kind: "shape",
      id: id(diagram.id, `badge-${node.id}`),
      frame: { x: badgeX - badge / 2, y: cy - badge / 2, w: badge, h: badge },
      emphasis: node.emphasis,
      z: 2,
      shape: "ellipse",
      box: {
        fill:
          node.emphasis === "primary"
            ? tokens.colors.primary
            : tokens.colors.accent,
        radius: badge / 2,
        shadow: "none",
      },
      label: String(i + 1),
      labelStyle: styleOnFill(
        resolveTextStyle("label", node.emphasis, tokens, { align: "center" }),
        node.emphasis === "primary"
          ? tokens.colors.primary
          : tokens.colors.accent,
        tokens,
      ),
    });
    // step card
    const cardX = frame.x + badge + tokens.spacing.itemGap;
    const h = Math.min(row.h, 88);
    out.push(
      nodeShape(
        diagram,
        node,
        { x: cardX, y: cy - h / 2, w: frame.x + frame.w - cardX, h },
        tokens,
        1,
      ),
    );
  });
  return out;
};

/**
 * Alternating timeline — labels alternate above/below the spine so twice as
 * many milestones fit without collisions. Best for 6+ milestones.
 */
const alternatingTimelineLayout: DiagramLayoutFn = (diagram, frame, tokens) => {
  const nodes = diagram.nodes;
  const out: ResolvedElement[] = [];
  const lineY = frame.y + frame.h / 2;
  out.push({
    kind: "shape",
    id: id(diagram.id, "spine"),
    frame: { x: frame.x, y: lineY - 1, w: frame.w, h: 2 },
    emphasis: "tertiary",
    z: 0,
    shape: "line",
    points: { x1: 0, y1: 1, x2: frame.w, y2: 1 },
    box: {
      borderColor: tokens.colors.border,
      borderWidth: 2,
      radius: 0,
      shadow: "none",
    },
  });
  const stepW = frame.w / nodes.length;
  nodes.forEach((node, i) => {
    const cx = frame.x + stepW * i + stepW / 2;
    const above = i % 2 === 0;
    const dotSize = 14;
    out.push({
      kind: "shape",
      id: id(diagram.id, `dot-${node.id}`),
      frame: {
        x: cx - dotSize / 2,
        y: lineY - dotSize / 2,
        w: dotSize,
        h: dotSize,
      },
      emphasis: node.emphasis,
      z: 2,
      shape: "ellipse",
      box: {
        fill:
          node.emphasis === "primary"
            ? tokens.colors.primary
            : tokens.colors.accent,
        radius: dotSize / 2,
        shadow: "none",
      },
    });
    const labelW = Math.min(stepW * 1.6, 220);
    const blockH = frame.h / 2 - 24;
    const labelY = above ? lineY - 20 - blockH : lineY + 20;
    out.push({
      kind: "text",
      id: id(diagram.id, `label-${node.id}`),
      frame: {
        x: cx - labelW / 2,
        y: above ? labelY + blockH - 28 : labelY,
        w: labelW,
        h: 28,
      },
      emphasis: node.emphasis,
      z: 1,
      role: "label",
      content: node.label,
      style: resolveTextStyle("label", node.emphasis, tokens, {
        align: "center",
      }),
    });
    if (node.sublabel) {
      out.push({
        kind: "text",
        id: id(diagram.id, `sub-${node.id}`),
        frame: {
          x: cx - labelW / 2,
          y: above ? labelY : labelY + 30,
          w: labelW,
          h: Math.max(24, blockH - 30),
        },
        emphasis: "tertiary",
        z: 1,
        role: "caption",
        content: node.sublabel,
        style: resolveTextStyle("caption", "tertiary", tokens, {
          align: "center",
        }),
      });
    }
  });
  return out;
};

// ---------------------------------------------------------------------------
// Diagram layout library — variants with metadata, scored per diagram
// ---------------------------------------------------------------------------

export interface DiagramVariant {
  id: string;
  layout: DiagramLayoutFn;
  /**
   * Deterministic fit score (0..1) from the diagram's structure and the
   * frame's aspect ratio. The highest-scoring variant is used.
   */
  score: (diagram: SemanticDiagram, frame: Frame) => number;
}

const wide = (frame: Frame) => frame.w / Math.max(1, frame.h);

export const DIAGRAM_VARIANTS: Record<
  SemanticDiagram["diagramType"],
  DiagramVariant[]
> = {
  flow: [
    {
      id: "flow-horizontal",
      layout: flowLayout,
      score: (d, f) =>
        (wide(f) > 1.6 ? 0.9 : 0.6) - (d.nodes.length > 6 ? 0.2 : 0),
    },
    {
      id: "flow-vertical-steps",
      layout: verticalProcessLayout,
      score: (d, f) =>
        (wide(f) < 1.6 ? 0.85 : 0.4) + (d.nodes.length > 6 ? 0.15 : 0),
    },
  ],
  process: [
    {
      id: "process-horizontal",
      layout: flowLayout,
      score: (d, f) =>
        (wide(f) > 1.6 ? 0.9 : 0.6) - (d.nodes.length > 5 ? 0.25 : 0),
    },
    {
      id: "process-vertical-steps",
      layout: verticalProcessLayout,
      score: (d, f) =>
        (wide(f) < 1.6 ? 0.85 : 0.45) + (d.nodes.length > 5 ? 0.3 : 0),
    },
  ],
  flowchart: [
    {
      id: "flowchart-branching",
      layout: flowchartLayout,
      score: () => 0.8,
    },
    {
      id: "flowchart-linear",
      layout: flowLayout,
      score: (d) => (d.edges.length <= d.nodes.length - 1 ? 0.5 : 0.2),
    },
  ],
  timeline: [
    {
      id: "timeline-horizontal",
      layout: timelineLayout,
      score: (d) => (d.nodes.length <= 5 ? 0.9 : 0.5),
    },
    {
      id: "timeline-alternating",
      layout: alternatingTimelineLayout,
      score: (d) => (d.nodes.length >= 6 ? 0.9 : 0.45),
    },
  ],
  cycle: [{ id: "cycle-radial", layout: cycleLayout, score: () => 0.8 }],
  pyramid: [{ id: "pyramid-stacked", layout: pyramidLayout, score: () => 0.8 }],
  funnel: [{ id: "funnel-stacked", layout: funnelLayout, score: () => 0.8 }],
  comparison: [
    {
      id: "comparison-two-col",
      layout: comparisonLayout,
      score: () => 0.8,
    },
    {
      id: "comparison-grid",
      layout: swotLayout,
      score: (d) => (d.nodes.length === 4 ? 0.85 : 0.2),
    },
  ],
  swot: [{ id: "swot-quadrant", layout: swotLayout, score: () => 0.9 }],
  architecture: [
    {
      id: "architecture-layered",
      layout: architectureLayout,
      score: () => 0.8,
    },
    {
      id: "architecture-flow",
      layout: flowchartLayout,
      score: (d, f) => (wide(f) > 2 && d.edges.length > 0 ? 0.7 : 0.3),
    },
  ],
  orgchart: [{ id: "orgchart-tree", layout: orgChartLayout, score: () => 0.9 }],
  roadmap: [
    {
      id: "roadmap-swimlanes",
      layout: roadmapLayout,
      score: (d) => (d.nodes.some((n) => n.group) ? 0.95 : 0.6),
    },
    {
      id: "roadmap-timeline",
      layout: timelineLayout,
      score: (d) =>
        !d.nodes.some((n) => n.group) && d.nodes.length <= 6 ? 0.75 : 0.3,
    },
  ],
};

/** Pick the best-fitting variant for a diagram + frame. Deterministic. */
export function chooseDiagramVariant(
  diagram: SemanticDiagram,
  frame: Frame,
): DiagramVariant {
  const variants =
    DIAGRAM_VARIANTS[diagram.diagramType] ?? DIAGRAM_VARIANTS.flow;
  let best = variants[0];
  let bestScore = -1;
  for (const v of variants) {
    const s = v.score(diagram, frame);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return best;
}

export function layoutDiagram(
  diagram: SemanticDiagram,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement[] {
  uid = 0; // deterministic ids per diagram
  return chooseDiagramVariant(diagram, frame).layout(diagram, frame, tokens);
}

export const builtinDiagramPlugin: DiagramPlugin = {
  id: "builtin-diagrams",
  kind: "diagram",
  name: "Built-in Diagram Engine",
  supports: Object.keys(DIAGRAM_VARIANTS),
  layout: layoutDiagram,
};
