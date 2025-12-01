'use client';

import { useState, useEffect, useRef } from 'react';
import { useStreamingPresentation } from '@/hooks/useStreamingPresentation';
import { exportPresentation } from '@/lib/presentation-export';
import { 
  Loader2, 
  Sparkles, 
  Zap, 
  ChevronDown, 
  FileText, 
  Upload, 
  Layout, 
  ArrowLeft,
  Check,
  Palette,
  Image as ImageIcon,
  Type,
  MoreHorizontal,
  Plus,
  Trash2,
  Settings2,
  AlignLeft,
  Grid,
  Globe,
  Smile,
  Users,
  Download,
  X,
  Search,
  Presentation,
  Minus
} from 'lucide-react';
import { PRESENTATION_THEMES, getThemeById, PresentationTheme } from '@/lib/presentation-themes';
import { ThemePreview } from './theme-preview';
import { OutlineEditor } from './outline-editor';

interface Slide {
  slideNumber: number;
  type: string;
  title: string;
  subtitle?: string;
  content: string;
  bullets?: string[];
  cta?: string;
  design?: {
    background: string;
    layout: string;
  };
  imageUrl?: string;
  chartData?: {
    type: 'bar' | 'line' | 'pie' | 'area';
    data: { name: string; value: number; category?: string }[];
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
  };
}

interface OutlineItem {
  title: string;
  type: string;
  description: string;
  content?: string;
  bullets?: string[];
}

type ViewState = 'dashboard' | 'input' | 'paste-text' | 'import-file' | 'webpage' | 'outline-review' | 'presentation';
type OutlineMode = 'card-by-card' | 'freeform';

