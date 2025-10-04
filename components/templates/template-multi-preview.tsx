'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateLivePreview } from './template-live-preview';
import { cn } from '@/lib/utils';

interface TemplateMultiPreviewProps {
  templateType: 'resume' | 'cv' | 'presentation' | 'letter';
  templateStyle: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  className?: string;
}

export function TemplateMultiPreview({
  templateType,
  templateStyle,
  fonts,
  className,
}: TemplateMultiPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Determine number of pages based on type
  const pageCount =
    templateType === 'presentation'
      ? 3 // PPT has 3 slides
      : templateType === 'cv' || templateType === 'resume'
      ? 1 // CV/Resume usually 1-2 pages (showing 1)
      : 1; // Letter is 1 page

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < pageCount - 1 ? prev + 1 : prev));
  };

  return (
    <div className={cn('relative group', className)}>
      {/* Main Preview */}
      <div className="relative overflow-hidden rounded-lg">
        <TemplateLivePreview
          templateType={templateType}
          templateStyle={templateStyle}
          fonts={fonts}
          scale={1}
        />

        {/* Navigation for Presentations */}
        {templateType === 'presentation' && pageCount > 1 && (
          <>
            {/* Previous Button */}
            {currentPage > 0 && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handlePrevPage}
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Next Button */}
            {currentPage < pageCount - 1 && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleNextPage}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {/* Page Indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {Array.from({ length: pageCount }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    idx === currentPage
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/75'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Page Counter */}
      {pageCount > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
          {currentPage + 1} / {pageCount}
        </div>
      )}
    </div>
  );
}
