/**
 * Domain component selection + spec extraction.
 * ---------------------------------------------
 * Deterministic mapping from a slide's semantic content to a Domain Component
 * (see ./domain.ts). This is what lets the visualization plugins "compose
 * domain-specific components instead of generic rectangles": a plugin tags its
 * blueprint with the chosen component id, and the materializer renders it.
 *
 * Pure functions only — no randomness, no IO. Returns `null` whenever a slide
 * has no strong domain signal, so the standard materializer path is preserved.
 */

import type { SemanticElement, SemanticSlide } from "../ir/schema";
import type {
  DomainComponentId,
  DomainId,
  DomainMetric,
  DomainNode,
  DomainSpec,
} from "./domain";

export interface DomainSelection {
  /** A DomainComponentId; kept as string so it can round-trip through the
   * visualization blueprint without coupling types.ts to the domain library. */
  componentId: string;
  /** A DomainId (see ./domain). */
  domain: string;
}

// ---------------------------------------------------------------------------
// Text harvesting
// ---------------------------------------------------------------------------

function slideText(slide: SemanticSlide): string {
  const parts: string[] = [slide.intent ?? ""];
  for (const el of slide.elements) {
    switch (el.kind) {
      case "text":
        parts.push(el.content);
        if (el.items) parts.push(el.items.join(" "));
        break;
      case "callout":
        if (el.title) parts.push(el.title);
        parts.push(el.content);
        break;
      case "code":
        parts.push(el.language);
        if (el.caption) parts.push(el.caption);
        break;
      case "metric":
        parts.push(el.label);
        break;
      case "diagram":
        parts.push(el.nodes.map((n) => n.label).join(" "));
        break;
      case "table":
        parts.push(el.headers.join(" "));
        break;
    }
  }
  return parts.join(" \n ").toLowerCase();
}

const has = (hay: string, re: RegExp) => re.test(hay);

// ---------------------------------------------------------------------------
// Domain detection — ordered by specificity
// ---------------------------------------------------------------------------

const DOMAIN_PATTERNS: Array<{ domain: DomainId; re: RegExp }> = [
  {
    domain: "security",
    re: /\b(security|secure|vulnerab|cve|owasp|exploit|threat|attack|malware|breach|pentest|firewall|zero.?trust|encryption|auth(entication|orization)?|oauth|rbac|hardening|audit)\b/,
  },
  {
    domain: "ai",
    re: /\b(a\.?i\.?|\bml\b|machine learning|deep learning|neural|model|llm|gpt|transformer|tokeniz|token|inference|training|fine.?tune|gpu|tpu|embedding|attention|prompt|dataset|rag)\b/,
  },
  {
    domain: "cloud",
    re: /\b(cloud|kubernetes|k8s|aws|azure|gcp|serverless|lambda|infrastructure|terraform|container|docker|microservice|region|availability zone|topology|ingress|load balancer)\b/,
  },
  {
    domain: "finance",
    re: /\b(revenue|arr|mrr|finance|financial|pricing|cost|budget|profit|margin|invoice|billing|cash flow|ebitda|forecast|valuation)\b/,
  },
  {
    domain: "data",
    re: /\b(data|analytics|pipeline|etl|elt|warehouse|lakehouse|query|sql|database|schema|ingest|dbt|reporting|metrics)\b/,
  },
  {
    domain: "mobile",
    re: /\b(mobile|ios|android|app store|play store|smartphone|phone|push notification|notification|swipe|tap)\b/,
  },
  {
    domain: "saas",
    re: /\b(saas|dashboard|subscription|onboarding|churn|retention|customer|tenant|workspace|admin panel|product|web app|platform)\b/,
  },
];

function detectDomain(text: string): DomainId {
  for (const { domain, re } of DOMAIN_PATTERNS) {
    if (has(text, re)) return domain;
  }
  return "generic";
}

// ---------------------------------------------------------------------------
// Component selection
// ---------------------------------------------------------------------------

