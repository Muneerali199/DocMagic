"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Palette,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Type,
  Heading1,
  AlignLeft,
  Link2,
} from "lucide-react";
import {
  ResumeStyleColors,
  DEFAULT_STYLE_COLORS,
  contrastVerdict,
} from "@/lib/resume-style-colors";
import { cn } from "@/lib/utils";

interface TextColorPanelProps {
  /** Current color overrides */
  colors: ResumeStyleColors;
  /** Called when any color changes – parent should update state & persist */
  onChange: (colors: ResumeStyleColors) => void;
  /** Compact mode for mobile */
  compact?: boolean;
}

interface ColorRowProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChangeValue: (hex: string) => void;
  bgColor?: string;
}

function ColorRow({
  label,
  icon,
  value,
  onChangeValue,
  bgColor = "#FFFFFF",
}: ColorRowProps) {
  const verdict = contrastVerdict(value, bgColor);

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Icon */}
      <div className="flex-shrink-0 text-muted-foreground">{icon}</div>

      {/* Label & swatch */}
      <div className="flex-1 min-w-0">
        <Label className="text-xs font-medium block mb-1">{label}</Label>
        <div className="flex items-center gap-2">
          {/* Color picker button */}
          <label className="relative cursor-pointer group">
            <span
              className="block w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md"
              style={{ backgroundColor: value }}
            />
            <input
              type="color"
              value={value}
              onChange={(e) => onChangeValue(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title={`Pick ${label.toLowerCase()}`}
            />
          </label>

          {/* Hex input */}
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                onChangeValue(v);
              }
            }}
            className="w-[5.5rem] px-2 py-1 text-xs font-mono rounded-md border border-gray-200 bg-background focus:outline-none focus:ring-1 focus:ring-yellow-400/50 uppercase"
            maxLength={7}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Contrast badge */}
      <div className="flex-shrink-0 text-right">
        {verdict.passes ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            {verdict.ratio.toFixed(1)}:1
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            {verdict.ratio.toFixed(1)}:1
          </span>
        )}
      </div>
    </div>
  );
}

export function TextColorPanel({
  colors,
  onChange,
  compact = false,
}: TextColorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const update = useCallback(
    (key: keyof ResumeStyleColors, value: string) => {
      onChange({ ...colors, [key]: value });
    },
    [colors, onChange]
  );

  const reset = useCallback(() => {
    onChange({ ...DEFAULT_STYLE_COLORS });
  }, [onChange]);

  const hasCustomColors =
    colors.headerColor !== DEFAULT_STYLE_COLORS.headerColor ||
    colors.sectionHeadingColor !== DEFAULT_STYLE_COLORS.sectionHeadingColor ||
    colors.bodyColor !== DEFAULT_STYLE_COLORS.bodyColor ||
    colors.linkColor !== DEFAULT_STYLE_COLORS.linkColor;

  // Check if any color fails contrast
  const anyContrastFail = [
    colors.headerColor,
    colors.sectionHeadingColor,
    colors.bodyColor,
    colors.linkColor,
  ].some((c) => !contrastVerdict(c).passes);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300",
        isExpanded
          ? "border-yellow-400/40 bg-gradient-to-b from-yellow-50/30 to-transparent dark:from-yellow-900/10"
          : "border-yellow-400/20 hover:border-yellow-400/40",
        compact ? "p-3" : "p-4"
      )}
    >
      {/* Collapse header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 group"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20 group-hover:from-yellow-400/30 group-hover:to-orange-400/30 transition-colors">
            <Palette className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <span className="text-sm font-semibold">Text Colors</span>
          {hasCustomColors && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400">
              Customized
            </span>
          )}
          {anyContrastFail && (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          <ColorRow
            label="Name / Header"
            icon={<Heading1 className="h-4 w-4" />}
            value={colors.headerColor}
            onChangeValue={(v) => update("headerColor", v)}
          />
          <ColorRow
            label="Section Headings"
            icon={<Type className="h-4 w-4" />}
            value={colors.sectionHeadingColor}
            onChangeValue={(v) => update("sectionHeadingColor", v)}
          />
          <ColorRow
            label="Body Text"
            icon={<AlignLeft className="h-4 w-4" />}
            value={colors.bodyColor}
            onChangeValue={(v) => update("bodyColor", v)}
          />
          <ColorRow
            label="Links"
            icon={<Link2 className="h-4 w-4" />}
            value={colors.linkColor}
            onChangeValue={(v) => update("linkColor", v)}
          />

          {/* Contrast warning banner */}
          {anyContrastFail && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                One or more colors may be hard to read on a white background.
                WCAG AA recommends a contrast ratio ≥ 4.5:1 for normal text.
              </p>
            </div>
          )}

          {/* Reset button */}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={!hasCustomColors}
              className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
