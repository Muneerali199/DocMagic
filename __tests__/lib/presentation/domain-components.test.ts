import type {
  Frame,
  PresentationStrategy,
  ResolvedElement,
  SemanticSlide,
} from "@/lib/presentation/ir/schema";
import { resolveDesign } from "@/lib/presentation/design/engine";
import {
  DOMAIN_COMPONENTS,
  isDomainComponent,
  renderDomainComponent,
  type DomainComponentId,
  type DomainSpec,
} from "@/lib/presentation/components/domain";
import {
  buildDomainSpec,
  selectDomainComponent,
} from "@/lib/presentation/components/domain-select";
import { composeScenes } from "@/lib/presentation/scene/engine";
import { composePresentation } from "@/lib/presentation/composer/composer";
import { visualizeSlides } from "@/lib/presentation/visualization/engine";
import { materializeSlide } from "@/lib/presentation/layout/materialize";
import type { LayoutResult } from "@/lib/presentation/layout/library";
import { defaultRegistry } from "@/lib/presentation/plugins/registry";
import { builtinChartPlugin } from "@/lib/presentation/charts/engine";
import { builtinDiagramPlugin } from "@/lib/presentation/diagrams/engine";

const strategy: PresentationStrategy = {
  intent: "Technical product overview",
  audience: "Engineering leaders",
  goal: "Explain the platform",
  storytellingStrategy: "educational",
  deckLength: 6,
  tone: "technical",
};
const tokens = resolveDesign(strategy).tokens;

const FRAME: Frame = { x: 80, y: 160, w: 1120, h: 480 };

function withinCanvas(el: ResolvedElement): boolean {
  const f = el.frame;
  // allow a small tolerance for hairline/overlap rounding
  return (
    f.x >= FRAME.x - 2 &&
    f.y >= FRAME.y - 2 &&
    f.x + f.w <= FRAME.x + FRAME.w + 2 &&
    f.y + f.h <= FRAME.y + FRAME.h + 2 &&
    f.w > 0 &&
    f.h > 0
  );
}

function baseSpec(overrides: Partial<DomainSpec>): DomainSpec {
  return {
    baseId: "spec",
    domain: "generic",
    bullets: [],
    metrics: [],
    nodes: [],
    ...overrides,
  };
}

describe("Domain Component Library", () => {
  const ids = Object.keys(DOMAIN_COMPONENTS) as DomainComponentId[];

  it("registers all seven domains' components", () => {
    expect(ids.length).toBeGreaterThanOrEqual(17);
    for (const id of ids) expect(isDomainComponent(id)).toBe(true);
    expect(isDomainComponent("not-a-component")).toBe(false);
  });

  it("every component renders valid, in-bounds ResolvedElements", () => {
    for (const id of ids) {
      const spec = baseSpec({
        baseId: id,
        title: "Example Surface",
        code: { language: "typescript", code: "const x = 1\nreturn x" },
        bullets: ["First point", "Second point", "Third point"],
        metrics: [
          { value: "98%", label: "Uptime", delta: "2%", trend: "up" },
          { value: "12k", label: "Users", delta: "5%", trend: "up" },
        ],
        table: { headers: ["A", "B"], rows: [["1", "2"]] },
        nodes: [
          { label: "API", group: "Edge" },
          { label: "DB", group: "Data" },
        ],
      });
      const out = renderDomainComponent(id, spec, FRAME, tokens);
      expect(out).not.toBeNull();
      expect(out!.length).toBeGreaterThan(0);
      for (const el of out!) {
        expect(withinCanvas(el)).toBe(true);
        expect(typeof el.id).toBe("string");
        expect(el.id.length).toBeGreaterThan(0);
      }
      // stable, unique ids within a component
      const idSet = new Set(out!.map((e) => e.id));
      expect(idSet.size).toBe(out!.length);
    }
  });

  it("is deterministic — identical inputs produce identical output", () => {
    const spec = baseSpec({
      baseId: "det",
      title: "Deterministic",
      bullets: ["a", "b", "c"],
    });
    for (const id of ids) {
      const a = renderDomainComponent(id, spec, FRAME, tokens);
      const b = renderDomainComponent(id, spec, FRAME, tokens);
      expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
    }
  });

  it("is theme-aware — surface colors come from the token palette", () => {
    const dashboard = renderDomainComponent(
      "dashboard",
      baseSpec({ baseId: "d", title: "Analytics" }),
      FRAME,
      tokens,
    )!;
    const usesToken = dashboard.some(
      (el) =>
        el.kind === "shape" &&
        (el.box.fill === tokens.colors.surface ||
          el.box.fill === tokens.colors.primary ||
          el.box.borderColor === tokens.colors.border),
    );
    expect(usesToken).toBe(true);
  });

  it("is editable — copy is emitted as text/code elements", () => {
    const editor = renderDomainComponent(
      "code-editor",
      baseSpec({
        baseId: "e",
        code: { language: "typescript", code: "export const answer = 42" },
      }),
      FRAME,
      tokens,
    )!;
    const codeEls = editor.filter((el) => el.kind === "code");
    expect(codeEls.length).toBeGreaterThan(0);
    const hasSource = codeEls.some(
      (el) => el.kind === "code" && el.code.includes("answer = 42"),
    );
    expect(hasSource).toBe(true);
  });

  it("returns null for frames too small to compose legibly", () => {
    expect(
      renderDomainComponent(
        "dashboard",
        baseSpec({ baseId: "s" }),
        { x: 0, y: 0, w: 100, h: 80 },
        tokens,
      ),
    ).toBeNull();
    expect(
      renderDomainComponent("not-real", baseSpec({}), FRAME, tokens),
    ).toBeNull();
  });
});