interface Signals {
  text: string;
  hasCode: boolean;
  codeLangs: string[];
  hasTable: boolean;
  hasChart: boolean;
  metricCount: number;
  hasDiagram: boolean;
  slideType: string;
}

function isShellLang(langs: string[]): boolean {
  return langs.some((l) =>
    [
      "bash",
      "sh",
      "shell",
      "console",
      "zsh",
      "shellscript",
      "powershell",
    ].includes(l),
  );
}

function selectSecurity(s: Signals): DomainComponentId {
  // Explicit product-surface intents win over the generic "cve"/"vulnerability"
  // keyword, which shows up on almost every security slide. Otherwise a PR-
  // review or terminal slide that merely mentions a CVE would collapse into a
  // static alert card.
  const shellSignal =
    isShellLang(s.codeLangs) ||
    has(s.text, /terminal|command line|\bcli\b|shell prompt|\$\s/);
  const prSignal = has(
    s.text,
    /pull request|\bpr\b|code review|diff|merge|reviewer|approv/,
  );
  if (prSignal) return "git-pr";
  if (has(s.text, /owasp|top 10|top ten/)) return "owasp-badge";
  if (shellSignal) return "terminal";
  if (
    has(
      s.text,
      /ci\/?cd|pipeline|build stage|deploy|workflow|github actions/,
    ) &&
    !s.hasCode
  )
    return "cicd-pipeline";
  if (has(s.text, /\bcve-\d|\bcve\b|vulnerabilit|zero.?day|advisory/))
    return "cve-alert";
  if (s.hasCode) return "code-editor";
  return "code-editor";
}

function selectAi(s: Signals): DomainComponentId {
  if (has(s.text, /attention|self.?attention|weights matrix|heatmap/))
    return "attention-block";
  if (has(s.text, /gpu|tpu|cluster|accelerator|compute node|h100|a100/))
    return "gpu-cluster";
  if (has(s.text, /token|vocabulary|context window|sequence/))
    return "token-flow";
  if (s.hasCode) return "code-editor";
  return "model-pipeline";
}

function selectDataFinanceSaas(
  s: Signals,
  domain: DomainId,
): DomainComponentId {
  if (s.hasCode && isShellLang(s.codeLangs)) return "terminal";
  if (s.hasCode) return "code-editor";
  if (has(s.text, /browser|web app|website|landing|url|https?:/))
    return "browser-window";
  if (
    s.slideType === "dashboard" ||
    has(s.text, /dashboard|admin|console|workspace/)
  )
    return "dashboard";
  if (s.hasTable && !s.hasChart) return "data-table";
  if (s.metricCount >= 1 || s.slideType === "kpi") {
    // a metric-only slide reads best as KPI widgets; mixed metric+chart as dashboard
    return s.hasChart ? "dashboard" : "kpi-widget";
  }
  if (s.hasChart) return "dashboard";
  if (s.hasTable) return "data-table";
  return domain === "finance" ? "dashboard" : "dashboard";
}

function selectCloud(s: Signals): DomainComponentId | null {
  if (s.hasCode && isShellLang(s.codeLangs)) return "terminal";
  if (
    has(
      s.text,
      /architecture|topology|diagram|service|region|infrastructure|microservice|deploy/,
    )
  )
    return "cloud-architecture";
  if (s.hasDiagram) return "cloud-architecture";
  if (s.metricCount >= 1) return "dashboard";
  return "cloud-architecture";
}

function selectMobile(s: Signals): DomainComponentId {
  if (has(s.text, /notification|alert|banner|push/)) return "app-notification";
  return "phone-frame";
}

/**
 * Choose a domain component for a slide, or null to keep the standard path.
 * Hero/section/closing/agenda slides are never converted (they are chrome-free
 * by design).
 */
