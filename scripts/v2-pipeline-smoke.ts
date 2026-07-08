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
  deckLength: 8,
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
      type: "flowchart",
      intent: "Show the branching decision flow",
      elements: [
        { id: "e1", kind: "text", role: "heading", content: "Decision Flow", emphasis: "primary" },
        {
          id: "e2",
          kind: "diagram",
          diagramType: "flowchart",
          emphasis: "primary",
          nodes: [
            { id: "n1", label: "Prompt", emphasis: "primary" },
            { id: "n2", label: "Has data?", emphasis: "secondary" },
            { id: "n3", label: "Chart Engine", emphasis: "secondary" },
            { id: "n4", label: "Diagram Engine", emphasis: "secondary" },
            { id: "n5", label: "Compile", emphasis: "secondary" },
          ],
          edges: [
            { from: "n1", to: "n2" },
            { from: "n2", to: "n3", label: "Yes" },
            { from: "n2", to: "n4", label: "No" },
            { from: "n3", to: "n5" },
            { from: "n4", to: "n5" },
          ],
        },
      ],
    },
    {
      id: "s6",
      type: "orgchart",
      intent: "Show the engine hierarchy",
      elements: [
        { id: "e1", kind: "text", role: "heading", content: "Engine Hierarchy", emphasis: "primary" },
        {
          id: "e2",
          kind: "diagram",
          diagramType: "orgchart",
          emphasis: "primary",
          nodes: [
            { id: "n1", label: "Orchestrator", emphasis: "primary" },
            { id: "n2", label: "Design Engine", emphasis: "secondary" },
            { id: "n3", label: "Layout Intelligence", emphasis: "secondary" },
            { id: "n4", label: "Constraint Solver", emphasis: "secondary" },
            { id: "n5", label: "Diagram Engine", emphasis: "tertiary" },
            { id: "n6", label: "Chart Engine", emphasis: "tertiary" },
          ],
          edges: [
            { from: "n1", to: "n2" },
            { from: "n1", to: "n3" },
            { from: "n1", to: "n4" },
            { from: "n3", to: "n5" },
            { from: "n3", to: "n6" },
          ],
        },
      ],
    },
    {
      id: "s7",
      type: "roadmap",
      intent: "Show the delivery roadmap by track",
      elements: [
        { id: "e1", kind: "text", role: "heading", content: "Delivery Roadmap", emphasis: "primary" },
        {
          id: "e2",
          kind: "diagram",
          diagramType: "roadmap",
          emphasis: "primary",
          nodes: [
            { id: "n1", label: "Core IR", group: "Platform", emphasis: "primary" },
            { id: "n2", label: "PPTX Compiler", group: "Platform", emphasis: "secondary" },
            { id: "n3", label: "Critic v2", group: "Quality", emphasis: "secondary" },
            { id: "n4", label: "Benchmarks", group: "Quality", emphasis: "secondary" },
            { id: "n5", label: "GSlides Target", group: "Targets", emphasis: "secondary" },
            { id: "n6", label: "Figma Target", group: "Targets", emphasis: "tertiary" },
          ],
          edges: [],
        },
      ],
    },
    {
      id: "s7b",
      type: "content",
      intent: "Explain the onboarding workflow step by step",
      elements: [
        { id: "e1", kind: "text", role: "heading", content: "Onboarding Workflow", emphasis: "primary" },
        {
          id: "e2",
          kind: "text",
          role: "bullet",
          content: "",
          emphasis: "secondary",
          items: [
            "Step 1: Sign up — create the workspace",
            "Step 2: Connect data — link your sources",
            "Step 3: Invite team — assign roles",
            "Step 4: Launch — go live in production",
          ],
        },
      ],
    },
    {
      id: "s8",
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

  console.log("[v0] 2b. Verifying Diagram Intelligence auto-conversion...")
  const workflowSlide = result.semantic.slides.find((s) => s.id === "s7b")
  if (!workflowSlide) throw new Error("s7b missing from semantic IR")
  const converted = workflowSlide.elements.find((e) => e.kind === "diagram")
  if (!converted || converted.kind !== "diagram") {
    throw new Error("Diagram Intelligence did not convert step bullets to a native diagram")
  }
  if (converted.nodes.length !== 4 || converted.edges.length !== 3) {
    throw new Error(`Converted diagram malformed: ${converted.nodes.length} nodes, ${converted.edges.length} edges`)
  }
  console.log(`[v0]    ok - bullets became native ${converted.diagramType} diagram (${converted.nodes.length} nodes, ${converted.edges.length} edges)`)

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

  console.log("[v0] 4b. Reading Design Critic result (post-render)...")
  const dc = result.designCritique
  if (typeof dc.overallScore !== "number" || !Array.isArray(dc.issues) || !Array.isArray(dc.recommendations)) {
    throw new Error("Design Critic result malformed")
  }
  console.log("[v0]    overallScore:", dc.overallScore, "- issues:", dc.issues.length, "- recommendations:", dc.recommendations.length)
  for (const issue of dc.issues.slice(0, 4)) console.log("[v0]      issue:", issue)
  for (const rec of dc.recommendations.slice(0, 3)) console.log("[v0]      rec:", rec)

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