describe("Domain selection", () => {
  const slide = (
    id: string,
    type: SemanticSlide["type"],
    title: string,
    extra: SemanticSlide["elements"] = [],
  ): SemanticSlide => ({
    id,
    type,
    intent: title,
    elements: [
      { id: `${id}-t`, kind: "text", role: "title", content: title, emphasis: "primary" },
      ...extra,
    ],
  });

  it("maps security + code to a developer surface", () => {
    const s = slide("sec", "content", "Hardening authentication middleware", [
      {
        id: "sec-c",
        kind: "code",
        language: "typescript",
        code: "const token = await verifySession(req)",
        emphasis: "secondary",
      },
    ]);
    const sel = selectDomainComponent(s);
    expect(sel?.domain).toBe("security");
    expect(["code-editor", "git-pr", "terminal"]).toContain(sel?.componentId);
  });

  it("maps a CVE slide to the cve-alert", () => {
    const s = slide("cve", "content", "CVE-2024-31337 critical vulnerability");
    expect(selectDomainComponent(s)?.componentId).toBe("cve-alert");
  });

  it("maps AI attention content to the attention block", () => {
    const s = slide("ai", "content", "Self-attention weights in the transformer");
    const sel = selectDomainComponent(s);
    expect(sel?.domain).toBe("ai");
    expect(sel?.componentId).toBe("attention-block");
  });

  it("maps a mobile notification to the app notification", () => {
    const s = slide("mob", "content", "Push notification delivery on iOS");
    const sel = selectDomainComponent(s);
    expect(sel?.domain).toBe("mobile");
    expect(sel?.componentId).toBe("app-notification");
  });

  it("maps a SaaS dashboard slide to the dashboard component", () => {
    const s = slide("saas", "dashboard", "Customer analytics dashboard", [
      { id: "m", kind: "metric", value: "42%", label: "Growth", emphasis: "secondary" },
      {
        id: "ch",
        kind: "chart",
        chartType: "line",
        categories: ["A", "B"],
        series: [{ name: "x", data: [1, 2] }],
        emphasis: "secondary",
      },
    ]);
    expect(selectDomainComponent(s)?.componentId).toBe("dashboard");
  });

  it("never converts hero/section/quote slides and ignores generic content", () => {
    expect(selectDomainComponent(slide("h", "hero", "Security Platform"))).toBeNull();
    expect(selectDomainComponent(slide("q", "quote", "A great CVE quote"))).toBeNull();
    expect(
      selectDomainComponent(slide("g", "content", "Our quarterly team offsite")),
    ).toBeNull();
  });

  it("extracts an editable spec from semantic content", () => {
    const s = slide("spec", "content", "Deploy pipeline security scan", [
      {
        id: "spec-b",
        kind: "text",
        role: "bullet",
        content: "steps",
        items: ["Build", "Scan", "Deploy"],
        emphasis: "secondary",
      },
    ]);
    const sel = selectDomainComponent(s)!;
    const spec = buildDomainSpec(s, sel);
    expect(spec.title).toBe("Deploy pipeline security scan");
    expect(spec.bullets).toEqual(["Build", "Scan", "Deploy"]);
  });
});

