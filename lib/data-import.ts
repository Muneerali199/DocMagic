import { z } from "zod";

const importItemSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  content: z.record(z.unknown()).default({}),
});

const dataExportSchema = z
  .object({
    export_metadata: z
      .object({
        version: z.string().optional(),
        exported_at: z.string().optional(),
        total_items: z.number().optional(),
      })
      .passthrough()
      .optional(),
    content: z.object({
      resumes: z.array(importItemSchema).default([]),
      presentations: z.array(importItemSchema).default([]),
      diagrams: z.array(importItemSchema).default([]),
      letters: z.array(importItemSchema).default([]),
      generated_documents: z.array(importItemSchema).default([]),
    }),
  })
  .passthrough();

export type ImportPayload = z.infer<typeof dataExportSchema>;

export interface ImportRow {
  table: "documents" | "presentations" | "diagrams" | "letters";
  sourceId?: string;
  row: Record<string, unknown>;
}

export interface ImportSummary {
  valid: boolean;
  total: number;
  documents: number;
  presentations: number;
  diagrams: number;
  letters: number;
  errors: string[];
}

function timestamp(value?: string) {
  return value || new Date().toISOString();
}

function documentRow(
  item: z.infer<typeof importItemSchema>,
  userId: string,
  type: "resume" | "generated",
): ImportRow {
  return {
    table: "documents",
    sourceId: item.id,
    row: {
      ...(item.id ? { id: item.id } : {}),
      user_id: userId,
      type,
      title: item.title || `Imported ${type}`,
      content: item.content,
      created_at: timestamp(item.created_at),
      updated_at: timestamp(item.updated_at),
    },
  };
}

export function parseImportPayload(payload: unknown): ImportPayload {
  return dataExportSchema.parse(payload);
}

export function buildImportRows(
  payload: ImportPayload,
  userId: string,
): ImportRow[] {
  const rows: ImportRow[] = [];
  const content = payload.content;

  for (const item of content.resumes) {
    rows.push(documentRow(item, userId, "resume"));
  }

  for (const item of content.generated_documents) {
    rows.push(documentRow(item, userId, "generated"));
  }

  for (const item of content.presentations) {
    rows.push({
      table: "presentations",
      sourceId: item.id,
      row: {
        ...(item.id ? { id: item.id } : {}),
        user_id: userId,
        title: item.title || "Imported Presentation",
        content: item.content,
        created_at: timestamp(item.created_at),
        updated_at: timestamp(item.updated_at),
      },
    });
  }

  for (const item of content.diagrams) {
    rows.push({
      table: "diagrams",
      sourceId: item.id,
      row: {
        ...(item.id ? { id: item.id } : {}),
        user_id: userId,
        title: item.title || "Imported Diagram",
        type: item.description || item.content.type || "diagram",
        content: item.content,
        created_at: timestamp(item.created_at),
        updated_at: timestamp(item.updated_at),
      },
    });
  }

  for (const item of content.letters) {
    rows.push({
      table: "letters",
      sourceId: item.id,
      row: {
        ...(item.id ? { id: item.id } : {}),
        user_id: userId,
        title: item.title || "Imported Letter",
        subject: item.title || "Imported Letter",
        content: item.content,
        created_at: timestamp(item.created_at),
        updated_at: timestamp(item.updated_at),
      },
    });
  }

  return rows;
}

export function summarizeImportRows(
  rows: ImportRow[],
  errors: string[] = [],
): ImportSummary {
  return {
    valid: errors.length === 0,
    total: rows.length,
    documents: rows.filter((row) => row.table === "documents").length,
    presentations: rows.filter((row) => row.table === "presentations").length,
    diagrams: rows.filter((row) => row.table === "diagrams").length,
    letters: rows.filter((row) => row.table === "letters").length,
    errors,
  };
}
