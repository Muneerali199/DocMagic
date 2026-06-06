"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResumePreview } from "@/components/resume/resume-preview";
import { exportToLaTeXFile } from "@/lib/resume/latex-exporter";
import { ResumeTemplates } from "@/components/resume/resume-templates";
import { TemplateSwitcher } from "@/components/resume/template-switcher";
import { GuidedResumeGenerator } from "@/components/resume/guided-resume-generator";
import { LinkedInImport } from "@/components/resume/linkedin-import";
import { TextColorPanel } from "@/components/resume/text-color-panel";
import { ResumeStyleColors, DEFAULT_STYLE_COLORS } from "@/lib/resume-style-colors";
import { useToast } from "@/hooks/use-toast";
import { useShare } from "@/hooks/use-share";
import { emailSchema, nameSchema } from "@/lib/validation";
import {
  File as FileIcon,
  Loader2,
  Sparkles,
  Maximize2,
  Minimize2,
  Download,
  User,
  Code,
  Mail,
  Wand2,
  Palette,
  Brain,
  Target,
  Zap,
  Share2,
  Copy,
  Globe,
  ExternalLink,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
  Send,
  FileDown,
  Check,
} from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { TooltipWithShortcut } from "../ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { logger } from "@/lib/logger";

type QuickResumeField = "name" | "email";
type QuickResumeErrors = Partial<Record<QuickResumeField, string>>;

