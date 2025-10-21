'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PDFPreviewProps {
  pdfUrl: string;
  previewImage?: string;
  className?: string;
}

export function PDFPreview({ pdfUrl, previewImage, className = '' }: PDFPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Use previewImage if provided, otherwise use API
  const imageUrl = previewImage || `/api/pdf-preview/${encodeURIComponent(pdfUrl.split('/').pop() || '')}`;

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-8">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-sm text-gray-600">Resume Preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt="Resume Preview"
        fill
        className="object-contain object-top"
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        unoptimized
      />
    </div>
  );
}