export function selectDomainComponent(
  slide: SemanticSlide,
): DomainSelection | null {
  if (["hero", "section", "closing", "agenda", "quote"].includes(slide.type))
    return null;

  const text = slideText(slide);
  const domain = detectDomain(text);
  if (domain === "generic") return null;

  const code = slide.elements.filter(
    (e): e is Extract<SemanticElement, { kind: "code" }> => e.kind === "code",
  );
  const signals: Signals = {
    text,
    hasCode: code.length > 0,
    codeLangs: code.map((c) => c.language.toLowerCase()),
    hasTable: slide.elements.some((e) => e.kind === "table"),
    hasChart: slide.elements.some((e) => e.kind === "chart"),
    metricCount: slide.elements.filter((e) => e.kind === "metric").length,
    hasDiagram: slide.elements.some((e) => e.kind === "diagram"),
    slideType: slide.type,
  };

  let componentId: DomainComponentId | null;
  switch (domain) {
    case "security":
      componentId = selectSecurity(signals);
      break;
    case "ai":
      componentId = selectAi(signals);
      break;
    case "cloud":
      componentId = selectCloud(signals);
      break;
    case "mobile":
      componentId = selectMobile(signals);
      break;
    case "saas":
    case "data":
    case "finance":
      componentId = selectDataFinanceSaas(signals, domain);
      break;
    default:
      componentId = null;
  }

  if (!componentId) return null;
  return { componentId, domain };
}

// ---------------------------------------------------------------------------
// Spec extraction — turn a semantic slide into coordinate-free DomainSpec
// ---------------------------------------------------------------------------

export function buildDomainSpec(
  slide: SemanticSlide,
  selection: DomainSelection,
): DomainSpec {
  const titleEl = slide.elements.find(
    (e): e is Extract<SemanticElement, { kind: "text" }> =>
      e.kind === "text" && e.role === "title",
  );
  const subtitleEl = slide.elements.find(
    (e): e is Extract<SemanticElement, { kind: "text" }> =>
      e.kind === "text" && (e.role === "subtitle" || e.role === "heading"),
  );

  const bullets: string[] = [];
  for (const el of slide.elements) {
    if (el.kind === "text") {
      if (el.items?.length) bullets.push(...el.items);
      else if (el.role === "bullet" || el.role === "body")
        bullets.push(el.content);
    } else if (el.kind === "callout") {
      bullets.push(el.content);
    }
  }

  const metrics: DomainMetric[] = slide.elements
    .filter(
      (e): e is Extract<SemanticElement, { kind: "metric" }> =>
        e.kind === "metric",
    )
    .map((m) => ({
      value: m.value,
      label: m.label,
      delta: m.delta,
      trend: m.trend,
    }));

  const codeEl = slide.elements.find(
    (e): e is Extract<SemanticElement, { kind: "code" }> => e.kind === "code",
  );
  const tableEl = slide.elements.find(
    (e): e is Extract<SemanticElement, { kind: "table" }> => e.kind === "table",
  );
  const chartEl = slide.elements.find(
    (e): e is Extract<SemanticElement, { kind: "chart" }> => e.kind === "chart",
  );
  const diagramEl = slide.elements.find(
    (e): e is Extract<SemanticElement, { kind: "diagram" }> =>
      e.kind === "diagram",
  );

  const nodes: DomainNode[] = diagramEl
    ? diagramEl.nodes.map((n) => ({
        label: n.label,
        sublabel: n.sublabel,
        group: n.group,
      }))
    : [];

  return {
    baseId: `${slide.id}:domain`,
    domain: selection.domain as DomainId,
    variant: selection.componentId,
    title: titleEl?.content ?? subtitleEl?.content,
    intent: slide.intent,
    code: codeEl
      ? {
          language: codeEl.language,
          code: codeEl.code,
          caption: codeEl.caption,
        }
      : undefined,
    bullets,
    metrics,
    table: tableEl
      ? { headers: tableEl.headers, rows: tableEl.rows }
      : undefined,
    chart: chartEl
      ? {
          chartType: chartEl.chartType,
          title: chartEl.title,
          categories: chartEl.categories,
          series: chartEl.series,
        }
      : undefined,
    nodes,
  };
}

/** Roles that stay as native slide text (never absorbed into the component). */
export function isChromeTitleRole(role: string): boolean {
  return role === "title" || role === "kicker";
}
