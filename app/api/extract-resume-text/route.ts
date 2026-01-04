import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let extractedText = '';
    
    // Handle different file types
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        // Use pdf-parse for PDF extraction
        const pdf = await import('pdf-parse');
        const pdfData = await pdf.default(buffer);
        extractedText = pdfData.text || '';
        
        // Clean up extracted text
        extractedText = extractedText
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
          
      } catch (pdfError) {
        console.error('PDF parsing with pdf-parse failed:', pdfError);
        
        // Fallback: Try basic text extraction from PDF
        try {
          const textContent = buffer.toString('utf-8');
          
          // Look for text in PDF streams
          const streamMatches = textContent.match(/stream[\s\S]*?endstream/g);
          if (streamMatches) {
            const texts: string[] = [];
            for (const stream of streamMatches) {
              // Extract readable ASCII text
              const readable = stream
                .replace(/stream|endstream/g, '')
                .replace(/[^\x20-\x7E\n]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              if (readable.length > 10 && /[a-zA-Z]{2,}/.test(readable)) {
                texts.push(readable);
              }
            }
            extractedText = texts.join(' ');
          }
          
          // If still empty, try extracting parenthesis content (PDF text objects)
          if (!extractedText || extractedText.length < 20) {
            const parenMatches = textContent.match(/\(([^)]{2,})\)/g);
            if (parenMatches) {
              extractedText = parenMatches
                .map(m => m.slice(1, -1))
                .filter(t => /[a-zA-Z]{2,}/.test(t))
                .join(' ')
                .replace(/\\[nrt]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            }
          }
        } catch (fallbackError) {
          console.error('Fallback PDF extraction failed:', fallbackError);
        }
      }
      
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      // Plain text files
      extractedText = buffer.toString('utf-8').trim();
      
    } else if (file.type === 'application/msword' || file.name.endsWith('.doc')) {
      // For .doc files, try to extract raw text
      try {
        const textContent = buffer.toString('utf-8');
        // Filter to readable ASCII
        extractedText = textContent
          .replace(/[^\x20-\x7E\n]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
          
        // Only keep if it looks like text
        if (extractedText.length > 50) {
          const words = extractedText.split(/\s+/).filter(w => /^[a-zA-Z]{2,}$/.test(w));
          if (words.length > 10) {
            extractedText = words.join(' ');
          } else {
            extractedText = '';
          }
        }
      } catch (docError) {
        console.error('DOC parsing error:', docError);
      }
      
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
      // For .docx files (which are ZIP archives with XML)
      try {
        const textContent = buffer.toString('utf-8');
        
        // Extract text between XML tags - look for w:t tags specifically
        const wtMatches = textContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
        if (wtMatches) {
          extractedText = wtMatches
            .map(m => {
              const match = m.match(/>([^<]+)</);
              return match ? match[1] : '';
            })
            .filter(t => t.trim().length > 0)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        // Fallback: any text between tags
        if (!extractedText || extractedText.length < 20) {
          const textMatches = textContent.match(/>([^<]{2,})</g);
          if (textMatches) {
            extractedText = textMatches
              .map(m => m.slice(1, -1))
              .filter(t => /[a-zA-Z]{2,}/.test(t))
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }
      } catch (docxError) {
        console.error('DOCX parsing error:', docxError);
      }
    }

    // Final cleanup
    if (extractedText) {
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/[^\x20-\x7E\n.,!?@:;()\-'"/]/g, '')
        .trim();
    }

    // If we couldn't extract enough text
    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json(
        { 
          error: 'Could not extract text from file',
          message: 'Please paste your resume text manually instead. The file may be an image-based PDF or in an unsupported format.',
          text: extractedText || ''
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ 
      text: extractedText,
      length: extractedText.length 
    });

  } catch (error) {
    console.error('Text extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from file. Please paste your resume text manually.' },
      { status: 500 }
    );
  }
}
