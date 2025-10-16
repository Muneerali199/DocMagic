'use client';

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  Crown,
  X,
} from "lucide-react";
import { CanvaTemplateCard } from './canva-template-card';
import {
  CANVA_TEMPLATES,
  TEMPLATE_CATEGORIES,
  SORT_OPTIONS,
  DIFFICULTY_FILTERS,
  PRO_FILTERS,
  type CanvaTemplate,
} from '@/lib/canva-templates';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function CanvaTemplateGallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [proFilter, setProFilter] = useState<string>('all');
  const [gridSize, setGridSize] = useState<'comfortable' | 'compact'>('comfortable');
  const [savedTemplates, setSavedTemplates] = useState<Set<string>>(new Set());

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = [...CANVA_TEMPLATES];

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

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((template) => template.type === selectedCategory);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((template) => template.difficulty_level === difficultyFilter);
    }

    // Pro filter
    if (proFilter === 'free') {
      filtered = filtered.filter((template) => !template.isPro);
    } else if (proFilter === 'pro') {
      filtered = filtered.filter((template) => template.isPro);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.usage_count - a.usage_count);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, difficultyFilter, proFilter]);

  const handleSaveTemplate = (id: string) => {
    setSavedTemplates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== 'all',
    difficultyFilter !== 'all',
    proFilter !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setDifficultyFilter('all');
    setProFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#211C1C' }}>
              Browse Templates
            </h1>
            <p className="mt-2" style={{ color: '#6B5C4C' }}>
              {filteredTemplates.length} professional templates to kickstart your creativity
            </p>
          </div>
          
          {/* Grid Size Toggle */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <Button
              variant={gridSize === 'comfortable' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setGridSize('comfortable')}
              className="rounded-md"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={gridSize === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setGridSize('compact')}
              className="rounded-md"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="inline-flex h-auto p-1 bg-gray-100">
              {TEMPLATE_CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all",
                    "data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  )}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="whitespace-nowrap">{category.label}</span>
                  {category.id === 'all' && (
                    <Badge variant="secondary" className="ml-1 bg-gray-200">
                      {CANVA_TEMPLATES.length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] h-11">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filters Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative h-11">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 px-1.5 min-w-[20px] h-5 flex items-center justify-center bg-blue-600">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Templates</SheetTitle>
                <SheetDescription>
                  Refine your search with advanced filters
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Difficulty */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Difficulty Level</label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_FILTERS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pro Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Template Type</label>
                  <Select value={proFilter} onValueChange={setProFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRO_FILTERS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchQuery}"
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSearchQuery('')}
                />
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {TEMPLATE_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedCategory('all')}
                />
              </Badge>
            )}
            {difficultyFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Level: {DIFFICULTY_FILTERS.find((d) => d.value === difficultyFilter)?.label}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setDifficultyFilter('all')}
                />
              </Badge>
            )}
            {proFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {PRO_FILTERS.find((p) => p.value === proFilter)?.label}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setProFilter('all')}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Featured Banner (only when showing all) */}
      {selectedCategory === 'all' && !searchQuery && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Featured Collection</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Professional Templates for Every Need
            </h2>
            <p className="text-white/90 max-w-2xl">
              Handpicked by our design team. Start creating stunning documents in minutes.
            </p>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredTemplates.length}</span> templates
        </p>
        {sortBy === 'popular' && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Sorted by popularity</span>
          </div>
        )}
      </div>

      {/* Template Grid */}
      <AnimatePresence mode="wait">
        {filteredTemplates.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "grid gap-6",
              gridSize === 'comfortable'
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            )}
          >
            {filteredTemplates.map((template) => (
              <CanvaTemplateCard
                key={template.id}
                {...template}
                isSaved={savedTemplates.has(template.id)}
                onSave={handleSaveTemplate}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4 max-w-md">
              We couldn't find any templates matching your criteria. Try adjusting your filters or search query.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
