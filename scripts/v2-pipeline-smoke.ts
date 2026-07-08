/**
 * Deterministic end-to-end smoke test for the v2 presentation engine.
 * Feeds a hand-written Semantic IR through:
 *   design engine -> layout intelligence -> materialize -> constraint solver
 *   -> optimization pipeline -> critic -> benchmark -> PPTX compile
 * No LLM calls. Run with: npx tsx scripts/v2-pipeline-smoke.ts
 */

import type { SemanticIR, PresentationStrategy } from "../lib/presentation/ir/schema"
import { validateSemanticIR, validateResolvedIR } from "../lib/presentation/ir/validate"
import { compileSemanticIR } from "../lib/presentation/orchestrator"
import { buildPptx } from "../lib/presentation/compiler/pptx"

const strategy: PresentationStrategy = {
  intent: "Convince engineering leaders that IR-first compilation beats HTML screenshot pipelines",
  audience: "startup founders and engineering leaders",
  goal: "persuade",
  storytellingStrategy: "problem-solution",
  deckLength: 5,
  tone: "bold",
  suggestedDesignLanguage: "stripe",
}

const semantic: SemanticIR = {
  version: "2.0.0",
  stage: "semantic",
  title: "The Presentation Compiler",
  strategy,
  slides: [
    {
      id: "s1",
      type: "hero",
      intent: "Open with the bold claim",
      elements: [
        { id: "e1", kind: "text", role: "title", content: "The Presentation Compiler", emphasis: "primary" },
        {
          id: "e2",
          kind: "text",
          role: "subtitle",
          content: "AI plans the story. Deterministic engines design every pixel.",
          emphasis: "secondary",
        },
      ],
    },
    {
      id: "s2",
      type: "kpi",
      intent: "Show the impact numbers",
      elements: [
        { id: "e1", kind: "text", role: "heading", content: "Impact at a Glance", emphasis: "primary" },
        { id: "e2", kind: "metric", label: "Editable objects", value: "100%", trend: "up", emphasis: "primary" },
        { id: "e3", kind: "metric", label: "Render targets", value: "3", trend: "flat", emphasis: "secondary" },
        { id: "e4", kind: "metric", label: "Screenshot exports", value: "0", trend: "down", emphasis: "secondary" },
      ],
    },
    {
      id: "s3",
      type: "process",
      intent: "Explain the pipeline",
      elements: [
        { id: "e1", kind: "text", role: "heading", content: "How It Works", emphasis: "primary" },
        {
          id: "e2",
          kind: "diagram",
          diagramType: "process",
          emphasis: "primary",
          nodes: [
            { id: "n1", label: "Strategist", emphasis: "primary" },
            { id: "n2", label: "Planner", emphasis: "secondary" },
            { id: "n3", label: "Layout", emphasis: "secondary" },
            { id: "n4", label: "Compiler", emphasis: "secondary" },
          ],
          edges: [
            { from: "n1", to: "n2" },
            { from: "n2", to: "n3" },
            { from: "n3", to: "n4" },
          ],
        },
      ],
    },
    {
      id: "s4",
      type: "content",
      intent: "List the benefits",
      elements: [
        { id: "e1", kind: "text", role: "heading", content: "Why It Wins", emphasis: "primary" },
        {
          id: "e2",
          kind: "text",
          role: "bullet",
          content: "Key benefits",
          emphasis: "secondary",
          items: [
            "Every element is a native, editable object",
            "One IR compiles to PPTX, HTML, and PDF",
            "Deterministic layout means zero overflow",
            "Design languages keep every deck consistent",
          ],
        },
      ],
    },
    {
      id: "s5",
      type: "closing",
      intent: "Call to action",
      elements: [
        { id: "e1", kind: "text", role: "title", content: "Ship Decks, Not Screenshots", emphasis: "primary" },
        { id: "e2", kind: "text", role: "subtitle", content: "Try the v2 engine today.", emphasis: "secondary" },
      ],
    },
  ],
}

async function main() {
  console.log("[v0] 1. Validating Semantic IR...")
  const sv = validateSemanticIR(semantic)
  if (!sv.ok) throw new Error("Semantic IR invalid:\n" + sv.errors.join("\n"))
  console.log("[v0]    ok -", semantic.slides.length, "slides")

  console.log("[v0] 2. Resolving (design -> layout -> constraints -> optimization)...")
  const result = await compileSemanticIR(sv.data!)
  const resolved = result.resolved
  const rv = validateResolvedIR(resolved)
  if (!rv.ok) throw new Error("Resolved IR invalid:\n" + rv.errors.join("\n"))
  for (const slide of resolved.slides) {
    if (slide.elements.length === 0) throw new Error(`Slide ${slide.id} has no elements`)
    for (const el of slide.elements) {
      const f = el.frame
      if (f.x < 0 || f.y < 0 || f.x + f.w > resolved.canvas.width + 1 || f.y + f.h > resolved.canvas.height + 1) {
        throw new Error(`Element ${el.id} on ${slide.id} out of bounds: ${JSON.stringify(f)}`)
      }
    }
  }
  console.log("[v0]    ok - layouts:", resolved.slides.map((s) => s.layoutId).join(", "))

  console.log("[v0] 3. Reading critic report (attached by pipeline)...")
  const report = resolved.critic
  if (!report) throw new Error("Critic report missing from Resolved IR")
  console.log("[v0]    score:", report.score, "- issues:", report.issues.length)
  for (const issue of report.issues.slice(0, 5)) {
    console.log(`[v0]      [${issue.severity}] ${issue.code}: ${issue.message}`)
  }

  console.log("[v0] 4. Reading benchmark from pipeline result...")
  const bench = result.benchmark
  console.log("[v0]    overall:", bench.scores.overall)
  for (const [metric, score] of Object.entries(bench.scores)) {
    if (metric !== "overall") console.log(`[v0]      ${metric}: ${score}`)
  }
  if (typeof bench.scores.overall !== "number" || Number.isNaN(bench.scores.overall)) {
    throw new Error("Benchmark overall score missing")
  }

  console.log("[v0] 5. Compiling native PPTX...")
  const pptx = buildPptx(resolved)
  const buf = (await pptx.write({ outputType: "nodebuffer" })) as Buffer
  if (buf.byteLength < 10_000) throw new Error("PPTX suspiciously small: " + buf.byteLength)
  console.log("[v0]    ok -", (buf.byteLength / 1024).toFixed(1), "KB")

  console.log("[v0] SMOKE TEST PASSED")
}

main().catch((err) => {
  console.error("[v0] SMOKE TEST FAILED:", err)
  process.exit(1)
})
