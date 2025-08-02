'use client';

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "./template-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Grid, List, RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { TEMPLATE_TYPES } from "@/lib/templates";
import { Template } from "@/types/templates";
import { useState, useMemo } from "react";
import { AuthButton } from "@/components/ui/auth-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateListProps {
  type?: Template['type'];
  title?: string;
  showCreateButton?: boolean;
  limit?: number;
  initialTemplates?: Template[];
  showFilters?: boolean;
  showSearch?: boolean;
  showCategoryTabs?: boolean;
}

export function TemplateList({
  type,
  title = "Templates",
  showCreateButton = true,
  limit,
  initialTemplates = [],
  showFilters = true,
  showSearch = true,
  showCategoryTabs = true
}: TemplateListProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(type || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // State for error handling and retry
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  // Network status monitoring
  useState(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  });

  const { data: templates = initialTemplates, isLoading, error, refetch, isFetching } = useQuery<Template[]>({
    queryKey: ["templates", type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (limit) params.append('limit', limit.toString());

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(`/api/templates?${params.toString()}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Templates not found');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment.');
          } else {
            throw new Error(`Failed to fetch templates (${response.status})`);
          }
        }
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection.');
          }
          throw error;
        }
        throw new Error('An unexpected error occurred');
      }
    },
    initialData: initialTemplates,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('429')) {
          return false;
        }
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    enabled: isOnline, // Only run query when online
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    if (!templates) return [];

    let filtered = templates.filter(template => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || template.type === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [templates, searchQuery, selectedCategory, sortBy]);

  // Get template categories with counts
  const templateCategories = useMemo(() => {
    if (!templates) return [];

    const categories = templates.reduce((acc, template) => {
      acc[template.type] = (acc[template.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { value: 'all', label: 'All Templates', count: templates.length },
      { value: 'resume', label: 'Resumes', count: categories.resume || 0 },
      { value: 'presentation', label: 'Presentations', count: categories.presentation || 0 },
      { value: 'letter', label: 'Letters', count: categories.letter || 0 },
      { value: 'cv', label: 'CVs', count: categories.cv || 0 },
    ];
  }, [templates]);

  // Enhanced retry function
  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Templates have been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Retry failed",
        description: "Unable to refresh templates. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 404) {
          throw new Error('Template not found. It may have already been deleted.');
        } else {
          throw new Error('Failed to delete template');
        }
      }

      toast({
        title: "Template deleted",
        description: "The template has been successfully deleted.",
      });

      await refetch();
    } catch (error) {
      console.error('Error deleting template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete template. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublic: !isPublic,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update template');
      }
      
      toast({
        title: isPublic ? "Template made private" : "Template made public",
        description: isPublic 
          ? "This template is now private and only you can see it." 
          : "This template is now public and can be viewed by anyone with the link.",
      });
      
      await refetch();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Enhanced error handling
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load templates';
    const isNetworkError = !isOnline || errorMessage.includes('timeout') || errorMessage.includes('network');

    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          {isNetworkError ? (
            <WifiOff className="h-10 w-10 text-muted-foreground" />
          ) : (
            <AlertCircle className="h-10 w-10 text-destructive" />
          )}
          <h3 className="mt-4 text-lg font-semibold">
            {isNetworkError ? 'Connection Problem' : 'Something went wrong'}
          </h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {isNetworkError
              ? 'Please check your internet connection and try again.'
              : errorMessage
            }
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
            {retryCount > 0 && (
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            )}
          </div>
          {retryCount > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Retry attempts: {retryCount}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
            <div className="flex items-center gap-2">
              {isFetching && (
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-muted-foreground" />
              )}
              {!isOnline && (
                <div className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1">
                  <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                  <span className="text-xs text-destructive">Offline</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Choose from our collection of professional templates
            {!isOnline && ' (showing cached results)'}
          </p>
        </div>
        {showCreateButton && (
          <div className="flex-shrink-0 w-full sm:w-auto">
            <AuthButton
              activity="create_template"
              onAuthenticatedClick={() => router.push('/templates/new')}
              size="lg"
              disabled={!isOnline}
              className="w-full sm:w-auto"
              authPromptTitle="Sign in to create templates"
              authPromptDescription="Create and customize your own document templates."
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create New Template</span>
              <span className="sm:hidden">Create Template</span>
            </AuthButton>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col gap-3 sm:gap-4">
          {showSearch && (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-center sm:justify-between">
              <div className="flex gap-2 flex-1">
                <Select value={sortBy} onValueChange={(value: 'name' | 'date' | 'type') => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Latest</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex rounded-md border w-fit">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none px-3"
                >
                  <Grid className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Grid</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none px-3"
                >
                  <List className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">List</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      {showCategoryTabs && !type && (
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            {templateCategories.map((category) => (
              <TabsTrigger 
                key={category.value} 
                value={category.value} 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                <span className="truncate">{category.label}</span>
                <Badge variant="secondary" className="text-xs px-1 py-0 min-w-0">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Results Summary */}
      {filteredAndSortedTemplates.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredAndSortedTemplates.length} of {templates?.length || 0} templates
          </span>
          {searchQuery && (
            <span>
              Search results for "{searchQuery}"
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
        }`}>
          {Array.from({ length: viewMode === 'grid' ? 8 : 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              {viewMode === 'grid' ? (
                <div className="rounded-lg border p-3 sm:p-4 space-y-3">
                  <Skeleton className="h-32 sm:h-48 w-full rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2">
                    <Skeleton className="h-8 w-full sm:w-24" />
                    <Skeleton className="h-8 w-full sm:w-20" />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <Skeleton className="h-5 w-full sm:w-48" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-full sm:w-3/4" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : filteredAndSortedTemplates.length > 0 ? (
        <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
        }`}>
          {filteredAndSortedTemplates.map((template) => {
            // Ensure type is one of the allowed values, default to 'resume' if not valid
            const validTypes = ['resume', 'presentation', 'letter', 'cv'] as const;
            type ValidTemplateType = typeof validTypes[number];
            const templateType = validTypes.includes(template.type as ValidTemplateType)
              ? template.type as ValidTemplateType
              : 'resume'; // Default to 'resume' if type is not valid

            return (
              <TemplateCard
                key={template.id}
                id={template.id}
                title={template.title}
                description={template.description || ''}
                type={templateType}
                content={template.content}
                isPublic={template.is_public}
                isOwner={true} // This should be determined by the current user
                onDelete={handleDelete}
                onTogglePublic={handleTogglePublic}
                viewMode={viewMode}
                tags={(template as any).tags}
                difficulty_level={(template as any).difficulty_level}
                usage_count={(template as any).usage_count}
                rating={(template as any).rating}
                preview_image={(template as any).preview_image}
                color_scheme={(template as any).color_scheme}
                industry={(template as any).industry}
              />
            );
          })}
        </div>
      ) : searchQuery ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <Search className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              No templates match your search for "{searchQuery}". Try adjusting your search terms.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You don't have any templates yet. Start by creating a new one.
            </p>
            <Button onClick={() => router.push('/templates/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
