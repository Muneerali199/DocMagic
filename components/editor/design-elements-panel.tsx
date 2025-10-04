'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Type, Square, Image, Palette, Shapes, Star,
  BarChart3, Layout, Search, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fabric } from 'fabric';
import { textPresets as templateTextPresets, colorPalettes as templateColorPalettes } from '@/lib/template-data';

// Build a combined text presets list from shared template data
const textPresets = [
  ...(templateTextPresets.headings || []),
  ...(templateTextPresets.body || []),
  ...(templateTextPresets.emphasis || []),
].map((p: any, idx: number) => ({
  id: p.name?.toLowerCase().replace(/\s+/g, '-') || `preset-${idx}`,
  name: p.name || `Preset ${idx + 1}`,
  fontSize: p.size || p.fontSize || 18,
  fontWeight: p.weight || 'normal',
  color: p.color || '#111827',
}));

// Flatten color palettes
const colorPalettes = Object.values(templateColorPalettes).flat();

// Shape Library
const shapeLibrary = [
  { id: 'rectangle', name: 'Rectangle', icon: 'rect' },
  { id: 'circle', name: 'Circle', icon: 'circle' },
  { id: 'triangle', name: 'Triangle', icon: 'triangle' },
  { id: 'star', name: 'Star', icon: 'star' },
  { id: 'heart', name: 'Heart', icon: 'heart' },
  { id: 'hexagon', name: 'Hexagon', icon: 'hexagon' },
  { id: 'pentagon', name: 'Pentagon', icon: 'pentagon' },
  { id: 'arrow', name: 'Arrow', icon: 'arrow' },
];

// Chart Templates
const chartTemplates = [
  { id: 'bar', name: 'Bar Chart', type: 'bar' },
  { id: 'line', name: 'Line Chart', type: 'line' },
  { id: 'pie', name: 'Pie Chart', type: 'pie' },
  { id: 'donut', name: 'Donut Chart', type: 'donut' },
];

