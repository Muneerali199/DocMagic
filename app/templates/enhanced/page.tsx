'use client';

import React, { useState } from 'react';
import { TemplateGalleryEnhanced } from '@/components/templates/template-gallery-enhanced';
import { TemplatePreviewFullScreen } from '@/components/templates/template-preview-fullscreen';
import { premiumTemplates } from '@/lib/template-data';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TemplatesEnhancedPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSelectTemplate = (templateId: string) => {
    const template = premiumTemplates.find((t) => t.id === templateId);
    if (template) {
      // Navigate to editor or create document from template
      toast.success(`Using template: ${template.name}`);
      // TODO: Navigate to appropriate editor based on template category
      // router.push(`/presentation/create?template=${templateId}`);
      console.log('Selected template:', template);
    }
  };

  const handlePreviewTemplate = (templateId: string) => {
    const template = premiumTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setIsPreviewOpen(true);
    }
  };

  const handleUseFromPreview = (templateId: string) => {
    handleSelectTemplate(templateId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Professional Templates
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose from our curated collection of premium templates. Each one is designed by
              professionals and ready to customize in real-time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-muted-foreground">Real-time customization</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-muted-foreground">AI-powered design</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-muted-foreground">Export to multiple formats</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container mx-auto px-4 py-8">
        <TemplateGalleryEnhanced
          onSelectTemplate={handleSelectTemplate}
          onPreviewTemplate={handlePreviewTemplate}
        />
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewFullScreen
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          template={selectedTemplate}
          onUseTemplate={handleUseFromPreview}
        />
      )}
    </div>
  );
}
