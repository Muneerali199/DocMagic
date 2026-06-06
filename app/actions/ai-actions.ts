'use server';

import { generateOutline, generateDocument, regenerateSection, type GenerationOptions, type OutlineOptions } from '@/lib/documents/ai-generator';
import type { GeneratedDocument } from '@/types/documents';

export async function generateOutlineAction(options: OutlineOptions) {
  return generateOutline(options);
}

export async function generateDocumentAction(options: GenerationOptions) {
  return generateDocument(options);
}

export async function regenerateSectionAction(
  document: GeneratedDocument,
  sectionId: string,
  feedback?: string
) {
  return regenerateSection(document, sectionId, feedback);
}