export function DesignElementsPanel() {
  const { canvas } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('text');

  const addTextToCanvas = (preset: any) => {
    if (!canvas) return;

    const text = new fabric.IText('Double click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      fontStyle: preset.fontStyle || 'normal',
      fill: preset.color,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addShapeToCanvas = (shapeId: string) => {
    if (!canvas) return;

    let shape: fabric.Object;

    switch (shapeId) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 200,
          height: 150,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 75,
          fill: '#10b981',
          stroke: '#059669',
          strokeWidth: 2,
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          left: 100,
          top: 100,
          width: 150,
          height: 130,
          fill: '#f59e0b',
          stroke: '#d97706',
          strokeWidth: 2,
        });
        break;
      case 'star':
        const points = [];
        const outerRadius = 80;
        const innerRadius = 40;
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / 5) * i;
          points.push({
            x: radius * Math.sin(angle),
            y: -radius * Math.cos(angle),
          });
        }
        shape = new fabric.Polygon(points, {
          left: 100,
          top: 100,
          fill: '#eab308',
          stroke: '#ca8a04',
          strokeWidth: 2,
        });
        break;
      default:
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 150,
          height: 150,
          fill: '#3b82f6',
        });
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  const applyColorPalette = (colors: string[]) => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach((obj, index) => {
      obj.set('fill', colors[index % colors.length]);
    });
    canvas.renderAll();
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="font-bold text-lg mb-3 text-gray-900">Design Elements</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start px-4 py-2 border-b rounded-none bg-gradient-to-r from-blue-50 to-indigo-50">
          <TabsTrigger value="text" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
            <Type className="w-4 h-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="shapes" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
            <Square className="w-4 h-4" />
            Shapes
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
            <Palette className="w-4 h-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
            <BarChart3 className="w-4 h-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="layouts" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
            <Layout className="w-4 h-4" />
            Layouts
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Text Presets */}
          <TabsContent value="text" className="p-4 space-y-3 mt-0">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Text Styles</h4>
              {textPresets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => addTextToCanvas(preset)}
                >
                  <div className="flex flex-col items-start">
                    <span
                      className="font-semibold"
                      style={{
                        fontSize: `${Math.min(preset.fontSize / 2, 20)}px`,
                        fontWeight: preset.fontWeight,
                        color: preset.color,
                      }}
                    >
                      {preset.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {preset.fontSize}px · {preset.fontWeight}
                    </span>
                  </div>
                </Button>
              ))}
            </div>

            <div className="space-y-2 pt-4">
              <h4 className="text-sm font-semibold text-gray-900">Quick Add</h4>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => addTextToCanvas(textPresets[2])}
              >
                <Type className="w-4 h-4 mr-2" />
                Add Text Box
              </Button>
            </div>
          </TabsContent>

          {/* Shapes */}
          <TabsContent value="shapes" className="p-4 mt-0">
            <div className="grid grid-cols-3 gap-3">
              {shapeLibrary.map((shape) => (
                <Button
                  key={shape.id}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => addShapeToCanvas(shape.id)}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    {shape.id === 'circle' && (
                      <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary" />
                    )}
                    {shape.id === 'rectangle' && (
                      <div className="w-10 h-8 bg-primary/20 border-2 border-primary" />
                    )}
                    {shape.id === 'triangle' && (
                      <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] border-b-primary/40" />
                    )}
                    {shape.id === 'star' && <Star className="w-10 h-10 text-primary" />}
                    {!['circle', 'rectangle', 'triangle', 'star'].includes(shape.id) && (
                      <Shapes className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <span className="text-xs">{shape.name}</span>
                </Button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Smart Shapes</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generated Shape
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Color Palettes */}
          <TabsContent value="colors" className="p-4 space-y-4 mt-0">
            {colorPalettes.map((palette) => (
              <div key={palette.id} className="space-y-2">
                <h4 className="text-sm font-medium">{palette.name}</h4>
                <div className="flex gap-2">
                  {palette.colors.map((color, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="flex-1 h-16 p-0 overflow-hidden"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        if (!canvas) return;
                        const activeObject = canvas.getActiveObject();
                        if (activeObject) {
                          activeObject.set('fill', color);
                          canvas.renderAll();
                        }
                      }}
                    >
                      <span className="sr-only">{color}</span>
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => applyColorPalette(palette.colors)}
                >
                  Apply Palette
                </Button>
              </div>
            ))}

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Custom Colors</h4>
              <div className="grid grid-cols-5 gap-2">
                {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', 
                  '#8b5cf6', '#ec4899', '#64748b', '#000000', '#ffffff'].map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    className="h-10 p-0"
                    style={{ backgroundColor: color, borderColor: color === '#ffffff' ? '#e5e7eb' : color }}
                    onClick={() => {
                      if (!canvas) return;
                      const activeObject = canvas.getActiveObject();
                      if (activeObject) {
                        activeObject.set('fill', color);
                        canvas.renderAll();
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Charts */}
          <TabsContent value="charts" className="p-4 space-y-3 mt-0">
            <h4 className="text-sm font-medium">Chart Templates</h4>
            {chartTemplates.map((chart) => (
              <Button
                key={chart.id}
                variant="outline"
                className="w-full justify-start h-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <span>{chart.name}</span>
                </div>
              </Button>
            ))}
          </TabsContent>

          {/* Layouts */}
          <TabsContent value="layouts" className="p-4 space-y-3 mt-0">
            <h4 className="text-sm font-medium">Slide Layouts</h4>
            <div className="grid grid-cols-2 gap-3">
              {['Title Slide', 'Two Column', 'Image + Text', 'Full Image', 'Comparison', 'Timeline'].map((layout) => (
                <Button
                  key={layout}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                >
                  <Layout className="w-6 h-6 text-primary" />
                  <span className="text-xs text-center">{layout}</span>
                </Button>
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer */}
      <div className="p-3 border-t bg-gradient-to-r from-gray-50 to-gray-100">
        <p className="text-xs text-gray-600 text-center font-medium">
          💡 Drag or click to add elements
        </p>
      </div>
    </div>
  );
}
