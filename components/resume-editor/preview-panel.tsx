'use client';

import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RESUME_TEMPLATES_NEW } from '@/lib/resume-templates-new';
import { ProfessionalTemplate } from './templates/professional-template';
import { SoftwareEngineerTemplate } from './templates/software-engineer-template';
import { ExecutiveTemplate } from './templates/executive-template';
import { TwoColumnTemplate } from './templates/two-column-template';
import { ModernMinimalTemplate } from './templates/modern-minimal-template';
import { CompactTemplate } from './templates/compact-template';
import { AcademicTemplate } from './templates/academic-template';
import { useState } from 'react';

interface ResumePreviewPanelProps {
  data: any;
  template: string;
  onTemplateChange: (template: string) => void;
}

export function ResumePreviewPanel({ data, template, onTemplateChange }: ResumePreviewPanelProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const currentTemplate = RESUME_TEMPLATES_NEW.find(t => t.id === template) || RESUME_TEMPLATES_NEW[0];

  // Render the appropriate template
  const renderTemplate = () => {
    switch (template) {
      case 'software-engineer':
      case 'data-scientist':
      case 'devops-engineer':
      case 'frontend-developer':
      case 'backend-developer':
        return <SoftwareEngineerTemplate data={data} />;
      case 'product-manager':
      case 'project-manager':
      case 'sales-executive':
        return <ExecutiveTemplate data={data} />;
      case 'marketing-manager':
      case 'financial-analyst':
        return <TwoColumnTemplate data={data} />;
      case 'ux-designer':
      case 'graphic-designer':
        return <ModernMinimalTemplate data={data} />;
      case 'accountant':
        return <CompactTemplate data={data} />;
      case 'academic-researcher':
      case 'teacher':
        return <AcademicTemplate data={data} />;
      default:
        return <ProfessionalTemplate data={data} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentTemplate.icon}</span>
          <div>
            <h3 className="font-bold text-gray-900">{currentTemplate.name}</h3>
            <p className="text-xs text-gray-500">{currentTemplate.description}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
          <Palette className="w-4 h-4 mr-2" />
          Change Template
        </Button>
      </div>

      {showTemplates && (
        <div className="bg-white border-b p-6">
          <h3 className="font-bold text-lg mb-4">Choose a Template</h3>
          <div className="grid grid-cols-3 gap-3">
            {RESUME_TEMPLATES_NEW.map((tmpl) => (
              <button key={tmpl.id} onClick={() => { onTemplateChange(tmpl.id); setShowTemplates(false); }}
                className={`p-4 border-2 rounded-lg text-left hover:shadow-lg transition-all ${
                  template === tmpl.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                <div className="text-3xl mb-2">{tmpl.icon}</div>
                <h4 className="font-bold text-sm">{tmpl.name}</h4>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="w-full max-w-[210mm] mx-auto bg-white shadow-2xl" style={{ minHeight: '297mm', padding: '48px' }}>
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
