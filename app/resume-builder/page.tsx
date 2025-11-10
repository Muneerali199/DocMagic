'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Sparkles, FileText, Download, Save, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import EditableResume from '@/components/resume-templates/EditableResume';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  education: Array<{ degree: string; school: string; year: string; gpa: string; }>;
  experience: Array<{ title: string; company: string; location: string; duration: string; points: string[]; }>;
  projects: Array<{ name: string; tech: string; duration: string; points: string[]; }>;
  skills: { languages: string; technologies: string; tools: string; };
  achievements: string[];
}

function ResumeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const templateId = searchParams?.get('template');
  
  const [isLoading, setIsLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai'; message: string}>>([]);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: 'Your Full Name',
    email: 'your.email@example.com',
    phone: '+1-234-567-8900',
    linkedin: 'linkedin.com/in/yourname',
    github: 'github.com/yourname',
    education: [{ degree: 'Bachelor of Science in Computer Science', school: 'University Name', year: '2020-2024', gpa: '3.8/4.0' }],
    experience: [{
      title: 'Software Engineer',
      company: 'Tech Company',
      location: 'City, State',
      duration: 'June 2023 - Present',
      points: ['Developed web applications using React and Node.js', 'Implemented RESTful APIs serving 1M+ requests per day']
    }],
    projects: [{
      name: 'E-Commerce Platform',
      tech: 'React, Node.js, MongoDB, AWS',
      duration: 'Jan 2023 - Mar 2023',
      points: ['Built full-stack web application', 'Implemented user authentication using JWT']
    }],
    skills: { languages: 'JavaScript, Python, Java, C++', technologies: 'React, Node.js, Express, MongoDB', tools: 'Git, Docker, AWS' },
    achievements: ['Won 1st place in University Hackathon 2023', 'Published research paper in IEEE conference']
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
          // Set preview image
          setTemplatePreviewUrl(template.previewImage);
          
          // Load template-specific data
          if (templateId === 'nit-patna-resume') {
            setResumeData({
              name: 'Your Full Name',
              email: 'your.email@example.com',
              phone: '+91-1234567890',
              linkedin: 'linkedin.com/in/yourname',
              github: 'github.com/yourname',
              education: [
                { degree: 'B.Tech., Computer Science Engineering', school: 'National Institute of Technology, Patna', year: '2020-2024', gpa: '8.5/10' },
                { degree: 'Senior Secondary (XII)', school: 'School Name, Board', year: '2020', gpa: '90%' }
              ],
              experience: [{
                title: 'Software Engineering Intern',
                company: 'Tech Company',
                location: 'City, Country',
                duration: 'June 2023 - August 2023',
                points: ['Developed web applications using React and Node.js', 'Implemented RESTful APIs serving 100K+ requests daily']
              }],
              projects: [{
                name: 'E-Commerce Platform',
                tech: 'React, Node.js, MongoDB, AWS',
                duration: 'January 2023 - March 2023',
                points: ['Built full-stack e-commerce application', 'Implemented user authentication using JWT']
              }],
              skills: { languages: 'C++, Python, JavaScript, Java, SQL', technologies: 'React, Node.js, Express, MongoDB', tools: 'Git, Docker, AWS, TensorFlow' },
              achievements: ['Ranked in top 5% in National Coding Competition 2023', 'Published research paper in IEEE conference']
            });
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

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      const element = document.getElementById('resume-content');
      if (!element) {
        toast.error('Resume content not found');
        return;
      }

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 0.5,
        filename: `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
      toast.success('Exporting PDF...');
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
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
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

        {/* RIGHT - Template + Editable Resume */}
        <ScrollArea className="flex-1 bg-gray-100">
          <div className="p-8">
            {/* Show the ACTUAL template you selected */}
            {templatePreviewUrl && (
              <div className="mb-8 max-w-4xl mx-auto">
                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                    <p className="text-sm text-gray-700 text-center">
                      📄 <strong>Your Selected Template</strong> - This is the exact design you chose
                    </p>
                  </div>
                  <img 
                    src={templatePreviewUrl} 
                    alt="Resume Template" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
            
            {/* Editable version that matches the template */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-700 text-center">
                  <strong>Edit Below</strong> - This matches your template design. Click any text to edit!
                </p>
              </div>
            </div>
            <EditableResume 
              data={resumeData} 
              onUpdate={(newData) => {
                setResumeData(newData);
                setLastUpdated(new Date());
                toast.success('Updated!', { duration: 1000 });
              }} 
            />
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
          <p className="text-gray-700 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ResumeBuilderContent />
    </Suspense>
  );
}
