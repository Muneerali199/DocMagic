# Presentation Engine v2 — IR-First Compiler

A compiler-based presentation platform: AI performs reasoning, planning, and critique; deterministic engines perform design, layout, optimization, and rendering. Every output format is generated from a single Presentation IR.

## Pipeline

```
prompt
  │
  ▼
Presentation Strategist   (LLM: GLM via Nebius — intent, audience, goal,
  │                        storytelling strategy, deck length, tone)
  ▼
Narrative Planner         (LLM — slide sequence, semantic slide types,
  │                        Semantic IR. NO layouts, NO coordinates)
  ▼
─── deterministic from here (no LLM) ───
  │
Design Engine             (selects design language → resolves design tokens)
  ▼
Asset Intelligence        (ranks + attaches imagery to image elements)
  ▼
Layout Intelligence       (scores Layout Library entries per slide semantics)
  ▼
Materializer              (semantic elements → positioned resolved elements;
  │                        diagram + chart engines run here via plugins)
  ▼
Constraint Solver         (overflow, collisions, font scaling, optical
  │                        alignment, safe margins, visual balance)
  ▼
Optimization Pipeline     (typography, whitespace, accessibility, layout
  │                        balancing passes — plugin-extensible)
  ▼
Critic                    (rule-based scorer; interface supports future
  │                        vision-model critics)
  ▼
Benchmark                 (9 quality metrics: readability, hierarchy,
  │                        consistency, editability, accessibility,
  │                        whitespace, storytelling, density, design)
  ▼
Resolved IR ──► Presentation Compiler ──► native PPTX / HTML / PDF
```

## Directory map

| Path | Responsibility |
| --- | --- |
| `ir/schema.ts` | Zod schemas: Semantic IR, Resolved IR, strategy, critic report |
| `ir/validate.ts` | Validation, JSON extraction, deterministic IR repair |
| `brain/client.ts` | Nebius LLM client (JSON mode + Zod validation + retry) |
| `brain/strategist.ts` | Presentation Strategist |
| `brain/planner.ts` | Narrative Planner → Semantic IR |
| `design/tokens.ts` | Centralized design token contract |
| `design/languages.ts` | 9 design languages (Apple, Stripe, Google, Notion, …) |
| `design/engine.ts` | Design Engine: strategy → language → resolved tokens |
| `layout/library.ts` | Semantic Layout Library with metadata (density, hierarchy, whitespace, capacity) |
| `layout/intelligence.ts` | Layout Intelligence: semantic scoring, no template IDs |
| `layout/materialize.ts` | Semantic elements → resolved elements in layout regions |
| `constraints/geometry.ts` | Rect math, collision, balance helpers |
| `constraints/solver.ts` | Deterministic constraint/optimization solver |
| `typography/measure.ts` | Text measurement + fit estimation |
| `typography/apply.ts` | Token-driven text style resolution |
| `color/engine.ts` | Contrast (WCAG), palette derivation, rgba/hex handling |
| `diagrams/engine.ts` | Semantic diagrams → positioned native shapes (plugin) |
| | 12 diagram types with a variant library (`DIAGRAM_VARIANTS`) — each type has scored layout variants (e.g. process: horizontal flow vs vertical numbered steps; timeline: single-side vs alternating) chosen deterministically by structure + frame aspect |
| `diagrams/intelligence.ts` | Diagram Intelligence: detects process/timeline/hierarchy/comparison/system content authored as text bullets and auto-converts it to native diagram elements (no LLM, never images) |
| `charts/engine.ts` | Chart normalization + palette assignment (plugin) |
| `assets/intelligence.ts` | Multi-factor asset ranking |
| `assets/providers.ts` | Asset provider adapters |
| `optimization/pipeline.ts` | Ordered pass runner |
| `optimization/passes.ts` | Built-in optimization passes |
| `critic/rule-based.ts` | Rule-based critic (implements `CriticPlugin`) |
| `benchmark/metrics.ts` | 9-metric benchmark framework |
| `plugins/types.ts` | Plugin contracts (diagram, chart, pass, critic, …) |
| `plugins/registry.ts` | Plugin registry |
| `compiler/pptx.ts` | Native PPTX (pptxgenjs, 100% editable objects) |
| `compiler/html.tsx` | React renderer for Resolved IR (preview + print surface) |
| `compiler/pdf.ts` | Print-based PDF export |
| `orchestrator.ts` | Wires the full pipeline; `generatePresentation()` entry point |

## Entry points

- `POST /api/v2/presentation` — full generation (requires `NEBIUS_API_KEY`)
- `/v2` — beta generator UI
- `compileSemanticIR()` — deterministic back half only (used by tests)
- `scripts/v2-pipeline-smoke.ts` — LLM-free end-to-end smoke test:
  `npx tsx scripts/v2-pipeline-smoke.ts`

## Environment

- `NEBIUS_API_KEY` — required for Strategist/Planner
- `PRESENTATION_BRAIN_MODEL` — optional, defaults to `zai-org/GLM-5.2`

## Rules

1. LLMs never emit coordinates, colors, or font sizes — only Semantic IR.
2. Renderers consume only Resolved IR; they make zero design decisions.
3. All visual values come from design tokens; nothing is hardcoded.
4. Constraint solving and optimization are fully deterministic.
5. Exports are native objects — never screenshots or rasterized slides.
6. The legacy HTML-first pipeline is untouched; v2 runs in parallel.
7. The LLM never draws. It classifies semantic intent (slide type = layout
   intent) and emits structured JSON; specialized engines construct all
   charts, diagrams, timelines, org charts, flowcharts, and roadmaps.
8. Image generation is only for creative assets (hero art, backgrounds,
   decorative imagery) — never for informational graphics.

## Native engines (Phase 2)

Slide-level: hero, KPI, dashboard, gallery, quote, agenda, section, closing,
content (materializer + Layout Library). Element-level: chart, table, code
block, metric, callout (materializer). Graph-level (diagram engine): flow,
flowchart, process, timeline, cycle, pyramid, funnel, comparison, SWOT,
architecture, org chart, roadmap. Roadmap uses node `group` as its swim-lane;
org chart and architecture derive tiers from the edge graph.
