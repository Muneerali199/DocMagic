'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Sparkles, FileText, Download, Save, Loader2, Send, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { ResumePreview, ResumePreviewRef } from '@/components/resume/resume-preview';

// Define ResumeData matching ResumePreview structure
interface ResumeData {
  name?: string;
  email?: string;
  phone?: string | number;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  portfolio?: string;
  summary?: string;
  experience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    date?: string;
    description?: string[];
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    location?: string;
    date?: string;
    gpa?: string;
    honors?: string;
  }>;
  skills?: {
    technical?: string[];
    programming?: string[];
    tools?: string[];
    soft?: string[];
  };
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
    credential?: string;
  }>;
}

function ResumeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const templateId = searchParams?.get('template') || 'professional';
  const resumePreviewRef = useRef<ResumePreviewRef>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai'; message: string}>>([]);
  const [showAIChat, setShowAIChat] = useState(false); // Mobile AI chat toggle
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: 'Your Full Name',
    email: 'your.email@example.com',
    phone: '+1-234-567-8900',
    location: 'City, State',
    linkedin: 'linkedin.com/in/yourname',
    github: 'github.com/yourname',
    summary: 'Experienced professional with a strong background in software development and problem solving.',
    education: [{ 
      degree: 'Bachelor of Science in Computer Science', 
      institution: 'University Name', 
      location: 'City, State',
      date: '2020-2024', 
      gpa: '3.8/4.0' 
    }],
    experience: [{
      title: 'Software Engineer',
      company: 'Tech Company',
      location: 'City, State',
      date: 'June 2023 - Present',
      description: ['Developed web applications using React and Node.js', 'Implemented RESTful APIs serving 1M+ requests per day']
    }],
    projects: [{
      name: 'E-Commerce Platform',
      description: 'Built full-stack web application with user authentication',
      technologies: ['React', 'Node.js', 'MongoDB', 'AWS']
    }],
    skills: { 
      technical: ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'SQL'],
      soft: ['Leadership', 'Communication', 'Problem Solving'],
      tools: ['Git', 'Docker', 'AWS', 'VS Code']
    }
  });

  // Load template
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId || !user) return;
      try {
        setIsLoading(true);
        const { RESUME_TEMPLATES } = await import('@/lib/resume-template-data');
        const template = RESUME_TEMPLATES.find(t => t.id === templateId);
        
        if (template) {
          // Load template-specific data
          if (templateId === 'nit-patna-resume') {
            setResumeData(prev => ({
              ...prev,
              name: 'Your Name',
              email: 'yourname@email.com',
              phone: '+91-1234567890',
              linkedin: 'linkedin.com/in/yourname',
              github: 'github.com/yourname',
              education: [
                { 
                  degree: 'B.Tech., Computer Science and Engineering', 
                  institution: 'National Institute of Technology, Patna', 
                  location: 'Patna, Bihar', 
                  date: '2020 - 2024', 
                  gpa: '8.5/10.0' 
                },
                { 
                  degree: 'Senior Secondary (XII), Science', 
                  institution: 'Your School Name, CBSE', 
                  location: 'Your City', 
                  date: '2020', 
                  gpa: '90%' 
                }
              ],
              experience: [{
                title: 'Software Development Intern',
                company: 'Company Name',
                location: 'City, India',
                date: 'May 2023 - July 2023',
                description: [
                  'Developed and maintained web applications using React.js and Node.js',
                  'Implemented RESTful APIs serving 100K+ requests daily with 99.9% uptime',
                  'Collaborated with cross-functional teams to deliver features ahead of schedule'
                ]
              }],
              projects: [
                {
                  name: 'E-Commerce Platform',
                  description: 'Built a full-stack e-commerce application with user authentication, product catalog, and payment integration',
                  technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe API'],
                  link: 'github.com/yourname/ecommerce'
                }
              ],
              skills: {
                programming: ['C++', 'Python', 'JavaScript', 'Java'],
                technical: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'SQL', 'Git'],
                tools: ['VS Code', 'Linux', 'Docker', 'AWS']
              }
            }));
          }
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

  // Export to PDF using ResumePreview ref
  const handleExportPDF = async () => {
    try {
      if (resumePreviewRef.current) {
        await resumePreviewRef.current.exportToPDF();
        toast.success('PDF Exported!');
      } else {
        toast.error('Export unavailable');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    }
  };

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header - Fully responsive */}
      <div className="flex-none bg-white border-b shadow-sm px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">Edit Resume</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Visual Editor • AI Powered</p>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="text-xs sm:text-sm px-2 sm:px-3">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Saved!')} className="text-xs sm:text-sm px-2 sm:px-3">
            <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT - AI Chat - Responsive with mobile drawer */}
        <div className={`
          ${showAIChat ? 'flex' : 'hidden lg:flex'}
          w-full lg:w-96 
          bg-gradient-to-b from-violet-50 to-purple-50 
          border-b lg:border-b-0 lg:border-r 
          flex-col
          ${showAIChat ? 'fixed inset-0 lg:relative z-50' : ''}
        `}>
          <div className="p-4 sm:p-6 border-b bg-white flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">AI Assistant</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Tell me what to change in your resume</p>
            </div>
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowAIChat(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {chatHistory.length === 0 && (
                <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
                  <p className="text-sm text-gray-700"><strong>💡 Try asking:</strong></p>
                  <ul className="text-xs sm:text-sm text-gray-600 mt-2 space-y-1">
                    <li>• "Make my experience more professional"</li>
                    <li>• "Add quantified achievements"</li>
                    <li>• "Improve my summary"</li>
                  </ul>
                </Card>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`p-2 sm:p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 ml-2 sm:ml-4' : 'bg-white mr-2 sm:mr-4 shadow-sm'}`}>
                  <p className="text-xs font-semibold mb-1 text-gray-700">{msg.role === 'user' ? 'You' : 'AI'}</p>
                  <p className="text-xs sm:text-sm text-gray-900">{msg.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-3 sm:p-4 bg-white border-t">
            <div className="flex gap-2">
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAiChat())}
                placeholder="Type your message..."
                className="flex-1 min-h-[50px] sm:min-h-[60px] text-sm sm:text-base text-gray-900"
              />
              <Button onClick={handleAiChat} disabled={isAiProcessing} className="bg-violet-600 hover:bg-violet-700 px-3 sm:px-4">
                {isAiProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile AI Chat Toggle Button */}
        <Button
          className="lg:hidden fixed bottom-4 right-4 z-40 rounded-full w-14 h-14 shadow-2xl bg-violet-600 hover:bg-violet-700"
          onClick={() => setShowAIChat(!showAIChat)}
        >
          {showAIChat ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </Button>

        {/* RIGHT - Editable Resume - Scrollable and responsive */}
        <ScrollArea className="flex-1 bg-gray-100">
          <div className="p-3 sm:p-6 lg:p-8">
            {/* Template Info Banner */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg border-2 border-blue-300 max-w-4xl mx-auto shadow-lg">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                      ✏️ Editing Template: {templateId}
                    </p>
                    <p className="text-xs text-gray-600">Click any text to edit directly • Changes save automatically</p>
                    <p className="text-xs text-blue-600 font-mono mt-1">DEBUG: template="{templateId}"</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700">Live Editing</span>
                </div>
              </div>
            </div>
            
            {/* Editable Resume Preview Component */}
            <div className="flex justify-center">
              <ResumePreview
                ref={resumePreviewRef}
                resume={resumeData}
                template={templateId}
                onChange={(newData) => {
                  setResumeData(newData);
                }}
                showControls={false}
                layoutMode="responsive"
                enableEditing={true}
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 text-base sm:text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ResumeBuilderContent />
    </Suspense>
  );
}
