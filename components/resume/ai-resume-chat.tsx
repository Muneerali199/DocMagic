"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  highlights?: string[];
  atsImpact?: string;
}

interface AIResumeChatProps {
  resumeData: any;
  onResumeUpdate: (updatedResume: any) => void;
}

export function AIResumeChat({ resumeData, onResumeUpdate }: AIResumeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI Resume Coach. I can help you:\n\n• Improve your professional summary\n• Enhance job descriptions with metrics\n• Optimize for ATS compatibility\n• Add powerful action verbs\n• Tailor content for specific roles\n\nWhat would you like to improve?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/resume/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeData,
          userMessage,
          conversationHistory: messages.slice(-4) // Last 2 exchanges for context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.advice,
        highlights: data.highlights,
        atsImpact: data.atsImpact
      }]);

      // Update resume if changes were made
      if (data.updatedResume) {
        onResumeUpdate(data.updatedResume);
        toast.success('Resume updated!', {
          description: 'Your resume has been improved based on AI suggestions.',
          duration: 4000
        });
      }

    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('Failed to get AI response', {
        description: 'Please try again or rephrase your question.'
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try rephrasing your question or try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    "Make my summary more impactful",
    "Add metrics to my achievements",
    "Improve ATS score",
    "Use stronger action verbs",
    "Tailor for software engineer role"
  ];

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <Card className="glass-effect border-2 border-purple-200/50 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Resume Coach
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                
                {/* Highlights */}
                {message.highlights && message.highlights.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ATS Impact */}
                {message.atsImpact && (
                  <div className="mt-3 flex items-start gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{message.atsImpact}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="text-xs px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-purple-700 rounded-full transition-all duration-200 border border-purple-200"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to improve your resume..."
            className="flex-1 border-2 focus:border-purple-400"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          💡 Tip: Be specific! e.g., "Add metrics to my first job" or "Make summary more senior-level"
        </p>
      </CardContent>
    </Card>
  );
}
