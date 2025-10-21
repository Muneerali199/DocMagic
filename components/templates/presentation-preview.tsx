'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PresentationPreviewProps {
  pdfUrl: string;
  previewImages: string[];
  className?: string;
}

export function PresentationPreview({ pdfUrl, previewImages, className = '' }: PresentationPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Auto-rotate slides every 2 seconds
  useEffect(() => {
    if (previewImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % previewImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [previewImages.length]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm text-gray-600">Presentation Preview</p>
        </div>
      </div>
    );
  }

  const currentImage = previewImages[currentSlide] || previewImages[0];

  return (
    <div className={`relative bg-white ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      )}
      
      <Image
        src={currentImage}
        alt={`Slide ${currentSlide + 1}`}
        fill
        className="object-contain"
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        unoptimized
      />

      {/* Slide Counter */}
      {previewImages.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full z-10">
          {currentSlide + 1} / {previewImages.length}
        </div>
      )}

      {/* Navigation Dots */}
      {previewImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
          {previewImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-yellow-500 w-4'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
