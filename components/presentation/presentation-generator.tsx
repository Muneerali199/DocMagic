"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PresentationPreview } from "@/components/presentation/presentation-preview";
import { PresentationTemplates } from "@/components/presentation/presentation-templates";
import { SlideOutlinePreview } from "@/components/presentation/slide-outline-preview";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Presentation as LayoutPresentation, Lock, Download, Wand2, Sliders as Slides, Palette, Eye, ArrowRight, CheckCircle, Play, Brain, Zap, Star } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dynamic from 'next/dynamic';
import { FeedbackForm } from "@/components/feedback-form";

// Dynamically import pptxgen with no SSR to avoid build issues
const PptxGenJS = dynamic(() => import('pptxgenjs'), { 
  ssr: false,
  loading: () => <p>Loading PowerPoint generator...</p>
});

type GenerationStep = 'input' | 'outline' | 'theme' | 'generated';

export function PresentationGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<any[]>([]);
  const [slideOutlines, setSlideOutlines] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("modern-business");
  const [pageCount, setPageCount] = useState(8);
  const [isExporting, setIsExporting] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep>('input');
  const { toast } = useToast();

  const MAX_FREE_PAGES = 8;
  const MAX_PRO_PAGES = 100;
  const isPro = false; // This would be connected to your auth/subscription system

  const generateSlideOutlines = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the presentation you want to generate",
        variant: "destructive",
      });
      return;
    }

    if (pageCount > (isPro ? MAX_PRO_PAGES : MAX_FREE_PAGES)) {
      toast({
        title: "Page limit exceeded",
        description: isPro
          ? `Maximum ${MAX_PRO_PAGES} pages allowed`
          : `Upgrade to Pro to create presentations with up to ${MAX_PRO_PAGES} pages`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/presentation-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, pageCount }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate outline');
      }

      const data = await response.json();
      setSlideOutlines(data.outlines);
      setCurrentStep('outline');

      toast({
        title: "🎯 AI Outline Created!",
        description: `${data.outlines.length} slides intelligently structured with professional images and charts. Choose your style!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate outline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFullPresentation = async () => {
    setIsGenerating(true);
    setCurrentStep('generated');

    try {
      const response = await fetch('/api/generate/presentation-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          outlines: slideOutlines, 
          template: selectedTemplate,
          prompt 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate presentation');
      }

      const data = await response.json();
      setSlides(data.slides);

      toast({
        title: "🎉 Professional Presentation Ready!",
        description: `${data.slides.length} slides created with Canva-style design, professional images, and interactive charts!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate presentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    if (!slides.length) return;
    setIsExporting(true);

    try {
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      
      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage();
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Add background based on template
        const templateStyles = getTemplateBackground(selectedTemplate);
        pdf.setFillColor(templateStyles.r, templateStyles.g, templateStyles.b);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        
        // Add title
        pdf.setFontSize(28);
        pdf.setTextColor(0, 0, 0);
        pdf.text(slides[i].title, 50, 80);
        
        // Add content
        pdf.setFontSize(16);
        const splitContent = pdf.splitTextToSize(slides[i].content, pdfWidth - 100);
        pdf.text(splitContent, 50, 130);
      }

      pdf.save(`${prompt.slice(0, 30)}-presentation.pdf`);
      toast({
        title: "📄 PDF Exported!",
        description: "Your professional presentation has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export presentation to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPPTX = async () => {
    if (!slides.length) return;
    setIsExporting(true);

    try {
      // Dynamically create a new instance of PptxGen
      const PptxGenJSModule = await import('pptxgenjs');
      const pptx = new PptxGenJSModule.default();
      pptx.layout = 'LAYOUT_WIDE';

      slides.forEach((slide, index) => {
        const pptxSlide = pptx.addSlide();
        const templateStyles = getTemplateColors(selectedTemplate);

        // Set slide background
        pptxSlide.background = { color: templateStyles.background };

        // Add title
        pptxSlide.addText(slide.title, {
          x: 0.5,
          y: 0.5,
          w: 12,
          h: 1.2,
          fontSize: 32,
          bold: true,
          color: templateStyles.textColor,
          fontFace: 'Arial'
        });

        // Add content
        if (slide.content) {
          pptxSlide.addText(slide.content, {
            x: 0.5,
            y: 2,
            w: 12,
            h: 2,
            fontSize: 18,
            color: templateStyles.textColor,
            fontFace: 'Arial'
          });
        }

        // Add bullets if available
        if (slide.bullets) {
          pptxSlide.addText(slide.bullets, {
            x: 0.5,
            y: 4,
            w: 12,
            h: 3,
            fontSize: 16,
            bullet: true,
            color: templateStyles.textColor,
            fontFace: 'Arial'
          });
        }

        // Add slide number
        pptxSlide.addText(`${index + 1}`, {
          x: 12.5,
          y: 6.8,
          w: 0.5,
          h: 0.3,
          fontSize: 12,
          color: templateStyles.accentColor,
          align: 'center'
        });
      });

      await pptx.writeFile({
        fileName: `${prompt.slice(0, 30)}-presentation.pptx`
      });

      toast({
        title: "📊 PowerPoint Exported!",
        description: "Your presentation is ready for editing in PowerPoint",
      });
    } catch (error) {
      console.error("PPTX export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export presentation to PowerPoint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resetToInput = () => {
    setCurrentStep('input');
    setSlideOutlines([]);
    setSlides([]);
    setPrompt("");
  };

  const goToThemeSelection = () => {
    setCurrentStep('theme');
  };

  const getTemplateBackground = (template: string) => {
    const backgrounds = {
      'modern-business': { r: 248, g: 250, b: 252 },
      'creative-gradient': { r: 252, g: 248, b: 255 },
      'minimalist-pro': { r: 249, g: 250, b: 251 },
      'tech-modern': { r: 15, g: 23, b: 42 },
      'elegant-dark': { r: 17, g: 24, b: 39 },
      'startup-pitch': { r: 240, g: 253, b: 244 }
    };
    return backgrounds[template as keyof typeof backgrounds] || backgrounds['modern-business'];
  };

  const getTemplateColors = (template: string) => {
    const colors = {
      'modern-business': { background: 'F8FAFC', textColor: '1E3A8A', accentColor: '3B82F6' },
      'creative-gradient': { background: 'FCF8FF', textColor: '7C2D92', accentColor: 'A855F7' },
      'minimalist-pro': { background: 'F9FAFB', textColor: '374151', accentColor: '6B7280' },
      'tech-modern': { background: '0F172A', textColor: 'FFFFFF', accentColor: '06B6D4' },
      'elegant-dark': { background: '111827', textColor: 'FFFFFF', accentColor: 'FBBF24' },
      'startup-pitch': { background: 'F0FDF4', textColor: '065F46', accentColor: '10B981' }
    };
    return colors[template as keyof typeof colors] || colors['modern-business'];
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all whitespace-nowrap ${
        currentStep === 'input' ? 'bolt-gradient text-white shadow-lg' : 'glass-effect hover:scale-105'
      }`}>
        <Brain className="h-4 w-4" />
        <span className="text-sm font-medium">1. Describe</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all whitespace-nowrap ${
        currentStep === 'outline' ? 'bolt-gradient text-white shadow-lg' : 'glass-effect hover:scale-105'
      }`}>
        <Zap className="h-4 w-4" />
        <span className="text-sm font-medium">2. AI Structure</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all whitespace-nowrap ${
        currentStep === 'theme' ? 'bolt-gradient text-white shadow-lg' : 'glass-effect hover:scale-105'
      }`}>
        <Palette className="h-4 w-4" />
        <span className="text-sm font-medium">3. Style</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all whitespace-nowrap ${
        currentStep === 'generated' ? 'bolt-gradient text-white shadow-lg' : 'glass-effect hover:scale-105'
      }`}>
        <Play className="h-4 w-4" />
        <span className="text-sm font-medium">4. Present</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderStepIndicator()}

      {/* Step 1: Input */}
      {currentStep === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4 shimmer">
                <Brain className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">AI-Powered Creation</span>
                <Sparkles className="h-4 w-4 text-blue-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 bolt-gradient-text">
                What's your presentation about?
              </h2>
              <p className="text-muted-foreground">
                Our AI will create a professional presentation with Canva-style design, 
                high-quality images, and meaningful charts
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pageCount" className="text-sm font-medium flex items-center gap-2">
                  <Slides className="h-4 w-4 text-muted-foreground" />
                  Number of Slides
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="pageCount"
                    type="number"
                    min="1"
                    max={isPro ? MAX_PRO_PAGES : MAX_FREE_PAGES}
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.min(parseInt(e.target.value) || 1, isPro ? MAX_PRO_PAGES : MAX_FREE_PAGES))}
                    className="w-24 glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20"
                    disabled={isGenerating}
                  />
                  {!isPro && (
                    <div className="flex items-center text-xs text-muted-foreground glass-effect px-3 py-2 rounded-full">
                      <Lock className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Max {MAX_FREE_PAGES} slides (Pro: {MAX_PRO_PAGES})</span>
                      <span className="sm:hidden">Max {MAX_FREE_PAGES}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Describe your presentation
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="E.g., Create a startup pitch deck for an AI-powered fitness app targeting millennials, including market analysis, product features, business model, and funding requirements"
                  className="min-h-[140px] text-base glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20 resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <Button
                onClick={generateSlideOutlines}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bolt-gradient text-white font-semibold py-4 rounded-xl hover:scale-105 transition-all duration-300 bolt-glow relative overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>AI is analyzing your topic...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5" />
                      <span>Generate AI Structure</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </div>
                
                {!isGenerating && (
                  <div className="absolute inset-0 shimmer opacity-30"></div>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-effect mb-3">
                <Star className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium">Professional Features</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bolt-gradient-text">Canva-Style Quality</h2>
            </div>

            <Card className="glass-effect border border-yellow-400/20 p-6 relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-10"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bolt-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Professional Images</h3>
                    <p className="text-sm text-muted-foreground">High-quality Pexels images selected by AI for each slide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bolt-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Interactive Charts</h3>
                    <p className="text-sm text-muted-foreground">Meaningful data visualizations with professional styling</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bolt-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    <Palette className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Canva-Style Design</h3>
                    <p className="text-sm text-muted-foreground">Professional templates with consistent branding</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bolt-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    <Play className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Full-Screen Presentation</h3>
                    <p className="text-sm text-muted-foreground">Present like a pro with smooth transitions and controls</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Outline Preview */}
      {currentStep === 'outline' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">AI Structure Complete</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 bolt-gradient-text">
              🎯 Perfect! Your presentation structure is ready
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Our AI analyzed your topic and created an intelligent slide flow with professional images, 
              meaningful charts, and compelling content. Now choose your style!
            </p>
          </div>

          <SlideOutlinePreview outlines={slideOutlines} />

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={resetToInput}
              variant="outline"
              className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
            >
              ← Edit Description
            </Button>
            <Button
              onClick={goToThemeSelection}
              className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300"
            >
              <Palette className="mr-2 h-4 w-4" />
              Choose Professional Style →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Theme Selection */}
      {currentStep === 'theme' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
              <Palette className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Professional Templates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 bolt-gradient-text">
              🎨 Choose your professional style
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Select a Canva-style template that matches your audience and purpose. 
              Each template includes optimized colors, typography, and visual elements.
            </p>
          </div>

          <PresentationTemplates
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
          />

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => setCurrentStep('outline')}
              variant="outline"
              className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
            >
              ← Back to Structure
            </Button>
            <Button
              onClick={generateFullPresentation}
              disabled={isGenerating}
              className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300 px-8 py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating your presentation...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Professional Presentation
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Generated Presentation */}
      {currentStep === 'generated' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Professional Presentation Ready!</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 bolt-gradient-text">
              🎉 Your Canva-Style Presentation is Ready!
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Complete with professional design, high-quality images, interactive charts, and compelling content. 
              Present in full-screen mode or export to PowerPoint!
            </p>
          </div>

          {slides.length > 0 && (
            <div id="presentation-preview" className="glass-effect border border-yellow-400/20 rounded-xl overflow-hidden relative">
              <div className="absolute inset-0 shimmer opacity-10"></div>
              <div className="relative z-10">
                <PresentationPreview slides={slides} template={selectedTemplate} />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={resetToInput}
              variant="outline"
              className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
            >
              <Brain className="mr-2 h-4 w-4" />
              Create New Presentation
            </Button>
            <Button
              onClick={() => setCurrentStep('theme')}
              variant="outline"
              className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
            >
              <Palette className="mr-2 h-4 w-4" />
              Change Style
            </Button>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={exportToPDF}
                disabled={isExporting}
                variant="outline"
                className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                PDF
              </Button>
              <Button
                onClick={exportToPPTX}
                disabled={isExporting}
                className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300"
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                PowerPoint
              </Button>
            </div>
          </div>
          
          {/* Feedback Form */}
          {slides.length > 0 && (
            <div className="mt-6">
              <FeedbackForm documentType="presentation" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}