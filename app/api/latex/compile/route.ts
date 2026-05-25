import { logger } from '@/lib/logger';
const { NextResponse } = require('next/server');
import type { NextRequest } from 'next/server';

export const maxDuration = 60;

interface CompileRequest {
  latex: string;
  engine?: 'pdflatex' | 'xelatex' | 'lualatex';
}

interface CompileError {
  line?: number;
  message: string;
  type: 'error' | 'warning';
}

export async function POST(request: NextRequest) {
  try {
    const body: CompileRequest = await request.json();
    const { latex, engine = 'pdflatex' } = body;

    if (!latex) {
      return NextResponse.json(
        { success: false, error: 'LaTeX code is required' },
        { status: 400 }
      );
    }

    if (!latex.includes('\\documentclass') || !latex.includes('\\begin{document}')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid LaTeX structure. Make sure your document has \\documentclass and \\begin{document}.',
          errors: [{
            message: 'Missing \\documentclass or \\begin{document}',
            type: 'error' as const
          }]
        },
        { status: 400 }
      );
    }

    console.log('Attempting LaTeX compilation via LaTeX.Online...');

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 45000);

      const encodedLatex = encodeURIComponent(latex);
      const compileUrl = `https://latexonline.cc/compile?text=${encodedLatex}&command=${engine}`;

      const response = await fetch(compileUrl, {
        method: 'GET',
        signal: controller.signal,
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/pdf')) {
          console.log('LaTeX compiled successfully!');
          const pdfBuffer = await response.arrayBuffer();
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'inline; filename="resume.pdf"',
              'Cache-Control': 'no-cache',
            },
          });
        } else {
          const errorText = await response.text();
          logger.error({ route: 'app/api/latex/compile/route.ts' }, 'LaTeX.Online returned non-PDF:', errorText.substring(0, 500));

          let errorMessage = 'Compilation failed - check your LaTeX syntax';
          if (errorText.includes('Undefined control sequence')) {
            errorMessage = 'Undefined command in LaTeX. Check for typos in command names.';
          } else if (errorText.includes('Missing')) {
            errorMessage = 'Missing bracket or brace in LaTeX code.';
          } else if (errorText.includes('Emergency stop')) {
            errorMessage = 'Critical LaTeX error - document cannot be compiled.';
          }

          return NextResponse.json({
            success: false,
            message: errorMessage,
            errors: [{ message: errorMessage, type: 'error' as const }],
            logs: errorText.substring(0, 1000),
          }, { status: 422 });
        }
      } else {
        const errorText = await response.text();
        logger.error({ route: 'app/api/latex/compile/route.ts' }, 'LaTeX.Online API error:', response.status, errorText.substring(0, 200));

        if (controller.signal.aborted) {
          throw new Error('Timeout');
        }

        console.log('Trying alternative compilation method...');

        const altController = new AbortController();
        const altTimeoutId = setTimeout(() => altController.abort(), 45000);

        try {
          const altResponse = await fetch('https://latex.ytotech.com/builds/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              compiler: engine,
              resources: [{ main: true, content: latex }]
            }),
            signal: altController.signal,
          });

          if (altResponse.ok) {
            const altContentType = altResponse.headers.get('content-type');
            if (altContentType?.includes('application/pdf')) {
              console.log('LaTeX compiled via alternative service!');
              const pdfBuffer = await altResponse.arrayBuffer();
              return new NextResponse(pdfBuffer, {
                headers: {
                  'Content-Type': 'application/pdf',
                  'Content-Disposition': 'inline; filename="resume.pdf"',
                  'Cache-Control': 'no-cache',
                },
              });
            }
          }
        } catch (altError) {
          logger.error({ route: 'app/api/latex/compile/route.ts' }, 'Alternative compilation also failed:', altError);
        } finally {
          clearTimeout(altTimeoutId);
        }

        throw new Error(`LaTeX.Online API error: ${response.status}`);
      }
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError' || fetchError.message === 'Timeout') {
        logger.error({ route: 'app/api/latex/compile/route.ts' }, 'LaTeX compilation timed out');
        return NextResponse.json({
          success: false,
          message: 'Compilation timed out. Try simplifying your document or download the .tex file to compile locally.',
          errors: [{ message: 'Compilation timeout', type: 'error' as const }],
        }, { status: 408 });
      }

      logger.error({ route: 'app/api/latex/compile/route.ts' }, 'LaTeX compilation error:', fetchError.message);

      return NextResponse.json({
        success: false,
        message: 'PDF compilation service temporarily unavailable. Please download the .tex file and compile in Overleaf or locally.',
        errors: [{ message: fetchError.message, type: 'error' as const }],
        previewUrl: null,
      }, { status: 503 });
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

  } catch (error: any) {
    logger.error({ route: 'app/api/latex/compile/route.ts' }, 'Error in LaTeX compilation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to compile LaTeX',
        message: error.message || 'An unexpected error occurred',
        errors: [{ message: error.message || 'Unknown error', type: 'error' as const }],
      },
      { status: 500 }
    );
  }
}