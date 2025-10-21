'use client';

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Search,
  Download,
  Eye,
  Star,
  Crown,
  Check,
  Filter,
} from "lucide-react";
import { RESUME_TEMPLATES, TEMPLATE_CATEGORIES, type ResumeTemplate } from '@/lib/resume-template-data';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import dynamic from 'next/dynamic';

const PDFPreview = dynamic(() => import('./pdf-preview').then(mod => ({ default: mod.PDFPreview })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
    </div>
  ),
});

const PresentationPreview = dynamic(() => import('./presentation-preview').then(mod => ({ default: mod.PresentationPreview })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
    </div>
  ),
});

export function ResumeTemplateGallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showProOnly, setShowProOnly] = useState(false);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = [...RESUME_TEMPLATES];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Type filter (resume or presentation)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((template) => template.type === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((template) => template.difficulty === selectedDifficulty);
    }

    // Pro filter
    if (showProOnly) {
      filtered = filtered.filter((template) => template.isPro);
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedDifficulty, showProOnly]);

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search templates by name, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base border-2 focus:border-yellow-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TEMPLATE_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className={cn(
                "whitespace-nowrap transition-all",
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'hover:border-yellow-500'
              )}
            >
              {category.label}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-500 outline-none"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="professional">Professional</option>
          </select>

          <Button
            onClick={() => setShowProOnly(!showProOnly)}
            variant={showProOnly ? 'default' : 'outline'}
            className={showProOnly ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
          >
            <Crown className="h-4 w-4 mr-2" />
            Pro Only
          </Button>

          <div className="ml-auto text-sm text-gray-600 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {filteredTemplates.length} templates found
          </div>
        </div>
      </div>

      {/* Resume Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
        {filteredTemplates.filter(t => t.type === 'resume').map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {/* Presentation Templates - 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTemplates.filter(t => t.type === 'presentation').map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template }: { template: ResumeTemplate }) {
  const [isHovered, setIsHovered] = useState(false);

  const isPresentation = template.type === 'presentation';

  return (
    <Card
      className="group relative overflow-hidden border-2 border-gray-200 hover:border-yellow-400 hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pro Badge */}
      {template.isPro && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            PRO
          </Badge>
        </div>
      )}

      {/* Featured Badge */}
      {template.isFeatured && !template.isPro && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            ⭐ Featured
          </Badge>
        </div>
      )}

      {/* Preview Image */}
      <div className={cn(
        "relative bg-white overflow-hidden border-b-2 border-gray-100",
        isPresentation ? "aspect-[16/9]" : "aspect-[210/297]"
      )}>
        {isPresentation && template.previewImages ? (
          <PresentationPreview 
            pdfUrl={template.pdfUrl}
            previewImages={template.previewImages}
            className="w-full h-full"
          />
        ) : (
          <PDFPreview 
            pdfUrl={template.pdfUrl}
            previewImage={template.previewImage}
            className="w-full h-full"
          />
        )}

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end gap-3 pb-6 animate-in fade-in duration-200">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 font-semibold shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                window.open(template.pdfUrl, '_blank');
              }}
            >
              <Eye className="h-5 w-5 mr-2" />
              Preview
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 font-semibold shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                const link = document.createElement('a');
                link.href = template.pdfUrl;
                link.download = `${template.title}.pdf`;
                link.click();
              }}
            >
              <Download className="h-5 w-5 mr-2" />
              Use Template
            </Button>
          </div>
        )}
      </div>

      {/* Template Info - Minimal */}
      {!isPresentation && (
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-base leading-tight text-gray-900">
            {template.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {template.description}
          </p>
        </div>
      )}
    </Card>
  );
}
