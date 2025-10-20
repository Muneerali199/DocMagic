"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { 
  FileText, Upload, Globe, Sparkles, Download, 
  Linkedin, FileDown, Loader2, CheckCircle2, AlertCircle, Edit, MessageSquare 
} from "lucide-react";
import { ResumePreview } from "./resume-preview";
import { ATSScoreDisplay } from "./ats-score-display";
import { AIResumeChat } from "./ai-resume-chat";

interface LinkedInProfile {
  fullName: string;
  headline?: string;
  summary?: string;
  location?: string;
  experience?: any[];
  education?: any[];
  skills?: string[];
  languages?: string[];
  certifications?: any[];
}

export function MobileResumeBuilder() {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [atsScore, setAtsScore] = useState<any>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currentStep, setCurrentStep] = useState<'input' | 'preview'>('input');
  const [showAIChat, setShowAIChat] = useState(false);

  const supabase = createClient();

  // Get auth token
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  // LinkedIn URL Import
  const handleLinkedInImport = async () => {
    if (!linkedinUrl.trim()) {
      toast({
        title: "Please enter a LinkedIn URL",
        variant: "destructive",
      });
      return;
    }

    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[\w-]+\/?$/;
    if (!linkedinRegex.test(linkedinUrl)) {
      toast({
        title: "Invalid LinkedIn URL",
        description: "Format: https://linkedin.com/in/username",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Please sign in first");

      const response = await fetch("/api/linkedin/import-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ profileUrl: linkedinUrl }),
      });

      const data = await response.json();

      if (response.status === 503) {
        toast({
          title: "🛡️ LinkedIn Blocks URL Import",
          description: data.helpfulTip || "Use PDF Export (click PDF tab above) - takes only 10 seconds!",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to import");
      }

      if (data.success && data.data) {
        const resume = convertToResume(data.data);
        setResumeData(resume);
        setCurrentStep('preview');
        
        toast({
          title: "✅ Imported Successfully!",
          description: `Used ${data.method} to extract your data`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // PDF Import
  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Please sign in first");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/linkedin/import-pdf", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse PDF");
      }

      const resume = convertToResume(data.profile);
      setResumeData(resume);
      setCurrentStep('preview');

      toast({
        title: "✅ PDF Imported!",
        description: "Your profile has been extracted",
      });
    } catch (error: any) {
      toast({
        title: "PDF Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Manual Text Import - Using existing working resume generation
  const handleManualImport = async () => {
    if (!userName.trim()) {
      toast({
        title: "Please enter your name",
        description: "Your name is required to generate the resume",
        variant: "destructive",
      });
      return;
    }

    if (!userEmail.trim()) {
      toast({
        title: "Please enter your email",
        description: "Your email is required to generate the resume",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!manualText.trim()) {
      toast({
        title: "Please enter job description",
        description: "Tell us about the role you're targeting",
        variant: "destructive",
      });
      return;
    }

    if (manualText.trim().length < 10) {
      toast({
        title: "Please provide more information",
        description: "Tell us more about the role (at least 10 characters)",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Please sign in first");

      // Use existing working resume generation API
      const response = await fetch("/api/generate/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          prompt: manualText.trim(),
          name: userName.trim(),
          email: userEmail.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Provide detailed error message
        const errorMsg = data.details || data.error || "Failed to generate resume";
        console.error("Resume generation error:", { status: response.status, data });
        throw new Error(errorMsg);
      }

      // Calculate ATS score
      const atsScore = calculateATSScore(data);
      
      // Convert to resume format with proper skills structure
      const resume = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        website: "",
        headline: data.name || "",
        summary: data.summary || "",
        experience: data.experience || [],
        education: data.education || [],
        skills: data.skills || {}, // Keep as object for resume-preview compatibility
        certifications: data.certifications || [],
        languages: [],
        projects: data.projects || [],
      };
      
      setResumeData(resume);
      setAtsScore(atsScore);
      setCurrentStep('preview');

      toast({
        title: "✨ Resume Generated!",
        description: `ATS Score: ${atsScore?.score}% (${atsScore?.grade} Grade)`,
      });
    } catch (error: any) {
      console.error("Resume generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again with more details",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Helper function to convert skills object to array
  const convertSkillsToArray = (skills: any): string[] => {
    if (Array.isArray(skills)) return skills;
    if (!skills) return [];
    
    const skillsArray: string[] = [];
    if (skills.technical) skillsArray.push(...skills.technical);
    if (skills.programming) skillsArray.push(...skills.programming);
    if (skills.tools) skillsArray.push(...skills.tools);
    if (skills.soft) skillsArray.push(...skills.soft);
    
    return skillsArray;
  };

  // Calculate ATS Score
  const calculateATSScore = (resume: any): any => {
    let score = 0;
    const feedback: string[] = [];
    const improvements: string[] = [];

    // Check contact info (20 points)
    if (resume.name && resume.name !== 'Your Name') {
      score += 5;
    } else {
      improvements.push("Add your full name");
    }
    
    if (resume.email && resume.email.includes('@')) {
      score += 5;
    } else {
      improvements.push("Add a professional email");
    }
    
    if (resume.phone) {
      score += 5;
    } else {
      improvements.push("Add phone number");
    }
    
    if (resume.location) {
      score += 5;
    } else {
      improvements.push("Add your location");
    }

    // Check professional summary (15 points)
    if (resume.summary && resume.summary.length > 100) {
      score += 15;
      feedback.push("✅ Strong professional summary");
    } else {
      score += 5;
      improvements.push("Expand professional summary to 3-4 sentences");
    }

    // Check experience (30 points)
    const exp = resume.experience || [];
    if (exp.length >= 2) {
      score += 10;
      feedback.push("✅ Multiple work experiences listed");
    } else if (exp.length === 1) {
      score += 5;
      improvements.push("Add more work experience");
    } else {
      improvements.push("Add work experience section");
    }

    // Check for quantifiable achievements
    const hasMetrics = exp.some((e: any) => {
      const desc = Array.isArray(e.description) ? e.description.join(' ') : (e.description || '');
      return /\d+%|\$\d+|\d+\+/.test(desc);
    });
    
    if (hasMetrics) {
      score += 10;
      feedback.push("✅ Includes quantifiable achievements");
    } else {
      improvements.push("Add numbers/metrics to achievements (e.g., 'increased sales by 25%')");
    }

    // Check achievement count
    const totalAchievements = exp.reduce((sum: number, e: any) => {
      const desc = e.description || [];
      return sum + (Array.isArray(desc) ? desc.length : 0);
    }, 0);
    
    if (totalAchievements >= 6) {
      score += 10;
      feedback.push("✅ Detailed work achievements");
    } else {
      improvements.push("Add 3-5 achievements per role");
    }

    // Check education (15 points)
    const edu = resume.education || [];
    if (edu.length > 0) {
      score += 10;
      feedback.push("✅ Education included");
      if (edu[0].gpa) {
        score += 5;
        feedback.push("✅ GPA mentioned");
      }
    } else {
      improvements.push("Add education section");
    }

    // Check skills (15 points)
    const skills = convertSkillsToArray(resume.skills);
    const totalSkills = skills.length;
    
    if (totalSkills >= 10) {
      score += 15;
      feedback.push("✅ Comprehensive skills list");
    } else if (totalSkills >= 5) {
      score += 10;
      improvements.push("Add more relevant skills (aim for 10-15)");
    } else {
      score += 5;
      improvements.push("Add technical and soft skills");
    }

    // Check certifications (5 points)
    if (resume.certifications && resume.certifications.length > 0) {
      score += 5;
      feedback.push("✅ Certifications included");
    } else {
      improvements.push("Add relevant certifications if available");
    }

    // Determine grade
    let grade = 'F';
    let color = 'red';
    if (score >= 90) {
      grade = 'A';
      color = 'green';
      feedback.push("🎉 Excellent! Your resume is ATS-optimized");
    } else if (score >= 80) {
      grade = 'B';
      color = 'blue';
      feedback.push("👍 Good! A few tweaks will make it perfect");
    } else if (score >= 70) {
      grade = 'C';
      color = 'yellow';
      feedback.push("⚠️ Decent, but needs improvement");
    } else if (score >= 60) {
      grade = 'D';
      color = 'orange';
      feedback.push("⚠️ Needs significant improvement");
    } else {
      color = 'red';
      feedback.push("❌ Needs major improvements for ATS compatibility");
    }

    return {
      score,
      grade,
      color,
      feedback,
      improvements,
      breakdown: {
        contactInfo: Math.min(20, score >= 20 ? 20 : (score > 0 ? 10 : 0)),
        summary: resume.summary ? 15 : 5,
        experience: Math.min(30, totalAchievements >= 6 ? 30 : 15),
        education: edu.length > 0 ? 15 : 0,
        skills: Math.min(15, totalSkills >= 10 ? 15 : 8),
        certifications: resume.certifications?.length > 0 ? 5 : 0
      }
    };
  };

  // Convert LinkedIn profile to resume format
  const convertToResume = (profile: LinkedInProfile) => {
    return {
      name: profile.fullName || "",
      email: "",
      phone: "",
      location: profile.location || "",
      website: "",
      headline: profile.headline || "",
      summary: profile.summary || "",
      experience: profile.experience || [],
      education: profile.education || [],
      skills: profile.skills || [],
      certifications: profile.certifications || [],
      languages: profile.languages || [],
    };
  };

  // Download PDF
  const downloadPDF = () => {
    toast({
      title: "Downloading PDF...",
      description: "Your resume will download shortly",
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background - Matching Landing Page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="mesh-gradient opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-r from-amber-400/8 to-orange-400/8 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header - Matching Landing Page Style */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-blue-200/30 mb-6 hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
              <span className="text-sm font-semibold bolt-gradient-text">AI-Powered Resume Builder</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              <span className="block mb-2">Create Your Perfect Resume</span>
              <span className="bolt-gradient-text">In Seconds, Not Hours</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Import from LinkedIn, upload PDF, or paste your info. Our advanced AI does the rest! ✨
            </p>
          </div>

        {currentStep === 'input' ? (
          /* Input Section */
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Import Methods */}
            <Card className="card-sky hover-sky border-2 border-blue-200/50 hover:border-blue-300/70 shadow-xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold professional-heading">
                  <span className="bolt-gradient-text">Import Your Profile</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Choose your preferred method to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="linkedin" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 glass-effect">
                    <TabsTrigger value="linkedin" className="text-xs md:text-sm data-[state=active]:bolt-gradient data-[state=active]:text-white">
                      <Globe className="h-4 w-4 mr-1" />
                      <span className="hidden md:inline">LinkedIn</span>
                      <span className="md:hidden">URL</span>
                    </TabsTrigger>
                    <TabsTrigger value="pdf" className="text-xs md:text-sm data-[state=active]:sunset-gradient data-[state=active]:text-white">
                      <Upload className="h-4 w-4 mr-1" />
                      PDF
                    </TabsTrigger>
                    <TabsTrigger value="text" className="text-xs md:text-sm data-[state=active]:forest-gradient data-[state=active]:text-white">
                      <FileText className="h-4 w-4 mr-1" />
                      Text
                    </TabsTrigger>
                  </TabsList>

                  {/* LinkedIn Tab */}
                  <TabsContent value="linkedin" className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Linkedin className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">LinkedIn Import</h3>
                          <p className="text-sm text-gray-600">Feature In Progress</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-200">
                          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Coming Soon!</p>
                            <p className="text-xs text-gray-600">
                              We're working on LinkedIn URL import feature. It will be available soon!
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Use Quick Generate Instead</p>
                            <p className="text-xs text-gray-600">
                              For now, use the &quot;Quick Generate&quot; tab. Just enter your name, email, and job description!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 opacity-50 pointer-events-none">
                      <Label htmlFor="linkedin-url" className="text-sm font-medium">
                        LinkedIn Profile URL
                      </Label>
                      <Input
                        id="linkedin-url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="bg-white/50"
                        disabled
                      />
                      <p className="text-xs text-gray-500">
                        Example: https://linkedin.com/in/billgates
                      </p>
                    </div>
                    <Button
                      onClick={handleLinkedInImport}
                      disabled={isImporting}
                      className="w-full bolt-gradient hover:scale-105 transition-all duration-300 bolt-glow text-white shadow-lg"
                      size="lg"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <span className="font-semibold">Importing...</span>
                        </>
                      ) : (
                        <>
                          <Linkedin className="mr-2 h-5 w-5" />
                          <span className="font-semibold">Import from LinkedIn</span>
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  {/* PDF Tab */}
                  <TabsContent value="pdf" className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="pdf-upload" className="text-sm font-medium">
                        Upload LinkedIn PDF Export
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-yellow-400 transition-colors cursor-pointer bg-white/30">
                        <input
                          type="file"
                          id="pdf-upload"
                          accept="application/pdf"
                          onChange={handlePdfImport}
                          className="hidden"
                        />
                        <label htmlFor="pdf-upload" className="cursor-pointer">
                          <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm font-medium text-gray-700">
                            Click to upload PDF
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            LinkedIn profile export only
                          </p>
                        </label>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800 font-medium mb-2">
                        💡 How to export from LinkedIn:
                      </p>
                      <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Go to your LinkedIn profile</li>
                        <li>Click &quot;More&quot; → &quot;Save to PDF&quot;</li>
                        <li>Upload the downloaded PDF here</li>
                      </ol>
                    </div>
                  </TabsContent>

                  {/* Manual Text Tab - Using Working Resume Generation */}
                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="user-name" className="text-sm font-medium">
                          Your Name *
                        </Label>
                        <Input
                          id="user-name"
                          placeholder="e.g., John Doe"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="bg-white/50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="user-email" className="text-sm font-medium">
                          Your Email *
                        </Label>
                        <Input
                          id="user-email"
                          type="email"
                          placeholder="e.g., john.doe@example.com"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="bg-white/50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="manual-text" className="text-sm font-medium flex items-center gap-2">
                          Job Description / Target Role *
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs rounded-full font-bold">
                            AI-Powered ✨
                          </span>
                        </Label>
                        <Textarea
                          id="manual-text"
                          placeholder="Describe the job role you're targeting:

Example:
Full Stack Developer with 5 years of experience
Expert in React, Node.js, Python, AWS
Led team of 10 developers
Increased performance by 40%
Bachelor's in Computer Science
Certified AWS Solutions Architect
..."
                          value={manualText}
                          onChange={(e) => setManualText(e.target.value)}
                          className="min-h-[180px] bg-white/50 resize-none"
                        />
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0 animate-pulse" />
                        <p className="text-xs text-gray-700">
                          <strong className="text-blue-700">AI will create:</strong> Complete professional resume with 
                          proper formatting, quantified achievements, and ATS optimization + instant compatibility score!
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleManualImport}
                      disabled={isImporting}
                      className="w-full forest-gradient hover:scale-105 transition-all duration-300 text-white shadow-lg"
                      size="lg"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <span className="font-semibold">Generating Professional Resume...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          <span className="font-semibold">Generate Resume with AI</span>
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Right: Benefits/Features - Enhanced Matching Landing Page */}
            <Card className="card-coral hover-coral border-2 border-amber-200/50 hover:border-amber-300/70 shadow-xl backdrop-blur-xl hidden lg:block">
              <CardHeader>
                <CardTitle className="text-2xl font-bold professional-heading">
                  <span className="sunset-gradient-text">Why Use Our Builder? ✨</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 forest-gradient rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold professional-heading mb-1">ATS-Optimized</h3>
                    <p className="text-sm text-muted-foreground">
                      Resumes formatted to pass Applicant Tracking Systems
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bolt-gradient rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold professional-heading mb-1">AI-Powered</h3>
                    <p className="text-sm text-muted-foreground">
                      Intelligent parsing extracts data from any format
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 cosmic-gradient rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold professional-heading mb-1">Export Anywhere</h3>
                    <p className="text-sm text-muted-foreground">
                      Download as PDF or DOCX, ready to send
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 sunset-gradient rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform">
                    <Linkedin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold professional-heading mb-1">LinkedIn Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Import directly from LinkedIn or PDF export
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-4 glass-effect rounded-lg border border-blue-200/30 hover:scale-105 transition-transform">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-500 animate-pulse mt-0.5" />
                    <p className="text-sm professional-text">
                      <strong className="bolt-gradient-text">Pro Tip:</strong> For best results, use PDF export from LinkedIn.
                      It&apos;s 100% reliable and includes all your data!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Preview Section with ATS Score and AI Chat */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Resume Preview */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="card-lavender hover-lavender border-2 border-purple-200/50 hover:border-purple-300/70 shadow-xl backdrop-blur-xl">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold professional-heading mb-2">
                      <span className="cosmic-gradient-text">Your Resume Preview</span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                      Review, edit, and download your professional resume
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAIChat(!showAIChat)}
                      className="border-purple-300/50 hover:border-purple-400 hover:scale-105 transition-all"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {showAIChat ? 'Hide' : 'Show'} AI Coach
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('input')}
                      className="border-purple-300/50 hover:border-purple-400 hover:scale-105 transition-all"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Edit Data
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resume Preview */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-8 shadow-lg">
                    <ResumePreview resume={resumeData} template="modern" />
                  </div>

                  {/* Download Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={downloadPDF}
                      className="flex-1 bolt-gradient hover:scale-105 transition-all duration-300 bolt-glow text-white shadow-lg"
                      size="lg"
                    >
                      <FileDown className="mr-2 h-5 w-5" />
                      <span className="font-semibold">Download PDF</span>
                    </Button>
                    <Button
                      onClick={downloadPDF}
                      className="flex-1 sunset-gradient hover:scale-105 transition-all duration-300 text-white shadow-lg"
                      size="lg"
                    >
                      <FileDown className="mr-2 h-5 w-5" />
                      <span className="font-semibold">Download DOCX</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: ATS Score & AI Chat */}
            <div className="space-y-6">
              {/* ATS Score */}
              {atsScore && <ATSScoreDisplay atsScore={atsScore} />}

              {/* AI Chat */}
              {showAIChat && (
                <AIResumeChat 
                  resumeData={resumeData} 
                  onResumeUpdate={(updated: any) => setResumeData(updated)}
                />
              )}

              {/* Quick Tips */}
              {!showAIChat && (
                <Card className="glass-effect border-2 border-blue-200/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <span>Pro Tips</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Use the AI Coach to improve your resume in real-time</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Target 85%+ ATS score for best results</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Add metrics and numbers to achievements</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Use keywords from your target job description</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
