import { TemplateCapabilities, TemplateCompatibilityResult } from "@/types/template";

export interface UserSelections {
  hasPhoto?: boolean;
  needsAts?: boolean;
  needsMultiColumn?: boolean;
}

export function checkCompatibility(
  capabilities: TemplateCapabilities,
  userSelections: UserSelections
): TemplateCompatibilityResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (userSelections.hasPhoto && !capabilities.supportsPhoto) {
    warnings.push("This template does not support photos. Your photo will not appear.");
    suggestions.push("Choose a template with photo support enabled.");
  }

  if (userSelections.needsAts && !capabilities.atsMode) {
    warnings.push("This template is not ATS-safe. It may not pass automated screening.");
    suggestions.push("Use an ATS-friendly template for job applications.");
  }

  if (userSelections.needsMultiColumn && !capabilities.multiColumn) {
    warnings.push("This template uses a single-column layout.");
    suggestions.push("Try a multi-column template to fit more content.");
  }

  if (!capabilities.exportStable) {
    warnings.push("Export stability is limited for this template. Preview before downloading.");
  }

  return { warnings, suggestions };
}