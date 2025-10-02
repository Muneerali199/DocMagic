"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  MessageCircle, 
  Send, 
  X, 
  Sparkles, 
  Loader2,
  Bot,
  User,
  Wand2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  slides: any[];
  onSlidesUpdate: (updatedSlides: any[]) => void;
  template: string;
  prompt: string;
}

export function AIPresentationAssistant({ 
  slides, 
  onSlidesUpdate, 
  template,
  prompt 
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI presentation assistant. I can help you:\n\n• Change slide content\n• Update titles and text\n• Modify layouts\n• Add or remove bullets\n• Adjust designs\n\nJust tell me what you'd like to change!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/generate/modify-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides,
          instruction: input,
          template,
          originalPrompt: prompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to modify presentation');
      }

      // Validate response data
      if (!data.modifiedSlides || !Array.isArray(data.modifiedSlides)) {
        throw new Error('Invalid response format from AI');
      }
      
      // Update slides with AI modifications
      onSlidesUpdate(data.modifiedSlides);

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.explanation || "✅ I've updated your presentation based on your request!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "✨ Presentation Updated!",
        description: "Your changes have been applied successfully.",
      });

    } catch (error) {
      console.error('Error modifying presentation:', error);
      
      const errorDetails = error instanceof Error ? error.message : 'Unknown error';
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Sorry, I couldn't process that request.\n\nError: ${errorDetails}\n\nPlease try:\n• Being more specific\n• Using simpler instructions\n• Trying again in a moment`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Error",
        description: errorDetails || "Failed to modify presentation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const quickActions = [
    "Make the first slide more engaging",
    "Add more details to slide 2",
    "Change the tone to be more professional",
    "Shorten all bullet points"
  ];

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bolt-gradient text-white shadow-2xl hover:scale-110 transition-transform rounded-full w-16 h-16 p-0"
          title="AI Assistant"
        >
          <div className="relative">
            <Wand2 className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] flex flex-col glass-effect rounded-2xl shadow-2xl border border-yellow-400/30">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bolt-gradient text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="h-5 w-5" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs opacity-90">Powered by Gemini</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bolt-gradient flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'glass-effect border border-border'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bolt-gradient flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
                <div className="glass-effect border border-border rounded-2xl px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me what to change..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isProcessing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="bolt-gradient text-white"
                size="icon"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </div>
      )}
    </>
  );
}
