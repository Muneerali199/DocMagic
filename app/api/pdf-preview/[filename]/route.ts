import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const pdfPath = path.join(process.cwd(), 'public', decodeURIComponent(filename));

    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      return new NextResponse('PDF not found', { status: 404 });
    }

    // Check if preview image already exists
    const previewDir = path.join(process.cwd(), 'public', 'templates', 'previews');
    if (!fs.existsSync(previewDir)) {
      fs.mkdirSync(previewDir, { recursive: true });
    }

    const previewPath = path.join(previewDir, `${path.parse(filename).name}.png`);

    // If preview exists, serve it
    if (fs.existsSync(previewPath)) {
      const imageBuffer = fs.readFileSync(previewPath);
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Convert PDF to image
    const document = await pdf(pdfPath, { scale: 2 });
    const firstPage = await document.getPage(1);
    
    if (!firstPage) {
      return new NextResponse('Failed to convert PDF', { status: 500 });
    }

    // Optimize image with sharp
    const optimizedImage = await sharp(firstPage)
      .resize(800, null, { // Width 800px, maintain aspect ratio
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ quality: 90 })
      .toBuffer();

    // Save preview for future use
    fs.writeFileSync(previewPath, optimizedImage);

    return new NextResponse(optimizedImage, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    return new NextResponse('Error generating preview', { status: 500 });
  }
}
