'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import InterviewQuestions from './InterviewQuestions';
import AnalysisResults from './AnalysisResults';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface ChatInterfaceProps {
  onAnalysisComplete?: (data: any) => void;
}

export default function ChatInterface({ onAnalysisComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analysis' | 'chat'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleResumeUpload = async () => {
    if (!file) return;
    
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const response = await fetch('/api/ai/resume-chat', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.type === 'analysis') {
        setAnalysisData(data);
        setResumeUploaded(true);
        setCurrentStep('analysis');
        
        // Add welcome message
        setMessages([{
          id: '1',
          type: 'ai',
          content: 'Great! I\'ve analyzed your resume. Here are your interview questions and analysis. Feel free to ask me anything about your interview preparation!',
          timestamp: new Date(),
          metadata: data
        }]);
        
        onAnalysisComplete?.(data);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setMessages([{
        id: 'error',
        type: 'ai',
        content: 'Sorry, there was an error processing your resume. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', inputMessage);

      const response = await fetch('/api/ai/resume-chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.message || 'I\'m here to help with your interview preparation!',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: 'error',
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
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

  if (currentStep === 'upload') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">AI Resume Interview Coach</h1>
          <p className="text-lg text-muted-foreground">
            Upload your resume to get personalized interview questions and coaching
          </p>
        </div>
        
        <Card className="p-8">
          <div className="text-center space-y-4">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Upload Your Resume
              </h3>
              <p className="text-sm text-muted-foreground">
                Select a PDF, DOC, or DOCX file
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              className="hidden"
              disabled={isLoading}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isLoading}
            >
              Browse Files
            </Button>

            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>

          {file && (
            <div className="mt-6">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Processing... {uploadProgress}%
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleResumeUpload}
                  disabled={isLoading || uploadProgress < 100}
                  className="w-full mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    'Get Interview Questions'
                  )}
                </Button>
              </Card>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {analysisData && (
          <div className="space-y-6">
            <AnalysisResults data={analysisData} />
            <InterviewQuestions questions={analysisData.questions?.questions || []} />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your interview preparation..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