describe("Visualization engine domain tagging", () => {
  function run(slides: SemanticSlide[]) {
    const scenes = composeScenes(slides);
    const plans = composePresentation(slides, scenes).plans;
    return visualizeSlides(slides, scenes, plans);
  }

  it("tags a security architecture slide with a domain component", () => {
    const slides: SemanticSlide[] = [
      {
        id: "arch",
        type: "architecture",
        intent: "Secure cloud architecture with zero-trust ingress",
        elements: [
          {
            id: "arch-t",
            kind: "text",
            role: "title",
            content: "Zero-trust cloud architecture",
            emphasis: "primary",
          },
          {
            id: "arch-d",
            kind: "diagram",
            diagramType: "architecture",
            nodes: [
              { id: "gw", label: "API Gateway", group: "Edge", emphasis: "secondary" },
              { id: "svc", label: "Auth Service", group: "Compute", emphasis: "secondary" },
              { id: "db", label: "Postgres", group: "Data", emphasis: "secondary" },
            ],
            edges: [{ from: "gw", to: "svc" }],
            emphasis: "secondary",
          },
        ],
      },
    ];
    const result = run(slides);
    const directive = result.assignments[0].blueprint.domainComponent;
    expect(directive).toBeDefined();
    expect(["cloud", "security"]).toContain(directive?.domain);
    // assignments remain coordinate-free
    expect(JSON.stringify(result.assignments)).not.toMatch(/"(x|y|w|h)":/);
  });

  it("is deterministic across runs including the domain directive", () => {
    const slides: SemanticSlide[] = [
      {
        id: "kpi",
        type: "kpi",
        intent: "SaaS revenue dashboard",
        elements: [
          { id: "kpi-t", kind: "text", role: "title", content: "MRR growth", emphasis: "primary" },
          { id: "kpi-m", kind: "metric", value: "$48k", label: "MRR", emphasis: "secondary" },
        ],
      },
    ];
    expect(run(slides)).toEqual(run(slides));
  });
});

describe("Materializer domain composition", () => {
  beforeAll(() => {
    if (!defaultRegistry.get("chart", builtinChartPlugin.id))
      defaultRegistry.register(builtinChartPlugin);
    if (!defaultRegistry.get("diagram", builtinDiagramPlugin.id))
      defaultRegistry.register(builtinDiagramPlugin);
  });

  it("composes product chrome and consumes generic body elements", () => {
    const slide: SemanticSlide = {
      id: "demo",
      type: "content",
      intent: "Running the security audit from the terminal",
      elements: [
        { id: "demo-t", kind: "text", role: "title", content: "Security scan CLI session", emphasis: "primary" },
        {
          id: "demo-c",
          kind: "code",
          language: "bash",
          code: "$ npm audit\n✓ 0 vulnerabilities\n$ npm test\n✓ 42 passing",
          emphasis: "secondary",
        },
      ],
    };
    const layout: LayoutResult = {
      placements: [
        { elementId: "demo-t", region: "title", frame: { x: 80, y: 60, w: 1120, h: 64 } },
        { elementId: "demo-c", region: "item-1", frame: { x: 80, y: 160, w: 1120, h: 480 } },
      ],
    };
    const selection = selectDomainComponent(slide)!;
    expect(selection.domain).toBe("security");

    const resolved = materializeSlide(
      slide,
      "content-standard",
      layout,
      tokens,
      defaultRegistry,
      undefined,
      selection,
    );

    // Title survives as native editable text.
    expect(
      resolved.elements.some(
        (el) => el.kind === "text" && el.content === "Security scan CLI session",
      ),
    ).toBe(true);
    // The raw code element was absorbed into the terminal chrome, not left as
    // a lone generic code box with the original id.
    expect(resolved.elements.some((el) => el.id === "demo-c")).toBe(false);
    // Domain component elements are present (ids are namespaced under the spec).
    expect(
      resolved.elements.some((el) => el.id.startsWith("demo:domain")),
    ).toBe(true);
    // The transcript text is preserved somewhere in the composed chrome.
    const hasTranscript = resolved.elements.some(
      (el) =>
        (el.kind === "text" || el.kind === "code") &&
        JSON.stringify(el).includes("42 passing"),
    );
    expect(hasTranscript).toBe(true);
  });

  it("falls back to the standard path when no directive is supplied", () => {
    const slide: SemanticSlide = {
      id: "plain",
      type: "content",
      intent: "Plain content",
      elements: [
        { id: "plain-t", kind: "text", role: "title", content: "Overview", emphasis: "primary" },
        { id: "plain-b", kind: "text", role: "body", content: "A simple paragraph.", emphasis: "secondary" },
      ],
    };
    const layout: LayoutResult = {
      placements: [
        { elementId: "plain-t", region: "title", frame: { x: 80, y: 60, w: 1120, h: 64 } },
        { elementId: "plain-b", region: "item-1", frame: { x: 80, y: 160, w: 1120, h: 200 } },
      ],
    };
    const resolved = materializeSlide(
      slide,
      "content-standard",
      layout,
      tokens,
      defaultRegistry,
    );
    // Original element ids are preserved without any domain chrome.
    expect(resolved.elements.some((el) => el.id === "plain-b")).toBe(true);
    expect(resolved.elements.some((el) => el.id.includes(":domain"))).toBe(false);
  });
});
