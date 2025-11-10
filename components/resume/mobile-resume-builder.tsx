"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { 
  FileText, Upload, Globe, Sparkles, Download, 
  Linkedin, FileDown, Loader2, CheckCircle2, AlertCircle, Edit, MessageSquare,
  ExternalLink, Copy, Check, Crown, FileCheck, Share2
} from "lucide-react";
import { ResumePreview, ResumePreviewRef } from "./resume-preview";
import { ATSScoreDisplay } from "./ats-score-display";
import { AIResumeChat } from "./ai-resume-chat";
import { RESUME_TEMPLATES } from "@/lib/resume-template-data";
import { userProfileService } from "@/lib/user-profile-service";
import { TemplateCustomizationPanel } from "@/components/templates/template-customization-panel";
import { VersionHistoryPanel } from "@/components/templates/version-history-panel";
import { CollaborationPanel } from "@/components/templates/collaboration-panel";
import { versionHistoryService } from "@/lib/version-history-service";

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

interface MobileResumeBuilderProps {
  templateId?: string | null;
}

export function MobileResumeBuilder({ templateId }: MobileResumeBuilderProps) {
  const { toast } = useToast();
  const resumePreviewRef = useRef<ResumePreviewRef>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [atsScore, setAtsScore] = useState<any>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currentStep, setCurrentStep] = useState<'selection' | 'input' | 'preview'>('selection');
  const [showAIChat, setShowAIChat] = useState(false);
  const [isCV, setIsCV] = useState(false); // Toggle between Resume (1 page) and CV (2+ pages)
  const [showSubdomainDialog, setShowSubdomainDialog] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  const supabase = createClient();

  // Load template data if templateId is provided
  useEffect(() => {
    console.log('Template ID received:', templateId);
    if (templateId) {
      const template = RESUME_TEMPLATES.find(t => t.id === templateId);
      console.log('Template found:', template);
      if (template) {
        // Initialize with template data - create a basic resume structure
        const templateResume = {
          personalInfo: {
            fullName: "Your Name",
            email: "your.email@example.com",
            phone: "+1 (555) 000-0000",
            location: "City, State",
            linkedin: "",
            portfolio: "",
            summary: "Professional summary goes here. Click to edit and add your information."
          },
          experience: [
            {
              company: "Example Company",
              position: "Your Position",
              location: "City, State",
              startDate: "Jan 2020",
              endDate: "Present",
              isCurrent: true,
              description: [
                "Click to edit your experience. Add your achievements and responsibilities here.",
                "Describe your key accomplishments and impact",
                "Use action verbs and quantify results when possible"
              ]
            }
          ],
          education: [
            {
              institution: "Your University",
              degree: "Your Degree",
              fieldOfStudy: "Your Major",
              location: "City, State",
              startDate: "2016",
              endDate: "2020",
              gpa: "3.5"
            }
          ],
          skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
          projects: [],
          certifications: []
        };
        
        console.log('Setting resume data:', templateResume);
        setResumeData(templateResume);
        setSelectedTemplate(template.id);
        setCurrentStep('preview');
        
        toast({
          title: "✨ Template Loaded!",
          description: `Using ${template.title}. Click on any section to edit with your information.`,
        });
      } else {
        console.error('Template not found for ID:', templateId);
        toast({
          title: "Template Not Found",
          description: "The selected template could not be loaded. Please try another template.",
          variant: "destructive",
        });
      }
    }
  }, [templateId, toast]);

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

  // Publish resume to subdomain
  const handlePublishToSubdomain = async () => {
    if (!subdomain.trim()) {
      toast({
        title: "Subdomain required",
        description: "Please enter a subdomain name",
        variant: "destructive",
      });
      return;
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      toast({
        title: "Invalid subdomain",
        description: "Use only lowercase letters, numbers, and hyphens",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Please sign in first");

      const response = await fetch("/api/resume/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          subdomain,
          resumeData,
          isCV,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish");
      }

      setIsPublished(true);
      setPublishedUrl(data.data.url);
      setShowSubdomainDialog(false);
      
      toast({
        title: "🎉 Resume Published!",
        description: `Your ${isCV ? 'CV' : 'resume'} is live! Visit: ${data.data.url}`,
      });
    } catch (error: any) {
      toast({
        title: "Publishing failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Copy subdomain URL
  const copySubdomainUrl = () => {
    if (!publishedUrl) return;
    navigator.clipboard.writeText(publishedUrl);
    toast({
      title: "Copied!",
      description: "Resume URL copied to clipboard",
    });
  };

  // Share resume using native share API (works on mobile and some desktop browsers)
  const handleNativeShare = async () => {
    if (!publishedUrl) {
      toast({
        title: "No URL to share",
        description: "Please publish your resume first",
        variant: "destructive",
      });
      return;
    }

    const shareData = {
      title: `${resumeData?.name || 'My'} Professional ${isCV ? 'CV' : 'Resume'}`,
      text: `Check out my professional ${isCV ? 'CV' : 'resume'} created with DocMagic!`,
      url: publishedUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Resume shared via native share",
        });
      } else {
        // Fallback: open share dialog with platform options
        setShowShareDialog(true);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // User didn't cancel, show platform options
        setShowShareDialog(true);
      }
    }
  };

  // Share on WhatsApp
  const shareOnWhatsApp = () => {
    if (!publishedUrl) return;
    const text = encodeURIComponent(`Check out my professional ${isCV ? 'CV' : 'resume'}: ${publishedUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Share on LinkedIn
  const shareOnLinkedIn = () => {
    if (!publishedUrl) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publishedUrl)}`, '_blank');
  };

  // Share via Email
  const shareViaEmail = () => {
    if (!publishedUrl) return;
    const subject = encodeURIComponent(`My Professional ${isCV ? 'CV' : 'Resume'}`);
    const body = encodeURIComponent(`Hi,\n\nI'd like to share my professional ${isCV ? 'CV' : 'resume'} with you:\n\n${publishedUrl}\n\nCreated with DocMagic - Professional Document Builder`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Share on Twitter/X
  const shareOnTwitter = () => {
    if (!publishedUrl) return;
    const text = encodeURIComponent(`Check out my professional ${isCV ? 'CV' : 'resume'}!`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(publishedUrl)}`, '_blank');
  };

  // Share on Facebook
  const shareOnFacebook = () => {
    if (!publishedUrl) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publishedUrl)}`, '_blank');
  };

  // Share on Telegram
  const shareOnTelegram = () => {
    if (!publishedUrl) return;
    const text = encodeURIComponent(`Check out my professional ${isCV ? 'CV' : 'resume'}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(publishedUrl)}&text=${text}`, '_blank');
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
          <div className="text-center mb-6 sm:mb-12 lg:mb-16 px-4">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-effect border border-blue-200/30 mb-4 sm:mb-6 hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold bolt-gradient-text">AI-Powered Resume Builder</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="block mb-1 sm:mb-2">Create Your Perfect Resume</span>
              <span className="bolt-gradient-text">In Seconds, Not Hours</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Import from LinkedIn, upload PDF, or paste your info. Our advanced AI does the rest! ✨
            </p>
          </div>

        {currentStep === 'selection' ? (
          /* Initial Selection: Resume or CV */
          <div className="max-w-4xl mx-auto px-4">
            <Card className="glass-effect border-2 border-blue-200/50 shadow-2xl">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-3xl font-bold mb-4">
                  <span className="bolt-gradient-text">What would you like to create?</span>
                </CardTitle>
                <CardDescription className="text-lg">
                  Choose the format that best suits your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Resume Option */}
                  <button
                    onClick={() => {
                      setIsCV(false);
                      setCurrentStep('input');
                    }}
                    className="group relative p-8 rounded-xl border-2 border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="absolute top-4 right-4">
                      <FileCheck className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Resume</h3>
                      <p className="text-gray-600 mb-4">Perfect for job applications</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Fits on <strong>1 page</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Concise and focused</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>ATS-optimized format</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Quick to review</span>
                        </li>
                      </ul>
                      <div className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-center font-semibold group-hover:bg-blue-700 transition-colors">
                        Create Resume
                      </div>
                    </div>
                  </button>

                  {/* CV Option */}
                  <button
                    onClick={() => {
                      setIsCV(true);
                      setCurrentStep('input');
                    }}
                    className="group relative p-8 rounded-xl border-2 border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="absolute top-4 right-4">
                      <FileText className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">CV (Curriculum Vitae)</h3>
                      <p className="text-gray-600 mb-4">For academic & detailed profiles</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>2+ pages</strong> allowed</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Comprehensive details</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Research & publications</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Full career history</span>
                        </li>
                      </ul>
                      <div className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg text-center font-semibold group-hover:bg-purple-700 transition-colors">
                        Create CV
                      </div>
                    </div>
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-2 border-amber-200 dark:border-amber-700">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Not sure which to choose?</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Choose Resume</strong> if you're applying for jobs in the US, Canada, or most industries.
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Choose CV</strong> if you're in academia, research, or need to showcase extensive experience.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : currentStep === 'input' ? (
          /* Input Section */
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-0">
            {/* Left: Import Methods */}
            <Card className="card-sky hover-sky border-2 border-blue-200/50 hover:border-blue-300/70 shadow-xl backdrop-blur-xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-bold professional-heading">
                  <span className="bolt-gradient-text">Import Your Profile</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm sm:text-base">
                  Choose your preferred method to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Tabs defaultValue="linkedin" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 glass-effect h-auto">
                    <TabsTrigger value="linkedin" className="text-xs sm:text-sm data-[state=active]:bolt-gradient data-[state=active]:text-white py-2 sm:py-2.5">
                      <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                      <span className="hidden sm:inline">LinkedIn</span>
                      <span className="sm:hidden">URL</span>
                    </TabsTrigger>
                    <TabsTrigger value="pdf" className="text-xs sm:text-sm data-[state=active]:sunset-gradient data-[state=active]:text-white py-2 sm:py-2.5">
                      <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                      PDF
                    </TabsTrigger>
                    <TabsTrigger value="text" className="text-xs sm:text-sm data-[state=active]:forest-gradient data-[state=active]:text-white py-2 sm:py-2.5">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                      Text
                    </TabsTrigger>
                  </TabsList>

                  {/* LinkedIn Tab */}
                  <TabsContent value="linkedin" className="space-y-3 sm:space-y-4">
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Linkedin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-gray-900">LinkedIn Import</h3>
                          <p className="text-xs sm:text-sm text-gray-600">Feature In Progress</p>
                        </div>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-white rounded-lg border border-blue-200">
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900 mb-0.5 sm:mb-1">Coming Soon!</p>
                            <p className="text-[10px] sm:text-xs text-gray-600">
                              We're working on LinkedIn URL import feature. It will be available soon!
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900 mb-0.5 sm:mb-1">Use Quick Generate Instead</p>
                            <p className="text-[10px] sm:text-xs text-gray-600">
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
                      className="w-full bolt-gradient hover:scale-105 transition-all duration-300 bolt-glow text-white shadow-lg text-sm sm:text-base"
                      size="lg"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <span className="font-semibold text-white">Importing...</span>
                        </>
                      ) : (
                        <>
                          <Linkedin className="mr-2 h-5 w-5" />
                          <span className="font-semibold text-white">Import from LinkedIn</span>
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  {/* PDF Tab */}
                  <TabsContent value="pdf" className="space-y-3 sm:space-y-4">
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="pdf-upload" className="text-sm font-medium">
                        Upload LinkedIn PDF Export
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 text-center hover:border-yellow-400 transition-colors cursor-pointer bg-white/30">
                        <input
                          type="file"
                          id="pdf-upload"
                          accept="application/pdf"
                          onChange={handlePdfImport}
                          className="hidden"
                        />
                        <label htmlFor="pdf-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
                          <p className="text-xs sm:text-sm font-medium text-gray-700">
                            Click to upload PDF
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            LinkedIn profile export only
                          </p>
                        </label>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-blue-800 font-medium mb-1.5 sm:mb-2">
                        💡 How to export from LinkedIn:
                      </p>
                      <ol className="text-[10px] sm:text-xs text-blue-700 space-y-0.5 sm:space-y-1 list-decimal list-inside">
                        <li>Go to your LinkedIn profile</li>
                        <li>Click &quot;More&quot; → &quot;Save to PDF&quot;</li>
                        <li>Upload the downloaded PDF here</li>
                      </ol>
                    </div>
                  </TabsContent>

                  {/* Manual Text Tab - Using Working Resume Generation */}
                  <TabsContent value="text" className="space-y-3 sm:space-y-4">
                    <div className="space-y-2 sm:space-y-3">
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
                      <div className="flex items-start gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 mt-0.5 flex-shrink-0 animate-pulse" />
                        <p className="text-[10px] sm:text-xs text-gray-700">
                          <strong className="text-blue-700">AI will create:</strong> Complete professional resume with 
                          proper formatting, quantified achievements, and ATS optimization + instant compatibility score!
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleManualImport}
                      disabled={isImporting}
                      className="w-full forest-gradient hover:scale-105 transition-all duration-300 text-white shadow-lg text-sm sm:text-base"
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
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-bold professional-heading">
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
                  {/* Resume/CV Toggle */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex flex-col">
                      <Label htmlFor="cv-mode" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {isCV ? 'CV Mode (2+ pages)' : 'Resume Mode (1 page)'}
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {isCV ? 'Allows multiple pages for detailed experience' : 'Fits content to a single page'}
                      </p>
                    </div>
                    <Switch
                      id="cv-mode"
                      checked={isCV}
                      onCheckedChange={setIsCV}
                    />
                  </div>


                  {/* Resume Preview */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-8 shadow-lg">
                    <ResumePreview 
                      ref={resumePreviewRef}
                      resume={resumeData} 
                      template={selectedTemplate}
                      showControls={false}
                      isCV={isCV}
                    />
                  </div>

                  {/* Download & Edit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => resumePreviewRef.current?.exportToPDF()}
                      className="flex-1 bolt-gradient hover:scale-105 transition-all duration-300 bolt-glow text-white shadow-lg"
                      size="lg"
                    >
                      <FileDown className="mr-2 h-5 w-5" />
                      <span className="font-semibold">Download {isCV ? 'CV' : 'Resume'} PDF</span>
                    </Button>
                    <Button
                      onClick={() => resumePreviewRef.current?.exportToWord()}
                      className="flex-1 sunset-gradient hover:scale-105 transition-all duration-300 text-white shadow-lg"
                      size="lg"
                    >
                      <FileDown className="mr-2 h-5 w-5" />
                      <span className="font-semibold">Download DOCX</span>
                    </Button>
                    <Button
                      onClick={() => resumePreviewRef.current?.toggleEdit()}
                      variant="outline"
                      className="flex-1 hover:scale-105 transition-all duration-300"
                      size="lg"
                    >
                      <Edit className="mr-2 h-5 w-5" />
                      <span className="font-semibold">Edit {isCV ? 'CV' : 'Resume'}</span>
                    </Button>
                  </div>

                  {/* Publish Online Section */}
                  <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200 dark:border-green-700">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                          Publish Your {isCV ? 'CV' : 'Resume'} Online
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get a free subdomain or use your custom domain (premium)
                        </p>
                      </div>
                    </div>

                    {isPublished && subdomain ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-300 dark:border-green-600">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                              <span className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                                {publishedUrl || `${subdomain}.docmagic.app`}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={copySubdomainUrl}
                                className="flex-shrink-0"
                                title="Copy URL"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleNativeShare}
                                className="flex-shrink-0"
                                title="Share"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(publishedUrl, '_blank')}
                                className="flex-shrink-0"
                                title="Open in new tab"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowSubdomainDialog(true)}
                          variant="outline"
                          className="w-full"
                        >
                          Change Subdomain
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowSubdomainDialog(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:scale-105 transition-all"
                        size="lg"
                      >
                        <Globe className="mr-2 h-5 w-5" />
                        Publish Online (Free)
                      </Button>
                    )}
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

      {/* Subdomain Publishing Dialog */}
      <Dialog open={showSubdomainDialog} onOpenChange={setShowSubdomainDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              <span className="bolt-gradient-text">Publish Your {isCV ? 'CV' : 'Resume'} Online</span>
            </DialogTitle>
            <DialogDescription>
              Choose how you want to host your {isCV ? 'CV' : 'resume'} online
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Free Subdomain Option */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Free Subdomain</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">yourname.docmagic.app</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="subdomain">Choose your subdomain</Label>
                <div className="flex gap-2">
                  <Input
                    id="subdomain"
                    placeholder="yourname"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1"
                  />
                  <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    .docmagic.app
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <Button
                onClick={handlePublishToSubdomain}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Globe className="mr-2 h-5 w-5" />
                Publish to Subdomain (Free)
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or</span>
              </div>
            </div>

            {/* Custom Domain Option (Premium) */}
            <div className="space-y-4 opacity-75">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    Custom Domain
                    <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">
                      PREMIUM
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">yourdomain.com</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="custom-domain">Your custom domain</Label>
                <Input
                  id="custom-domain"
                  placeholder="www.yourdomain.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </div>

              <Button
                disabled
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                size="lg"
              >
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Premium
              </Button>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Premium features:</strong> Custom domain, remove branding, advanced analytics, priority support
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Share2 className="h-6 w-6 text-blue-600" />
              <span className="bolt-gradient-text">Share Your {isCV ? 'CV' : 'Resume'}</span>
            </DialogTitle>
            <DialogDescription>
              Share your professional {isCV ? 'CV' : 'resume'} with recruiters, colleagues, or on social media
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* URL Display */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your resume URL:</p>
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                {publishedUrl}
              </p>
            </div>

            {/* Social Media Platforms */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Share on Social Media
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={shareOnWhatsApp}
                  variant="outline"
                  className="w-full justify-start hover:bg-green-50 hover:border-green-500 dark:hover:bg-green-900/20"
                >
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </Button>

                <Button
                  onClick={shareOnLinkedIn}
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-500 dark:hover:bg-blue-900/20"
                >
                  <Linkedin className="mr-2 h-5 w-5" />
                  LinkedIn
                </Button>

                <Button
                  onClick={shareOnTwitter}
                  variant="outline"
                  className="w-full justify-start hover:bg-sky-50 hover:border-sky-500 dark:hover:bg-sky-900/20"
                >
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter/X
                </Button>

                <Button
                  onClick={shareOnFacebook}
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-600 dark:hover:bg-blue-900/20"
                >
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>

                <Button
                  onClick={shareOnTelegram}
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-400 dark:hover:bg-blue-900/20"
                >
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </Button>

                <Button
                  onClick={shareViaEmail}
                  variant="outline"
                  className="w-full justify-start hover:bg-gray-50 hover:border-gray-500 dark:hover:bg-gray-800"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </Button>
              </div>
            </div>

            {/* Copy Link Button */}
            <div className="pt-2">
              <Button
                onClick={() => {
                  copySubdomainUrl();
                  setShowShareDialog(false);
                }}
                variant="outline"
                className="w-full"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
