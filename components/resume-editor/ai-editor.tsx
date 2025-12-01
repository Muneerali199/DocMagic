'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeAIEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export function ResumeAIEditor({ data, onChange }: ResumeAIEditorProps) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai'; message: string}>>([]);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    
    setChatHistory([...chatHistory, { role: 'user', message: prompt }]);
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, documentType: 'resume', currentData: data })
      });
      
      if (response.ok) {
        const result = await response.json();
        setChatHistory(prev => [...prev, { 
          role: 'ai', 
          message: 'I\'ve updated your resume based on your request!' 
        }]);
        toast.success('Resume updated by AI!');
      }
    } catch (error) {
      toast.error('AI request failed');
    } finally {
      setIsProcessing(false);
      setPrompt('');
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-violet-600" />
        <h2 className="text-xl font-bold">AI Assistant</h2>
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm font-semibold mb-2">💡 Try asking:</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• "Make my summary more professional"</li>
          <li>• "Add quantified achievements to my experience"</li>
          <li>• "Improve the wording of my job descriptions"</li>
          <li>• "Optimize for ATS systems"</li>
        </ul>
      </Card>

      <div className="flex-1 overflow-auto space-y-3">
        {chatHistory.map((msg, i) => (
          <div 
            key={i} 
            className={`p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-white mr-8 shadow-sm'
            }`}
          >
            <p className="text-xs font-semibold mb-1">{msg.role === 'user' ? 'You' : 'AI'}</p>
            <p className="text-sm">{msg.message}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Ask AI to improve your resume..."
          className="flex-1"
          rows={3}
        />
        <Button onClick={handleSend} disabled={isProcessing} className="bg-violet-600">
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
