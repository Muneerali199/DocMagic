'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  // Selection & Navigation
  MousePointer2, Hand, ZoomIn, ZoomOut, Maximize2, Move,
  // Text Tools
  Type, Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, Quote,
  // Shape Tools
  Square, Circle, Triangle, Pentagon, Hexagon, Star,
  Minus, ArrowRight, ArrowUp, ArrowDown, ArrowLeft,
  // Image & Media
  Image, Video, Music, Film, FileImage,
  // Drawing Tools
  Pencil, Paintbrush, Eraser, Pen, Highlighter,
  // Design Tools
  Palette, Pipette, Droplets, Sparkles, Wand2,
  Grid3x3, Grid2x2, Ruler, Crosshair,
  // Edit Tools
  Copy, Scissors, Clipboard, Undo2, Redo2,
  RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  // Layer Tools
  Layers, Eye, EyeOff, Lock, Unlock,
  // Advanced
  Filter, Contrast, Sun, Moon, Zap,
  Download, Upload, Save, FolderOpen,
  Settings, Share2, Link, Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function EnhancedEditorToolbar() {
  const {
    canvas,
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

  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fillColor, setFillColor] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#000000');

  // Main Tool Categories
  const toolCategories = {
    selection: [
      { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
      { id: 'move', icon: Move, label: 'Move', shortcut: 'M' },
      { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'H' },
    ],
    text: [
      { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
    ],
    shapes: [
      { id: 'rectangle', icon: Square, label: 'Rectangle' },
      { id: 'circle', icon: Circle, label: 'Circle' },
      { id: 'triangle', icon: Triangle, label: 'Triangle' },
      { id: 'star', icon: Star, label: 'Star' },
      { id: 'pentagon', icon: Pentagon, label: 'Pentagon' },
      { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
    ],
    lines: [
      { id: 'line', icon: Minus, label: 'Line' },
      { id: 'arrow-right', icon: ArrowRight, label: 'Arrow Right' },
      { id: 'arrow-up', icon: ArrowUp, label: 'Arrow Up' },
      { id: 'arrow-down', icon: ArrowDown, label: 'Arrow Down' },
      { id: 'arrow-left', icon: ArrowLeft, label: 'Arrow Left' },
    ],
    drawing: [
      { id: 'draw', icon: Pencil, label: 'Pencil', shortcut: 'D' },
      { id: 'brush', icon: Paintbrush, label: 'Brush', shortcut: 'B' },
      { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
      { id: 'pen', icon: Pen, label: 'Pen', shortcut: 'P' },
    ],
    media: [
      { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
      { id: 'video', icon: Video, label: 'Video' },
      { id: 'music', icon: Music, label: 'Audio' },
    ],
  };

  const textFormattingTools = [
    { id: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B' },
    { id: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I' },
    { id: 'underline', icon: Underline, label: 'Underline', shortcut: 'Ctrl+U' },
    { id: 'strikethrough', icon: Strikethrough, label: 'Strikethrough' },
  ];

  const alignmentTools = [
    { id: 'align-left', icon: AlignLeft, label: 'Align Left' },
    { id: 'align-center', icon: AlignCenter, label: 'Align Center' },
    { id: 'align-right', icon: AlignRight, label: 'Align Right' },
    { id: 'align-justify', icon: AlignJustify, label: 'Justify' },
  ];

  const listTools = [
    { id: 'bullet-list', icon: List, label: 'Bullet List' },
    { id: 'numbered-list', icon: ListOrdered, label: 'Numbered List' },
    { id: 'indent', icon: Indent, label: 'Increase Indent' },
    { id: 'outdent', icon: Outdent, label: 'Decrease Indent' },
  ];

  const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 8, 10];

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId as any);
  };

  const handleTextFormat = (format: string) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    switch (format) {
      case 'bold':
        (activeObject as any).set('fontWeight', (activeObject as any).fontWeight === 'bold' ? 'normal' : 'bold');
        break;
      case 'italic':
        (activeObject as any).set('fontStyle', (activeObject as any).fontStyle === 'italic' ? 'normal' : 'italic');
        break;
      case 'underline':
        (activeObject as any).set('underline', !(activeObject as any).underline);
        break;
      case 'strikethrough':
        (activeObject as any).set('linethrough', !(activeObject as any).linethrough);
        break;
    }
    canvas.renderAll();
  };

  const handleAlignment = (alignment: string) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    (activeObject as any).set('textAlign', alignment.replace('align-', ''));
    canvas.renderAll();
  };

  const handleZoomChange = (value: string) => {
    setZoom(parseFloat(value));
  };

  const handleFontSizeChange = (value: string) => {
    const size = parseInt(value);
    setFontSize(size);
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject as any).fontSize) {
      (activeObject as any).set('fontSize', size);
      canvas.renderAll();
    }
  };

  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject as any).fontFamily) {
      (activeObject as any).set('fontFamily', value);
      canvas.renderAll();
    }
  };

  const handleFillColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setFillColor(color);
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set('fill', color);
      canvas.renderAll();
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col bg-white border-b border-gray-200 shadow-md">
        {/* Top Row: File Menu, Quick Actions, View Controls */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          {/* File Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 font-semibold text-gray-900 hover:bg-white hover:text-blue-600">
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem>
                <FolderOpen className="w-4 h-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Save className="w-4 h-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 font-semibold text-gray-900 hover:bg-white hover:text-blue-600">
                Edit
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={undo} disabled={historyIndex <= 0}>
                <Undo2 className="w-4 h-4 mr-2" />
                Undo (Ctrl+Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo2 className="w-4 h-4 mr-2" />
                Redo (Ctrl+Shift+Z)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy (Ctrl+C)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={paste}>
                <Clipboard className="w-4 h-4 mr-2" />
                Paste (Ctrl+V)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={cut}>
                <Scissors className="w-4 h-4 mr-2" />
                Cut (Ctrl+X)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 font-semibold text-gray-900 hover:bg-white hover:text-blue-600">
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={toggleGrid}>
                <Grid3x3 className="w-4 h-4 mr-2" />
                {showGrid ? 'Hide' : 'Show'} Grid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleGuides}>
                <Ruler className="w-4 h-4 mr-2" />
                {showGuides ? 'Hide' : 'Show'} Guides
              </DropdownMenuItem>
              <DropdownMenuSeparator />
                          <DropdownMenuLabel className="font-semibold text-gray-900">File</DropdownMenuLabel>
              {zoomLevels.map((level) => (
                <DropdownMenuItem key={level} onClick={() => setZoom(level)}>
                  {Math.round(level * 100)}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Quick History Actions */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="h-8 w-8 p-0"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              className="h-8 w-8 p-0 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <Select value={zoom.toString()} onValueChange={handleZoomChange}>
              <SelectTrigger className="h-8 w-24 font-semibold text-gray-900 bg-white border-gray-300">
                <SelectValue>{Math.round(zoom * 100)}%</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {zoomLevels.map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    {Math.round(level * 100)}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(10, zoom + 0.1))}
              className="h-8 w-8 p-0 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(1)}
              className="h-8 w-8 p-0 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Second Row: Main Tools */}
                {/* Row 2 - Main Tool Palette */}
        <div className="flex items-center gap-1 px-4 py-3 border-b overflow-x-auto bg-white">
          {/* Selection Tools */}
          <div className="flex items-center gap-1">
            {toolCategories.selection.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === tool.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleToolClick(tool.id)}
                    className={cn(
                      'h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600',
                      activeTool === tool.id && 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    <tool.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tool.label} {tool.shortcut && `(${tool.shortcut})`}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Text Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleToolClick('text')}
                className={cn(
                  'h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600',
                  activeTool === 'text' && 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                <Type className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Text Tool (T)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-8" />

          {/* Shape Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={activeTool === 'shape' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600',
                  activeTool === 'shape' && 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                <Square className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Shapes</DropdownMenuLabel>
              {toolCategories.shapes.map((shape) => (
                <DropdownMenuItem
                  key={shape.id}
                  onClick={() => {
                    setActiveTool('shape');
                    setActiveShape(shape.id as any);
                  }}
                >
                  <shape.icon className="w-4 h-4 mr-2" />
                  {shape.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Lines & Arrows</DropdownMenuLabel>
              {toolCategories.lines.map((line) => (
                <DropdownMenuItem
                  key={line.id}
                  onClick={() => {
                    setActiveTool('shape');
                    setActiveShape(line.id as any);
                  }}
                >
                  <line.icon className="w-4 h-4 mr-2" />
                  {line.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-8" />

          {/* Drawing Tools */}
          <div className="flex items-center gap-1">
            {toolCategories.drawing.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === tool.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleToolClick(tool.id)}
                    className={cn(
                      'h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600',
                      activeTool === tool.id && 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    <tool.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tool.label} {tool.shortcut && `(${tool.shortcut})`}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Media Tools */}
          <div className="flex items-center gap-1">
            {toolCategories.media.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === tool.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleToolClick(tool.id)}
                    className={cn(
                      'h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600',
                      activeTool === tool.id && 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    <tool.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tool.label} {tool.shortcut && `(${tool.shortcut})`}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Design Tools */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <Palette className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Color Palette</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <Pipette className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eyedropper</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <Wand2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Magic Wand</TooltipContent>
          </Tooltip>
        </div>

        {/* Third Row: Text Formatting (shows when text is selected) */}
        <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto bg-gradient-to-r from-gray-50 to-white">
          {/* Font Family */}
          <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
            <SelectTrigger className="h-8 w-40 font-medium text-gray-900 bg-white border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
              <SelectItem value="Impact">Impact</SelectItem>
            </SelectContent>
          </Select>

          {/* Font Size */}
          <Select value={fontSize.toString()} onValueChange={handleFontSizeChange}>
            <SelectTrigger className="h-8 w-20 font-semibold text-gray-900 bg-white border-gray-300">
              <SelectValue>{fontSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96, 128].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-8" />

          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            {textFormattingTools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextFormat(tool.id)}
                    className="h-8 w-8 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <tool.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tool.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Text Alignment */}
          <div className="flex items-center gap-1">
            {alignmentTools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAlignment(tool.id)}
                    className="h-8 w-8 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <tool.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tool.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            {listTools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <tool.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tool.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Fill Color */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Fill:</span>
            <Input
              type="color"
              value={fillColor}
              onChange={handleFillColorChange}
              className="h-8 w-12 p-1 border-gray-300 cursor-pointer"
            />
            <Input
              type="text"
              value={fillColor}
              onChange={(e) => handleFillColorChange(e as any)}
              className="h-8 w-24 text-xs font-mono text-gray-900 border-gray-300"
              placeholder="#000000"
            />
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Stroke Color */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Stroke:</span>
            <Input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="h-8 w-12 p-1 border-gray-300 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
