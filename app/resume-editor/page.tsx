'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  FileText, 
  Code, 
  Eye, 
  Download, 
  Save,
  Loader2,
  Wand2,
  Type,
  Users,
  Share2,
  MessageSquare,
  Zap,
  RefreshCw,
  Play,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { CollaborationPanel } from '@/components/templates/collaboration-panel';

function ResumeEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  
  const templateId = searchParams?.get('template');
  const documentId = searchParams?.get('id');
  
  const [mode, setMode] = useState<'latex' | 'text'>('text');
  const [latexCode, setLatexCode] = useState('');
  const [normalText, setNormalText] = useState('');
  const [htmlPreview, setHtmlPreview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('My Resume');
  const [documentData, setDocumentData] = useState<any>(null);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Update HTML preview from content
  const updatePreview = useCallback(() => {
    const content = mode === 'latex' ? latexCode : normalText;
    if (!content.trim()) {
      setHtmlPreview('<div class="text-gray-400 text-center mt-20">Start typing to see preview...</div>');
      return;
    }
    
    // Convert markdown/text to HTML
    let html = content
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-4 text-gray-900">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-800 border-b-2 border-blue-500 pb-1">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>')
      .replace(/^\*(.+)\*$/gm, '<p class="text-sm text-gray-600 italic mb-2">$1</p>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="ml-6 mb-1 text-gray-700">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3 text-gray-700">')
      .replace(/\n/g, '<br/>');
    
    html = `<div class="prose max-w-none"><p class="mb-3 text-gray-700">${html}</p></div>`;
    setHtmlPreview(html);
  }, [latexCode, normalText, mode]);

  // Auto-update preview when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 500);
    return () => clearTimeout(timer);
  }, [latexCode, normalText, mode, updatePreview]);

  // Load template or document
  useEffect(() => {
    const loadContent = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        if (documentId) {
          // Load existing document
          const response = await fetch(`/api/documents/${documentId}`);
          if (response.ok) {
            const doc = await response.json();
            setDocumentData(doc);
            setDocumentTitle(doc.title);
            if (doc.content?.latex) {
              setLatexCode(doc.content.latex);
              setMode('latex');
            } else if (doc.content?.text) {
              setNormalText(doc.content.text);
              setMode('text');
            }
            toast.success('Document loaded');
          }
        } else if (templateId) {
          // Load template
          const { RESUME_TEMPLATES } = await import('@/lib/resume-template-data');
          const template = RESUME_TEMPLATES.find(t => t.id === templateId);
          
          if (template) {
            setDocumentTitle(template.title);
            
            // Load template with sample content
            const sampleContent = `# ${template.title}\n\n**Email:** your.email@example.com | **Phone:** +1 234 567 8900\n**LinkedIn:** linkedin.com/in/yourname | **GitHub:** github.com/yourname\n\n## Professional Summary\n\nExperienced professional with expertise in [your field]. Proven track record of delivering high-quality results.\n\n## Experience\n\n### Senior Software Engineer | Tech Company\n*January 2020 - Present*\n\n- Led development of key features that increased user engagement by 40%\n- Mentored team of 5 junior developers\n- Implemented CI/CD pipeline reducing deployment time by 60%\n\n### Software Engineer | Startup Inc\n*June 2018 - December 2019*\n\n- Built scalable backend services handling 1M+ requests/day\n- Collaborated with cross-functional teams\n- Reduced API response time by 50%\n\n## Education\n\n### Bachelor of Science in Computer Science\n**University Name** | 2014 - 2018\n- GPA: 3.8/4.0\n- Relevant Coursework: Data Structures, Algorithms, Machine Learning\n\n## Skills\n\n**Programming Languages:** JavaScript, Python, Java, Go\n**Frameworks:** React, Node.js, Django, Spring Boot\n**Tools:** Git, Docker, Kubernetes, AWS\n**Databases:** PostgreSQL, MongoDB, Redis`;
            
            setNormalText(sampleContent);
            
            // Create mock document
            const mockDoc = {
              id: `temp-${Date.now()}`,
              user_id: user.id,
              title: template.title,
              type: 'resume',
              content: { text: sampleContent },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setDocumentData(mockDoc);
            
            toast.success(`Template "${template.title}" loaded! Start editing.`);
          }
        } else {
          // New blank document
          const blankContent = `# Your Name\n\n**Email:** your.email@example.com | **Phone:** +1 234 567 8900\n\n## Professional Summary\n\nWrite your professional summary here...\n\n## Experience\n\n### Job Title | Company Name\n*Start Date - End Date*\n\n- Achievement or responsibility\n- Achievement or responsibility\n\n## Education\n\n### Degree | University\n*Year*\n\n## Skills\n\nList your skills here...`;
          
          setNormalText(blankContent);
          setDocumentTitle('New Resume');
        }
      } catch (error) {
        console.error('Error loading content:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [templateId, documentId, user]);

  // AI: Convert normal text to LaTeX
  const handleGenerateLatex = async () => {
    if (!normalText.trim()) {
      toast.error('Please enter some text first');
      return;
    }

    try {
      setIsGenerating(true);
      toast.info('AI is generating LaTeX code...');

      const response = await fetch('/api/ai/text-to-latex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: normalText,
          documentType: 'resume'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLatexCode(data.latex);
        setMode('latex');
        toast.success('LaTeX code generated!');
      } else {
        const basicLatex = generateBasicLatex(normalText);
        setLatexCode(basicLatex);
        setMode('latex');
        toast.success('Basic LaTeX generated!');
      }
    } catch (error) {
      console.error('Error generating LaTeX:', error);
      const basicLatex = generateBasicLatex(normalText);
      setLatexCode(basicLatex);
      setMode('latex');
      toast.success('Basic LaTeX generated!');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI: Process custom prompt
  const handleAiCommand = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a command');
      return;
    }

    const content = mode === 'latex' ? latexCode : normalText;
    if (!content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    try {
      setIsAiProcessing(true);
      toast.info('AI is processing your request...');

      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${aiPrompt}\n\nCurrent ${mode === 'latex' ? 'LaTeX' : 'text'} content:\n${content}`,
          documentType: 'resume'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (mode === 'latex') {
          setLatexCode(data.response);
        } else {
          setNormalText(data.response);
        }
        toast.success('AI updated your resume!');
        setAiPrompt('');
      } else {
        toast.error('AI request failed');
      }
    } catch (error) {
      console.error('Error with AI:', error);
      toast.error('AI request failed');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // AI: Quick improve
  const handleQuickImprove = async () => {
    const content = mode === 'latex' ? latexCode : normalText;
    if (!content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    try {
      setIsGenerating(true);
      toast.info('AI is improving your resume...');

      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Improve this resume to be more professional, impactful, and ATS-friendly. Use action verbs and quantify achievements where possible:\n\n${content}`,
          documentType: 'resume'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (mode === 'latex') {
          setLatexCode(data.response);
        } else {
          setNormalText(data.response);
        }
        toast.success('Resume improved!');
      } else {
        toast.error('Failed to improve');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to improve');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate basic LaTeX from text
  const generateBasicLatex = (text: string): string => {
    const lines = text.split('\n');
    let latex = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\begin{document}

\\pagestyle{empty}

`;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        latex += '\n';
      } else if (trimmed.startsWith('# ')) {
        latex += `\\section*{${trimmed.substring(2)}}\n`;
      } else if (trimmed.startsWith('## ')) {
        latex += `\\subsection*{${trimmed.substring(3)}}\n`;
      } else if (trimmed.startsWith('- ')) {
        latex += `\\item ${trimmed.substring(2)}\n`;
      } else {
        latex += `${trimmed}\n\n`;
      }
    });

    latex += '\\end{document}';
    return latex;
  };

  // Export as PDF
  const handleExport = async () => {
    const content = mode === 'latex' ? latexCode : normalText;
    
    if (!content.trim()) {
      toast.error('Nothing to export');
      return;
    }

    try {
      toast.info('Exporting resume...');
      
      // Create a simple text file for now
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_')}.${mode === 'latex' ? 'tex' : 'txt'}`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Resume exported!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export');
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="max-w-md mx-auto p-8 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-3">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to create your resume</p>
          <Button 
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign In to Continue
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-medium">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="flex-none bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{documentTitle}</h1>
              <p className="text-sm text-gray-500">AI-Powered Resume Editor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-gray-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
          {/* Mode Selector */}
          <div className="flex-none px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'latex' | 'text')} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Normal Text
                </TabsTrigger>
                <TabsTrigger value="latex" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  LaTeX Code
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-auto p-6">
            {mode === 'text' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Write Your Resume</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleQuickImprove}
                      disabled={isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      AI Improve
                    </Button>
                    <Button
                      onClick={handleGenerateLatex}
                      disabled={isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generate LaTeX
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  value={normalText}
                  onChange={(e) => setNormalText(e.target.value)}
                  placeholder="Enter your resume content here...&#10;&#10;Use # for main headings&#10;Use ## for subheadings&#10;Use - for bullet points&#10;&#10;Example:&#10;# John Doe&#10;Email: john@example.com&#10;&#10;## Experience&#10;- Software Engineer at Tech Corp (2020-2023)&#10;- Developed web applications&#10;&#10;## Education&#10;- BS Computer Science, University (2016-2020)"
                  className="min-h-[600px] font-mono text-sm resize-none border-2 border-gray-200 focus:border-blue-500"
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Write in plain text, then click "AI Improve" to enhance your content or "Generate LaTeX" to convert to professional format!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">LaTeX Code</h3>
                  <Button
                    onClick={() => setMode('text')}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Back to Text
                  </Button>
                </div>
                
                <Textarea
                  value={latexCode}
                  onChange={(e) => setLatexCode(e.target.value)}
                  placeholder="LaTeX code will appear here...&#10;&#10;You can also write LaTeX directly if you know it!"
                  className="min-h-[600px] font-mono text-sm resize-none border-2 border-gray-200 focus:border-blue-500 bg-gray-50"
                />
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>✨ LaTeX Generated!</strong> You can edit the code directly or export it to compile with a LaTeX editor.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="w-96 bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 p-6 overflow-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI Assistant
              </h3>
              <p className="text-sm text-gray-600">
                Get help creating a professional resume
              </p>
            </div>

            <Card className="p-4 bg-white border-2 border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button
                  onClick={handleQuickImprove}
                  disabled={isGenerating || !normalText.trim()}
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="sm"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Improve Content
                </Button>
                
                <Button
                  onClick={handleGenerateLatex}
                  disabled={isGenerating || !normalText.trim()}
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate LaTeX
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">How It Works</h4>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Write your resume in plain text (or use template)</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Click "AI Improve" to enhance your content</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Click "Generate LaTeX" to convert to professional format</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Export and use in any LaTeX editor</span>
                </li>
              </ol>
            </Card>

            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tips</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Use # for main sections (Name, Contact)</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Use ## for subsections (Experience, Education)</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Use - for bullet points</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Keep it concise and professional</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResumeEditorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ResumeEditorContent />
    </Suspense>
  );
}
