'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WebsiteCode {
  html: string;
  css: string;
  javascript: string;
  pages?: {
    [key: string]: {
      html: string;
      title: string;
      description: string;
    };
  };
  assets?: {
    colors: string[];
    fonts: string[];
    images?: string[];
  };
}

interface WebsiteChatProps {
  currentCode: WebsiteCode;
  onCodeUpdate: (newCode: WebsiteCode) => void;
  isOpen: boolean;
  onClose: () => void;
  style?: string;
}

export default function WebsiteChat({
  currentCode,
  onCodeUpdate,
  isOpen,
  onClose,
  style = 'modern'
}: WebsiteChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm here to help you improve your website. Tell me what you'd like to change - colors, layout, content, features, or anything else!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call API to improve website
      const response = await fetch('/api/generate/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isImprovement: true,
          currentCode,
          improvementRequest: userMessage.content,
          style
        })
      });

      if (!response.ok) {
        throw new Error('Failed to improve website');
      }

      const data = await response.json();

      if (data.success) {
        // Update the website code
        onCodeUpdate({
          html: data.html,
          css: data.css,
          javascript: data.javascript,
          pages: data.pages,
          assets: data.assets
        });

        // Add assistant response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "✅ Done! I've updated your website based on your request. Check out the preview!",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || 'Failed to improve website');
      }
    } catch (error) {
      console.error('Error improving website:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "❌ Sorry, I couldn't make that change. Please try rephrasing your request or try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl z-50 flex flex-col border-l border-purple-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-purple-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Website Assistant</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ask me to improve your site</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Improving your website...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to change colors, add features, modify layout..."
            className="resize-none min-h-[60px] bg-white dark:bg-gray-900 border-purple-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 Try: &ldquo;Make the header blue&rdquo;, &ldquo;Add a contact form&rdquo;, &ldquo;Change to dark theme&rdquo;
        </p>
      </div>
    </div>
  );
}
