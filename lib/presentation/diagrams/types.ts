/**
 * Diagram engine types.
 */

import type { z } from "zod";
import type {
  SemanticDiagramSchema,
  Frame,
  ResolvedElement,
} from "../ir/schema";
import type { DesignTokens } from "../design/tokens";

export type SemanticDiagram = z.infer<typeof SemanticDiagramSchema>;

export type DiagramType = SemanticDiagram["diagramType"];

export interface DiagramLayoutFn {
  (
    diagram: SemanticDiagram,
    frame: Frame,
    tokens: DesignTokens,
  ): ResolvedElement[];
}
