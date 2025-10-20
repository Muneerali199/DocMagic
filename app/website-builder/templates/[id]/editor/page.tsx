"use client";

import { useParams, useRouter } from 'next/navigation';
import { websiteTemplates } from '@/lib/website-templates';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Sparkles, Download, Code, Eye, Loader2, Copy, Check } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const templateId = params?.id as string;
  const [template, setTemplate] = useState(websiteTemplates.find(t => t.id === templateId));
  const [currentHtml, setCurrentHtml] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const foundTemplate = websiteTemplates.find(t => t.id === templateId);
    if (foundTemplate) {
      setTemplate(foundTemplate);
      setCurrentHtml(foundTemplate.htmlCode);
      setMessages([
        {
          role: 'assistant',
          content: `🎨 Welcome! I've loaded the **${foundTemplate.name}** template for you.\n\nI can help you customize this template. Here are some things you can ask me:\n\n• Change colors and styling\n• Modify text content\n• Add or remove sections\n• Adjust layouts\n• Update images\n• Change fonts\n\nWhat would you like to modify?`
        }
      ]);
    }
  }, [templateId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userMessage.trim() || isGenerating) return;

    const newUserMessage: Message = {
      role: 'user',
      content: userMessage
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsGenerating(true);

    try {
      // Simulate AI response (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiResponse: Message = {
        role: 'assistant',
        content: `I understand you want to: "${userMessage}"\n\n✨ I've updated the template based on your request. Check the preview on the right to see the changes!\n\nWould you like me to make any other modifications?`
      };

      setMessages(prev => [...prev, aiResponse]);

      toast({
        title: "✨ Template Updated",
        description: "Your changes have been applied successfully!",
      });

    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template?.name || 'template'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "✅ Downloaded",
      description: "Template saved successfully!",
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: "✅ Copied",
      description: "Code copied to clipboard!",
    });
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Template Not Found</h1>
          <Button onClick={() => router.push('/website-builder')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Builder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/website-builder')} 
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {template.name} - Editor
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered template customization
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'preview' ? 'default' : 'ghost'}
                onClick={() => setViewMode('preview')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'code' ? 'default' : 'ghost'}
                onClick={() => setViewMode('code')}
              >
                <Code className="h-4 w-4 mr-1" />
                Code
              </Button>
            </div>
            <Button onClick={handleCopyCode} variant="outline" size="sm">
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button onClick={handleDownload} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - AI Chatbox */}
        <div className="w-[40%] border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
          {/* Chat Header */}
          <div className="flex-none px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customize your template</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me to customize the template..."
                className="flex-1 resize-none min-h-[60px] max-h-[120px]"
                disabled={isGenerating}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!userMessage.trim() || isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="icon"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Right Side - Preview/Code */}
        <div className="w-[60%] bg-gray-100 dark:bg-gray-900 overflow-hidden">
          {viewMode === 'preview' ? (
            <iframe
              ref={iframeRef}
              srcDoc={currentHtml}
              className="w-full h-full border-0"
              title="Template Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="w-full h-full overflow-auto p-4 custom-scrollbar">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                <code>{currentHtml}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
