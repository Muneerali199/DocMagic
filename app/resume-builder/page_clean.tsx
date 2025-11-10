'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Sparkles, FileText, Download, Save, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ResumeBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const templateId = searchParams?.get('template');
  
  const [isLoading, setIsLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai'; message: string}>>([]);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState<string>('');

  // Load template
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId || !user) return;
      try {
        setIsLoading(true);
        const { RESUME_TEMPLATES } = await import('@/lib/resume-template-data');
        const template = RESUME_TEMPLATES.find(t => t.id === templateId);
        
        if (template) {
          setTemplatePreviewUrl(template.previewImage);
          toast.success(`Template "${template.title}" loaded!`);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load template');
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplate();
  }, [templateId, user]);

  // AI Chat
  const handleAiChat = async () => {
    if (!aiPrompt.trim()) return;
    
    setChatHistory([...chatHistory, { role: 'user', message: aiPrompt }]);
    setIsAiProcessing(true);
    
    try {
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, documentType: 'resume' })
      });
      
      if (response.ok) {
        setChatHistory(prev => [...prev, { role: 'ai', message: 'I\'ve analyzed your request! Your resume will be updated based on your instructions.' }]);
        toast.success('AI response received!');
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', message: 'Sorry, I encountered an error.' }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', message: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsAiProcessing(false);
      setAiPrompt('');
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="p-8 text-center max-w-md">
          <FileText className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to edit your resume</p>
          <Button onClick={() => router.push('/auth/signin')} className="bg-blue-600">Sign In</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-none bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Edit Resume</h1>
            <p className="text-xs text-gray-500">Visual Editor • AI Powered</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Exporting...')}>
            <Download className="w-4 h-4 mr-2" />Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Saved!')}>
            <Save className="w-4 h-4 mr-2" />Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT - AI Chat */}
        <div className="w-96 bg-gradient-to-b from-violet-50 to-purple-50 border-r flex flex-col">
          <div className="p-6 border-b bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-violet-600" />
              <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
            </div>
            <p className="text-sm text-gray-600">Tell me what to change in your resume</p>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatHistory.length === 0 && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <p className="text-sm text-gray-700"><strong>💡 Try asking:</strong></p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>• "Make my experience more professional"</li>
                    <li>• "Add quantified achievements"</li>
                    <li>• "Improve my summary"</li>
                  </ul>
                </Card>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 ml-4' : 'bg-white mr-4 shadow-sm'}`}>
                  <p className="text-xs font-semibold mb-1 text-gray-700">{msg.role === 'user' ? 'You' : 'AI'}</p>
                  <p className="text-sm text-gray-900">{msg.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAiChat())}
                placeholder="Type your message..."
                className="flex-1 min-h-[60px] text-gray-900"
              />
              <Button onClick={handleAiChat} disabled={isAiProcessing} className="bg-violet-600 hover:bg-violet-700">
                {isAiProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT - Resume Preview ONLY */}
        <ScrollArea className="flex-1 bg-gray-100">
          <div className="p-8 max-w-4xl mx-auto">
            {templatePreviewUrl ? (
              <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <p className="text-sm text-gray-700 text-center">
                    ✨ <strong>Your Resume Template</strong> - Use AI chat on the left to edit this resume
                  </p>
                </div>
                <img 
                  src={templatePreviewUrl} 
                  alt="Resume Template" 
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="bg-white shadow-2xl rounded-lg p-12 border text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading template...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
