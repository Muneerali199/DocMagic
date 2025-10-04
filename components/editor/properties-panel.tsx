'use client';

import React, { useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/lib/editor-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PropertiesPanel() {
  const { canvas } = useEditorStore();
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [properties, setProperties] = useState<any>({});

  useEffect(() => {
    if (!canvas) return;

    const updateSelection = () => {
      const active = canvas.getActiveObject();
      setSelectedObject(active || null);
      
      if (active) {
        setProperties({
          left: Math.round(active.left || 0),
          top: Math.round(active.top || 0),
          width: Math.round((active.width || 0) * (active.scaleX || 1)),
          height: Math.round((active.height || 0) * (active.scaleY || 1)),
          angle: Math.round(active.angle || 0),
          opacity: active.opacity || 1,
          fill: active.fill || '#000000',
          stroke: active.stroke || '#000000',
          strokeWidth: active.strokeWidth || 0,
          fontFamily: (active as any).fontFamily || 'Inter',
          fontSize: (active as any).fontSize || 16,
          fontWeight: (active as any).fontWeight || 'normal',
          fontStyle: (active as any).fontStyle || 'normal',
          textAlign: (active as any).textAlign || 'left',
          underline: (active as any).underline || false,
          locked: active.lockMovementX || false,
          visible: active.visible !== false,
        });
      }
    };

    canvas.on('selection:created', updateSelection);
    canvas.on('selection:updated', updateSelection);
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setProperties({});
    });
    canvas.on('object:modified', updateSelection);

    return () => {
      canvas.off('selection:created', updateSelection);
      canvas.off('selection:updated', updateSelection);
      canvas.off('selection:cleared');
      canvas.off('object:modified', updateSelection);
    };
  }, [canvas]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject || !canvas) return;

    const updates: any = {};
    
    if (key === 'width' || key === 'height') {
      if (key === 'width') {
        updates.scaleX = value / (selectedObject.width || 1);
      } else {
        updates.scaleY = value / (selectedObject.height || 1);
      }
    } else if (key === 'locked') {
      updates.lockMovementX = value;
      updates.lockMovementY = value;
      updates.lockRotation = value;
      updates.lockScalingX = value;
      updates.lockScalingY = value;
      updates.selectable = !value;
    } else {
      updates[key] = value;
    }

    selectedObject.set(updates);
    canvas.renderAll();
    
    setProperties({ ...properties, [key]: value });
    useEditorStore.getState().saveState();
  };

  if (!selectedObject) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 shadow-sm p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-sm font-medium text-gray-700">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const isText = selectedObject.type === 'text' || selectedObject.type === 'i-text' || selectedObject.type === 'textbox';

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-sm overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 -m-4 mb-2 p-4">
          <h3 className="font-bold text-lg capitalize text-gray-900">
            {selectedObject.type} Properties
          </h3>
          <p className="text-xs text-gray-600 mt-1 font-medium">
            Customize the selected element
          </p>
        </div>

        <Separator />

        {/* Position & Size */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-900">Position & Size</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">X Position</Label>
              <Input
                type="number"
                value={properties.left}
                onChange={(e) => updateProperty('left', Number(e.target.value))}
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">Y Position</Label>
              <Input
                type="number"
                value={properties.top}
                onChange={(e) => updateProperty('top', Number(e.target.value))}
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">Width</Label>
              <Input
                type="number"
                value={properties.width}
                onChange={(e) => updateProperty('width', Number(e.target.value))}
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">Height</Label>
              <Input
                type="number"
                value={properties.height}
                onChange={(e) => updateProperty('height', Number(e.target.value))}
                className="h-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Rotation: {properties.angle}°</Label>
            <Slider
              value={[properties.angle]}
              onValueChange={([value]) => updateProperty('angle', value)}
              min={-180}
              max={180}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Appearance */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-900">Appearance</h4>
          
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Fill Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={properties.fill || '#000000'}
                onChange={(e) => updateProperty('fill', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                type="text"
                value={properties.fill || '#000000'}
                onChange={(e) => updateProperty('fill', e.target.value)}
                className="h-8 flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Opacity: {Math.round(properties.opacity * 100)}%</Label>
            <Slider
              value={[properties.opacity * 100]}
              onValueChange={([value]) => updateProperty('opacity', value / 100)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Stroke Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={properties.stroke || '#000000'}
                onChange={(e) => updateProperty('stroke', e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                type="text"
                value={properties.stroke || '#000000'}
                onChange={(e) => updateProperty('stroke', e.target.value)}
                className="h-8 flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Stroke Width</Label>
            <Input
              type="number"
              value={properties.strokeWidth}
              onChange={(e) => updateProperty('strokeWidth', Number(e.target.value))}
              className="h-8"
              min={0}
            />
          </div>
        </div>

        {/* Text Properties */}
        {isText && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900">Text</h4>
              
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Font Family</Label>
                <Select
                  value={properties.fontFamily}
                  onValueChange={(value) => updateProperty('fontFamily', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Font Size</Label>
                <Input
                  type="number"
                  value={properties.fontSize}
                  onChange={(e) => updateProperty('fontSize', Number(e.target.value))}
                  className="h-8"
                  min={8}
                  max={200}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Text Alignment</Label>
                <div className="flex gap-1">
                  {[
                    { value: 'left', icon: AlignLeft },
                    { value: 'center', icon: AlignCenter },
                    { value: 'right', icon: AlignRight },
                    { value: 'justify', icon: AlignJustify },
                  ].map(({ value, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={properties.textAlign === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateProperty('textAlign', value)}
                      className="flex-1 h-8 px-2"
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Text Style</Label>
                <div className="flex gap-1">
                  <Button
                    variant={properties.fontWeight === 'bold' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      updateProperty('fontWeight', properties.fontWeight === 'bold' ? 'normal' : 'bold')
                    }
                    className="flex-1 h-8 px-2"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={properties.fontStyle === 'italic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      updateProperty('fontStyle', properties.fontStyle === 'italic' ? 'normal' : 'italic')
                    }
                    className="flex-1 h-8 px-2"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={properties.underline ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateProperty('underline', !properties.underline)}
                    className="flex-1 h-8 px-2"
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Layer Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-900">Layer Controls</h4>
          
          <div className="flex gap-2">
            <Button
              variant={properties.locked ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateProperty('locked', !properties.locked)}
              className="flex-1"
            >
              {properties.locked ? (
                <Lock className="w-4 h-4 mr-2" />
              ) : (
                <Unlock className="w-4 h-4 mr-2" />
              )}
              {properties.locked ? 'Locked' : 'Unlocked'}
            </Button>
            
            <Button
              variant={properties.visible ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateProperty('visible', !properties.visible)}
              className="flex-1"
            >
              {properties.visible ? (
                <Eye className="w-4 h-4 mr-2" />
              ) : (
                <EyeOff className="w-4 h-4 mr-2" />
              )}
              {properties.visible ? 'Visible' : 'Hidden'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
