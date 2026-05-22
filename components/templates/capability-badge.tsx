import { TemplateCapabilities } from "@/types/template";
import { Badge } from "@/components/ui/badge";
import { checkCompatibility, UserSelections } from "@/lib/templateCompatibility";
import { AlertTriangle } from "lucide-react";

interface CapabilityBadgeProps {
  capabilities: TemplateCapabilities;
  userSelections?: UserSelections;
}

export function CapabilityBadges({ capabilities, userSelections = {} }: CapabilityBadgeProps) {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      <Badge variant={capabilities.supportsPhoto ? "default" : "outline"} className="text-xs">
        {capabilities.supportsPhoto ? "✓ Photo" : "✗ No Photo"}
      </Badge>
      <Badge variant={capabilities.atsMode ? "default" : "outline"} className="text-xs">
        {capabilities.atsMode ? "✓ ATS-Safe" : "✗ Not ATS"}
      </Badge>
      <Badge variant={capabilities.multiColumn ? "default" : "outline"} className="text-xs">
        {capabilities.multiColumn ? "✓ Multi-col" : "Single-col"}
      </Badge>
      <Badge variant={capabilities.exportStable ? "default" : "outline"} className="text-xs">
        {capabilities.exportStable ? "✓ Export Stable" : "⚠ Export Beta"}
      </Badge>
    </div>
  );
}

interface CompatibilityWarningsProps {
  capabilities: TemplateCapabilities;
  userSelections: UserSelections;
}

export function CompatibilityWarnings({ capabilities, userSelections }: CompatibilityWarningsProps) {
  const { warnings, suggestions } = checkCompatibility(capabilities, userSelections);

  if (warnings.length === 0) return null;

  return (
    <div className="mt-2 rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-700 p-2">
      {warnings.map((warning, i) => (
        <div key={i} className="flex items-start gap-1 text-xs text-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{warning}</span>
        </div>
      ))}
      {suggestions.map((suggestion, i) => (
        <div key={i} className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 ml-4">
          → {suggestion}
        </div>
      ))}
    </div>
  );
}