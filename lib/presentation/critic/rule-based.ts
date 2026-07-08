/**
 * Rule-based Critic — Phase 1 implementation of the CriticPlugin interface.
 *
 * Scores a Resolved IR deck 0-100 and reports issues + recommendations.
 * A vision-capable model critic can replace this later with zero
 * architectural change (same plugin contract).
 */

import {
  CANVAS,
  type CriticIssue,
  type CriticReport,
  type ResolvedIR,
  type ResolvedSlide,
} from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import type { CriticPlugin } from "../plugins/types";
import { detectCollisions, measureBalance } from "../constraints/solver";
import { contrastRatio } from "../color/engine";
import { measureText } from "../typography/measure";

interface SlideAudit {
  issues: CriticIssue[];
  /** 0..1 quality of this slide */
  quality: number;
}

function auditSlide(slide: ResolvedSlide, tokens: DesignTokens): SlideAudit {
  const issues: CriticIssue[] = [];
  let penalty = 0;

  // 1. collisions (error)
  for (const col of detectCollisions(slide)) {
    issues.push({
      slideId: slide.id,
      elementId: col.a,
      severity: "error",
      code: "collision",
      message: `Elements "${col.a}" and "${col.b}" overlap by ${Math.round(col.overlap)}px².`,
    });
    penalty += 0.15;
  }

  // 2. off-canvas elements (error)
  for (const el of slide.elements) {
    const f = el.frame;
    if (
      f.x < -1 ||
      f.y < -1 ||
      f.x + f.w > CANVAS.width + 1 ||
      f.y + f.h > CANVAS.height + 1
    ) {
      const fullBleedMedia = el.kind === "image" || el.kind === "shape";
      if (!fullBleedMedia) {
        issues.push({
          slideId: slide.id,
          elementId: el.id,
          severity: "error",
          code: "off-canvas",
          message: `Element "${el.id}" extends outside the canvas.`,
        });
        penalty += 0.12;
      }
    }
  }

  // 3. text overflow (warning)
  for (const el of slide.elements) {
    if (el.kind !== "text") continue;
    const padding = el.box?.fill ? tokens.spacing.cardPadding : 0;
    const metrics = measureText(
      el.content,
      el.items,
      el.style,
      Math.max(1, el.frame.w - padding * 2),
    );
    if (metrics.height > el.frame.h - padding * 2 + 2) {
      issues.push({
        slideId: slide.id,
        elementId: el.id,
        severity: "warning",
        code: "text-overflow",
        message: `Text in "${el.id}" likely overflows its frame (${metrics.height}px est. vs ${Math.round(el.frame.h)}px).`,
      });
      penalty += 0.08;
    }
    // 4. readability floor
    if (el.style.fontSize < 12) {
      issues.push({
        slideId: slide.id,
        elementId: el.id,
        severity: "warning",
        code: "font-too-small",
        message: `Font size ${el.style.fontSize}px in "${el.id}" is below the 12px readability floor.`,
      });
      penalty += 0.06;
    }
    // 5. contrast (warning)
    const bg = el.box?.fill ?? slide.background;
    const ratio = contrastRatio(el.style.color, bg, slide.background);
    const required = el.style.fontSize >= 24 ? 3 : 4.5;
    if (ratio < required) {
      issues.push({
        slideId: slide.id,
        elementId: el.id,
        severity: "warning",
        code: "low-contrast",
        message: `Contrast ${ratio.toFixed(2)}:1 in "${el.id}" is below WCAG AA (${required}:1).`,
      });
      penalty += 0.08;
    }
  }

  // 6. density: too many elements (info)
  const contentEls = slide.elements.filter((el) => el.kind !== "shape");
  if (contentEls.length > 9) {
    issues.push({
      slideId: slide.id,
      severity: "info",
      code: "high-density",
      message: `Slide has ${contentEls.length} content elements; consider splitting.`,
    });
    penalty += 0.05;
  }

  // 7. whitespace / balance (info)
  const balance = measureBalance(slide, tokens);
  if (balance.coverage > 0.85) {
    issues.push({
      slideId: slide.id,
      severity: "info",
      code: "low-whitespace",
      message: `Content covers ${Math.round(balance.coverage * 100)}% of the safe area; whitespace is cramped.`,
    });
    penalty += 0.04;
  }
  if (balance.horizontalImbalance > 0.65 && slide.type !== "hero") {
    issues.push({
      slideId: slide.id,
      severity: "info",
      code: "imbalanced",
      message: `Horizontal visual weight is ${Math.round(balance.horizontalImbalance * 100)}% one-sided.`,
    });
    penalty += 0.03;
  }

  // 8. hierarchy: exactly one primary text anchor (info)
  const primaryTexts = slide.elements.filter(
    (el) => el.kind === "text" && el.emphasis === "primary",
  );
  if (primaryTexts.length === 0) {
    issues.push({
      slideId: slide.id,
      severity: "info",
      code: "no-anchor",
      message: "Slide has no primary text anchor; hierarchy may read flat.",
    });
    penalty += 0.03;
  }

  return { issues, quality: Math.max(0, 1 - penalty) };
}

function deckRecommendations(ir: ResolvedIR, issues: CriticIssue[]): string[] {
  const recs: string[] = [];
  const byCode = (code: string) => issues.filter((i) => i.code === code).length;
  if (byCode("collision") > 0)
    recs.push(
      "Resolve element overlaps — rerun the constraint solver or reduce content per slide.",
    );
  if (byCode("text-overflow") > 1)
    recs.push(
      "Shorten copy on dense slides; several text blocks exceed their frames.",
    );
  if (byCode("low-contrast") > 0)
    recs.push("Increase text contrast to meet WCAG AA.");
  if (byCode("high-density") > 1)
    recs.push("Split dense slides — aim for one idea per slide.");
  if (byCode("low-whitespace") > ir.slides.length / 3)
    recs.push(
      "Increase whitespace across the deck by trimming content or using more slides.",
    );
  const types = new Set(ir.slides.map((s) => s.type));
  if (ir.slides.length >= 6 && types.size <= 2)
    recs.push(
      "Vary slide types (KPI, comparison, timeline) to improve storytelling rhythm.",
    );
  return recs;
}

export function critiqueResolvedIR(
  ir: ResolvedIR,
  tokens: DesignTokens,
): CriticReport {
  const audits = ir.slides.map((s) => auditSlide(s, tokens));
  const issues = audits.flatMap((a) => a.issues);
  const avgQuality =
    audits.reduce((sum, a) => sum + a.quality, 0) / Math.max(1, audits.length);
  return {
    score: Math.round(avgQuality * 100),
    issues,
    recommendations: deckRecommendations(ir, issues),
  };
}

export const ruleBasedCritic: CriticPlugin = {
  id: "core.critic.rules",
  kind: "critic",
  name: "Rule-based Critic",
  critique: async (ir, tokens) => critiqueResolvedIR(ir, tokens),
};
