export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateDiagramWithMistral } from '@/lib/mistral';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, diagramType = 'flowchart' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    console.log(`📊 Generating ${diagramType} diagram with Mistral...`);
    
    const diagram = await generateDiagramWithMistral({ prompt, diagramType });
    
    console.log('✅ Diagram generated successfully with Mistral');
    return NextResponse.json(diagram);
  } catch (error) {
    console.error('Error generating diagram:', error);
    return NextResponse.json(
      { error: 'Failed to generate diagram', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}