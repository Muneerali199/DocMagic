'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Edit, Sparkles } from "lucide-react";
import { RESUME_TEMPLATES_NEW } from '@/lib/resume-templates-new';
import { TemplatePreviewRenderer } from './template-preview-renderer';
import { cn } from "@/lib/utils";

export function ResumeTemplateGalleryNew() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(RESUME_TEMPLATES_NEW.map(t => t.category))];
    return cats;
  }, []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = [...RESUME_TEMPLATES_NEW];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((template) => template.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search resume templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base border-2 focus:border-blue-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'whitespace-nowrap transition-all',
                selectedCategory === category
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'hover:bg-gray-100'
              )}
            >
              {category === 'all' ? 'All Templates' : category}
            </Button>
          ))}
        </div>

        <div className="text-sm text-gray-600">
          {filteredTemplates.length} editable templates found
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="group relative overflow-hidden border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => router.push(`/resume-editor?template=${template.id}`)}
          >
            {/* Template Preview */}
            <div className="relative aspect-[210/297] bg-gray-100 overflow-hidden border-b-2 border-gray-200">
              {/* Actual Template Preview */}
              <TemplatePreviewRenderer templateId={template.id} />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 font-semibold shadow-xl"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Template
                </Button>
              </div>

              {/* Editable Badge */}
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-green-500 text-white border-0 shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Editable
                </Badge>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-4 bg-white">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-base leading-tight text-gray-900">
                  {template.name}
                </h3>
                <Badge variant="outline" className="text-xs shrink-0">
                  {template.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {template.description}
              </p>
            </div>
          </Card>
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
