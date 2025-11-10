import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latex } = body;

    if (!latex) {
      return NextResponse.json(
        { error: 'LaTeX code is required' },
        { status: 400 }
      );
    }

    // For now, we'll use LaTeX.Online API or return a placeholder
    // In production, you'd use a proper LaTeX compilation service
    
    try {
      // Try to compile with LaTeX.Online
      const response = await fetch('https://latexonline.cc/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `text=${encodeURIComponent(latex)}`,
      });

      if (response.ok) {
        const pdfBuffer = await response.arrayBuffer();
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="resume.pdf"',
          },
        });
      }
    } catch (error) {
      console.error('LaTeX compilation error:', error);
    }

    // Fallback: Return a message as PDF placeholder
    return NextResponse.json({
      success: false,
      message: 'PDF compilation service temporarily unavailable. Please export LaTeX and compile in Overleaf.',
      previewUrl: null
    });

  } catch (error: any) {
    console.error('Error in LaTeX compilation:', error);
    return NextResponse.json(
      { error: 'Failed to compile LaTeX', details: error.message },
      { status: 500 }
    );
  }
}
