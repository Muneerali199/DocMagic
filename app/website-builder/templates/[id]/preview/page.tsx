"use client";

import { useParams, useRouter } from 'next/navigation';
import { websiteTemplates } from '@/lib/website-templates';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Code, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TemplatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params?.id as string;
  const [template, setTemplate] = useState(websiteTemplates.find(t => t.id === templateId));

  useEffect(() => {
    const foundTemplate = websiteTemplates.find(t => t.id === templateId);
    setTemplate(foundTemplate);
  }, [templateId]);

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Template Not Found</h1>
          <Button onClick={() => router.push('/website-builder')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Builder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/website-builder')} 
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {template.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push(`/website-builder/templates/${templateId}/editor`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Use This Template
            </Button>
          </div>
        </div>
      </div>

      {/* Full Preview */}
      <div className="pt-20">
        <iframe
          srcDoc={template.htmlCode}
          className="w-full h-screen border-0"
          title={template.name}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
