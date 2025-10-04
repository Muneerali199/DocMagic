'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Copy,
  Trash2,
  GripVertical,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Page {
  id: string;
  name: string;
  thumbnail: string;
  canvasData: any;
}

export function PagesPanel() {
  const { canvas } = useEditorStore();
  const [pages, setPages] = useState<Page[]>([
    {
      id: 'page-1',
      name: 'Page 1',
      thumbnail: '',
      canvasData: null,
    },
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Save current page data before switching
  const saveCurrentPage = () => {
    if (!canvas) return;
    
    const currentPage = pages[currentPageIndex];
    const canvasData = canvas.toJSON();
    const thumbnail = canvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.2 });
    
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      canvasData,
      thumbnail,
    };
    setPages(updatedPages);
  };

  // Load page data
  const loadPage = (index: number) => {
    if (!canvas) return;
    
    saveCurrentPage();
    
    const page = pages[index];
    if (page.canvasData) {
      canvas.loadFromJSON(page.canvasData, () => {
        canvas.renderAll();
      });
    } else {
      canvas.clear();
      canvas.renderAll();
    }
    
    setCurrentPageIndex(index);
    useEditorStore.getState().saveState();
  };

  // Add new page
  const addPage = () => {
    saveCurrentPage();
    
    const newPage: Page = {
      id: `page-${Date.now()}`,
      name: `Page ${pages.length + 1}`,
      thumbnail: '',
      canvasData: null,
    };
    
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    loadPage(updatedPages.length - 1);
  };

  // Duplicate page
  const duplicatePage = (index: number) => {
    saveCurrentPage();
    
    const pageToDuplicate = pages[index];
    const newPage: Page = {
      id: `page-${Date.now()}`,
      name: `${pageToDuplicate.name} (Copy)`,
      thumbnail: pageToDuplicate.thumbnail,
      canvasData: pageToDuplicate.canvasData ? JSON.parse(JSON.stringify(pageToDuplicate.canvasData)) : null,
    };
    
    const updatedPages = [...pages];
    updatedPages.splice(index + 1, 0, newPage);
    setPages(updatedPages);
    loadPage(index + 1);
  };

  // Delete page
  const deletePage = (index: number) => {
    if (pages.length === 1) {
      alert('Cannot delete the last page');
      return;
    }
    
    const updatedPages = pages.filter((_, i) => i !== index);
    setPages(updatedPages);
    
    // Load previous page or first page
    const newIndex = index > 0 ? index - 1 : 0;
    setCurrentPageIndex(newIndex);
    loadPage(newIndex);
  };

  // Rename page
  const renamePage = (index: number, newName: string) => {
    const updatedPages = [...pages];
    updatedPages[index] = {
      ...updatedPages[index],
      name: newName,
    };
    setPages(updatedPages);
  };

  // Navigate pages
  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      loadPage(currentPageIndex + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      loadPage(currentPageIndex - 1);
    }
  };

  // Auto-save current page periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (canvas) {
        const currentPage = pages[currentPageIndex];
        const canvasData = canvas.toJSON();
        const thumbnail = canvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.2 });
        
        const updatedPages = [...pages];
        updatedPages[currentPageIndex] = {
          ...currentPage,
          canvasData,
          thumbnail,
        };
        setPages(updatedPages);
      }
    }, 5000); // Auto-save every 5 seconds

    return () => clearInterval(interval);
  }, [canvas, currentPageIndex, pages]);

  if (isCollapsed) {
    return (
      <div className="h-12 bg-white border-t border-gray-200 shadow-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="h-8 w-8 p-0"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">Pages</span>
            <span className="text-xs text-gray-600">
              {currentPageIndex + 1}/{pages.length}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={addPage}
          className="h-8 px-3 text-blue-600 hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Page
        </Button>
      </div>
    );
  }

  return (
    <div className="h-44 bg-white border-t border-gray-200 shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 border-b bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Pages</h3>
            <p className="text-xs text-gray-600 font-medium">
              {pages.length} {pages.length === 1 ? 'page' : 'pages'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="h-8 w-8 p-0"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Pages List - Horizontal Scroll */}
      <ScrollArea className="flex-1 px-3">
        <div className="flex gap-3 py-3">
          {pages.map((page, index) => (
            <div
              key={page.id}
              onClick={() => loadPage(index)}
              className={cn(
                'group relative rounded-lg overflow-hidden cursor-pointer transition-all flex-shrink-0 w-40',
                currentPageIndex === index
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'ring-1 ring-gray-200 hover:ring-blue-300 hover:shadow-md'
              )}
            >
              {/* Thumbnail */}
              <div
                className={cn(
                  'h-24 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative',
                  currentPageIndex === index && 'bg-blue-50'
                )}
              >
                {page.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={page.thumbnail}
                    alt={page.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-gray-300" />
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                
                {/* Current page indicator */}
                {currentPageIndex === index && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Current
                  </div>
                )}

                {/* Page number */}
                <div className="absolute top-2 left-2 bg-white/90 text-gray-900 text-xs font-semibold px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>

              {/* Page Name & Controls */}
              <div className="p-2 bg-white border-t border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={page.name}
                    onChange={(e) => renamePage(index, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 text-xs font-medium flex-1"
                  />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <GripVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        duplicatePage(index);
                      }}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(index);
                        }}
                        className="text-red-600"
                        disabled={pages.length === 1}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer - Compact Horizontal Layout */}
      <div className="px-3 py-2 border-t bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between gap-4">
        <Button
          onClick={addPage}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Page
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPageIndex === 0}
            className="h-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <div className="text-xs font-bold text-gray-900 whitespace-nowrap px-2">
            {currentPageIndex + 1} / {pages.length}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPageIndex === pages.length - 1}
            className="h-8"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="text-xs text-gray-600">
          <span className="font-bold text-gray-900">💡</span> Auto-saves every 5s • Click to switch pages
        </div>
      </div>
    </div>
  );
}