export default function RealTimeGenerator() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [generationMode, setGenerationMode] = useState('presentation');
  
  // Settings
  const [slideCount, setSlideCount] = useState(8);
  const [language, setLanguage] = useState('English');
  const [topic, setTopic] = useState('');
  
  // Outline Review State
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [outlineMode, setOutlineMode] = useState<OutlineMode>('card-by-card');
  const [rawOutlineText, setRawOutlineText] = useState('');
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [pastedText, setPastedText] = useState('');
  
  // Advanced Settings
  const [textDensity, setTextDensity] = useState('concise');
  const [audience, setAudience] = useState('Business');
  const [tone, setTone] = useState('Professional');
  const [theme, setTheme] = useState('Peach');
  const [imageSource, setImageSource] = useState('ai');
  const [imageModel, setImageModel] = useState('flux-fast');
  const [artStyle, setArtStyle] = useState('photorealistic');
  const [extraKeywords, setExtraKeywords] = useState('');

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Theme Gallery State
  const [showThemeGallery, setShowThemeGallery] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState('peach');
  const [searchTheme, setSearchTheme] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'dark' | 'light' | 'colorful' | 'professional'>('all');

  const currentTheme = getThemeById(selectedThemeId);

  // Filter themes
  const filteredThemes = PRESENTATION_THEMES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTheme.toLowerCase());
    const matchesTab = activeTab === 'all' || t.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideText, setCurrentSlideText] = useState('');
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const handleSlideUpdate = (index: number, updatedSlide: Slide) => {
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides[index] = updatedSlide;
      return newSlides;
    });
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      slideNumber: slides.length + 1,
      type: 'content',
      title: 'New Slide',
      content: 'Click to edit content...',
      design: { background: 'gradient-blue-purple' }
    };
    setSlides(prev => [...prev, newSlide]);
  };

  // Save & Share state
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [presentationId, setPresentationId] = useState<string | null>(null);

  const handleSavePresentation = async () => {
    setIsSaving(true);
    try {
      // Get auth token from Supabase
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please sign in to save and share presentations');
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: topic || 'Untitled Presentation',
          slides: slides,
          template: selectedThemeId,
          prompt: topic,
          isPublic: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save presentation');
      }

      const data = await response.json();
      setPresentationId(data.id);
      setShareUrl(data.shareUrl);
      setShowShareModal(true);
      
      console.log('✅ Presentation saved:', data);
    } catch (error) {
      console.error('❌ Error saving presentation:', error);
      alert('Failed to save presentation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const { isStreaming, content, error, progress, generatePresentation } =
    useStreamingPresentation();

  const examplePrompts = [
    "The future of AI in healthcare",
    "Q3 Marketing Strategy Review",
    "Introduction to React Native",
    "Sustainable Energy Solutions"
  ];

  const themes = [
    { name: 'Peach', color: 'bg-orange-100', border: 'border-orange-200' },
    { name: 'Serene', color: 'bg-emerald-100', border: 'border-emerald-200' },
    { name: 'Malibu', color: 'bg-blue-100', border: 'border-blue-200' },
    { name: 'Chimney', color: 'bg-stone-100', border: 'border-stone-200' },
    { name: 'Bee Happy', color: 'bg-yellow-100', border: 'border-yellow-200' },
    { name: 'Spectrum', color: 'bg-purple-100', border: 'border-purple-200' },
  ];

  // Convert structured outline to raw text for editor
  useEffect(() => {
    if (outline.length > 0 && !rawOutlineText) {
      const text = outline.map(item => {
        let cardText = `${item.title}\n${item.description || item.content || ''}`;
        if (item.bullets) {
          cardText += '\n' + item.bullets.map(b => `* ${b}`).join('\n');
        }
        return cardText;
      }).join('\n\n---\n\n');
      setRawOutlineText(text);
    }
  }, [outline, rawOutlineText]);

  // Debug view changes
  useEffect(() => {
    console.log('🎬 VIEW CHANGED TO:', view);
  }, [view]);

  // Update structured outline when raw text changes (debounced or on blur ideally, but simple here)
  const handleRawTextChange = (text: string) => {
    setRawOutlineText(text);
    // Simple parsing for card count update
    const cards = text.split('---').filter(c => c.trim().length > 0);
    setSlideCount(cards.length);
  };

  // Parse streamed content into slides
  useEffect(() => {
    if (!content) return;

    const parseSlides = (text: string) => {
      // Attempt to parse as JSON first (in case AI ignores TOON format)
      try {
        // Find potential JSON array in the text
        const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const jsonSlides = JSON.parse(jsonMatch[0]);
          if (Array.isArray(jsonSlides)) {
            return jsonSlides.map((s: any, i: number) => ({
              slideNumber: i + 1,
              type: s.type || 'content',
              title: s.title || `Slide ${i + 1}`,
              subtitle: s.subtitle,
              content: s.content || s.description || '',
              bullets: s.bullets || [],
              cta: s.cta,
              design: { background: s.background || 'gradient-blue-purple', layout: 'default' },
              chartData: s.chartData,
              imageUrl: s.imageUrl
            }));
          }
        }
      } catch (e) {
        // Not valid JSON, continue to TOON parsing
      }

      // TOON Parsing
      // Split by separator, handle potential variations (case insensitive, spaces)
      const slideBlocks = text.split(/---SLIDE---|--- SLIDE ---|---slide---/i).filter(block => block.trim());
      
      if (slideBlocks.length === 0) {
        // Fallback: If no separators found but text exists, treat as single slide or try to split by "Slide X"
        if (text.length > 50) {
           const implicitSlides = text.split(/Slide \d+:/i).filter(b => b.trim());
           if (implicitSlides.length > 1) {
             return implicitSlides.map((block, i) => ({
               slideNumber: i + 1,
               title: `Slide ${i + 1}`,
               content: block.trim(),
               type: 'content',
               design: { background: 'gradient-blue-purple', layout: 'default' }
             }));
           }
        }
      }

      return slideBlocks.map((block, index) => {
        const lines = block.trim().split('\n');
        const slide: any = { 
          slideNumber: index + 1,
          design: { background: 'gradient-blue-purple', layout: 'default' }
        };
        
        let currentKey = '';
        let currentList: string[] = [];
        let chartDataLines: string[] = [];
        let inChartData = false;
        
        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return;
          
          const lowerLine = trimmedLine.toLowerCase();

          if (lowerLine.startsWith('type:')) {
            slide.type = trimmedLine.substring(5).trim();
          } else if (lowerLine.startsWith('title:')) {
            slide.title = trimmedLine.substring(6).trim();
          } else if (lowerLine.startsWith('subtitle:')) {
            slide.subtitle = trimmedLine.substring(9).trim();
          } else if (lowerLine.startsWith('cta:')) {
            slide.cta = trimmedLine.substring(4).trim();
          } else if (lowerLine.startsWith('background:')) {
            slide.design.background = trimmedLine.substring(11).trim();
          } else if (lowerLine.startsWith('charttype:')) {
            const chartType = trimmedLine.substring(10).trim().toLowerCase();
            slide.chartData = { type: chartType, data: [] };
            inChartData = false;
          } else if (lowerLine.startsWith('chartdata:')) {
            inChartData = true;
            chartDataLines = [];
          } else if (inChartData && trimmedLine.includes(':')) {
            // Parse chart data line: "Q1 2024: 125"
            const [name, valueStr] = trimmedLine.split(':').map(s => s.trim());
            const value = parseFloat(valueStr);
            if (!isNaN(value) && name) {
              chartDataLines.push({ name, value });
            }
          } else if (lowerLine.startsWith('bullets:')) {
            currentKey = 'bullets';
            currentList = [];
            inChartData = false;
          } else if (trimmedLine.startsWith('* ') && currentKey === 'bullets') {
            currentList.push(trimmedLine.substring(2).trim());
            slide.bullets = currentList;
          } else if (lowerLine.startsWith('content:')) {
            slide.content = trimmedLine.substring(8).trim();
            currentKey = 'content';
            inChartData = false;
          } else if (currentKey === 'content' && !trimmedLine.includes(':') && !inChartData) {
            slide.content += ' ' + trimmedLine;
          }
        });
        
        // Add parsed chart data
        if (chartDataLines.length > 0 && slide.chartData) {
          slide.chartData.data = chartDataLines;
          slide.chartData.colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        }

        // Fallback if title is missing
        if (!slide.title) {
          const titleMatch = block.match(/Title:\s*(.*)/i);
          if (titleMatch) slide.title = titleMatch[1];
          else slide.title = `Slide ${index + 1}`;
        }
        
        return slide as Slide;
      });
    };

    try {
      const parsedSlides = parseSlides(content);
      if (parsedSlides.length > 0) {
        // Merge with existing slides to preserve images
        setSlides(prevSlides => {
          return parsedSlides.map((newSlide, index) => {
            const existingSlide = prevSlides[index];
            if (existingSlide && existingSlide.imageUrl) {
              return { ...newSlide, imageUrl: existingSlide.imageUrl };
            }
            return newSlide;
          });
        });
        
        // Update current slide text for the loading indicator
        const lastSlide = parsedSlides[parsedSlides.length - 1];
        if (lastSlide) {
          setCurrentSlideText(lastSlide.title || 'Generating...');
        }
      }
    } catch (e) {
      console.error('Error parsing slides:', e);
    }
  }, [content]);  const handleGenerateOutline = async () => {
    if (!topic.trim()) return;
    
    console.log('🎯 handleGenerateOutline called with topic:', topic);
    console.log('🎯 Requesting', slideCount, 'cards');
    
    setIsGeneratingOutline(true);
    
    try {
      console.log('📡 Calling /api/generate/presentation-outline...');
      const response = await fetch('/api/generate/presentation-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: topic, 
          pageCount: slideCount,
          outlineOnly: true 
        })
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Received data:', data);
      
      if (data.outlines && Array.isArray(data.outlines)) {
        console.log('✅ Setting', data.outlines.length, 'outlines');
        setOutline(data.outlines);
        console.log('✅ Switching to outline-review view');
        setView('outline-review');
      } else {
        console.error('❌ Invalid outline format:', data);
        throw new Error('Invalid outline format received');
      }
    } catch (err) {
      console.error("❌ Failed to generate outline:", err);
      alert(`Failed to generate outline: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleFinalGenerate = async () => {
    console.log('🚀 handleFinalGenerate called');
    console.log('🚀 Topic:', topic);
    console.log('🚀 Outline length:', outline.length);
    console.log('🚀 Settings:', { textDensity, audience, tone, theme, imageSource });
    
    setSlides([]);
    setCurrentSlideText('');
    setView('presentation');
    console.log('🎬 View set to: presentation');
    
    // If in card-by-card mode, parse the raw text back into structured outline
    // If in freeform mode, parse the raw text back into structured outline
    let finalOutline = outline;
    if (outlineMode === 'freeform') {
      const cards = rawOutlineText.split('---').filter(c => c.trim().length > 0);
      if (cards.length > 0) {
        finalOutline = cards.map((cardText, index) => {
          const lines = cardText.trim().split('\n');
          const title = lines[0] || `Slide ${index + 1}`;
          const content = lines.slice(1).join('\n').trim();
          return {
            title,
            type: 'content',
            description: content,
            content: content
          };
        });
      }
    }

    const settings = {
      textDensity,
      audience,
      tone,
      language,
      theme,
      imageSource,
      imageModel,
      artStyle,
      extraKeywords
    };

    console.log('📡 Calling generatePresentation with:', {
      topic,
      audience,
      outlineLength: finalOutline.length,
      settings
    });
    
    // Start text generation stream
    generatePresentation(topic, audience, finalOutline, settings); 
    
    // Start parallel image generation if enabled
    if (imageSource === 'ai') {
      console.log('🎨 Starting background image generation...');
      try {
        // Import dynamically to avoid SSR issues
        const { generateSlideImage } = await import('@/lib/flux-image-generator');
        
        // Generate images for each slide in the outline
        const imagePromises = finalOutline.map(async (slide, index) => {
          // Only generate images for 50% of slides (alternating)
          if (index % 2 !== 0) {
            return { index, imageUrl: null };
          }

          try {
            const imageUrl = await generateSlideImage(
              slide.type || 'content',
              slide.title,
              slide.description || slide.content || '',
              "1024x576"
            );
            
            // Update the specific slide with the new image
            setSlides(prevSlides => {
              const newSlides = [...prevSlides];
              // Find slide by index since streaming might not have created all slides yet
              // We'll store it in a temporary map if slide doesn't exist
              if (newSlides[index]) {
                newSlides[index] = { ...newSlides[index], imageUrl };
              }
              return newSlides;
            });
            
            return { index, imageUrl };
          } catch (err) {
            console.error(`Failed to generate image for slide ${index + 1}`, err);
            return { index, imageUrl: null };
          }
        });
        
        // Wait for all images (optional, or let them load progressively)
        const results = await Promise.all(imagePromises);
        
        // Final pass to ensure all images are attached to slides
        setSlides(prevSlides => {
          return prevSlides.map((slide, index) => {
            const imgResult = results.find(r => r.index === index);
            if (imgResult && imgResult.imageUrl) {
              return { ...slide, imageUrl: imgResult.imageUrl };
            }
            return slide;
          });
        });
        
      } catch (err) {
        console.error("❌ Image generation failed:", err);
      }
    }
  };

  const handleExport = async (format: 'png' | 'pdf' | 'pptx') => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const slideElements = Array.from(
        document.querySelectorAll('[data-slide-card]')
      ) as HTMLElement[];
      
      if (slideElements.length === 0) {
        alert('No slides to export');
        return;
      }

      await exportPresentation(slideElements, topic || 'presentation', {
        format,
        includeSlideNumbers: true
      }, slides, currentTheme);
      
      console.log(`✅ Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateFromText = async () => {
    if (!pastedText.trim()) return;
    
    setIsGeneratingOutline(true);
    
    try {
      // Check if text contains --- separators for manual slide breaks
      if (pastedText.includes('---')) {
        // Manual mode: split by --- and create slides
        const sections = pastedText.split('---').filter(s => s.trim());
        const manualOutline = sections.map((section, index) => {
          const lines = section.trim().split('\n').filter(l => l.trim());
          const title = lines[0] || `Slide ${index + 1}`;
          const content = lines.slice(1).join('\n');
          
          return {
            title,
            type: 'content',
            description: content,
            content: content,
            bullets: lines.slice(1).filter(l => l.trim())
          };
        });
        
        setOutline(manualOutline);
        setSlideCount(manualOutline.length);
        setRawOutlineText(pastedText);
        setOutlineMode('freeform');
        setView('outline-review');
      } else {
        // AI mode: use pasted text as prompt to generate outline
        setTopic(pastedText.substring(0, 200)); // Set truncated version as topic
        
        const response = await fetch('/api/generate/presentation-outline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: pastedText,
            audience,
            slideCount: Math.min(12, Math.max(4, Math.ceil(pastedText.length / 200)))
          })
        });
        
        if (!response.ok) throw new Error('Failed to generate outline');
        
        const data = await response.json();
        setOutline(data.outline || []);
        setSlideCount(data.outline?.length || 8);
        setView('outline-review');
      }
    } catch (error) {
      console.error('Error generating from text:', error);
      alert('Failed to generate presentation. Please try again.');
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const getGradientClass = (background?: string) => {
    // ALWAYS use the selected theme's gradient
    // This prevents AI from overriding with blue/purple gradients
    const themeConfig = getThemeById(selectedThemeId);
    return themeConfig.colors.gradient;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans text-foreground selection:bg-blue-500/30">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="mesh-gradient opacity-40 absolute inset-0"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-b border-border z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => !isStreaming && setView('dashboard')}>
              <div className="w-10 h-10 bolt-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold professional-heading tracking-tight">DocMagic AI</h1>
              </div>
            </div>

            {isStreaming && (
              <div className="flex items-center gap-4 bg-card/80 px-4 py-2 rounded-full border border-border backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-semibold">Generating...</span>
                </div>
                <div className="w-32 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bolt-gradient h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-32 relative z-10">
        
        {/* VIEW 1: DASHBOARD */}
        {view === 'dashboard' && (
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 pt-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-blue-200/30 mb-6 hover:scale-105 transition-transform duration-300">
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                <span className="text-sm font-semibold bolt-gradient-text">AI-Powered Creation</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold professional-heading mb-6 tracking-tight">
                Create with <span className="bolt-gradient-text">Intelligence</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                Transform your ideas into professional presentations in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => setView('input')}
                className="group relative flex flex-col p-1 rounded-3xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-card/60 backdrop-blur-xl w-full h-full rounded-[20px] p-6 flex flex-col relative overflow-hidden border border-border hover:border-blue-500/50 shadow-lg hover:shadow-blue-500/10 transition-all">
                    <div className="w-12 h-12 bolt-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold professional-heading mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Generate</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Create from a one-line prompt.</p>
                </div>
              </button>
              <button 
                onClick={() => setView('paste-text')}
                className="group relative flex flex-col p-1 rounded-3xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-card/60 backdrop-blur-xl w-full h-full rounded-[20px] p-6 flex flex-col relative overflow-hidden border border-border hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-500/10 transition-all">
                    <div className="w-12 h-12 cosmic-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold professional-heading mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Paste Text</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Transform notes into slides.</p>
                </div>
              </button>

              <button 
                onClick={() => setView('import-file')}
                className="group relative flex flex-col p-1 rounded-3xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-card/60 backdrop-blur-xl w-full h-full rounded-[20px] p-6 flex flex-col relative overflow-hidden border border-border hover:border-orange-500/50 shadow-lg hover:shadow-orange-500/10 transition-all">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold professional-heading mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Import File</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Convert PDF or Doc to slides.</p>
                </div>
              </button>

              <button 
                onClick={() => setView('webpage')}
                className="group relative flex flex-col p-1 rounded-3xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-card/60 backdrop-blur-xl w-full h-full rounded-[20px] p-6 flex flex-col relative overflow-hidden border border-border hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/10 transition-all">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <Layout className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold professional-heading mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Webpage</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Turn any URL into a deck.</p>
                </div>
              </button>
            </div>
          </div>
        )}



        {/* VIEW 1.6: IMPORT FILE */}
        {view === 'import-file' && (
          <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-3xl w-full animate-fade-in-up">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold professional-heading mb-4 tracking-tight">
                  Import a <span className="bolt-gradient-text">File</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Upload a PDF, Word document, or text file to generate slides.
                </p>
              </div>

              <div className="bg-card rounded-3xl shadow-2xl shadow-orange-500/5 border border-border p-12 mb-8 border-dashed border-2 flex flex-col items-center justify-center hover:border-orange-500/50 transition-colors cursor-pointer group">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Click to upload or drag and drop</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Supported formats: PDF, DOCX, TXT, MD (Max 10MB)
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setView('dashboard')}
                  className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  disabled
                  className="px-8 py-3 rounded-xl font-bold bg-muted text-muted-foreground cursor-not-allowed"
                >
                  Generate Presentation (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 1.7: WEBPAGE */}
        {view === 'webpage' && (
          <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-3xl w-full animate-fade-in-up">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold professional-heading mb-4 tracking-tight">
                  Transform a <span className="bolt-gradient-text">Webpage</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Paste a URL to turn any article or blog post into a presentation.
                </p>
              </div>

              <div className="bg-card rounded-3xl shadow-2xl shadow-indigo-500/5 border border-border p-8 mb-8">
                <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-xl border border-border">
                  <div className="p-3 bg-background rounded-lg shadow-sm">
                    <Globe className="w-6 h-6 text-indigo-500" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="https://example.com/article"
                    className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setView('dashboard')}
                  className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  disabled
                  className="px-8 py-3 rounded-xl font-bold bg-muted text-muted-foreground cursor-not-allowed"
                >
                  Generate Presentation (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        )}


        {/* VIEW 2: INPUT FORM */}
        {view === 'input' && (
          <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-6">
            <div className="max-w-4xl w-full animate-fade-in-up">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold professional-heading mb-4 tracking-tight">
                  What would you like to <span className="bolt-gradient-text">create?</span>
                </h2>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
                  <span className="text-sm font-medium text-muted-foreground">Number of cards:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSlideCount(Math.max(1, slideCount - 1))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      type="button"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={slideCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setSlideCount(Math.min(20, Math.max(1, val)));
                      }}
                      className="w-16 text-center bg-transparent font-bold text-lg text-foreground outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors"
                    />
                    <button
                      onClick={() => setSlideCount(Math.min(20, slideCount + 1))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      type="button"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">(1-20)</span>
                </div>
              </div>

              <div className="bg-card rounded-3xl shadow-2xl shadow-blue-500/5 border border-border p-2">
                <div className="relative">
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe your presentation topic..."
                    className="w-full px-6 py-6 bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[120px]"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerateOutline()}
                    autoFocus
                  />
                  <div className="absolute bottom-2 right-2">
                    <button
                      onClick={handleGenerateOutline}
                      disabled={!topic.trim() || isGeneratingOutline}
                      className="bolt-gradient text-white p-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                    >
                      {isGeneratingOutline ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowLeft className="w-5 h-5 rotate-180" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {examplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTopic(prompt)}
                    className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-muted-foreground hover:border-blue-300 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Loading Overlay */}
              {isGeneratingOutline && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-md mx-4">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
                      <div className="text-center">
                        <h3 className="text-lg font-bold mb-2">Generating Outline...</h3>
                        <p className="text-sm text-muted-foreground">Creating {slideCount} cards for your presentation</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: OUTLINE REVIEW (Gamma Style) */}
        {view === 'outline-review' && (
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Outline Editor */}
            <OutlineEditor 
              outline={outline}
              setOutline={setOutline}
              slideCount={slideCount}
              setSlideCount={setSlideCount}
              rawOutlineText={rawOutlineText}
              setRawOutlineText={setRawOutlineText}
              outlineMode={outlineMode}
              setOutlineMode={setOutlineMode}
            />

            {/* Right Column: Settings Panel */}
            <div className="w-full lg:w-80 flex-shrink-0 space-y-6 h-fit sticky top-24 overflow-y-auto max-h-[calc(100vh-8rem)] pr-2">
              <h3 className="text-lg font-bold professional-heading mb-4">Settings</h3>
              
              {/* Text Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Type className="w-3 h-3" />
                  Text Content
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount of text</label>
                    <select 
                      value={textDensity}
                      onChange={(e) => setTextDensity(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="minimal">Brief</option>
                      <option value="concise">Concise</option>
                      <option value="detailed">Detailed</option>
                      <option value="extensive">Extensive</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Write for...</label>
                    <select 
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="Business">Business</option>
                      <option value="High schoolers">High schoolers</option>
                      <option value="College students">College students</option>
                      <option value="Creatives">Creatives</option>
                      <option value="Tech enthusiasts">Tech enthusiasts</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Tone</label>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Conversational">Conversational</option>
                      <option value="Technical">Technical</option>
                      <option value="Academic">Academic</option>
                      <option value="Inspirational">Inspirational</option>
                      <option value="Humorous">Humorous</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Output language</label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-border w-full" />

                
              {/* Visual Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Palette className="w-3 h-3" />
                  Visuals
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground block">Theme</label>
                    <button 
                      onClick={() => setShowThemeGallery(true)}
                      className="text-xs text-blue-500 hover:text-blue-600 font-medium hover:underline"
                    >
                      View more
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {PRESENTATION_THEMES.slice(0, 6).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedThemeId(t.id);
                          setTheme(t.name);
                        }}
                        className={`
                          relative group overflow-hidden rounded-xl border-2 transition-all duration-200 aspect-[4/3]
                          ${selectedThemeId === t.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-border'}
                        `}
                      >
                        <div 
                          className={`absolute inset-0 w-full h-full ${t.colors.gradient} p-3 flex flex-col`} 
                          style={{ backgroundColor: t.colors.background }}
                        >
                          <div className="flex-1" style={{ fontFamily: t.font, color: t.colors.foreground }}>
                            <div className="h-1.5 w-1/3 rounded-full mb-2 opacity-20" style={{ backgroundColor: t.colors.foreground }} />
                            <div className="text-[10px] font-bold leading-tight mb-1">Title</div>
                            <div className="text-[7px] opacity-80 leading-relaxed mb-1.5 line-clamp-2">
                              Body text preview for {t.name} theme style.
                            </div>
                            <div className="text-[7px] font-medium" style={{ color: t.colors.accent }}>Link text &rarr;</div>
                          </div>
                        </div>

                        {selectedThemeId === t.id && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Image Source</label>
                    <select 
                      value={imageSource}
                      onChange={(e) => setImageSource(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="ai">AI Images</option>
                      <option value="stock">Stock Photos</option>
                      <option value="web">Web Images</option>
                    </select>
                  </div>

                  {imageSource === 'ai' && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">AI Model</label>
                        <select 
                          value={imageModel}
                          onChange={(e) => setImageModel(e.target.value)}
                          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        >
                          <option value="flux-fast">Flux Fast</option>
                          <option value="flux-pro">Flux Pro</option>
                          <option value="dalle">DALL-E 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Art Style</label>
                        <select 
                          value={artStyle}
                          onChange={(e) => setArtStyle(e.target.value)}
                          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        >
                          <option value="photorealistic">Photorealistic</option>
                          <option value="illustration">Illustration</option>
                          <option value="abstract">Abstract</option>
                          <option value="3d">3D Render</option>
                          <option value="line-art">Line Art</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Extra Keywords</label>
                        <input 
                          value={extraKeywords}
                          onChange={(e) => setExtraKeywords(e.target.value)}
                          placeholder="e.g. playful, sunlit"
                          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Theme Gallery Modal */}
        {showThemeGallery && (
          <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
            <div className="bg-card w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl border border-border flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Left Sidebar - Filters & List */}
              <div className="w-1/3 border-r border-border flex flex-col bg-muted/30">
                <div className="p-6 border-b border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Select a Theme</h2>
                    <button onClick={() => setShowThemeGallery(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search themes..." 
                      value={searchTheme}
                      onChange={(e) => setSearchTheme(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {['all', 'dark', 'light', 'colorful', 'professional'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`
                          px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors
                          ${activeTab === tab ? 'bg-foreground text-background' : 'bg-background border border-border hover:bg-muted'}
                        `}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-3">
                    {filteredThemes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedThemeId(t.id);
                          setTheme(t.name);
                        }}
                        className={`
                          relative group overflow-hidden rounded-xl border-2 transition-all duration-200 aspect-[4/3] text-left
                          ${selectedThemeId === t.id ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg scale-[1.02]' : 'border-transparent hover:border-border'}
                        `}
                      >
                        <div 
                          className={`absolute inset-0 w-full h-full ${t.colors.gradient} p-4 flex flex-col`} 
                          style={{ backgroundColor: t.colors.background }}
                        >
                          <div className="flex-1" style={{ fontFamily: t.font, color: t.colors.foreground }}>
                            <div className="h-2 w-1/3 rounded-full mb-3 opacity-20" style={{ backgroundColor: t.colors.foreground }} />
                            <div className="text-xs font-bold leading-tight mb-1.5">Title</div>
                            <div className="text-[9px] opacity-80 leading-relaxed mb-2 line-clamp-2">
                              Body text preview for {t.name} theme style.
                            </div>
                            <div className="text-[9px] font-medium" style={{ color: t.colors.accent }}>Link text &rarr;</div>
                          </div>
                        </div>

                        {selectedThemeId === t.id && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Live Preview */}
              <div className="flex-1 bg-muted/10 p-8 flex flex-col">
                <div className="flex-1 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-2xl aspect-[16/9] shadow-2xl rounded-xl overflow-hidden transform transition-all duration-500">
                      <ThemePreview theme={currentTheme} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-4">
                  <button 
                    onClick={() => setShowThemeGallery(false)}
                    className="px-6 py-2.5 font-medium hover:bg-muted rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setShowThemeGallery(false)}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    Apply Theme
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 4: PRESENTATION */}
        {view === 'presentation' && (
          <div className="max-w-6xl mx-auto px-6 py-8">
            {!isStreaming && (
              <div className="mb-8 flex items-center justify-between">
                <button 
                  onClick={() => setView('dashboard')}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium group"
                >
                  <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center group-hover:border-foreground/20 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  Create New Presentation
                </button>

                {/* Save & Share Button */}
                {slides.length > 0 && (
                  <button
                    onClick={handleSavePresentation}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Globe className="w-5 h-5" />
                        Save & Share
                      </>
                    )}
                  </button>
                )}

                {/* Export Button */}
                {slides.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      disabled={isExporting}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Export
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Export Dropdown Menu */}
                    {showExportMenu && !isExporting && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                        <button
                          onClick={() => handleExport('png')}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <div>
                            <div className="font-semibold text-sm">PNG Images</div>
                            <div className="text-xs text-muted-foreground">High quality</div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleExport('pdf')}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-t border-border"
                        >
                          <FileText className="w-4 h-4" />
                          <div>
                            <div className="font-semibold text-sm">PDF Document</div>
                            <div className="text-xs text-muted-foreground">Portable format</div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleExport('pptx')}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-t border-border"
                        >
                          <Layout className="w-4 h-4" />
                          <div>
                            <div className="font-semibold text-sm">PowerPoint</div>
                            <div className="text-xs text-muted-foreground">Editable slides</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div ref={slideContainerRef} className="space-y-12">
              {slides.length === 0 && isStreaming && (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <Loader2 className="w-16 h-16 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-2xl font-bold professional-heading mb-2">Generating Your Presentation</h3>
                  <p className="text-muted-foreground">Creating slides based on your outline...</p>
                </div>
              )}
              
              {slides.map((slide, index) => (
                <div key={index} className="animate-fadeIn" data-slide-card>
                  <SlideCard 
                    slide={slide} 
                    getGradientClass={getGradientClass} 
                    theme={currentTheme}
                    onUpdate={(updatedSlide) => handleSlideUpdate(index, updatedSlide)}
                  />
                </div>
              ))}
              
              {/* Add Slide Button */}
              {!isStreaming && slides.length > 0 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleAddSlide}
                    className="group flex items-center gap-3 px-8 py-4 bg-card hover:bg-muted border-2 border-dashed border-border hover:border-blue-500 rounded-2xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                      <Plus className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-foreground">Add New Slide</div>
                      <div className="text-sm text-muted-foreground">Click to insert a blank slide</div>
                    </div>
                  </button>
                </div>
              )}
              
              {isStreaming && currentSlideText && slides.length > 0 && (
                <div className="animate-pulse">
                  <div className="bg-card rounded-3xl p-12 min-h-[500px] flex flex-col items-center justify-center border border-border shadow-xl">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold professional-heading mb-2">Creating Slide {slides.length + 1}</h3>
                    <p className="text-muted-foreground max-w-md text-center">Analyzing content and designing layout...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="fixed bottom-8 right-8 max-w-md animate-slideIn z-50">
            <div className="bg-card border border-red-200 dark:border-red-900 rounded-2xl p-6 shadow-2xl shadow-red-500/10 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-foreground font-bold mb-1">Generation Error</h4>
                <p className="text-muted-foreground text-sm mb-3">{error}</p>
                <button onClick={() => window.location.reload()} className="text-red-600 hover:text-red-700 font-bold text-sm">Try again</button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Presentation Saved!</h2>
                      <p className="text-sm text-muted-foreground">Share with anyone via link</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowShareModal(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Share Link */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Share Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl);
                          alert('Link copied to clipboard!');
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Permission Options */}
                  <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Anyone with the link</div>
                          <div className="text-xs text-muted-foreground">Can view this presentation</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-600">Active</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      onClick={() => window.open(shareUrl, '_blank')}
                      className="px-4 py-3 bg-card hover:bg-muted border border-border rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Open Link
                    </button>
                    <button
                      onClick={() => {
                        const text = `Check out my presentation: ${shareUrl}`;
                        navigator.clipboard.writeText(text);
                        alert('Share text copied!');
                      }}
                      className="px-4 py-3 bg-card hover:bg-muted border border-border rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Copy Share Text
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Footer (Only in Outline Review) */}
        {view === 'outline-review' && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border p-4 z-50 animate-slideUp">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-muted-foreground">
                  <span className="text-foreground font-bold">{slideCount}</span> cards total
                </div>
                <div className="h-4 w-[1px] bg-border" />
                <div className="text-sm text-muted-foreground">
                  Est. time: <span className="text-foreground font-bold">~1min</span>
                </div>
              </div>
              
              <button 
                onClick={handleFinalGenerate}
                className="bolt-gradient text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate Presentation
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slideIn { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-in-up { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>
      </div>
    </div>
  );
}

// Enhanced Slide Card Component with Icons, Diagrams, Images, and Charts
function SlideCard({ slide, getGradientClass, theme, onUpdate }: { 
  slide: Slide; 
  getGradientClass: (bg?: string) => string; 
  theme: PresentationTheme;
  onUpdate?: (updatedSlide: Slide) => void;
}) {
  const isHero = slide.type === 'hero' || slide.type === 'cover';
  const isFlowchart = slide.type === 'process' || slide.type === 'flowchart';
  const hasChart = slide.chartData && slide.chartData.data && slide.chartData.data.length > 0;
  const hasImage = slide.imageUrl && slide.imageUrl.length > 0;
  const isEditable = !!onUpdate;

  // Dynamic import for Recharts
  const { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = 
    require('recharts');

  // Icon mapping for different slide types
  const getSlideIcon = (type: string) => {
    switch(type) {
      case 'hero': return '🚀';
      case 'list': return '📋';
      case 'bullets': return '✓';
      case 'process': return '⚡';
      case 'flowchart': return '📊';
      case 'quote': return '💬';
      case 'big-number': return '📈';
      case 'data': return '📊';
      case 'chart': return '📈';
      default: return '✨';
    }
  };

  // Import color contrast utility
  const { getOptimalTextColor } = require('@/lib/color-contrast');

  // Smart text color based on background using WCAG 2.0 luminance calculation
  // Use the theme's actual background color (hex) instead of gradient class for accurate contrast
  const slideBackground = slide.design?.background || '';
  const gradientClass = getGradientClass(slideBackground);
  
  // ALWAYS use the theme's background hex color for contrast calculation
  // This ensures accurate text color on light backgrounds like Peach (#FFF5F0)
  const textColor = getOptimalTextColor(theme.colors.background) || theme.colors.foreground;

  const chartColors = slide.chartData?.colors || [theme.colors.accent, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="group relative bg-card rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border">
      {/* Edit indicator */}
      {isEditable && (
        <div className="absolute top-4 left-4 z-30 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Type className="w-3 h-3" />
          Click to edit
        </div>
      )}
      
      <div 
        className={`${getGradientClass(slide.design?.background)} p-12 md:p-16 min-h-[600px] flex items-center justify-center relative overflow-hidden`}
        style={{ color: textColor }}
      >
        {/* Background Image */}
        {hasImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ 
              backgroundImage: `url(${slide.imageUrl})`,
              filter: 'blur(0px)'
            }}
          />
        )}

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Slide Number Badge */}
        <div 
          className="absolute top-8 right-8 backdrop-blur-md border px-4 py-2 rounded-full text-sm font-bold tracking-wide shadow-lg z-20"
          style={{ 
            borderColor: `${textColor}30`,
            backgroundColor: `${theme.colors.background}40`,
            color: textColor
          }}
        >
          SLIDE {slide.slideNumber}
        </div>

        <div className={`max-w-5xl ${isHero ? 'text-center' : 'text-left'} w-full relative z-10`}>
          {/* Icon for slide type */}
          {!isHero && (
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl backdrop-blur-md mb-6 text-4xl"
              style={{ backgroundColor: `${theme.colors.background}30` }}
            >
              {getSlideIcon(slide.type)}
            </div>
          )}

          {/* Title */}
          <h2 
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.({ ...slide, title: e.currentTarget.textContent || slide.title })}
            className={`font-bold mb-8 leading-tight tracking-tight drop-shadow-md ${isHero ? 'text-5xl md:text-7xl' : 'text-4xl md:text-5xl'} ${isEditable ? 'cursor-text hover:outline hover:outline-2 hover:outline-blue-500/50 rounded-lg px-2 -mx-2' : ''}`}
          >
            {slide.title}
          </h2>

          {/* Subtitle */}
          {slide.subtitle && (
            <p 
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate?.({ ...slide, subtitle: e.currentTarget.textContent || slide.subtitle })}
              className={`text-2xl md:text-3xl mb-10 font-light leading-relaxed drop-shadow-sm opacity-90 ${isEditable ? 'cursor-text hover:outline hover:outline-2 hover:outline-blue-500/50 rounded-lg px-2 -mx-2' : ''}`}
            >
              {slide.subtitle}
            </p>
          )}

          {/* Chart Visualization */}
          {hasChart && (
            <div className="my-10 backdrop-blur-md rounded-2xl p-6 border" style={{ borderColor: `${textColor}20`, backgroundColor: `${theme.colors.background}20` }}>
              <ResponsiveContainer width="100%" height={350}>
                {slide.chartData!.type === 'bar' && (
                  <BarChart data={slide.chartData!.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${textColor}30`} />
                    <XAxis dataKey="name" stroke={textColor} />
                    <YAxis stroke={textColor} />
                    <Tooltip 
                      contentStyle={{ 
                        background: theme.colors.card, 
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        color: theme.colors.foreground
                      }} 
                    />
                    <Legend wrapperStyle={{ color: textColor }} />
                    <Bar dataKey="value" fill={chartColors[0]} radius={[8, 8, 0, 0]} />
                  </BarChart>
                )}

                {slide.chartData!.type === 'line' && (
                  <LineChart data={slide.chartData!.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${textColor}30`} />
                    <XAxis dataKey="name" stroke={textColor} />
                    <YAxis stroke={textColor} />
                    <Tooltip 
                      contentStyle={{ 
                        background: theme.colors.card, 
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        color: theme.colors.foreground
                      }} 
                    />
                    <Legend wrapperStyle={{ color: textColor }} />
                    <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={3} />
                  </LineChart>
                )}

                {slide.chartData!.type === 'pie' && (
                  <PieChart>
                    <Pie
                      data={slide.chartData!.data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {slide.chartData!.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: theme.colors.card, 
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        color: theme.colors.foreground
                      }} 
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

          {/* Content */}
          {slide.content && !slide.bullets && !isFlowchart && !hasChart && (
            <p 
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdate?.({ ...slide, content: e.currentTarget.textContent || slide.content })}
              className={`text-xl md:text-2xl leading-relaxed font-medium max-w-3xl mx-auto drop-shadow-sm opacity-90 ${isEditable ? 'cursor-text hover:outline hover:outline-2 hover:outline-blue-500/50 rounded-lg px-2 -mx-2' : ''}`}
            >
              {slide.content}
            </p>
          )}

          {/* Bullets with enhanced styling */}
          {slide.bullets && slide.bullets.length > 0 && !isFlowchart && (
            <div className="grid gap-4 mt-10">
              {slide.bullets.map((bullet, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-4 backdrop-blur-sm rounded-2xl p-6 transition-all group/item border"
                  style={{ 
                    borderColor: `${textColor}20`,
                    backgroundColor: `${theme.colors.background}20`
                  }}
                >
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold group-hover/item:scale-110 transition-transform"
                    style={{ backgroundColor: `${textColor}20` }}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-xl md:text-2xl font-medium leading-relaxed flex-1 opacity-95">{bullet}</span>
                </div>
              ))}
            </div>
          )}

          {/* Flowchart/Process View */}
          {isFlowchart && slide.bullets && slide.bullets.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-10 flex-wrap">
              {slide.bullets.map((step, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div 
                    className="relative px-6 py-4 rounded-xl backdrop-blur-sm border transition-all hover:scale-105"
                    style={{ 
                      borderColor: `${textColor}30`,
                      backgroundColor: `${theme.colors.background}30`
                    }}
                  >
                    <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: theme.colors.accent, color: '#fff' }}>
                      {idx + 1}
                    </span>
                    <span className="text-lg font-medium">{step}</span>
                  </div>
                  {idx < (slide.bullets?.length || 0) - 1 && (
                    <ArrowLeft className="w-6 h-6 rotate-180 opacity-50" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          {slide.cta && (
            <button 
              className="mt-12 px-10 py-5 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto"
              style={{ 
                backgroundColor: textColor,
                color: theme.colors.background
              }}
            >
              {slide.cta} <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
