"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PresentationPreview } from "@/components/presentation/presentation-preview";
import { AIPresentationAssistant } from "@/components/presentation/ai-presentation-assistant";
import { PresentationTemplates } from "@/components/presentation/presentation-templates";
import { SlideOutlinePreview } from "@/components/presentation/slide-outline-preview";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { Loader2, Sparkles, Presentation as LayoutPresentation, Lock, Download, Wand2, Sliders as Slides, Palette, Eye, ArrowRight, CheckCircle, Play, Brain, Zap, Star, Share2, Copy, Globe, ExternalLink, Mail, MessageCircle, Twitter, Linkedin, Facebook, Send } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createClient } from "@/lib/supabase/client";
import type PptxGenJS from 'pptxgenjs';

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
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [presentationId, setPresentationId] = useState<string>('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const { toast } = useToast();
  const { user } = useUser();
  const supabase = createClient();

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
    setGenerationProgress(0);
    setGenerationStage('Initializing AI...');

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      setGenerationStage('🧠 AI analyzing your topic...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setGenerationStage('✨ Generating slide content...');
      setGenerationProgress(20);

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
        clearInterval(progressInterval);
        throw new Error('Failed to generate presentation');
      }

      setGenerationStage('🖼️ Fetching unique images for each slide...');
      setGenerationProgress(50);

      const data = await response.json();
      
      setGenerationStage('🎨 Applying professional design...');
      setGenerationProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));

      setGenerationStage('📊 Adding charts and visualizations...');
      setGenerationProgress(95);
      await new Promise(resolve => setTimeout(resolve, 500));

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGenerationStage('✅ Complete!');
      
      setSlides(data.slides);

      toast({
        title: "🎉 Professional Presentation Ready!",
        description: `${data.slides.length} slides created with unique images, professional design, and interactive charts!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate presentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStage('');
    }
  };

  const exportToPDF = async () => {
    if (!slides.length) return;
    setIsExporting(true);

    try {
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage();
        
        const slide = slides[i];
        
        // Add background based on template
        const templateStyles = getTemplateBackground(selectedTemplate);
        pdf.setFillColor(templateStyles.r, templateStyles.g, templateStyles.b);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        
        // Add title with professional formatting
        const slideTitle = slide.title || 'Untitled Slide';
        const titleWidth = slide.image ? pdfWidth - 530 : pdfWidth - 100;
        
        // Adjust font size based on title length and image presence
        let titleFontSize = slide.image ? 36 : 44;
        const titleLines = pdf.splitTextToSize(slideTitle, titleWidth);
        
        // Reduce font size if too many lines
        if (titleLines.length > 2) {
          titleFontSize = slide.image ? 30 : 38;
        }
        
        pdf.setFontSize(titleFontSize);
        pdf.setTextColor(templateStyles.titleR, templateStyles.titleG, templateStyles.titleB);
        pdf.setFont('helvetica', 'bold');
        pdf.text(titleLines, 50, 55);
        
        // Dynamic spacing after title
        let yPos = 55 + (titleLines.length * (titleFontSize * 1.3));
        
        // Add image if available
        if (slide.image) {
          try {
            let imageData = slide.image;
            
            // Check if image needs conversion from URL to base64
            if (slide.image.startsWith('http')) {
              try {
                const response = await fetch(slide.image);
                if (!response.ok) throw new Error('Failed to fetch image');
                const blob = await response.blob();
                imageData = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
              } catch (fetchError) {
                // Failed to fetch image, using fallback
                imageData = null;
              }
            }
            
            // Add image to PDF with better positioning
            if (imageData && (imageData.startsWith('data:image') || imageData.startsWith('http'))) {
              const imgWidth = 380;
              const imgHeight = 270; // Better aspect ratio
              const imgX = pdfWidth - imgWidth - 50;
              const imgY = 70; // Consistent position
              
              // Determine format from data URL
              let format = 'JPEG';
              if (imageData.includes('image/png')) format = 'PNG';
              else if (imageData.includes('image/webp')) format = 'WEBP';
              
              // Add border/shadow effect with rectangle
              pdf.setDrawColor(200, 200, 200);
              pdf.setLineWidth(2);
              pdf.rect(imgX - 2, imgY - 2, imgWidth + 4, imgHeight + 4);
              
              pdf.addImage(imageData, format, imgX, imgY, imgWidth, imgHeight);
            }
          } catch (error) {
            // Error adding image to PDF - skipping image
          }
        }
        
        // Add content with better typography
        if (slide.content) {
          const contentFontSize = slide.image ? 16 : 20;
          pdf.setFontSize(contentFontSize);
          pdf.setFont('helvetica', 'normal');
          const contentColor = getTextColorForTemplate(selectedTemplate);
          pdf.setTextColor(contentColor.r, contentColor.g, contentColor.b);
          const contentWidth = slide.image ? pdfWidth - 500 : pdfWidth - 100;
          const splitContent = pdf.splitTextToSize(slide.content, contentWidth);
          pdf.text(splitContent, 50, yPos);
          yPos += splitContent.length * (contentFontSize + 6) + 30;
        }
        
        // Add bullets with improved formatting
        if (slide.bullets && Array.isArray(slide.bullets)) {
          const bulletFontSize = slide.image ? 14 : 18;
          pdf.setFontSize(bulletFontSize);
          const contentColor = getTextColorForTemplate(selectedTemplate);
          pdf.setTextColor(contentColor.r, contentColor.g, contentColor.b);
          const contentWidth = slide.image ? pdfWidth - 500 : pdfWidth - 120;
          
          slide.bullets.forEach((bullet: string, idx: number) => {
            // Ensure we don't go off page
            if (yPos > pdfHeight - 90) return;
            
            // Add bullet number or circle
            pdf.setFont('helvetica', 'bold');
            pdf.setFillColor(templateStyles.accentR, templateStyles.accentG, templateStyles.accentB);
            pdf.circle(62, yPos - 3, 5, 'F');
            
            // Add bullet text
            pdf.setFont('helvetica', 'normal');
            const bulletText = pdf.splitTextToSize(bullet, contentWidth - 50);
            pdf.text(bulletText, 80, yPos);
            yPos += bulletText.length * (bulletFontSize + 4) + 15;
          });
        }
        
        // Add chart if available - render actual chart
        if (slide.charts && slide.charts.data && Array.isArray(slide.charts.data)) {
          try {
            // Create chart visualization
            const chartX = slide.image ? 50 : pdfWidth - 380;
            const chartY = slide.image ? pdfHeight - 180 : yPos;
            const chartWidth = 360;
            const chartHeight = 150;
            
            // Add chart title
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            const contentColor = getTextColorForTemplate(selectedTemplate);
            pdf.setTextColor(contentColor.r, contentColor.g, contentColor.b);
            pdf.text(slide.charts.title || 'Data Visualization', chartX, chartY - 10);
            
            // Draw simple bar chart
            if (slide.charts.type === 'bar' || !slide.charts.type) {
              const maxValue = Math.max(...slide.charts.data.map((d: any) => d.value || 0));
              const barWidth = (chartWidth - 40) / slide.charts.data.length;
              const chartData = slide.charts.data.slice(0, 6); // Max 6 bars
              
              chartData.forEach((item: any, idx: number) => {
                const value = item.value || 0;
                const barHeight = (value / maxValue) * (chartHeight - 40);
                const x = chartX + (idx * barWidth) + 10;
                const y = chartY + chartHeight - barHeight - 20;
                
                // Draw bar
                pdf.setFillColor(templateStyles.accentR, templateStyles.accentG, templateStyles.accentB);
                pdf.rect(x, y, barWidth - 10, barHeight, 'F');
                
                // Add value label
                pdf.setFontSize(9);
                pdf.setTextColor(50, 50, 50);
                pdf.text(String(value), x + (barWidth - 10) / 2, y - 5, { align: 'center' });
                
                // Add category label
                const label = (item.name || item.label || '').substring(0, 8);
                pdf.text(label, x + (barWidth - 10) / 2, chartY + chartHeight - 5, { 
                  align: 'center',
                  maxWidth: barWidth - 5
                });
              });
              
              // Draw axes
              pdf.setDrawColor(150, 150, 150);
              pdf.setLineWidth(1);
              pdf.line(chartX, chartY + chartHeight - 20, chartX + chartWidth, chartY + chartHeight - 20);
              pdf.line(chartX, chartY, chartX, chartY + chartHeight - 20);
            }
            
            // Draw simple pie chart for pie/doughnut types
            else if (slide.charts.type === 'pie' || slide.charts.type === 'doughnut') {
              const centerX = chartX + chartWidth / 2;
              const centerY = chartY + chartHeight / 2;
              const radius = Math.min(chartWidth, chartHeight) / 3;
              
              const total = slide.charts.data.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
              let currentAngle = -90;
              
              const colors = [
                [templateStyles.accentR, templateStyles.accentG, templateStyles.accentB],
                [16, 185, 129],
                [245, 158, 11],
                [239, 68, 68],
                [139, 92, 246],
                [6, 182, 212]
              ];
              
              slide.charts.data.slice(0, 6).forEach((item: any, idx: number) => {
                const value = item.value || 0;
                const angle = (value / total) * 360;
                const color = colors[idx % colors.length];
                
                pdf.setFillColor(color[0], color[1], color[2]);
                
                // Draw pie slice
                const startAngle = (currentAngle * Math.PI) / 180;
                const endAngle = ((currentAngle + angle) * Math.PI) / 180;
                
                pdf.circle(centerX, centerY, radius, 'F');
                
                currentAngle += angle;
              });
              
              // Add legend
              pdf.setFontSize(9);
              slide.charts.data.slice(0, 6).forEach((item: any, idx: number) => {
                const color = colors[idx % colors.length];
                const legendY = chartY + 20 + (idx * 15);
                
                pdf.setFillColor(color[0], color[1], color[2]);
                pdf.rect(chartX + chartWidth - 100, legendY - 8, 10, 10, 'F');
                
                pdf.setTextColor(50, 50, 50);
                const label = `${item.name || item.label}: ${item.value}`;
                pdf.text(label.substring(0, 20), chartX + chartWidth - 85, legendY);
              });
            }
          } catch (chartError) {
            // Error rendering chart - using text fallback
            // Fallback to text label
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            const contentColor = getTextColorForTemplate(selectedTemplate);
            pdf.setTextColor(contentColor.r, contentColor.g, contentColor.b);
            pdf.text(`📊 ${slide.charts.title || 'Chart Data'}`, 50, pdfHeight - 60);
          }
        }
        
        // Add slide number with accent color
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(templateStyles.accentR, templateStyles.accentG, templateStyles.accentB);
        pdf.text(`${i + 1} / ${slides.length}`, pdfWidth - 80, pdfHeight - 25);
      }

      pdf.save(`${prompt.slice(0, 30)}-presentation.pdf`);
      toast({
        title: "📄 PDF Exported with Images!",
        description: "Your professional presentation with images has been downloaded",
      });
    } catch (error) {
      console.error('PDF export error:', error);
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
      
      // Define master slide with template colors
      const templateStyles = getTemplateColors(selectedTemplate);

      for (let index = 0; index < slides.length; index++) {
        const slide = slides[index];
        const pptxSlide = pptx.addSlide();

        // Set slide background
        pptxSlide.background = { color: templateStyles.background };

        // Determine layout based on content
        const hasImage = !!slide.image;
        const hasChart = !!slide.charts;
        const hasBullets = slide.bullets && Array.isArray(slide.bullets) && slide.bullets.length > 0;

        // Add title with better formatting
        pptxSlide.addText(slide.title, {
          x: 0.5,
          y: 0.4,
          w: hasImage ? 6.2 : 12.5,
          h: 1.2,
          fontSize: hasImage ? 32 : 40,
          bold: true,
          color: templateStyles.textColor,
          fontFace: 'Calibri',
          valign: 'top',
          wrap: true,
          breakLine: true
        });

        let contentY = 1.8;

        // Add image if available
        if (hasImage && slide.image) {
          try {
            let imageData = slide.image;
            
            // Convert external URLs to base64 if not already base64
            if (slide.image.startsWith('http')) {
              try {
                const response = await fetch(slide.image);
                if (!response.ok) throw new Error('Failed to fetch image');
                const blob = await response.blob();
                imageData = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
              } catch (fetchError) {
                console.warn('Error fetching image, skipping:', fetchError);
                imageData = null;
              }
            }
            
            // Add image to slide (right side) if we have valid data
            if (imageData && imageData.startsWith('data:image')) {
              pptxSlide.addImage({
                data: imageData,
                x: 6.8,
                y: 1.3,
                w: 5.8,
                h: 4.2,
                sizing: { type: 'cover', w: 5.8, h: 4.2 },
                rounding: true
              });
            }
          } catch (error) {
            console.error('Error adding image to slide:', error);
          }
        }

        // Add content with better spacing
        if (slide.content) {
          pptxSlide.addText(slide.content, {
            x: 0.5,
            y: contentY,
            w: hasImage ? 6 : 12.5,
            h: 2,
            fontSize: hasImage ? 16 : 20,
            color: templateStyles.textColor,
            fontFace: 'Calibri',
            valign: 'top',
            wrap: true,
            lineSpacing: 24
          });
          contentY += 2.3;
        }

        // Add bullets with improved formatting
        if (hasBullets) {
          pptxSlide.addText(slide.bullets.map((bullet: string) => ({ text: bullet })), {
            x: 0.7,
            y: contentY,
            w: hasImage ? 5.8 : 12,
            h: hasImage ? 3.5 : 4.5,
            fontSize: hasImage ? 14 : 18,
            color: templateStyles.textColor,
            fontFace: 'Calibri',
            bullet: { 
              type: 'number', 
              code: '2022', 
              marginPt: 20,
              indent: 15 
            },
            valign: 'top',
            lineSpacing: 28,
            paraSpaceBefore: 6,
            paraSpaceAfter: 6
          });
        }

        // Add chart if available
        if (hasChart && slide.charts && slide.charts.data) {
          try {
            const chartData = slide.charts.data;
            const chartType = slide.charts.type || 'bar';
            
            // Prepare chart data for pptxgen
            const chartLabels = chartData.map((item: any) => item.name || item.label);
            const chartValues = chartData.map((item: any) => item.value || item.data);

            // Determine chart position
            const chartX = hasImage ? 0.5 : 7;
            const chartY = hasBullets ? 5 : contentY;
            const chartW = hasImage ? 6 : 5.5;
            const chartH = 2.5;

            // Map chart type
            let pptxChartType: any = 'bar';
            if (chartType === 'line') pptxChartType = 'line';
            else if (chartType === 'pie') pptxChartType = 'pie';
            else if (chartType === 'doughnut') pptxChartType = 'doughnut';

            // Add chart with professional styling
            pptxSlide.addChart(pptxChartType, [
              {
                name: slide.charts.title || 'Data',
                labels: chartLabels,
                values: chartValues
              }
            ], {
              x: hasImage ? 0.7 : 7.2,
              y: hasBullets ? 5.2 : contentY,
              w: hasImage ? 5.8 : 5.3,
              h: 2.8,
              showTitle: true,
              title: slide.charts.title || '',
              titleFontSize: 16,
              titleFontFace: 'Calibri',
              titleColor: templateStyles.textColor,
              showLegend: true,
              legendPos: 'b',
              legendFontSize: 11,
              showValue: false,
              chartColors: [
                templateStyles.accentColor,
                '10B981',
                'F59E0B',
                'EF4444',
                '8B5CF6',
                '06B6D4'
              ],
              border: { pt: 1, color: 'E5E7EB' },
              fill: 'FFFFFF'
            });
          } catch (error) {
            console.error('Error adding chart to slide:', error);
          }
        }

        // Add slide number with better styling
        pptxSlide.addText(`${index + 1} / ${slides.length}`, {
          x: 11.8,
          y: 6.9,
          w: 1.2,
          h: 0.4,
          fontSize: 12,
          color: templateStyles.accentColor,
          fontFace: 'Calibri',
          align: 'right',
          valign: 'bottom',
          bold: false
        });
      }

      await pptx.writeFile({
        fileName: `${prompt.slice(0, 30)}-presentation.pptx`
      });

      toast({
        title: "📊 PowerPoint Exported with Images & Charts!",
        description: "Your complete presentation is ready for editing in PowerPoint",
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
    setShareUrl('');
    setPresentationId('');
  };

  const saveAndSharePresentation = async (isPublic: boolean = true) => {
    if (!slides.length) return;
    
    setIsSaving(true);
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        console.log('Session:', session);
        toast({
          title: "Authentication Required",
          description: "Please sign in to save and share presentations.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: prompt.slice(0, 100) || 'Untitled Presentation',
          slides,
          template: selectedTemplate,
          prompt,
          isPublic
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save presentation');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
      setPresentationId(data.id);

      if (isPublic) {
        // Copy to clipboard
        await navigator.clipboard.writeText(data.shareUrl);
        toast({
          title: "🎉 Presentation Shared!",
          description: "Share link copied to clipboard. Anyone can now view your presentation!",
        });
      } else {
        toast({
          title: "💾 Presentation Saved!",
          description: "Your presentation has been saved privately.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save presentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out this presentation!');
    const body = encodeURIComponent(`I created this amazing presentation using DocMagic. Check it out:\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Check out this presentation I created with DocMagic: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent('Check out this amazing presentation I created with DocMagic!');
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareViaFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareViaTelegram = () => {
    const text = encodeURIComponent('Check out this presentation I created with DocMagic!');
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DocMagic Presentation',
          text: 'Check out this presentation I created!',
          url: shareUrl
        });
        toast({
          title: "Shared successfully!",
          description: "Presentation shared via Web Share API",
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      toast({
        title: "Not supported",
        description: "Web Share API is not supported on this device",
        variant: "destructive",
      });
    }
  };

  const goToThemeSelection = () => {
    setCurrentStep('theme');
  };

  const getTemplateBackground = (template: string) => {
    const backgrounds = {
      'modern-business': { 
        r: 248, g: 250, b: 252,
        titleR: 30, titleG: 58, titleB: 138,
        accentR: 59, accentG: 130, accentB: 246
      },
      'creative-gradient': { 
        r: 252, g: 248, b: 255,
        titleR: 124, titleG: 45, titleB: 146,
        accentR: 168, accentG: 85, accentB: 247
      },
      'minimalist-pro': { 
        r: 249, g: 250, b: 251,
        titleR: 55, titleG: 65, titleB: 81,
        accentR: 107, accentG: 114, accentB: 128
      },
      'tech-modern': { 
        r: 15, g: 23, b: 42,
        titleR: 255, titleG: 255, titleB: 255,
        accentR: 6, accentG: 182, accentB: 212
      },
      'elegant-dark': { 
        r: 17, g: 24, b: 39,
        titleR: 255, titleG: 255, titleB: 255,
        accentR: 251, accentG: 191, accentB: 36
      },
      'startup-pitch': { 
        r: 240, g: 253, b: 244,
        titleR: 6, titleG: 95, titleB: 70,
        accentR: 16, accentG: 185, accentB: 129
      }
    };
    return backgrounds[template as keyof typeof backgrounds] || backgrounds['modern-business'];
  };

  const getTextColorForTemplate = (template: string) => {
    const textColors = {
      'modern-business': { r: 30, g: 58, b: 138 },      // Dark blue
      'creative-gradient': { r: 124, g: 45, b: 146 },   // Purple
      'minimalist-pro': { r: 55, g: 65, b: 81 },        // Dark gray
      'tech-modern': { r: 226, g: 232, b: 240 },        // Light gray for dark bg
      'elegant-dark': { r: 226, g: 232, b: 240 },       // Light gray for dark bg
      'startup-pitch': { r: 6, g: 95, b: 70 }           // Dark green
    };
    return textColors[template as keyof typeof textColors] || textColors['modern-business'];
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
                What&apos;s your presentation about?
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

      {/* Loading State with Progress */}
      {isGenerating && currentStep === 'generated' && (
        <div className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <div className="glass-effect p-8 sm:p-12 rounded-2xl border border-yellow-400/30 text-center">
              {/* Animated Icon */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bolt-gradient rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bolt-gradient p-4 rounded-full animate-bounce">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Stage Text */}
              <h3 className="text-xl sm:text-2xl font-bold mb-3 bolt-gradient-text">
                {generationStage || 'Creating Your Presentation...'}
              </h3>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bolt-gradient transition-all duration-500 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(generationProgress)}% Complete
                </p>
              </div>

              {/* Feature List */}
              <div className="grid grid-cols-2 gap-4 mt-8 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Unique Images</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>AI Content</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Pro Design</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Charts & Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Generated Presentation */}
      {currentStep === 'generated' && !isGenerating && slides.length > 0 && (
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
                <PresentationPreview 
                  slides={slides} 
                  template={selectedTemplate}
                  onSlidesUpdate={setSlides}
                  allowImageEditing={true}
                />
              </div>
            </div>
          )}

          {/* Enhanced Share Section with Dialog */}
          {shareUrl && (
            <div className="glass-effect p-6 rounded-xl border border-green-400/20 bg-green-50/10">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-effect mb-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Presentation Shared</span>
                </div>
                <h3 className="text-lg font-semibold bolt-gradient-text">Your presentation is live!</h3>
                <p className="text-sm text-muted-foreground">Share it with the world</p>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
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

              {/* Advanced Share Options Dialog */}
              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bolt-gradient text-white"
                    size="lg"
                  >
                    <Share2 className="mr-2 h-5 w-5" />
                    More Sharing Options
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bolt-gradient-text">Share Presentation</DialogTitle>
                    <DialogDescription>
                      Share your presentation across multiple platforms
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
                        <Button onClick={copyShareLink} size="sm" variant="outline">
                          <Copy className="h-4 w-4" />
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
            
            {/* Share button */}
            {!shareUrl && (
              <Button
                onClick={() => saveAndSharePresentation(true)}
                disabled={isSaving}
                className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="mr-2 h-4 w-4" />
                )}
                Share Presentation
              </Button>
            )}
            
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
                variant="outline"
                className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
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

          {/* AI Assistant for Real-Time Edits */}
          <AIPresentationAssistant
            slides={slides}
            onSlidesUpdate={setSlides}
            template={selectedTemplate}
            prompt={prompt}
          />
        </div>
      )}
    </div>
  );
}