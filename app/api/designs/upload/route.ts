import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_MIME_TYPES = [
  'application/x-sketch',
  'application/x-figma',
  'application/octet-stream',
  'image/vnd.adobe.photoshop',
  'application/x-xd',
];

const ALLOWED_EXTENSIONS = ['.sketch', '.figma', '.xd', '.psd'];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 413 }
      );
    }

    // Validate file extension whitelist
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 415 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported media type: ${file.type}` },
        { status: 415 }
      );
    }

    // Sanitize filename - strip path traversal and special chars
    const sanitizedFilename = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '_');

    return NextResponse.json(
      { message: 'File validated successfully', filename: sanitizedFilename },
      { status: 200 }
    );
  } catch (error) {
    console.error('[upload] Error processing file upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
