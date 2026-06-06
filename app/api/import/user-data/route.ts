import { ZodError } from "zod";
import {
  buildImportRows,
  parseImportPayload,
  summarizeImportRows,
} from "@/lib/data-import";
import { createRoute, createSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createRoute();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "Unauthorized. Please sign in to import your data." },
        { status: 401 },
      );
    }

    const payload = parseImportPayload(await request.json());
    const rows = buildImportRows(payload, user.id);
    const summary = summarizeImportRows(rows);

    if (rows.length === 0) {
      return Response.json({
        summary,
        message: "No importable records found.",
      });
    }

    const admin = createSupabaseAdmin();
    const errors: string[] = [];

    for (const table of [
      "documents",
      "presentations",
      "diagrams",
      "letters",
    ] as const) {
      const tableRows = rows
        .filter((row) => row.table === table)
        .map((row) => row.row);
      if (tableRows.length === 0) continue;

      const { error } = await admin
        .from(table)
        .upsert(tableRows, { onConflict: "id" });

      if (error) {
        errors.push(`${table}: ${error.message}`);
      }
    }

    const finalSummary = summarizeImportRows(rows, errors);
    const status = errors.length ? 207 : 200;

    return Response.json(
      {
        summary: finalSummary,
        message: errors.length
          ? "Import completed with partial failures."
          : "Import completed successfully.",
      },
      { status },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid import file.",
          details: error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error: "Failed to import data.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
