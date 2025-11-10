'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFResumeEditorProps {
  pdfUrl: string;
  templateId: string;
}

export default function PDFResumeEditor({ pdfUrl, templateId }: PDFResumeEditorProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <p className="text-sm text-gray-700 text-center">
            📄 <strong>Your Selected Template</strong> - This is the exact template you chose
          </p>
        </div>
        
        <div className="relative">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex justify-center"
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={800}
            />
          </Document>
          
          {/* Editable overlay - positioned absolutely over PDF */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="relative w-full h-full">
              {/* Add editable text fields positioned over PDF text */}
              <div className="absolute top-[15%] left-[50%] transform -translate-x-1/2 pointer-events-auto">
                <input
                  type="text"
                  placeholder="Click to edit name"
                  className="text-3xl font-bold text-center bg-transparent border-2 border-dashed border-blue-400 rounded px-4 py-2 text-gray-900 hover:bg-blue-50 focus:bg-white focus:border-blue-600"
                  style={{ minWidth: '400px' }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {numPages > 1 && (
          <div className="p-4 bg-gray-50 border-t flex justify-center gap-4">
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-gray-700 text-center">
          ⚠️ <strong>Note:</strong> PDF editing with overlay is complex. For now, use the editable form below to input your data, then export.
        </p>
      </div>
    </div>
  );
}
