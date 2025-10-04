import { create } from 'zustand';
import { fabric } from 'fabric';

// Element types that can be added to the canvas
export type ElementType = 'text' | 'shape' | 'image' | 'chart' | 'icon';

// Shape types
export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow';

// Element properties
export interface Element {
  id: string;
  type: ElementType;
  object: fabric.Object;
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

// Editor state
interface EditorState {
  // Canvas
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
  
  // Elements
  elements: Element[];
  selectedElement: Element | null;
  setSelectedElement: (element: Element | null) => void;
  addElement: (element: Element) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  
  // History (Undo/Redo)
  history: fabric.Object[][];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  saveState: () => void;
  
  // Zoom and Pan
  zoom: number;
  setZoom: (zoom: number) => void;
  panX: number;
  panY: number;
  setPan: (x: number, y: number) => void;
  
  // Active tool
  activeTool: 'select' | 'text' | 'shape' | 'image' | 'pan' | 'draw';
  setActiveTool: (tool: EditorState['activeTool']) => void;
  
  // Active shape (for shape tool)
  activeShape: ShapeType;
  setActiveShape: (shape: ShapeType) => void;
  
  // Grid and guides
  showGrid: boolean;
  toggleGrid: () => void;
  showGuides: boolean;
  toggleGuides: () => void;
  snapToGrid: boolean;
  toggleSnapToGrid: () => void;
  
  // Clipboard
  clipboard: fabric.Object | null;
  copy: () => void;
  paste: () => void;
  cut: () => void;
  
  // Layers
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Canvas
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
  
  // Elements
  elements: [],
  selectedElement: null,
  setSelectedElement: (element) => set({ selectedElement: element }),
  
  addElement: (element) => {
    set((state) => ({
      elements: [...state.elements, element],
    }));
    get().saveState();
  },
  
  removeElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (element && state.canvas) {
      state.canvas.remove(element.object);
    }
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElement: state.selectedElement?.id === id ? null : state.selectedElement,
    }));
    get().saveState();
  },
  
  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },
  
  // History
  history: [],
  historyIndex: -1,
  
  saveState: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas) return;
    
    const json = canvas.toJSON();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json.objects);
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  
  undo: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas || historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    
    canvas.clear();
    canvas.loadFromJSON({ objects: state }, () => {
      canvas.renderAll();
    });
    
    set({ historyIndex: newIndex });
  },
  
  redo: () => {
    const { canvas, history, historyIndex } = get();
    if (!canvas || historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    
    canvas.clear();
    canvas.loadFromJSON({ objects: state }, () => {
      canvas.renderAll();
    });
    
    set({ historyIndex: newIndex });
  },
  
  // Zoom and Pan
  zoom: 1,
  setZoom: (zoom) => {
    const { canvas } = get();
    if (canvas) {
      canvas.setZoom(zoom);
      canvas.renderAll();
    }
    set({ zoom });
  },
  
  panX: 0,
  panY: 0,
  setPan: (x, y) => {
    const { canvas } = get();
    if (canvas) {
      canvas.viewportTransform![4] = x;
      canvas.viewportTransform![5] = y;
      canvas.renderAll();
    }
    set({ panX: x, panY: y });
  },
  
  // Tools
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  activeShape: 'rectangle',
  setActiveShape: (shape) => set({ activeShape: shape }),
  
  // Grid and guides
  showGrid: true,
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  
  showGuides: true,
  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),
  
  snapToGrid: false,
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  
  // Clipboard
  clipboard: null,
  
  copy: () => {
    const { canvas } = get();
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        set({ clipboard: cloned });
      });
    }
  },
  
  paste: () => {
    const { canvas, clipboard } = get();
    if (!canvas || !clipboard) return;
    
    clipboard.clone((cloned: fabric.Object) => {
      canvas.discardActiveObject();
      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
        evented: true,
      });
      
      if (cloned.type === 'activeSelection') {
        // Handle multiple objects
        (cloned as any).canvas = canvas;
        (cloned as any).forEachObject((obj: fabric.Object) => {
          canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      get().saveState();
    });
  },
  
  cut: () => {
    const { canvas, copy } = get();
    if (!canvas) return;
    
    copy();
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.requestRenderAll();
      get().saveState();
    }
  },
  
  // Layers
  bringToFront: (id) => {
    const { canvas, elements } = get();
    const element = elements.find((el) => el.id === id);
    if (element && canvas) {
      canvas.bringToFront(element.object);
      canvas.renderAll();
      get().saveState();
    }
  },
  
  sendToBack: (id) => {
    const { canvas, elements } = get();
    const element = elements.find((el) => el.id === id);
    if (element && canvas) {
      canvas.sendToBack(element.object);
      canvas.renderAll();
      get().saveState();
    }
  },
  
  bringForward: (id) => {
    const { canvas, elements } = get();
    const element = elements.find((el) => el.id === id);
    if (element && canvas) {
      canvas.bringForward(element.object);
      canvas.renderAll();
      get().saveState();
    }
  },
  
  sendBackward: (id) => {
    const { canvas, elements } = get();
    const element = elements.find((el) => el.id === id);
    if (element && canvas) {
      canvas.sendBackwards(element.object);
      canvas.renderAll();
      get().saveState();
    }
  },
}));
