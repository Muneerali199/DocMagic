"use client";

/**
 * v2 presentation generator UI — exercises the IR compiler pipeline.
 * Prompt in → NDJSON progress stream → Resolved IR preview + exports.
 */

import { useCallback, useRef, useState } from "react";
import type { ResolvedIR } from "@/lib/presentation/ir/schema";
import type { BenchmarkReport } from "@/lib/presentation/benchmark/metrics";
import { SlideView } from "@/lib/presentation/compiler/html";
import { DESIGN_LANGUAGES } from "@/lib/presentation/design/languages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
  strategy: "Strategist: understanding intent and audience",
  narrative: "Narrative Planner: building the story",
  design: "Design Engine: selecting design language",
  assets: "Asset Intelligence: selecting imagery",
  layout: "Layout Intelligence: placing content",
  optimize: "Optimization Pipeline: constraints and accessibility",
  critique: "Critic: scoring quality",
};

interface GenerationState {
  status: "idle" | "generating" | "done" | "error";
  stage?: string;
  error?: string;
  resolved?: ResolvedIR;
  benchmark?: BenchmarkReport;
  designLanguage?: string;
}

export function PresentationV2Generator() {
  const [prompt, setPrompt] = useState("");
  const [slideCount, setSlideCount] = useState<string>("auto");
  const [language, setLanguage] = useState<string>("auto");
  const [state, setState] = useState<GenerationState>({ status: "idle" });
  const [activeSlide, setActiveSlide] = useState(0);
  const [exporting, setExporting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (!prompt.trim() || state.status === "generating") return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ status: "generating", stage: "strategy" });
    setActiveSlide(0);
    try {
      const res = await fetch("/api/v2/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          slideCount: slideCount === "auto" ? undefined : Number(slideCount),
          designLanguage: language === "auto" ? undefined : language,
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(err?.error ?? `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as Record<string, unknown>;
          if (event.type === "progress") {
            setState((s) => ({ ...s, stage: event.stage as string }));
          } else if (event.type === "result") {
            setState({
              status: "done",
              resolved: event.resolved as ResolvedIR,
              benchmark: event.benchmark as BenchmarkReport,
              designLanguage: event.designLanguage as string,
            });
          } else if (event.type === "error") {
            throw new Error(event.message as string);
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Generation failed",
      });
    }
  }, [prompt, slideCount, language, state.status]);

  const exportPptxFile = useCallback(async () => {
    if (!state.resolved || exporting) return;
    setExporting(true);
    try {
      const { downloadPptx } = await import("@/lib/presentation/compiler/pptx");
      await downloadPptx(state.resolved);
    } finally {
      setExporting(false);
    }
  }, [state.resolved, exporting]);

  const exportPdfFile = useCallback(async () => {
    if (!state.resolved) return;
    const { exportPdf } = await import("@/lib/presentation/compiler/pdf");
    exportPdf(state.resolved);
  }, [state.resolved]);

  const deck = state.resolved;
  const slide = deck?.slides[activeSlide];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground text-balance">
          Presentation Compiler{" "}
          <span className="text-muted-foreground text-base font-normal">
            v2 beta
          </span>
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          AI plans the story; deterministic engines design, lay out, and compile
          every slide as native, editable objects.
        </p>
      </header>

      <section
        aria-label="Generator controls"
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
      >
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your presentation, e.g. 'Investor pitch for an AI-powered logistics startup'"
          rows={3}
          className="resize-none"
          aria-label="Presentation prompt"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Select value={slideCount} onValueChange={setSlideCount}>
            <SelectTrigger className="w-36" aria-label="Slide count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto length</SelectItem>
              {[6, 8, 10, 12, 15, 20].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} slides
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-44" aria-label="Design language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto design</SelectItem>
              {DESIGN_LANGUAGES.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={generate}
            disabled={!prompt.trim() || state.status === "generating"}
          >
            {state.status === "generating" ? (
              <>
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
                Generating
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
        {state.status === "generating" && (
          <p className="text-sm text-muted-foreground" role="status">
            {STAGE_LABELS[state.stage ?? ""] ?? "Working..."}
          </p>
        )}
        {state.status === "error" && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
      </section>

      {deck && slide && (
        <section
          aria-label="Presentation preview"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-lg font-medium text-foreground">
                {deck.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {deck.slides.length} slides · {state.designLanguage} design ·
                critic score {deck.critic?.score ?? "—"}/100
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportPdfFile}>
                <FileText className="mr-1.5 size-4" aria-hidden="true" />
                PDF
              </Button>
              <Button size="sm" onClick={exportPptxFile} disabled={exporting}>
                {exporting ? (
                  <Loader2
                    className="mr-1.5 size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Download className="mr-1.5 size-4" aria-hidden="true" />
                )}
                PPTX
              </Button>
            </div>
          </div>

          <div className="flex w-full justify-center overflow-hidden rounded-lg border border-border bg-muted p-4">
            <div className="w-full max-w-4xl">
              <div
                className="relative w-full"
                style={{ aspectRatio: "16 / 9" }}
              >
                <ScaledSlide irSlide={slide} />
              </div>
            </div>
          </div>

          <nav
            aria-label="Slide navigation"
            className="flex items-center justify-center gap-3"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveSlide((i) => Math.max(0, i - 1))}
              disabled={activeSlide === 0}
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {activeSlide + 1} / {deck.slides.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setActiveSlide((i) => Math.min(deck.slides.length - 1, i + 1))
              }
              disabled={activeSlide === deck.slides.length - 1}
              aria-label="Next slide"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </nav>

          <div
            className="flex gap-2 overflow-x-auto pb-2"
            role="tablist"
            aria-label="Slides"
          >
            {deck.slides.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === activeSlide}
                aria-label={`Slide ${i + 1}: ${s.intent}`}
                onClick={() => setActiveSlide(i)}
                className={`shrink-0 overflow-hidden rounded border-2 transition-colors ${
                  i === activeSlide
                    ? "border-primary"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <SlideView slide={s} scale={0.09} />
              </button>
            ))}
          </div>

          {state.benchmark && (
            <BenchmarkPanel report={state.benchmark} critic={deck.critic} />
          )}
        </section>
      )}
    </main>
  );
}

/** Scales the 1280x720 slide to fill its responsive container. */
function ScaledSlide({ irSlide }: { irSlide: ResolvedIR["slides"][number] }) {
  const [scale, setScale] = useState(0.65);
  const measure = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const update = () => setScale(node.clientWidth / 1280);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
  }, []);
  return (
    <div ref={measure} className="absolute inset-0">
      <SlideView slide={irSlide} scale={scale} />
    </div>
  );
}

function BenchmarkPanel({
  report,
  critic,
}: {
  report: BenchmarkReport;
  critic?: ResolvedIR["critic"];
}) {
  const entries = Object.entries(report.scores).filter(
    ([k]) => k !== "overall",
  ) as [string, number][];
  const label = (k: string) =>
    k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
  return (
    <section
      aria-label="Quality report"
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Quality benchmark
        </h3>
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {report.scores.overall}/100 overall
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-3">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{label(key)}</span>
            <span
              className={`text-xs font-medium tabular-nums ${
                value >= 80
                  ? "text-foreground"
                  : value >= 60
                    ? "text-muted-foreground"
                    : "text-destructive"
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
      {critic && critic.recommendations.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <h4 className="mb-1.5 text-xs font-medium text-foreground">
            Critic recommendations
          </h4>
          <ul className="flex list-disc flex-col gap-1 pl-4">
            {critic.recommendations.map((rec, i) => (
              <li
                key={i}
                className="text-xs leading-relaxed text-muted-foreground"
              >
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