export function ResumeGenerator({ initialSession }: { initialSession?: any }) {
  const supabaseClient = createClient();
  const { user, loading } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [quickFormErrors, setQuickFormErrors] = useState<QuickResumeErrors>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  // Persist selected template across sessions (#430)
  const [selectedTemplate, setSelectedTemplate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("draftdeck:selectedTemplate") ?? "professional";
    }
    return "professional";
  });
  const [previewKey, setPreviewKey] = useState(0); // bumped on template switch for fade animation
  const [isFullView, setIsFullView] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [resumeId, setResumeId] = useState<string>("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const [customColors, setCustomColors] = useState<ResumeStyleColors>({ ...DEFAULT_STYLE_COLORS });

  /** Switches template, persists choice to localStorage, triggers fade animation (#430) */
  const handleTemplateSwitch = useCallback((id: string) => {
    setSelectedTemplate(id);
    setPreviewKey((k) => k + 1);
    if (typeof window !== "undefined") {
      localStorage.setItem("draftdeck:selectedTemplate", id);
    }
  }, []);

  const isNameValid = name.length > 0 && nameSchema.safeParse(name).success;
  const isEmailValid = email.length > 0 && emailSchema.safeParse(email).success;

  const validateQuickField = (field: QuickResumeField, value: string) => {
    const schema = field === "name" ? nameSchema : emailSchema;
    const result = schema.safeParse(value);
    const errorMessage = result.success
      ? undefined
      : result.error.errors[0]?.message ?? "Invalid value";

    setQuickFormErrors((current) => {
      if (!errorMessage) {
        const nextErrors = { ...current };
        delete nextErrors[field];
        return nextErrors;
      }

      return {
        ...current,
        [field]: errorMessage,
      };
    });

    return result;
  };

  const validateQuickForm = () => {
    const validatedName = nameSchema.safeParse(name);
    const validatedEmail = emailSchema.safeParse(email);
    const nextErrors: QuickResumeErrors = {};

    if (!validatedName.success) {
      nextErrors.name =
        validatedName.error.errors[0]?.message ?? "Name is required";
    }

    if (!validatedEmail.success) {
      nextErrors.email =
        validatedEmail.error.errors[0]?.message ??
        "Please enter a valid email address";
    }

    if (!validatedName.success || !validatedEmail.success) {
      setQuickFormErrors(nextErrors);
      return null;
    }

    setQuickFormErrors({});

    return {
      name: validatedName.data,
      email: validatedEmail.data,
    };
  };

  const generateResume = async () => {
    const validatedQuickForm = validateQuickForm();

    if (!validatedQuickForm) {
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the resume you want to generate",
        variant: "destructive",
      });
      return;
    }

    const { name: validatedName, email: validatedEmail } = validatedQuickForm;

    if (validatedName !== name) {
      setName(validatedName);
    }

    if (validatedEmail !== email) {
      setEmail(validatedEmail);
    }

    setIsGenerating(true);

    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate a resume",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      const { data: { session } } = await supabaseClient.auth.getSession();

      const response = await fetch("/api/generate/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": session?.access_token ? `Bearer ${session.access_token}` : ""
        },
        body: JSON.stringify({
          prompt,
          name: validatedName,
          email: validatedEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate resume");
      }

      const data = await response.json();
      setResumeData(data);

      // Auto-save resume to history
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          await fetch('/api/resumes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              title: `${data.name || validatedName}'s Resume`,
              content: data,
              template: selectedTemplate,
              prompt: prompt || `Resume for ${data.name || validatedName}`,
              isPublic: false,
              customColors: customColors,
            }),
          });
          logger.info(null, '✅ Resume saved to history');
        }
      } catch (saveError) {
        console.error('Failed to auto-save resume:', saveError);
        // Don't show error to user - resume was still generated successfully
      }

      toast({
        title: "Resume generated! ✨",
        description: "Your tailored resume is ready to preview and download",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGuidedResumeGenerated = (resume: any) => {
    setResumeData(resume);
  };

  const handleLinkedInImport = (profile: any) => {
    logger.info(null, 'LinkedIn profile received:', profile);

    // Convert LinkedIn profile to resume format
    // Handle both 'name' and 'fullName' field
    const fullName = profile.fullName || profile.name || "";

    const resume = {
      name: fullName,
      email: profile.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      website: profile.website || profile.profileUrl || "",
      headline: profile.headline || "",
      summary: profile.summary || "",
      experience: profile.experience || [],
      education: profile.education || [],
      skills: profile.skills || [],
      certifications: profile.certifications || [],
      languages: profile.languages || [],
    };

    logger.info(null, 'Converted resume data:', resume);

    setResumeData(resume);
    setName(fullName);
    setEmail(profile.email || "");
    setQuickFormErrors({});

    // Log to verify state was updated
    setTimeout(() => {
      logger.info(null, 'Resume data state after update:', resume);
    }, 100);

    toast({
      title: "LinkedIn data imported! ✨",
      description: "Your profile has been converted to resume format. Review and customize as needed.",
    });
  };

  // Download functions
  const downloadPDF = async () => {
    if (!resumeData) return;

    setIsExporting(true);
    try {
      // First try the new @react-pdf/renderer vector PDF export for highest quality
      try {
        const { generateReactPDF } = await import('@/lib/resume/pdf-exporter');
        await generateReactPDF(resumeData, selectedTemplate);
        
        toast({
          title: "Resume downloaded!",
          description: "Your resume has been downloaded as a high-quality PDF.",
        });
        return; // Success! Exit early.
      } catch (reactPdfError) {
        console.error('Vector PDF generation failed, falling back to html2canvas:', reactPdfError);
        // Fall back to html2canvas if React PDF fails
      }

      const resumeElement = document.getElementById('resume-content');
      if (!resumeElement) {
        throw new Error('Resume content not found');
      }

      // Capture with better quality and proper sizing
      const canvas = await html2canvas(resumeElement, {
        scale: 3, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794, // A4 width in pixels at 96 DPI
        windowHeight: 1123, // A4 height in pixels at 96 DPI
        width: resumeElement.scrollWidth,
        height: resumeElement.scrollHeight,
        x: 0,
        y: 0
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Create PDF with proper A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      // Calculate proper dimensions to fit content
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / (imgWidth / 3.78), pdfHeight / (imgHeight / 3.78)); // Convert pixels to mm

      const finalWidth = (imgWidth / 3.78) * ratio;
      const finalHeight = (imgHeight / 3.78) * ratio;

      // Center the content
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = 0;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight, '', 'FAST');
      pdf.save(`${resumeData.name?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.pdf`);

      toast({
        title: "Resume downloaded!",
        description: "Your resume has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export failed",
        description: "Failed to export resume to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadDOCX = () => {
    toast({
      title: "Coming Soon",
      description: "Word export will be available in the next update.",
    });
  };

  const downloadLaTeX = async () => {
    if (!resumeData) return;
    setIsExporting(true);
    try {
      await exportToLaTeXFile(resumeData as any);
      toast({
        title: "Resume downloaded!",
        description: "Your LaTeX source has been downloaded.",
      });
    } catch (error) {
      console.error('Error exporting to LaTeX:', error);
      toast({
        title: "Export failed",
        description: "Failed to export resume to LaTeX. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Share functions
  const saveAndShareResume = async () => {
    if (!resumeData) return;

    setIsSaving(true);
    try {
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast({
          title: "Authentication Required",
          description: "Please sign in to save and share resumes.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: `${resumeData.name}'s Resume` || 'Untitled Resume',
          content: resumeData,
          template: selectedTemplate,
          prompt: prompt || `Resume for ${resumeData.name || 'Professional'}`,
          isPublic: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save resume');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
      setResumeId(data.id);
      setIsShareDialogOpen(true);

      await navigator.clipboard.writeText(data.shareUrl);
      toast({
        title: "🎉 Resume Shared!",
        description: "Share link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const {
    copyToClipboard: copyShareLink,
    shareViaEmail,
    shareViaWhatsApp,
    shareViaTwitter,
    shareViaLinkedIn,
    shareViaFacebook,
    shareViaTelegram,
    shareViaWebShare,
  } = useShare(shareUrl, {
    emailSubject: "Check out my resume!",
    emailBody: `I wanted to share my professional resume with you:\n\n${shareUrl}`,
    text: "Check out my professional resume!",
    title: "My Resume",
  });

  return (
    <>
      <div className={`space-y-6 transition-all duration-300 ${isFullView ? "p-0" : "px-2 sm:px-0"}`}>
        <Tabs defaultValue="guided" className="w-full">
          <div className={`flex justify-center mb-6 ${isFullView ? "hidden" : ""}`}>
            <TabsList className="glass-effect border border-yellow-400/20 p-1 h-auto flex overflow-x-auto scrollbar-hide gap-1 sm:gap-2 md:gap-4 w-full max-w-full">
              <TabsTrigger
                value="guided"
                className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm sm:text-base min-w-[140px] justify-center"
              >
                <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Smart Builder</span>
                <span className="sm:hidden">Smart</span>
              </TabsTrigger>
              <TabsTrigger
                value="quick"
                className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm sm:text-base min-w-[140px] justify-center"
              >
                <Wand2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Quick Generate</span>
                <span className="sm:hidden">Quick</span>
              </TabsTrigger>
              <TabsTrigger
                value="linkedin"
                className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm sm:text-base min-w-[140px] justify-center"
              >
                <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">LinkedIn Import</span>
                <span className="sm:hidden">LinkedIn</span>
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm sm:text-base min-w-[140px] justify-center"
              >
                <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Templates</span>
                <span className="sm:hidden">Templates</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="linkedin" className="space-y-6 pt-4">
            <LinkedInImport onImport={handleLinkedInImport} />
          </TabsContent>

          <TabsContent value="guided" className="space-y-6 pt-4">
            {/* Guided Resume Builder Content */}
            {!isFullView && (
              <>
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
                    Our AI-powered guided builder creates resumes that pass
                    Applicant Tracking Systems with perfect keyword optimization
                  </p>
                </div>
                <div className="glass-effect p-6 sm:p-8 rounded-2xl border border-yellow-400/20 relative overflow-hidden">
                  <div className="absolute inset-0 shimmer opacity-20"></div>
                  <div className="relative z-10">
                    <GuidedResumeGenerator onResumeGenerated={handleGuidedResumeGenerated} />
                  </div>
                </div>
              </>
            )}

            {resumeData && (
              <div className={`${isFullView ? "w-full" : ""}`}>
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

                <div
                  key={previewKey}
                  className={`glass-effect border border-yellow-400/20 rounded-xl overflow-hidden bg-white transition-all duration-300 animate-fade-in ${isFullView ? "fixed inset-4 z-50 shadow-2xl" : ""
                  }`}>
                  <div className="absolute inset-0 shimmer opacity-10"></div>
                  <div className="relative z-10">
                    <ResumePreview resume={resumeData} template={selectedTemplate} customColors={customColors} />
                  </div>
                </div>

                {/* Template Switcher (#430) */}
                <TemplateSwitcher
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleTemplateSwitch}
                  className="mt-4"
                />

                {/* Text Color Controls (#429) */}
                <div className="mt-4">
                  <TextColorPanel colors={customColors} onChange={setCustomColors} />
                </div>

                <div className="glass-effect p-4 rounded-xl border border-yellow-400/20 mt-6">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Download className="h-4 w-4 text-yellow-500" />
                    Download Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={downloadPDF}
                      disabled={isExporting}
                      variant="outline"
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                    >
                      {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      Download PDF
                    </Button>
                    <Button
                      onClick={downloadDOCX}
                      variant="outline"
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download DOCX
                    </Button>
                    <Button
                      onClick={downloadLaTeX}
                      disabled={isExporting}
                      variant="outline"
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                    >
                      {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Code className="mr-2 h-4 w-4" />}
                      Download LaTeX
                    </Button>
                    <Button
                      onClick={saveAndShareResume}
                      disabled={isSaving}
                      variant="outline"
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                    >
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                      Share Resume
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quick" className="space-y-6 pt-4">
            <div className={`grid grid-cols-1 ${isFullView ? "" : "lg:grid-cols-2"} gap-6 sm:gap-8`}>
              <div className={isFullView ? "hidden" : "space-y-6"}>
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
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Your Name
                      {isNameValid && (
                        <Check className="h-3 w-3 text-green-500" />
                      )}
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => {
                        const nextName = e.target.value;
                        setName(nextName);

                        if (quickFormErrors.name) {
                          validateQuickField("name", nextName);
                        }
                      }}
                      onBlur={() => validateQuickField("name", name)}
                      className={`glass-effect focus:ring-yellow-400/20 w-full text-base px-3 py-2 ${quickFormErrors.name
                        ? "border-red-400/60 focus:border-red-400/80"
                        : "border-yellow-400/30 focus:border-yellow-400/60"
                        }`}
                      disabled={isGenerating}
                    />
                    {quickFormErrors.name && (
                      <p className="text-xs text-red-500">
                        {quickFormErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                      {isEmailValid && (
                        <span className="text-green-500 text-xs">✓</span>
                      )}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => {
                        const nextEmail = e.target.value;
                        setEmail(nextEmail);

                        if (quickFormErrors.email) {
                          validateQuickField("email", nextEmail);
                        }
                      }}
                      onBlur={() => validateQuickField("email", email)}
                      className={`glass-effect focus:ring-yellow-400/20 w-full text-base px-3 py-2 ${quickFormErrors.email
                          ? "border-red-400/60 focus:border-red-400/80"
                          : "border-yellow-400/30 focus:border-yellow-400/60"
                        }`}
                      disabled={isGenerating}
                    />
                    {quickFormErrors.email && (
                      <p className="text-xs text-red-500">
                        {quickFormErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      Describe your ideal resume
                    </Label>
                    <Textarea
                      id="prompt"
                      placeholder="E.g., Senior React Developer resume for Google, highlighting frontend performance optimization and component architecture"
                      className="min-h-[120px] text-base glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20 resize-none w-full px-3 py-2"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>

                  <TooltipWithShortcut content="Generate a professional resume using AI based on your description">
                    <Button
                      onClick={generateResume}
                      disabled={
                        isGenerating ||
                        !prompt.trim() ||
                        !name.trim() ||
                        !email.trim() ||
                        Boolean(quickFormErrors.name) ||
                        Boolean(quickFormErrors.email)
                      }
                      className="w-full h-12 bolt-gradient text-white font-semibold text-base hover:scale-105 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generating Resume...</span>
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
                  </TooltipWithShortcut>
                </div>

                {resumeData && (
                  <div className="glass-effect p-4 rounded-xl border border-yellow-400/20">
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <Download className="h-4 w-4 text-yellow-500" />
                      Download Options
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <TooltipWithShortcut content="Download resume as PDF file for sharing">
                        <Button
                          onClick={downloadPDF}
                          disabled={isExporting}
                          variant="outline"
                          className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 w-full sm:w-auto"
                        >
                          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                          Download PDF
                        </Button>
                      </TooltipWithShortcut>
                      <TooltipWithShortcut content="Download as Word document for editing">
                        <Button
                          onClick={downloadDOCX}
                          variant="outline"
                          className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 w-full sm:w-auto"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download DOCX
                        </Button>
                      </TooltipWithShortcut>
                      <TooltipWithShortcut content="Download as LaTeX source for advanced editing">
                        <Button
                          onClick={downloadLaTeX}
                          disabled={isExporting}
                          variant="outline"
                          className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 w-full sm:w-auto"
                        >
                          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Code className="mr-2 h-4 w-4" />}
                          Download LaTeX
                        </Button>
                      </TooltipWithShortcut>
                      <TooltipWithShortcut content="Create a shareable link for your resume">
                        <Button
                          onClick={saveAndShareResume}
                          disabled={isSaving}
                          variant="outline"
                          className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 w-full sm:w-auto"
                        >
                          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                          Share Resume
                        </Button>
                      </TooltipWithShortcut>
                    </div>
                  </div>
                )}
              </div>

              <div className={`space-y-4 ${isFullView ? "w-full" : ""}`}>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                  <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-effect mb-3">
                      <FileIcon className="h-3 w-3 text-blue-500" />
                      <span className="text-xs font-medium">Live Preview</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold bolt-gradient-text">
                      Preview
                    </h2>
                  </div>
                  {resumeData && (
                    <TooltipWithShortcut
                      content={
                        isFullView
                          ? "Return to normal view"
                          : "View resume in full screen"
                      }
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFullView(!isFullView)}
                        className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 mt-2 sm:mt-0"
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
                    </TooltipWithShortcut>
                  )}
                </div>

                {resumeData ? (
                  <>
                    <div
                      key={previewKey}
                      className={`glass-effect border border-yellow-400/20 rounded-xl overflow-y-auto bg-white transition-all duration-300 animate-fade-in ${isFullView ? "fixed inset-4 z-50 shadow-2xl" : "overflow-hidden"
                        }`}
                    >
                      <div className="absolute inset-0 shimmer opacity-10"></div>
                      <div className="relative z-10">
                        <ResumePreview
                          resume={resumeData}
                          template={selectedTemplate}
                          customColors={customColors}
                        />
                      </div>
                    </div>

                    {/* Template Switcher (#430) */}
                    <TemplateSwitcher
                      selectedTemplate={selectedTemplate}
                      onSelectTemplate={handleTemplateSwitch}
                      className="mt-4"
                    />
                  </>
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
                              <div
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
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

          <TabsContent
            value="templates"
            className={`pt-4 ${isFullView ? "hidden" : ""}`}
          >
            <div className="glass-effect p-6 rounded-xl border border-yellow-400/20 relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-20"></div>
              <div className="relative z-10">
                <ResumeTemplates
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={setSelectedTemplate}
                  onEditTemplate={() => { }}
                  onDownloadTemplate={() => { }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bolt-gradient-text">Share Your Resume</DialogTitle>
            <DialogDescription>
              Share your professional resume across multiple platforms
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Link Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Share Link</Label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg"
                />
                <Button onClick={copyShareLink} size="sm" variant="outline" title="Copy link">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => window.open(shareUrl, '_blank')}
                  size="sm"
                  variant="outline"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Social Media Grid */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Share Via</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={shareViaEmail}
                  variant="outline"
                  className="justify-start h-auto py-3 hover:border-blue-400/50 hover:bg-blue-50/10"
                >
                  <Mail className="mr-2 h-5 w-5 text-blue-600" />
                  <span>Email</span>
                </Button>

                <Button
                  onClick={shareViaWhatsApp}
                  variant="outline"
                  className="justify-start h-auto py-3 hover:border-green-400/50 hover:bg-green-50/10"
                >
                  <MessageCircle className="mr-2 h-5 w-5 text-green-600" />
                  <span>WhatsApp</span>
                </Button>

                <Button
                  onClick={shareViaTwitter}
                  variant="outline"
                  className="justify-start h-auto py-3 hover:border-sky-400/50 hover:bg-sky-50/10"
                >
                  <Twitter className="mr-2 h-5 w-5 text-sky-500" />
                  <span>Twitter</span>
                </Button>

                <Button
                  onClick={shareViaLinkedIn}
                  variant="outline"
                  className="justify-start h-auto py-3 hover:border-blue-400/50 hover:bg-blue-50/10"
                >
                  <Linkedin className="mr-2 h-5 w-5 text-blue-700" />
                  <span>LinkedIn</span>
                </Button>

                <Button
                  onClick={shareViaFacebook}
                  variant="outline"
                  className="justify-start h-auto py-3 hover:border-blue-400/50 hover:bg-blue-50/10"
                >
                  <Facebook className="mr-2 h-5 w-5 text-blue-600" />
                  <span>Facebook</span>
                </Button>

                <Button
                  onClick={shareViaTelegram}
                  variant="outline"
                  className="justify-start h-auto py-3 hover:border-sky-400/50 hover:bg-sky-50/10"
                >
                  <Send className="mr-2 h-5 w-5 text-sky-500" />
                  <span>Telegram</span>
                </Button>
              </div>
            </div>

            {/* Web Share API (Mobile) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                onClick={shareViaWebShare}
                variant="outline"
                className="w-full justify-center h-auto py-3 border-purple-400/30 hover:border-purple-400/50 hover:bg-purple-50/10"
              >
                <Share2 className="mr-2 h-5 w-5 text-purple-600" />
                <span>Share via System</span>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
