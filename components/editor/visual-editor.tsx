'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/lib/editor-store';
import { cn } from '@/lib/utils';

interface VisualEditorProps {
  width?: number;
  height?: number;
  className?: string;
}

export function VisualEditor({ width = 1920, height = 1080, className }: VisualEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  
  const {
    canvas,
    setCanvas,
    activeShape,
    zoom,
    showGrid,
    activeTool,
    saveState,
  } = useEditorStore();

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || canvas) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      renderOnAddRemove: true,
    });

    // Set initial zoom to fit container
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const scaleX = (containerWidth - 40) / width;
      const scaleY = (containerHeight - 40) / height;
      const initialZoom = Math.min(scaleX, scaleY, 1);
      
      fabricCanvas.setZoom(initialZoom);
      fabricCanvas.setWidth(width * initialZoom);
      fabricCanvas.setHeight(height * initialZoom);
    }

    setCanvas(fabricCanvas);
    setIsReady(true);

    // Event listeners
    fabricCanvas.on('object:modified', () => {
      saveState();
    });

    fabricCanvas.on('object:added', () => {
      saveState();
    });

    fabricCanvas.on('object:removed', () => {
      saveState();
    });

    // Cleanup
    return () => {
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, []);

  // Handle zoom changes
  useEffect(() => {
    if (!canvas || !containerRef.current) return;

    const newWidth = width * zoom;
    const newHeight = height * zoom;
    
    canvas.setZoom(zoom);
    canvas.setWidth(newWidth);
    canvas.setHeight(newHeight);
    canvas.renderAll();
  }, [zoom, canvas, width, height]);

  // Draw grid
  useEffect(() => {
    if (!canvas || !showGrid) return;

    const drawGrid = () => {
      const gridSize = 20;
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      // Remove existing grid
      const objects = canvas.getObjects();
      objects.forEach((obj) => {
        if ((obj as any).isGrid) {
          canvas.remove(obj);
        }
      });

      // Draw vertical lines
      for (let i = 0; i < canvasWidth / zoom; i += gridSize) {
        const line = new fabric.Line([i, 0, i, canvasHeight / zoom], {
          stroke: '#e5e7eb',
          strokeWidth: 1 / zoom,
          selectable: false,
          evented: false,
        });
        (line as any).isGrid = true;
        canvas.add(line);
        canvas.sendToBack(line);
      }

      // Draw horizontal lines
      for (let i = 0; i < canvasHeight / zoom; i += gridSize) {
        const line = new fabric.Line([0, i, canvasWidth / zoom, i], {
          stroke: '#e5e7eb',
          strokeWidth: 1 / zoom,
          selectable: false,
          evented: false,
        });
        (line as any).isGrid = true;
        canvas.add(line);
        canvas.sendToBack(line);
      }

      canvas.renderAll();
    };

    drawGrid();
  }, [canvas, showGrid, zoom]);

  // Handle tool changes
  useEffect(() => {
    if (!canvas) return;

    switch (activeTool) {
      case 'select':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        break;
      case 'pan':
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'grab';
        break;
      case 'draw':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        break;
      default:
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
    }

    canvas.renderAll();
  }, [activeTool, canvas]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          canvas.remove(activeObject);
          canvas.renderAll();
        }
      }

      // Ctrl/Cmd + Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().undo();
      }

      // Ctrl/Cmd + Shift + Z (Redo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().redo();
      }

      // Ctrl/Cmd + C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        useEditorStore.getState().copy();
      }

      // Ctrl/Cmd + V (Paste)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        useEditorStore.getState().paste();
      }

      // Ctrl/Cmd + X (Cut)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        useEditorStore.getState().cut();
      }

      // Ctrl/Cmd + A (Select All)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        canvas.discardActiveObject();
        const sel = new fabric.ActiveSelection(canvas.getObjects(), {
          canvas: canvas,
        });
        canvas.setActiveObject(sel);
        canvas.requestRenderAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas]);

  // Text tool - Add text on canvas click
  useEffect(() => {
    if (!canvas || activeTool !== 'text') return;

    const handleCanvasClick = (opt: any) => {
      const pointer = canvas.getPointer(opt.e);
      
      const text = new fabric.IText('Double click to edit', {
        left: pointer.x,
        top: pointer.y,
        fontFamily: 'Inter',
        fontSize: 24,
        fill: '#000000',
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
      canvas.renderAll();
    };

    canvas.on('mouse:down', handleCanvasClick);
    return () => {
      canvas.off('mouse:down', handleCanvasClick);
    };
  }, [canvas, activeTool]);

  // Shape tool - Draw shapes with mouse drag
  useEffect(() => {
    if (!canvas || activeTool !== 'shape') return;

    let isDrawing = false;
    let shape: fabric.Object | null = null;
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (opt: any) => {
      isDrawing = true;
      const pointer = canvas.getPointer(opt.e);
      startX = pointer.x;
      startY = pointer.y;

      // Create shape based on activeShape
      if (activeShape === 'rectangle') {
        shape = new fabric.Rect({
          left: startX,
          top: startY,
          width: 0,
          height: 0,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
        });
      } else if (activeShape === 'circle') {
        shape = new fabric.Circle({
          left: startX,
          top: startY,
          radius: 0,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
        });
      } else if (activeShape === 'triangle') {
        shape = new fabric.Triangle({
          left: startX,
          top: startY,
          width: 0,
          height: 0,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
        });
      } else if (activeShape === 'line') {
        shape = new fabric.Line([startX, startY, startX, startY], {
          stroke: '#1e40af',
          strokeWidth: 3,
        });
      }

      if (shape) {
        canvas.add(shape);
      }
    };

    const handleMouseMove = (opt: any) => {
      if (!isDrawing || !shape) return;

      const pointer = canvas.getPointer(opt.e);
      const width = pointer.x - startX;
      const height = pointer.y - startY;

      if (activeShape === 'rectangle') {
        (shape as fabric.Rect).set({
          width: Math.abs(width),
          height: Math.abs(height),
          left: width > 0 ? startX : pointer.x,
          top: height > 0 ? startY : pointer.y,
        });
      } else if (activeShape === 'circle') {
        const radius = Math.sqrt(width * width + height * height) / 2;
        (shape as fabric.Circle).set({ radius });
      } else if (activeShape === 'triangle') {
        (shape as fabric.Triangle).set({
          width: Math.abs(width),
          height: Math.abs(height),
          left: width > 0 ? startX : pointer.x,
          top: height > 0 ? startY : pointer.y,
        });
      } else if (activeShape === 'line') {
        (shape as fabric.Line).set({
          x2: pointer.x,
          y2: pointer.y,
        });
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (isDrawing && shape) {
        canvas.setActiveObject(shape);
      }
      isDrawing = false;
      shape = null;
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas, activeTool, activeShape]);

  // Mouse wheel zoom
  useEffect(() => {
    if (!canvas) return;

    const handleWheel = (opt: any) => {
      const e = opt.e;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY;
        let newZoom = canvas.getZoom();
        newZoom *= 0.999 ** delta;

        // Limit zoom
        if (newZoom > 4) newZoom = 4;
        if (newZoom < 0.1) newZoom = 0.1;

        // Zoom to mouse pointer
        canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, newZoom);
        useEditorStore.getState().setZoom(newZoom);

        return false;
      }
    };

    canvas.on('mouse:wheel', handleWheel);
    return () => {
      canvas.off('mouse:wheel', handleWheel);
    };
  }, [canvas]);

  // Panning with middle mouse button or space
  useEffect(() => {
    if (!canvas) return;

    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (opt: any) => {
      const e = opt.e;
      if (e.button === 1 || (activeTool === 'pan' && e.button === 0) || e.spaceKey) {
        isPanning = true;
        canvas.selection = false;
        lastPosX = e.clientX;
        lastPosY = e.clientY;
        canvas.defaultCursor = 'grabbing';
      }
    };

    const handleMouseMove = (opt: any) => {
      if (!isPanning) return;
      
      const e = opt.e;
      const vpt = canvas.viewportTransform!;
      vpt[4] += e.clientX - lastPosX;
      vpt[5] += e.clientY - lastPosY;
      canvas.requestRenderAll();
      lastPosX = e.clientX;
      lastPosY = e.clientY;
    };

    const handleMouseUp = () => {
      if (isPanning) {
        isPanning = false;
        canvas.selection = true;
        canvas.defaultCursor = activeTool === 'pan' ? 'grab' : 'default';
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas, activeTool]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full flex items-center justify-center overflow-hidden bg-gray-100',
        className
      )}
    >
      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative shadow-2xl">
        <canvas ref={canvasRef} />
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-lg shadow-lg border border-border text-sm font-medium">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
