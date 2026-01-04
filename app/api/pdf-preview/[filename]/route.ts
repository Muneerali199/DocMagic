import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const decodedFilename = decodeURIComponent(filename);
    
    // Check if a preview image already exists in the previews folder
    const previewDir = path.join(process.cwd(), 'public', 'templates', 'previews');
    const baseName = path.parse(decodedFilename).name;
    
    // Try different image extensions
    const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
    
    for (const ext of extensions) {
      const previewPath = path.join(previewDir, `${baseName}${ext}`);
      if (fs.existsSync(previewPath)) {
        const imageBuffer = fs.readFileSync(previewPath);
        const contentType = ext === '.png' ? 'image/png' : 
                           ext === '.webp' ? 'image/webp' : 'image/jpeg';
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }
    
    // Check if the PDF itself exists
    const pdfPath = path.join(process.cwd(), 'public', decodedFilename);
    if (!fs.existsSync(pdfPath)) {
      // Return a placeholder response indicating preview unavailable
      return new NextResponse(
        JSON.stringify({ 
          error: 'Preview not available',
          message: 'PDF preview image not found. Use the PDF directly.',
          pdfUrl: `/${decodedFilename}`
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // PDF exists but no preview - return info to use PDF viewer
    return new NextResponse(
      JSON.stringify({ 
        type: 'pdf',
        message: 'Use PDF viewer to display this document',
        pdfUrl: `/${decodedFilename}`
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error in PDF preview route:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error processing request' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
