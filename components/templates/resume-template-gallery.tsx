'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="space-y-6 md:space-y-8">
      {/* Search and Filters */}
      <div className="space-y-3 md:space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 md:pl-12 h-12 md:h-14 text-sm md:text-base border-2 focus:border-yellow-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {TEMPLATE_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'whitespace-nowrap transition-all text-xs md:text-sm h-9 md:h-10',
                selectedCategory === category.id
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'hover:bg-gray-100'
              )}
            >
              {category.label}
              <Badge variant="secondary" className="ml-1.5 md:ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 items-center overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <Button
            onClick={() => setSelectedDifficulty('all')}
            variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'whitespace-nowrap text-xs md:text-sm h-9 md:h-10',
              selectedDifficulty === 'all'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : ''
            )}
          >
            All Levels
          </Button>
          <Button
            onClick={() => setSelectedDifficulty('beginner')}
            variant={selectedDifficulty === 'beginner' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'whitespace-nowrap text-xs md:text-sm h-9 md:h-10',
              selectedDifficulty === 'beginner'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : ''
            )}
          >
            Beginner
          </Button>
          <Button
            onClick={() => setSelectedDifficulty('intermediate')}
            variant={selectedDifficulty === 'intermediate' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'whitespace-nowrap text-xs md:text-sm h-9 md:h-10',
              selectedDifficulty === 'intermediate'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : ''
            )}
          >
            Intermediate
          </Button>
          <Button
            onClick={() => setSelectedDifficulty('professional')}
            variant={selectedDifficulty === 'professional' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'whitespace-nowrap text-xs md:text-sm h-9 md:h-10',
              selectedDifficulty === 'professional'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : ''
            )}
          >
            Professional
          </Button>
          <Button
            onClick={() => setShowProOnly(!showProOnly)}
            variant={showProOnly ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'whitespace-nowrap text-xs md:text-sm h-9 md:h-10',
              showProOnly ? 'bg-purple-500 hover:bg-purple-600' : ''
            )}
          >
            <Crown className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
            Pro Only
          </Button>

          <div className="ml-auto text-xs md:text-sm text-gray-600 flex items-center gap-1.5 md:gap-2 whitespace-nowrap">
            <Filter className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{filteredTemplates.length} templates found</span>
            <span className="sm:hidden">{filteredTemplates.length}</span>
          </div>
        </div>
      </div>

      {/* Resume Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
        {filteredTemplates.filter(t => t.type === 'resume').map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {/* Presentation Templates - 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {filteredTemplates.filter(t => t.type === 'presentation').map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 md:py-16">
          <div className="text-4xl md:text-6xl mb-3 md:mb-4">🔍</div>
          <h3 className="text-xl md:text-2xl font-bold mb-2">No templates found</h3>
          <p className="text-sm md:text-base text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template }: { template: ResumeTemplate }) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const isPresentation = template.type === 'presentation';

  const handleUseTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🎯 Opening template:', template.id, 'Type:', template.type);
    
    // Route to appropriate editor based on template type
    let url = '';
    if (template.type === 'resume') {
      // Resume templates go to resume builder
      url = `/resume-builder?template=${encodeURIComponent(template.id)}`;
    } else if (template.type === 'presentation') {
      // Presentation templates go to visual editor
      url = `/editor?template=${encodeURIComponent(template.id)}`;
    } else {
      // Default to resume builder for other types
      url = `/resume-builder?template=${encodeURIComponent(template.id)}`;
    }
    
    console.log('📍 Navigating to:', url);
    router.push(url);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(template.pdfUrl, '_blank');
  };

  return (
    <Card
      className="group relative overflow-hidden border-2 border-gray-200 hover:border-yellow-400 hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleUseTemplate}
    >
      {/* Pro Badge */}
      {template.isPro && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
            <Crown className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
            PRO
          </Badge>
        </div>
      )}

      {/* Featured Badge */}
      {template.isFeatured && !template.isPro && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs">
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

        {/* Hover Overlay - Desktop Only */}
        {isHovered && (
          <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex-col items-center justify-end gap-3 pb-6 animate-in fade-in duration-200">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 font-semibold shadow-xl"
              onClick={handlePreview}
            >
              <Eye className="h-5 w-5 mr-2" />
              Preview
            </Button>
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-xl"
              onClick={handleUseTemplate}
            >
              <Download className="h-5 w-5 mr-2" />
              Use Template
            </Button>
          </div>
        )}
        
        {/* Mobile Action Buttons */}
        <div className="md:hidden absolute bottom-2 left-2 right-2 flex gap-2 z-10">
          <Button
            size="sm"
            className="flex-1 bg-white/90 backdrop-blur-sm text-black hover:bg-white font-semibold shadow-lg text-xs h-8"
            onClick={handlePreview}
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-yellow-500/90 backdrop-blur-sm hover:bg-yellow-600 text-white font-semibold shadow-lg text-xs h-8"
            onClick={handleUseTemplate}
          >
            <Download className="h-3 w-3 mr-1" />
            Use
          </Button>
        </div>
      </div>

      {/* Template Info - Minimal */}
      {!isPresentation && (
        <div className="p-3 md:p-4">
          {/* Title */}
          <h3 className="font-semibold text-sm md:text-base leading-tight text-gray-900">
            {template.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2">
            {template.description}
          </p>
        </div>
      )}
    </Card>
  );
}
