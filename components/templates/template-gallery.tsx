'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Plus } from 'lucide-react';
import { Template } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplatePreview } from './template-preview';
import { useTemplates } from '@/hooks/use-templates';
import { getTemplateTypeIcon } from '@/lib/templates';

type TemplateCategory = 'all' | 'resume' | 'presentation' | 'letter' | 'cv' | 'featured' | 'recent' | 'mine';

interface TemplateGalleryProps {
  onSelectTemplate?: (template: Template) => void;
  onCreateNew?: () => void;
  showHeader?: boolean;
  showTabs?: boolean;
  filterByUser?: boolean;
  limit?: number;
  className?: string;
}

export function TemplateGallery({
  onSelectTemplate,
  onCreateNew,
  showHeader = true,
  showTabs = true,
  filterByUser = false,
  limit,
  className = "",
}: TemplateGalleryProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
  
  const { templates, isLoading, error } = useTemplates();
  
  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      activeCategory === 'all' || 
      template.type === activeCategory ||
      (activeCategory === 'mine' && !template.is_default) ||
      (activeCategory === 'featured' && template.is_featured) ||
      (activeCategory === 'recent' && isRecent(template.updated_at));
      
    const matchesUser = !filterByUser || template.user_id === 'current-user-id'; // Replace with actual user ID
    
    return matchesSearch && matchesCategory && matchesUser;
  }).slice(0, limit);
  
  const featuredTemplates = templates.filter(t => t.is_featured);
  const recentTemplates = templates.filter(t => isRecent(t.updated_at));
  const myTemplates = templates.filter(t => !t.is_default);
  
  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'featured', label: 'Featured', count: featuredTemplates.length },
    { id: 'recent', label: 'Recently Updated', count: recentTemplates.length },
    { id: 'mine', label: 'My Templates', count: myTemplates.length },
    { id: 'resume', label: 'Resumes', icon: '📄' },
    { id: 'presentation', label: 'Presentations', icon: '📊' },
    { id: 'letter', label: 'Cover Letters', icon: '✉️' },
    { id: 'cv', label: 'CVs', icon: '📑' },
  ];
  
  function isRecent(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    return date > thirtyDaysAgo;
  }
  
  const handleUseTemplate = (template: Template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    } else {
      router.push(`/documents/new?templateId=${template.id}`);
    }
  };
  
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      router.push('/templates/new');
    }
  };
  
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showHeader && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
              <p className="text-muted-foreground">
                Browse and manage your document templates
              </p>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Failed to load templates</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {error.message || 'An error occurred while loading templates. Please try again.'}
        </p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }
  
  const renderTemplates = (templatesToRender: Template[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templatesToRender.length > 0 ? (
        templatesToRender.map(template => (
          <TemplatePreview
            key={template.id}
            template={template}
            onUseTemplate={() => handleUseTemplate(template)}
            onEdit={() => router.push(`/templates/${template.id}/edit`)}
            className="h-full"
          />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery
              ? 'No templates match your search. Try a different term.'
              : 'Get started by creating a new template.'}
          </p>
          <Button className="mt-4" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      )}
    </div>
  );
  
  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
            <p className="text-muted-foreground">
              Browse and manage your document templates
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Filter by:
            </span>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as TemplateCategory)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon && <span>{category.icon} </span>}
                  {category.label}
                  {category.count !== undefined && ` (${category.count})`}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {showTabs ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="mine">My Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {renderTemplates(filteredTemplates)}
            </TabsContent>
            
            <TabsContent value="featured">
              {renderTemplates(featuredTemplates)}
            </TabsContent>
            
            <TabsContent value="recent">
              {renderTemplates(recentTemplates)}
            </TabsContent>
            
            <TabsContent value="mine">
              {renderTemplates(myTemplates)}
            </TabsContent>
          </Tabs>
        ) : (
          renderTemplates(filteredTemplates)
        )}
      </div>
    </div>
  );
}

// Helper component for error icon
function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// Helper component for X icon
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
