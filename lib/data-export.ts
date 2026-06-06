/**
 * Data Export Service
 * Fetches all user content and formats as structured JSON for GDPR data portability
 */

import { createClient } from '@supabase/supabase-js';

export type ContentType = "resume" | "presentation" | "diagram" | "letter" | "generated";

export interface ExportableItem {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  content: Record<string, unknown>;
}

interface RawDocument {
  id: string;
  type: string;
  title?: string;
  content?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  document_type?: string;
}

interface RawPresentation {
  id: string;
  title?: string;
  content?: Record<string, unknown>;
  slides?: unknown[];
  themeId?: string;
  template?: string;
  created_at: string;
  updated_at: string;
}

interface RawDiagram {
  id: string;
  title?: string;
  type?: string;
  mermaid_code?: string;
  mermaidCode?: string;
  data?: Record<string, unknown>;
  content?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface RawLetter {
  id: string;
  subject?: string;
  title?: string;
  letter_type?: string;
  content?: Record<string, unknown>;
  from?: Record<string, unknown>;
  to?: Record<string, unknown>;
  date?: string;
  body?: string;
  signature?: string;
  created_at: string;
  updated_at: string;
}

export interface UserDataExport {
  export_metadata: {
    exported_at: string;
    version: string;
    user_id: string;
    total_items: number;
  };
  content: {
    resumes: ExportableItem[];
    presentations: ExportableItem[];
    diagrams: ExportableItem[];
    letters: ExportableItem[];
    generated_documents: ExportableItem[];
  };
  counts: {
    resumes: number;
    presentations: number;
    diagrams: number;
    letters: number;
    generated: number;
    total: number;
  };
}

/**
 * Fetches all user data from various tables
 */
// Admin client for data export - bypasses RLS to fetch all user data
const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
};

/**
 * Fetches all user data from various tables
 */
