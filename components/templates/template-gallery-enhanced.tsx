'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid3x3, List, SlidersHorizontal, TrendingUp, Clock, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TemplateCardEnhanced } from './template-card-enhanced';
import { CategoryFilter } from './category-filter';
import { templateCategories, premiumTemplates } from '@/lib/template-data';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'recent' | 'name' | 'rating';

interface TemplateGalleryEnhancedProps {
  onSelectTemplate?: (templateId: string) => void;
  onPreviewTemplate?: (templateId: string) => void;
  className?: string;
}

export function TemplateGalleryEnhanced({
  onSelectTemplate,
  onPreviewTemplate,
  className,
}: TemplateGalleryEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = premiumTemplates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.features.some((f) => f.toLowerCase().includes(query))
      );
    }

    // Sort templates
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.usageCount || 0) - (a.usageCount || 0);
        case 'recent':
          return b.new === a.new ? 0 : b.new ? 1 : -1;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const handleUseTemplate = (templateId: string) => {
    onSelectTemplate?.(templateId);
  };

  const handlePreviewTemplate = (templateId: string) => {
    onPreviewTemplate?.(templateId);
  };

  // Add template counts to categories
  const categoriesWithCounts = useMemo(() => {
    return templateCategories.map((cat) => ({
      ...cat,
      count: premiumTemplates.filter((t) => t.category === cat.id).length,
    }));
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Template Gallery</h1>
            <p className="text-muted-foreground mt-1">
              Choose from {premiumTemplates.length}+ professional templates
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {premiumTemplates.filter((t) => t.popular).length} Popular
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {premiumTemplates.filter((t) => t.new).length} New
            </Badge>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates, categories, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Popular
                </span>
              </SelectItem>
              <SelectItem value="recent">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent
                </span>
              </SelectItem>
              <SelectItem value="rating">
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rating
                </span>
              </SelectItem>
              <SelectItem value="name">A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>

          {/* Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categoriesWithCounts}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Active Filters */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Category: {templateCategories.find((c) => c.id === selectedCategory)?.name}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredTemplates.length}</span>{' '}
          template{filteredTemplates.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Templates Grid/List */}
      <AnimatePresence mode="wait">
        {filteredTemplates.length > 0 ? (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TemplateCardEnhanced
                  template={template}
                  onUse={handleUseTemplate}
                  onPreview={handlePreviewTemplate}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="rounded-full bg-muted p-6 mb-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
