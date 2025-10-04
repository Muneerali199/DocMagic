'use client';

import React from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MousePointer2,
  Type,
  Square,
  Circle,
  Image,
  Hand,
  Pencil,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  Eye,
  EyeOff,
  Copy,
  Scissors,
  Clipboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function EditorToolbar() {
  const {
    activeTool,
    setActiveTool,
    activeShape,
    setActiveShape,
    zoom,
    setZoom,
    showGrid,
    toggleGrid,
    showGuides,
    toggleGuides,
    undo,
    redo,
    copy,
    paste,
    cut,
    history,
    historyIndex,
  } = useEditorStore();

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select (V)', shortcut: 'V' },
    { id: 'text', icon: Type, label: 'Text (T)', shortcut: 'T' },
    { id: 'shape', icon: Square, label: 'Shape (S)', shortcut: 'S' },
    { id: 'image', icon: Image, label: 'Image (I)', shortcut: 'I' },
    { id: 'pan', icon: Hand, label: 'Pan (H)', shortcut: 'H' },
    { id: 'draw', icon: Pencil, label: 'Draw (D)', shortcut: 'D' },
  ];

  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

  const handleZoomIn = () => {
    const currentIndex = zoomLevels.findIndex((z) => z >= zoom);
    const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1);
    setZoom(zoomLevels[nextIndex]);
  };

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.findIndex((z) => z >= zoom);
    const prevIndex = Math.max(currentIndex - 1, 0);
    setZoom(zoomLevels[prevIndex]);
  };

  const handleFitToScreen = () => {
    setZoom(1);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('select');
          break;
        case 't':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('text');
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('shape');
          break;
        case 'i':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('image');
          break;
        case 'h':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('pan');
          break;
        case 'd':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('draw');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-2 bg-white border-b border-border">
        {/* Tools */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTool(tool.id as any)}
                  className={cn(
                    'w-9 h-9 p-0',
                    activeTool === tool.id && 'bg-primary text-primary-foreground'
                  )}
                >
                  <tool.icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Shape Selector (only visible when shape tool is active) */}
        {activeTool === 'shape' && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-1">
              {[
                { type: 'rectangle', icon: Square, label: 'Rectangle' },
                { type: 'circle', icon: Circle, label: 'Circle' },
              ].map((shape) => (
                <Tooltip key={shape.type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeShape === shape.type ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveShape(shape.type as any)}
                      className={cn(
                        'w-9 h-9 p-0',
                        activeShape === shape.type && 'bg-primary text-primary-foreground'
                      )}
                    >
                      <shape.icon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{shape.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </>
        )}

        <Separator orientation="vertical" className="h-8" />

        {/* History */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="w-9 h-9 p-0"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="w-9 h-9 p-0"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Shift+Z)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Clipboard */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={copy}
                className="w-9 h-9 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy (Ctrl+C)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={cut}
                className="w-9 h-9 p-0"
              >
                <Scissors className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cut (Ctrl+X)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={paste}
                className="w-9 h-9 p-0"
              >
                <Clipboard className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Paste (Ctrl+V)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= zoomLevels[0]}
                className="w-9 h-9 p-0"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>

          <div className="min-w-[60px] text-center text-sm font-medium">
            {Math.round(zoom * 100)}%
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= zoomLevels[zoomLevels.length - 1]}
                className="w-9 h-9 p-0"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFitToScreen}
                className="w-9 h-9 p-0"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fit to Screen</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* View Options */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? 'default' : 'ghost'}
                size="sm"
                onClick={toggleGrid}
                className={cn('w-9 h-9 p-0', showGrid && 'bg-primary/10 text-primary')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Grid</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGuides ? 'default' : 'ghost'}
                size="sm"
                onClick={toggleGuides}
                className={cn('w-9 h-9 p-0', showGuides && 'bg-primary/10 text-primary')}
              >
                {showGuides ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Guides</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
