import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { pdfUrl } = await request.json();
    
    // For now, return a placeholder
    // In production, you'd use a service like pdf2pic or similar
    return NextResponse.json({
      success: true,
      imageUrl: `https://api.placeholder.com/400x566?text=Resume+Preview`,
    });
  } catch (error) {
    console.error('Error converting PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to convert PDF' },
      { status: 500 }
    );
  }
}
