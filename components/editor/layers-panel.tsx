'use client';

import React, { useEffect, useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Type,
  Square,
  Image as ImageIcon,
  Circle,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fabric } from 'fabric';

export function LayersPanel() {
  const {
    canvas,
    elements,
    selectedElement,
    removeElement,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  } = useEditorStore();

  const [layers, setLayers] = useState<any[]>([]);

  useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      const objects = canvas.getObjects();
      const layersData = objects
        .filter((obj) => !(obj as any).isGrid) // Filter out grid lines
        .map((obj, index) => ({
          id: (obj as any).id || `obj-${index}`,
          object: obj,
          type: obj.type,
          name: (obj as any).name || getObjectName(obj),
          locked: obj.lockMovementX || false,
          visible: obj.visible !== false,
          selected: canvas.getActiveObject() === obj,
        }))
        .reverse(); // Reverse to show top layers first

      setLayers(layersData);
    };

    updateLayers();

    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);
    canvas.on('selection:created', updateLayers);
    canvas.on('selection:updated', updateLayers);
    canvas.on('selection:cleared', updateLayers);

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
      canvas.off('selection:created', updateLayers);
      canvas.off('selection:updated', updateLayers);
      canvas.off('selection:cleared', updateLayers);
    };
  }, [canvas]);

  const getObjectName = (obj: fabric.Object): string => {
    const type = obj.type || 'object';
    
    if (type === 'i-text' || type === 'text' || type === 'textbox') {
      const text = (obj as any).text || '';
      return text.length > 20 ? text.substring(0, 20) + '...' : text || 'Text';
    }
    
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'i-text':
      case 'text':
      case 'textbox':
        return Type;
      case 'rect':
        return Square;
      case 'circle':
        return Circle;
      case 'image':
        return ImageIcon;
      default:
        return Square;
    }
  };

  const selectLayer = (layer: any) => {
    if (!canvas) return;
    canvas.setActiveObject(layer.object);
    canvas.renderAll();
  };

  const toggleLock = (layer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    
    const newLocked = !layer.locked;
    layer.object.set({
      lockMovementX: newLocked,
      lockMovementY: newLocked,
      lockRotation: newLocked,
      lockScalingX: newLocked,
      lockScalingY: newLocked,
      selectable: !newLocked,
    });
    
    canvas.renderAll();
    useEditorStore.getState().saveState();
  };

  const toggleVisibility = (layer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    
    layer.object.set({ visible: !layer.visible });
    canvas.renderAll();
    useEditorStore.getState().saveState();
  };

  const deleteLayer = (layer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    
    canvas.remove(layer.object);
    canvas.renderAll();
    useEditorStore.getState().saveState();
  };

  const moveLayerUp = (layer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    
    layer.object.bringForward();
    canvas.renderAll();
    useEditorStore.getState().saveState();
  };

  const moveLayerDown = (layer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    
    layer.object.sendBackwards();
    canvas.renderAll();
    useEditorStore.getState().saveState();
  };

  const moveLayerToTop = (layer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    
    layer.object.bringToFront();
    canvas.renderAll();
    useEditorStore.getState().saveState();
  };

  const moveLayerToBottom = (layer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    
    layer.object.sendToBack();
    canvas.renderAll();
    useEditorStore.getState().saveState();
  };

  return (
    <div className="w-80 bg-gradient-to-b from-gray-900 to-gray-800 border-l border-gray-700/50 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-750 backdrop-blur-sm">
        <h3 className="font-bold text-lg text-white">Layers</h3>
        <p className="text-sm text-gray-300 mt-1 font-medium">
          {layers.length} {layers.length === 1 ? 'element' : 'elements'}
        </p>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <Square className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-200">No Layers</p>
              <p className="text-sm mt-2 text-gray-400">Add elements to see them here</p>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {layers.map((layer, index) => {
              const Icon = getObjectIcon(layer.type);
              
              return (
                <div
                  key={layer.id}
                  onClick={() => selectLayer(layer)}
                  className={cn(
                    'group relative flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200',
                    layer.selected
                      ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/20 border-2 border-blue-500 shadow-xl ring-2 ring-blue-500/20'
                      : 'bg-gray-800/60 hover:bg-gray-700/80 border-2 border-transparent hover:border-gray-600/50 hover:shadow-lg backdrop-blur-sm'
                  )}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200',
                        layer.selected 
                          ? 'bg-gradient-to-br from-blue-600/40 to-blue-500/20 shadow-lg' 
                          : 'bg-gray-700/80 group-hover:bg-gray-600/80'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5 transition-all duration-200',
                        layer.selected ? 'text-blue-300' : 'text-gray-300 group-hover:text-white'
                      )} />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white truncate">{layer.name}</p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Layer Order */}
                    <div className="hidden group-hover:flex flex-col">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => moveLayerToTop(layer, e)}
                        className="h-4 w-4 p-0"
                        title="Move to top"
                      >
                        <ChevronsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => moveLayerToBottom(layer, e)}
                        className="h-4 w-4 p-0"
                        title="Move to bottom"
                      >
                        <ChevronsDown className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="hidden group-hover:flex flex-col">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => moveLayerUp(layer, e)}
                        className="h-4 w-4 p-0"
                        title="Move up"
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => moveLayerDown(layer, e)}
                        className="h-4 w-4 p-0"
                        title="Move down"
                        disabled={index === layers.length - 1}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-1 hidden group-hover:block" />

                    {/* Lock */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleLock(layer, e)}
                      className={cn(
                        'w-6 h-6 p-0',
                        layer.locked && 'text-orange-600'
                      )}
                      title={layer.locked ? 'Unlock' : 'Lock'}
                    >
                      {layer.locked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Unlock className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      )}
                    </Button>

                    {/* Visibility */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleVisibility(layer, e)}
                      className={cn(
                        'w-6 h-6 p-0',
                        !layer.visible && 'text-red-600'
                      )}
                      title={layer.visible ? 'Hide' : 'Show'}
                    >
                      {layer.visible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => deleteLayer(layer, e)}
                      className="w-6 h-6 p-0 text-red-600 opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {layers.length > 0 && (
        <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-750 backdrop-blur-sm">
          <div className="text-sm text-gray-200">
            <p className="font-bold text-white flex items-center gap-2">
              <span className="text-lg">💡</span> Quick Tips
            </p>
            <ul className="mt-2.5 space-y-2 text-xs font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Click to select
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Hover for controls
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                Drag to reorder
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
