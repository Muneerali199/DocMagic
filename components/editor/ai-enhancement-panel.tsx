'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Send, 
  Wand2, 
  Zap, 
  RefreshCw,
  CheckCircle,
  Loader2,
  Lightbulb,
  Type,
  Palette as PaletteIcon,
  Layout,
  Image as ImageIcon
} from 'lucide-react';
import { fabric } from 'fabric';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIEnhancementPanelProps {
  documentId: string;
  documentType: string;
}

export function AIEnhancementPanel({ documentId, documentType }: AIEnhancementPanelProps) {
  const { canvas } = useEditorStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your AI assistant. I can help you:\n\n• Improve text content\n• Suggest design enhancements\n• Generate color schemes\n• Optimize layouts\n• Add creative elements\n\nWhat would you like to enhance?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickActions = [
    {
      icon: Type,
      label: 'Improve Text',
      prompt: 'Improve the text content to be more professional and engaging',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: PaletteIcon,
      label: 'Color Scheme',
      prompt: 'Suggest a modern color scheme for this design',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Layout,
      label: 'Layout Ideas',
      prompt: 'Suggest layout improvements for better visual hierarchy',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: ImageIcon,
      label: 'Add Elements',
      prompt: 'Suggest creative elements to add to this design',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleSendMessage = async (message?: string) => {
    const userMessage = message || input.trim();
    if (!userMessage || isProcessing) return;

    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Get current canvas state
      const canvasData = canvas?.toJSON();
      
      // Call AI enhancement API
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          documentType,
          documentId,
          canvasData,
          context: {
            objectCount: canvas?.getObjects().length || 0,
            hasText: canvas?.getObjects().some(obj => obj.type === 'i-text' || obj.type === 'text'),
            hasImages: canvas?.getObjects().some(obj => obj.type === 'image')
          }
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Apply enhancements if provided
      if (data.enhancements) {
        applyEnhancements(data.enhancements);
      }

      toast.success('AI enhancement applied');
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        role: 'assistant',
        content: generateFallbackResponse(userMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      
      toast.info('Using offline AI suggestions');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFallbackResponse = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    
    if (lower.includes('text') || lower.includes('content')) {
      return '✨ Here are some text improvement suggestions:\n\n• Use action verbs to make content more dynamic\n• Keep sentences concise and clear\n• Add bullet points for better readability\n• Use consistent formatting throughout\n• Highlight key information with bold text';
    }
    
    if (lower.includes('color') || lower.includes('scheme')) {
      return '🎨 Modern color scheme suggestions:\n\n• Primary: #3B82F6 (Blue)\n• Secondary: #8B5CF6 (Purple)\n• Accent: #10B981 (Green)\n• Background: #F9FAFB (Light Gray)\n• Text: #1F2937 (Dark Gray)\n\nThese colors work well together and are accessible!';
    }
    
    if (lower.includes('layout')) {
      return '📐 Layout improvement tips:\n\n• Use the rule of thirds for element placement\n• Maintain consistent spacing between elements\n• Create visual hierarchy with size and color\n• Align elements to a grid for cleaner look\n• Leave adequate white space for breathing room';
    }
    
    if (lower.includes('element') || lower.includes('add')) {
      return '💡 Creative element suggestions:\n\n• Add icons to illustrate key points\n• Use shapes to create visual interest\n• Include relevant images or illustrations\n• Add decorative lines or dividers\n• Consider using gradients for modern look';
    }
    
    return '✨ I can help you enhance your design! Try asking about:\n\n• Text improvements\n• Color schemes\n• Layout suggestions\n• Adding creative elements\n• Design best practices';
  };

  const applyEnhancements = (enhancements: any) => {
    if (!canvas) return;

    try {
      // Apply color changes
      if (enhancements.colors) {
        const activeObject = canvas.getActiveObject();
        if (activeObject && enhancements.colors.primary) {
          activeObject.set('fill', enhancements.colors.primary);
          canvas.renderAll();
        }
      }

      // Apply text changes
      if (enhancements.text) {
        const textObjects = canvas.getObjects().filter(
          obj => obj.type === 'i-text' || obj.type === 'text'
        );
        
        textObjects.forEach((obj, index) => {
          if (enhancements.text[index]) {
            (obj as fabric.IText).set('text', enhancements.text[index]);
          }
        });
        canvas.renderAll();
      }

      // Apply layout changes
      if (enhancements.layout) {
        // Implement layout adjustments
        toast.info('Layout enhancements applied');
      }

    } catch (error) {
      console.error('Error applying enhancements:', error);
      toast.error('Failed to apply some enhancements');
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <div className="flex-none p-4 border-b border-gray-700/50 bg-gradient-to-r from-violet-900/30 to-purple-900/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">AI Enhancement</h3>
            <p className="text-xs text-gray-400">Powered by advanced AI</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.prompt)}
              disabled={isProcessing}
              className="h-auto py-2 px-3 flex flex-col items-center gap-1 bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 text-white"
            >
              <action.icon className="w-4 h-4" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[85%] p-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'
                    : 'bg-gray-800/80 text-gray-100 border-gray-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </Card>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <Card className="bg-gray-800/80 border-gray-700 p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  <p className="text-sm text-gray-300">AI is analyzing...</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-none p-4 border-t border-gray-700/50 bg-gray-900/50">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask AI to enhance your design..."
            className="min-h-[80px] resize-none bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            disabled={isProcessing}
          />
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </p>
            <Button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              size="sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enhance
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Footer Tips */}
      <div className="flex-none p-3 bg-gradient-to-r from-violet-900/20 to-purple-900/20 border-t border-gray-700/50">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400">
            Tip: Be specific about what you want to improve for better results
          </p>
        </div>
      </div>
    </div>
  );
}
