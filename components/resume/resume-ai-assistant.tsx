'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ResumeAIAssistantProps = {
  resumeContent: string;
  onApplySuggestion: (suggestion: string) => void;
};

interface ResumeData {
  content: string;
  // Add other resume properties as needed
}

export function ResumeAIAssistant({ resumeContent, onApplySuggestion }: ResumeAIAssistantProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('editor');
  const [resumeData, setResumeData] = useState<ResumeData>({ content: resumeContent });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial system message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your AI Resume Assistant. I can help you improve your resume. Ask me questions like:\n\n• How can I make my summary stronger?\n• Does this experience sound impactful for a [job title] role?\n• Can you suggest better action verbs?\n• How can I tailor this for [industry] jobs?"
      }
    ]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze/resume/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          resumeContent,
          conversationHistory: messages
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle quick prompt selection
  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const quickPrompts = [
    'How can I make my summary stronger?',
    'Suggest better action verbs',
    'Improve work experience impact',
    'Tailor for [job title] role'
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={cn(
              'p-4 rounded-lg max-w-[85%]',
              message.role === 'assistant' 
                ? 'bg-muted mr-auto' 
                : 'bg-primary text-primary-foreground ml-auto'
            )}
          >
            <div className="whitespace-pre-line">{message.content}</div>
            {message.role === 'assistant' && index > 0 && (
              <Button 
                className="mt-2 text-xs border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                onClick={() => onApplySuggestion(message.content)}
              >
                <Wand2 className="w-3 h-3 mr-1" /> Apply Suggestions
              </Button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="p-4 bg-muted rounded-lg max-w-[85%] mr-auto">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickPrompts.map((prompt, i) => (
            <Button
              key={i}
              className="text-xs h-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleQuickPrompt(prompt)}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {prompt}
            </Button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about improving your resume..."
            className="min-h-[40px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 p-0 flex items-center justify-center"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