export async function fetchAllUserData(userId: string): Promise<UserDataExport> {
  const supabase = createAdminClient();

  // Fetch all data types in parallel for efficiency
  const [
    documentsResult,
    presentationsResult,
    diagramsResult,
    lettersResult,
  ] = await Promise.all([
    // Fetch all documents (resumes and generated documents)
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    
    // Fetch presentations
    supabase
      .from("presentations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    
    // Fetch diagrams
    supabase
      .from("diagrams")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    
    // Fetch letters
    supabase
      .from("letters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  // Handle Supabase query errors
  if (documentsResult.error) throw new Error(`Failed to fetch documents: ${documentsResult.error.message}`);
  if (presentationsResult.error) throw new Error(`Failed to fetch presentations: ${presentationsResult.error.message}`);
  if (diagramsResult.error) throw new Error(`Failed to fetch diagrams: ${diagramsResult.error.message}`);
  if (lettersResult.error) throw new Error(`Failed to fetch letters: ${lettersResult.error.message}`);

  // Process documents - separate resumes from generated documents
  const allDocuments: RawDocument[] = documentsResult.data || [];
  const resumes: ExportableItem[] = [];
  const generatedDocs: ExportableItem[] = [];

  allDocuments.forEach((doc: RawDocument) => {
    const item: ExportableItem = {
      id: doc.id,
      type: doc.type as ContentType,
      title: doc.title || `Untitled ${doc.type}`,
      description: getDocumentDescription(doc),
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      content: doc.content || {},
    };

    if (doc.type === "resume") {
      item.type = "resume";
      resumes.push(item);
    } else if (doc.type === "generated") {
      generatedDocs.push(item);
    }
  });

  // Process presentations
  const presentations: ExportableItem[] = (presentationsResult.data as RawPresentation[] || []).map((pres: RawPresentation) => {
    const content = pres.content || {};
    const slides = (content.slides as unknown[]) || pres.slides || [];
    
    return {
      id: pres.id,
      type: "presentation",
      title: pres.title || "Untitled Presentation",
      description: `${slides.length || 0} slides`,
      created_at: pres.created_at,
      updated_at: pres.updated_at,
      content: {
        title: pres.title,
        slides: slides,
        theme_id: (content.themeId || content.template || pres.themeId || pres.template || "peach") as string,
        settings: (content.settings || {}) as Record<string, unknown>,
      },
    };
  });

  // Process diagrams
  const diagrams: ExportableItem[] = (diagramsResult.data as RawDiagram[] || []).map((diagram: RawDiagram) => ({
    id: diagram.id,
    type: "diagram",
    title: diagram.title || "Untitled Diagram",
    description: diagram.type || "Diagram",
    created_at: diagram.created_at,
    updated_at: diagram.updated_at,
    content: {
      type: diagram.type,
      mermaid_code: diagram.mermaid_code || diagram.mermaidCode,
      data: diagram.data || diagram.content || {},
      settings: diagram.settings || {},
    },
  }));

  // Process letters
  const letters: ExportableItem[] = (lettersResult.data as RawLetter[] || []).map((letter: RawLetter) => {
    const content = letter.content || {};
    
    return {
      id: letter.id,
      type: "letter",
      title: letter.subject || letter.title || "Untitled Letter",
      description: letter.letter_type || (content.letter_type as string | undefined) || "Letter",
      created_at: letter.created_at,
      updated_at: letter.updated_at,
      content: {
        letter_type: letter.letter_type || content.letter_type,
        subject: letter.subject || content.subject,
        from: content.from || letter.from || {},
        to: content.to || letter.to || {},
        date: content.date || letter.date,
        body: content.content || content.body || letter.body,
        signature: content.signature || letter.signature,
      },
    };
  });

  const counts = {
    resumes: resumes.length,
    presentations: presentations.length,
    diagrams: diagrams.length,
    letters: letters.length,
    generated: generatedDocs.length,
    total: resumes.length + presentations.length + diagrams.length + letters.length + generatedDocs.length,
  };

  return {
    export_metadata: {
      exported_at: new Date().toISOString(),
      version: "1.0.0",
      user_id: userId,
      total_items: counts.total,
    },
    content: {
      resumes,
      presentations,
      diagrams,
      letters,
      generated_documents: generatedDocs,
    },
    counts,
  };
}

/**
 * Helper function to get document description
 */
function getDocumentDescription(doc: RawDocument): string {
  const content = doc.content || {};
  
  switch (doc.type) {
    case "resume": {
      const resumeData = content.resumeData as Record<string, unknown> | undefined;
      const personalInfo = (resumeData?.personal_info || resumeData?.personalInfo || content.personal_info || content.personalInfo) as Record<string, unknown> | undefined;
      return (personalInfo?.name as string) || "Resume";
    }
    case "generated": {
      const metadata = content.metadata as Record<string, unknown> | undefined;
      const sections = (metadata?.sections || content.sections || []) as unknown[];
      return `${sections.length || 0} sections • ${doc.document_type?.replace(/-/g, " ") || "AI Document"}`;
    }
    default:
      return doc.type || "Document";
  }
}

/**
 * Generates a JSON file for download
 */
export function generateExportFile(data: UserDataExport): Blob {
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: "application/json" });
}

/**
 * Compresses data using gzip compression.
 * Falls back to uncompressed if CompressionStream is unavailable (e.g. Edge runtime or
 * older Node.js versions that do not ship the Compression Streams API).
 * Returns a compressed blob.
 */
export async function compressData(data: UserDataExport): Promise<Blob> {
  const jsonString = JSON.stringify(data, null, 2);
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(jsonString);

  // Guard: CompressionStream is not available in all runtimes (e.g. Next.js Edge)
  if (typeof CompressionStream === 'undefined') {
    return new Blob([uint8Array], { type: 'application/json' });
  }

  // Use CompressionStream API for gzip compression
  const compressionStream = new CompressionStream('gzip');
  const writer = compressionStream.writable.getWriter();
  const reader = compressionStream.readable.getReader();

  // Write data to compression stream
  await writer.write(uint8Array);
  await writer.close();

  // Collect compressed chunks
  const chunks: BlobPart[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Combine chunks into a single blob
  return new Blob(chunks, { type: 'application/gzip' });
}

/**
 * Generates a filename for the export
 */
export function generateExportFilename(userId: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `draftdeckai-export-${userId.substring(0, 8)}-${date}.json`;
}
