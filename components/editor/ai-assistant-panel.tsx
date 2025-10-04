'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Lightbulb, Wand2, Zap } from 'lucide-react';
import { fabric } from 'fabric';
import { toast } from 'sonner';

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  action: () => void;
}

export function AIAssistantPanel() {
  const { canvas } = useEditorStore();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseCommand = (command: string): void => {
    const lower = command.toLowerCase().trim();
    setIsProcessing(true);

    setTimeout(() => {
      // Simple command parsing (Phase 4 MVP)
      if (lower.includes('add text') || lower.includes('add heading')) {
        addTextElement('Add a heading', 48, 'bold');
        toast.success('Added text element');
      } else if (lower.includes('add rectangle') || lower.includes('add box')) {
        addShape('rectangle');
        toast.success('Added rectangle');
      } else if (lower.includes('add circle')) {
        addShape('circle');
        toast.success('Added circle');
      } else if (lower.includes('change color') || lower.includes('make it blue')) {
        changeColor('#3b82f6');
        toast.success('Changed color to blue');
      } else if (lower.includes('align center')) {
        alignObjects('center');
        toast.success('Aligned to center');
      } else if (lower.includes('suggest') || lower.includes('ideas')) {
        generateSuggestions();
      } else {
        toast.info('Try commands like: "add text", "add rectangle", "change color blue"');
      }

      setIsProcessing(false);
      setInput('');
    }, 500);
  };

  const addTextElement = (text: string, size: number, weight: string) => {
    if (!canvas) return;
    const textObj = new fabric.IText(text, {
      left: 150,
      top: 150,
      fontSize: size,
      fontWeight: weight,
      fill: '#1a1a1a',
      fontFamily: 'Inter',
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
  };

  const addShape = (type: 'rectangle' | 'circle') => {
    if (!canvas) return;
    let shape: fabric.Object;

    if (type === 'rectangle') {
      shape = new fabric.Rect({
        left: 150,
        top: 150,
        width: 200,
        height: 150,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
      });
    } else {
      shape = new fabric.Circle({
        left: 150,
        top: 150,
        radius: 75,
        fill: '#10b981',
        stroke: '#059669',
        strokeWidth: 2,
      });
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  const changeColor = (color: string) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set('fill', color);
      canvas.renderAll();
    }
  };

  const alignObjects = (alignment: 'center' | 'left' | 'right') => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const canvasCenter = canvas.getWidth() / 2;
      if (alignment === 'center') {
        activeObject.set({ left: canvasCenter - (activeObject.width || 0) / 2 });
      }
      canvas.renderAll();
    }
  };

  const generateSuggestions = () => {
    const newSuggestions: AISuggestion[] = [
      {
        id: '1',
        title: 'Add Title',
        description: 'Create a bold heading for your slide',
        action: () => addTextElement('Your Title Here', 48, 'bold'),
      },
      {
        id: '2',
        title: 'Add Shape',
        description: 'Insert a rectangle or circle',
        action: () => addShape('rectangle'),
      },
      {
        id: '3',
        title: 'Apply Blue Theme',
        description: 'Change selected object to blue',
        action: () => changeColor('#3b82f6'),
      },
      {
        id: '4',
        title: 'Center Element',
        description: 'Align selected object to center',
        action: () => alignObjects('center'),
      },
    ];

    setSuggestions(newSuggestions);
    toast.success('Generated 4 smart suggestions');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      parseCommand(input);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg text-gray-900">AI Assistant</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Tell me what you want to create
        </p>

        {/* Command Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="e.g., add text, add rectangle..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            className="flex-1 h-9"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isProcessing || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isProcessing ? <Zap className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b bg-gradient-to-r from-violet-50/50 to-purple-50/50">
        <h4 className="text-sm font-semibold mb-3">Quick Commands</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => parseCommand('add text')}
            className="text-xs"
          >
            Add Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => parseCommand('add rectangle')}
            className="text-xs"
          >
            Add Shape
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => parseCommand('change color blue')}
            className="text-xs"
          >
            Blue Color
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => parseCommand('suggest ideas')}
            className="text-xs"
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            Suggest
          </Button>
        </div>
      </div>

      {/* Smart Suggestions */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <h4 className="text-sm font-semibold">Smart Suggestions</h4>
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wand2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ask for suggestions to get started</p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                className="w-full h-auto py-3 flex flex-col items-start"
                onClick={() => {
                  suggestion.action();
                  toast.success(`Applied: ${suggestion.title}`);
                }}
              >
                <span className="font-medium">{suggestion.title}</span>
                <span className="text-xs text-muted-foreground">{suggestion.description}</span>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t bg-gradient-to-r from-gray-50 to-gray-100">
        <p className="text-xs text-gray-600 text-center font-medium">
          🤖 AI-powered design assistant (Phase 4 MVP)
        </p>
      </div>
    </div>
  );
}
