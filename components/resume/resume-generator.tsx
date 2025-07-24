"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumePreview } from "@/components/resume/resume-preview";
import { ResumeTemplates } from "@/components/resume/resume-templates";
import { GuidedResumeGenerator } from "@/components/resume/guided-resume-generator";
import { useToast } from "@/hooks/use-toast";
import { File as FileIcon, Loader2, Sparkles, Maximize2, Minimize2, Download, User, Mail, Wand2, Palette, Brain, Target, Zap, FileText } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { generateWordDocument, formatResumeForWord } from "@/lib/word-export";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FeedbackForm } from "@/components/feedback-form";

export function ResumeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [isFullView, setIsFullView] = useState(false);
  const { toast } = useToast();
  const { isPro } = useSubscription();
  
  const generateResume = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the resume you want to generate",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim() || !email.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name and email",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          name,
          email,
        }),
      });

      if (!response.ok) {
        // If API fails, create a sample resume for testing
        if (response.status === 429 || response.status === 500) {
          const sampleResume = {
            name: name,
            email: email,
            phone: "+1 (555) 123-4567",
            location: "San Francisco, CA",
            summary: `Experienced professional with expertise in ${prompt.toLowerCase()}. Passionate about delivering high-quality results and driving innovation.`,
            experience: [
              {
                title: "Senior Developer",
                company: "Tech Corp",
                location: "San Francisco, CA",
                date: "2020 - Present",
                description: [
                  "• Led development of scalable applications",
                  "• Mentored junior developers",
                  "• Implemented best practices and coding standards"
                ]
              }
            ],
            education: [
              {
                degree: "Bachelor of Science in Computer Science",
                institution: "University of California",
                location: "Berkeley, CA",
                date: "2018",
                gpa: "3.8/4.0"
              }
            ],
            skills: {
              technical: ["JavaScript", "TypeScript", "React", "Node.js"],
              programming: ["Python", "Java", "Go"],
              tools: ["Docker", "AWS", "Git", "Jenkins"],
              soft: ["Leadership", "Communication", "Problem Solving"]
            }
          };
          
          setResumeData(sampleResume);
          toast({
            title: "Sample Resume Created! ✨",
            description: "API rate limit reached. Here's a sample resume to test the Word export feature.",
          });
          return;
        }
        throw new Error('Failed to generate resume');
      }

      const data = await response.json();
      setResumeData(data);
      
      toast({
        title: "Resume generated! ✨",
        description: "Your tailored resume is ready to preview and download",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGuidedResumeGenerated = (resume: any) => {
    setResumeData(resume);
  };

  const exportToPDF = async () => {
    if (!resumeData) return;
    
    try {
      const element = document.getElementById('resume-content');
      if (!element) throw new Error('Resume content element not found');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate ratio to fit the image within the PDF
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${resumeData.name?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.pdf`);
      
      toast({
        title: "Resume exported!",
        description: "Your resume has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export failed",
        description: "Failed to export resume to PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToWord = async () => {
    if (!resumeData) return;
    
    try {
      const wordData = formatResumeForWord(resumeData);
      const blob = await generateWordDocument(wordData, 'resume');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.name?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Resume exported!",
        description: "Your resume has been downloaded as a Word document.",
      });
    } catch (error) {
      console.error('Error exporting to Word:', error);
      toast({
        title: "Export failed",
        description: "Failed to export resume to Word. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-300 ${isFullView ? 'p-0' : ''}`}>
      <Tabs defaultValue="guided" className="w-full">
        <div className={`flex justify-center mb-6 ${isFullView ? 'hidden' : ''}`}>
          <TabsList className="glass-effect border border-yellow-400/20 p-1 h-auto">
            <TabsTrigger 
              value="guided" 
              className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              ATS-Optimized Builder
            </TabsTrigger>
            <TabsTrigger 
              value="quick" 
              className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Quick Create
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              disabled={isGenerating}
              className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="guided" className="space-y-6 pt-4">
          <div className={`${isFullView ? 'hidden' : ''}`}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4 shimmer">
                <Target className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">100% ATS-Optimized</span>
                <Zap className="h-4 w-4 text-blue-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 bolt-gradient-text">
                Build Your ATS-Friendly Resume
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered guided builder creates resumes that pass Applicant Tracking Systems
                with perfect keyword optimization and professional formatting
              </p>
            </div>

            <div className="glass-effect p-6 sm:p-8 rounded-2xl border border-yellow-400/20 relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-20"></div>
              <div className="relative z-10">
                <GuidedResumeGenerator onResumeGenerated={handleGuidedResumeGenerated} />
              </div>
            </div>
          </div>

          {resumeData && (
            <div className={`${isFullView ? 'w-full' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-effect mb-3">
                    <FileIcon className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-medium">ATS-Optimized Resume</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold bolt-gradient-text">Preview</h2>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullView(!isFullView)}
                  className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                >
                  {isFullView ? (
                    <>
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Exit Full View
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Full View
                    </>
                  )}
                </Button>
              </div>

              <div className={`glass-effect border border-yellow-400/20 rounded-xl overflow-hidden bg-white transition-all duration-300 relative ${
                isFullView ? 'fixed inset-4 z-50 shadow-2xl' : ''
              }`}>
                <div className="absolute inset-0 shimmer opacity-10"></div>
                <div className="relative z-10">
                  <ResumePreview resume={resumeData} template={selectedTemplate} />
                </div>
              </div>

              {/* Download Options */}
              <div className="glass-effect p-4 rounded-xl border border-yellow-400/20 mt-6">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Download className="h-4 w-4 text-yellow-500" />
                  Download Options
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                    onClick={exportToPDF}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                    onClick={exportToWord}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download Word
                  </Button>
                  {isPro && (
                    <Button variant="outline" className="glass-effect border-yellow-400/30 hover:border-yellow-400/60">
                      Share Link
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quick" className="space-y-6 pt-4">
          <div className={`grid grid-cols-1 ${isFullView ? '' : 'lg:grid-cols-2'} gap-6 sm:gap-8`}>
            {/* Left Side - Form */}
            <div className={isFullView ? 'hidden' : 'space-y-6'}>
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-effect mb-3">
                  <Wand2 className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-medium">Quick AI Resume Generator</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 bolt-gradient-text">
                  Generate Your Resume
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fill in your details and let AI craft the perfect resume
                </p>
              </div>

              <div className="space-y-4">
                {/* Personal Information */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Your Name
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20"
                    disabled={isGenerating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20"
                    disabled={isGenerating}
                  />
                </div>
                
                {/* Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Describe your ideal resume
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="E.g., Senior React Developer resume for Google, highlighting frontend performance optimization and component architecture"
                    className="min-h-[120px] text-base glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20 resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                
                {/* Generate Button */}
                <Button 
                  onClick={generateResume} 
                  disabled={isGenerating || !prompt.trim() || !name.trim() || !email.trim()} 
                  className="w-full bolt-gradient text-white font-semibold py-3 rounded-xl hover:scale-105 transition-all duration-300 bolt-glow relative overflow-hidden"
                >
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Generate Resume</span>
                        <Wand2 className="h-4 w-4" />
                      </>
                    )}
                  </div>
                  
                  {!isGenerating && (
                    <div className="absolute inset-0 shimmer opacity-30"></div>
                  )}
                </Button>
              </div>
              
              {/* Download Options */}
              {resumeData && (
                <div className="glass-effect p-4 rounded-xl border border-yellow-400/20">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Download className="h-4 w-4 text-yellow-500" />
                    Download Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                      onClick={exportToPDF}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                      onClick={exportToWord}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download Word
                    </Button>
                    {isPro && (
                      <Button variant="outline" className="glass-effect border-yellow-400/30 hover:border-yellow-400/60">
                        Share Link
                      </Button>
                    )}
                  </div>
                  
                  {/* Feedback Form */}
                  <FeedbackForm documentType="resume" />
                </div>
              )}
            </div>

            {/* Right Side - Preview */}
            <div className={`space-y-4 ${isFullView ? 'w-full' : ''}`}>
              <div className="flex justify-between items-center">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-effect mb-3">
                    <FileIcon className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-medium">Live Preview</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold bolt-gradient-text">Preview</h2>
                </div>
                
                {resumeData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullView(!isFullView)}
                    className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                  >
                    {isFullView ? (
                      <>
                        <Minimize2 className="h-4 w-4 mr-2" />
                        Exit Full View
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Full View
                      </>
                    )}
                  </Button>
                )}
              </div>

              {resumeData ? (
                <div className={`glass-effect border border-yellow-400/20 rounded-xl overflow-hidden bg-white transition-all duration-300 relative ${
                  isFullView ? 'fixed inset-4 z-50 shadow-2xl' : ''
                }`}>
                  <div className="absolute inset-0 shimmer opacity-10"></div>
                  <div className="relative z-10">
                    <ResumePreview resume={resumeData} template={selectedTemplate} />
                  </div>
                </div>
              ) : (
                <Card className="glass-effect border border-yellow-400/20 flex items-center justify-center min-h-[500px] relative overflow-hidden">
                  <div className="absolute inset-0 shimmer opacity-10"></div>
                  <CardContent className="py-10 relative z-10">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <FileIcon className="h-16 w-16 mx-auto text-muted-foreground/50" />
                        <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-yellow-500 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">
                          {isGenerating 
                            ? "Creating your resume with AI magic..."
                            : "Your resume preview will appear here"}
                        </p>
                        {isGenerating && (
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className={`pt-4 ${isFullView ? 'hidden' : ''}`}>
          <div className="glass-effect p-6 rounded-xl border border-yellow-400/20 relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-20"></div>
            <div className="relative z-10">
              <ResumeTemplates
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                onEditTemplate={() => {}}
                onDownloadTemplate={() => {}}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}