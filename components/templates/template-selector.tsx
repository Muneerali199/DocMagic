'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, X } from 'lucide-react';
import { Template } from '@/types';
import { useTemplates } from '@/hooks/use-templates';
import { getTemplateTypeIcon } from '@/lib/templates';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: Template) => void;
  onCreateNew?: () => void;
}

export function TemplateSelector({
  open,
  onOpenChange,
  onSelectTemplate,
  onCreateNew,
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const { templates, isLoading, error } = useTemplates();
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = selectedType ? template.type === selectedType : true;
    
    return matchesSearch && matchesType;
  });
  
  const templateTypes = Array.from(new Set(templates.map(t => t.type)));
  
  const handleTemplateSelect = (template: Template) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };
  
  const handleCreateNew = () => {
    onOpenChange(false);
    if (onCreateNew) {
      onCreateNew();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          <div className="flex items-center space-x-2">
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
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button
              variant={!selectedType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(null)}
            >
              All Templates
            </Button>
            {templateTypes.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {getTemplateTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-destructive">
              Failed to load templates. Please try again.
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || selectedType 
                  ? 'Try adjusting your search or filter'
                  : 'Create a new template to get started'}
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2">
              {filteredTemplates.map(template => (
                <div 
                  key={template.id} 
                  className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors flex flex-col h-full"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">
                      {getTemplateTypeIcon(template.type)}
                    </span>
                    <h4 className="font-medium">{template.title}</h4>
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
                      {template.description}
                    </p>
                  )}
                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    Last updated {new Date(template.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
