import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // For now, return a placeholder or the PDF itself
    // In production, you'd use pdf-to-image conversion
    if (id === 'black-white-professional') {
      const pdfPath = path.join(process.cwd(), 'public', 'Black and White Clean Professional A4 Resume.pdf');
      
      if (fs.existsSync(pdfPath)) {
        const pdfBuffer = fs.readFileSync(pdfPath);
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline',
          },
        });
      }
    }

    // Fallback to placeholder image
    return NextResponse.redirect(
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop&q=80'
    );
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.redirect(
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop&q=80'
    );
  }
}
