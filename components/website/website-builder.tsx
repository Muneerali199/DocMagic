"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { websiteTemplates } from "@/lib/website-templates";
import { useRouter } from "next/navigation";
import WebsiteChat from "./website-chat";
import {
  Loader2,
  Sparkles,
  Code,
  Eye,
  Download,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  Tablet,
  Copy,
  Check,
  FileCode,
  Figma,
  ArrowRight,
  ExternalLink,
  MessageSquare
} from "lucide-react";

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type CodeTab = 'html' | 'css' | 'javascript';

interface WebsiteCode {
  html: string;
  css: string;
  javascript: string;
  pages?: {
    [key: string]: {
      html: string;
      title: string;
      description: string;
    };
  };
  assets?: {
    colors: string[];
    fonts: string[];
    images?: string[];
  };
}

export function WebsiteBuilder() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [isGenerating, setIsGenerating] = useState(false);
  const [websiteCode, setWebsiteCode] = useState<WebsiteCode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('html');
  const [copied, setCopied] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const styles = [
    { id: 'modern', name: 'Modern', description: 'Clean & minimalist', color: 'bg-blue-500' },
    { id: 'creative', name: 'Creative', description: 'Bold & vibrant', color: 'bg-purple-500' },
    { id: 'professional', name: 'Professional', description: 'Corporate & trustworthy', color: 'bg-gray-700' },
    { id: 'minimal', name: 'Minimal', description: 'Maximum simplicity', color: 'bg-gray-400' },
    { id: 'tech', name: 'Tech', description: 'Futuristic & dark', color: 'bg-cyan-500' },
    { id: 'ecommerce', name: 'E-Commerce', description: 'Product-focused', color: 'bg-green-500' },
  ];

  const generateWebsite = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a description",
        description: "Describe the website you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate/website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          pages: ['home'],
          includeAnimations: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate website');
      }

      const data = await response.json();
      
      console.log('Generated website data:', data);
      
      // Ensure we have the required fields
      if (!data.html || !data.css) {
        throw new Error('Invalid response: missing HTML or CSS');
      }
      
      setWebsiteCode(data);

      toast({
        title: "🎉 Website Generated!",
        description: "Your website is ready. Check the preview!",
      });

      // Auto-open chat sidebar after generation
      setShowChat(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Update preview HTML when websiteCode changes
  useEffect(() => {
    if (websiteCode) {
      const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>${websiteCode.css || ''}</style>
</head>
<body>
    ${websiteCode.html || '<p>No HTML content</p>'}
    <script>${websiteCode.javascript || ''}</script>
</body>
</html>`;
      
      setPreviewHtml(fullHTML);
      console.log('Preview HTML updated');
    }
  }, [websiteCode]);

  const copyCode = async () => {
    if (!websiteCode) return;

    const code = activeCodeTab === 'html' 
      ? websiteCode.html 
      : activeCodeTab === 'css' 
      ? websiteCode.css 
      : websiteCode.javascript;

    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: "Copied!",
      description: `${activeCodeTab.toUpperCase()} code copied to clipboard`,
    });
  };

  const downloadCode = () => {
    if (!websiteCode) return;

    // Create a zip-like structure (for now, download individual files)
    const files = [
      { name: 'index.html', content: websiteCode.html },
      { name: 'styles.css', content: websiteCode.css },
      { name: 'script.js', content: websiteCode.javascript },
    ];

    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    toast({
      title: "📦 Files Downloaded!",
      description: "HTML, CSS, and JavaScript files are ready",
    });
  };

  const exportToFigma = () => {
    toast({
      title: "Figma Export",
      description: "Copy the HTML and paste it into Figma's HTML embed feature",
    });
  };

  const getViewportWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements - Matching Landing Page */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="mesh-gradient opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        {/* Compact Header */}
        <div className="text-center mb-4 sm:mb-6 px-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full glass-effect border border-blue-200/30 mb-2 sm:mb-3 hover:scale-105 transition-transform duration-300">
            <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
            <span className="text-[10px] sm:text-xs md:text-sm font-semibold bolt-gradient-text">AI Website Builder</span>
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
          </div>
          
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
            <span className="block">Create Stunning Websites</span>
            <span className="bolt-gradient-text">In Seconds with AI</span>
          </h1>
        </div>

        {/* Input Section */}
        {!websiteCode && (
          <div className="space-y-4 sm:space-y-6">
            {/* Main Input Form */}
            <div className="glass-effect rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200/30 backdrop-blur-xl shadow-xl">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="prompt" className="text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                    Describe Your Website
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="E.g., Create a modern landing page for a SaaS product with a hero section, features grid, pricing table, and contact form."
                    className="min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm glass-effect border-blue-200/30 focus:border-blue-400/60 focus:ring-blue-400/20 resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                    <Layout className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                    Base Style
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                    {styles.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id)}
                        className={`group p-1.5 sm:p-2 rounded-lg border transition-all duration-300 backdrop-blur-lg shadow-sm hover:shadow-md ${
                          style === s.id
                            ? 'border-blue-400 glass-effect scale-105 ring-1 ring-blue-400/20'
                            : 'border-gray-200/50 hover:border-blue-300/70 glass-effect hover:scale-105'
                        }`}
                      >
                        <div className={`w-full h-6 sm:h-8 rounded-md ${s.color} mb-0.5 sm:mb-1 shadow-sm ring-1 ring-white/20 group-hover:scale-110 transition-transform`}></div>
                        <div className="text-[9px] sm:text-[10px] font-semibold text-gray-800 dark:text-white text-center">{s.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateWebsite}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bolt-gradient text-white font-semibold py-4 sm:py-5 text-sm sm:text-base rounded-xl hover:scale-105 transition-all duration-300 bolt-glow relative overflow-hidden shadow-lg"
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 relative z-10">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Generating Your Website...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Generate Website with AI</span>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </>
                    )}
                  </div>
                  {!isGenerating && (
                    <div className="absolute inset-0 shimmer opacity-30"></div>
                  )}
                </Button>
              </div>
            </div>

            {/* Premium Templates Section - Full Width Below */}
            <div className="glass-effect rounded-xl p-3 sm:p-4 md:p-6 border-2 border-purple-200/30 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <Layout className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    <span className="bolt-gradient-text">Premium Templates</span>
                  </h2>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                    Start with professionally designed templates
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  {showTemplates ? 'Hide Templates' : 'Show Templates'}
                </Button>
              </div>
              
              {showTemplates && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {websiteTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="group relative overflow-hidden rounded-lg border border-gray-200/50 hover:border-blue-300/70 glass-effect hover:scale-[1.02] transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      {/* Template Thumbnail */}
                      <div 
                        className={`w-full h-40 bg-gradient-to-br ${template.gradient} relative overflow-hidden cursor-pointer`}
                        onClick={() => router.push(`/website-builder/templates/${template.id}/preview`)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-7xl opacity-20">{template.icon}</div>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                            <Button
                              size="sm"
                              className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/website-builder/templates/${template.id}/preview`);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/website-builder/templates/${template.id}/editor`);
                              }}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              Use
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Template Info */}
                      <div className="p-3 sm:p-4 bg-white dark:bg-gray-800">
                        <h3 className="font-semibold text-xs sm:text-sm mb-1 text-gray-800 dark:text-white">
                          {template.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {template.category}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => router.push(`/website-builder/templates/${template.id}/preview`)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview & Code Section */}
        {websiteCode && (
          <div className="space-y-4 sm:space-y-6">
            {/* Action Buttons - Mobile Optimized */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
              <Button
                onClick={() => setWebsiteCode(null)}
                className="glass-effect border-2 border-blue-200/50 hover:border-blue-300/70 hover:scale-105 transition-all duration-300 backdrop-blur-lg shadow-md text-xs sm:text-sm"
                variant="outline"
                size="sm"
              >
                ← New
              </Button>
              <Button
                onClick={downloadCode}
                className="glass-effect border-2 border-emerald-200/50 hover:border-emerald-300/70 hover:scale-105 transition-all duration-300 backdrop-blur-lg shadow-md gap-1 sm:gap-2 text-xs sm:text-sm"
                variant="outline"
                size="sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">Save</span>
              </Button>
              <Button
                onClick={exportToFigma}
                className="glass-effect border-2 border-purple-200/50 hover:border-purple-300/70 hover:scale-105 transition-all duration-300 backdrop-blur-lg shadow-md gap-1 sm:gap-2 text-xs sm:text-sm"
                variant="outline"
                size="sm"
              >
                <Figma className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Figma</span>
              </Button>
            </div>

            {/* Preview & Code Tabs */}
            <div className="glass-effect rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border-2 border-blue-200/30 backdrop-blur-xl shadow-xl">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 glass-effect border border-blue-200/30 h-auto">
                  <TabsTrigger value="preview" className="gap-1 sm:gap-2 data-[state=active]:bolt-gradient data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-2.5">
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Live Preview</span>
                    <span className="sm:hidden">Preview</span>
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-1 sm:gap-2 data-[state=active]:bolt-gradient data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-2.5">
                    <FileCode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">View Code</span>
                    <span className="sm:hidden">Code</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                  {/* Viewport Controls - Mobile Optimized */}
                  <div className="flex justify-center gap-1 sm:gap-2 flex-wrap">
                    <Button
                      className={viewMode === 'desktop' ? 'bolt-gradient text-white' : 'glass-effect border-2 border-blue-200/50 hover:border-blue-300/70'}
                      variant={viewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('desktop')}
                    >
                      <Monitor className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Desktop</span>
                    </Button>
                    <Button
                      className={viewMode === 'tablet' ? 'bolt-gradient text-white' : 'glass-effect border-2 border-blue-200/50 hover:border-blue-300/70'}
                      variant={viewMode === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('tablet')}
                    >
                      <Tablet className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Tablet</span>
                    </Button>
                    <Button
                      className={viewMode === 'mobile' ? 'bolt-gradient text-white' : 'glass-effect border-2 border-blue-200/50 hover:border-blue-300/70'}
                      variant={viewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('mobile')}
                    >
                      <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Mobile</span>
                    </Button>
                  </div>

                  {/* Preview Frame - Mobile Optimized */}
                  <div className="glass-effect rounded-lg sm:rounded-xl p-1.5 sm:p-2 md:p-4 border border-blue-200/30">
                    <div className="bg-white rounded-lg shadow-2xl overflow-hidden mx-auto transition-all duration-300 ring-2 ring-blue-200/20" style={{ width: getViewportWidth() }}>
                      <iframe
                        ref={iframeRef}
                        srcDoc={previewHtml}
                        className="w-full h-[400px] sm:h-[500px] md:h-[600px] border-0"
                        title="Website Preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                  {/* Code Type Tabs */}
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                    <Button
                      className={activeCodeTab === 'html' ? 'bolt-gradient text-white' : 'glass-effect border-2 border-blue-200/50'}
                      variant={activeCodeTab === 'html' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCodeTab('html')}
                    >
                      HTML
                    </Button>
                    <Button
                      className={activeCodeTab === 'css' ? 'bolt-gradient text-white' : 'glass-effect border-2 border-blue-200/50'}
                      variant={activeCodeTab === 'css' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCodeTab('css')}
                    >
                      CSS
                    </Button>
                    <Button
                      className={activeCodeTab === 'javascript' ? 'bolt-gradient text-white' : 'glass-effect border-2 border-blue-200/50'}
                      variant={activeCodeTab === 'javascript' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCodeTab('javascript')}
                    >
                      JavaScript
                    </Button>
                    <Button
                      onClick={copyCode}
                      size="sm"
                      variant="outline"
                      className="ml-auto gap-2 glass-effect border-2 border-emerald-200/50 hover:border-emerald-300/70"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>

                  {/* Code Display */}
                  <div className="glass-effect rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 bg-gray-900/95 text-green-400 font-mono text-xs sm:text-sm overflow-auto max-h-[400px] sm:max-h-[600px] border border-blue-200/30">
                    <pre className="whitespace-pre-wrap">
                      {activeCodeTab === 'html' && websiteCode.html}
                      {activeCodeTab === 'css' && websiteCode.css}
                      {activeCodeTab === 'javascript' && websiteCode.javascript}
                    </pre>
                  </div>

                  {/* Color Palette */}
                  {websiteCode.assets?.colors && websiteCode.assets.colors.length > 0 && (
                    <div className="glass-effect rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-purple-200/30 backdrop-blur-lg">
                      <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                        <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                        Color Palette
                      </h3>
                      <div className="flex gap-2 sm:gap-3 flex-wrap">
                        {websiteCode.assets.colors.map((color, index) => (
                          <div key={index} className="text-center group">
                            <div
                              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                            <div className="text-[10px] sm:text-xs mt-1 sm:mt-2 font-mono font-semibold">{color}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generated Images */}
                  {websiteCode.assets?.images && websiteCode.assets.images.length > 0 && (
                    <div className="glass-effect rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200/30 backdrop-blur-lg">
                      <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        Generated Images ({websiteCode.assets.images.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                        {websiteCode.assets.images.map((imageUrl: string, index: number) => (
                          <div key={index} className="group relative">
                            <img
                              src={imageUrl}
                              alt={`Generated image ${index + 1}`}
                              className="w-full h-20 sm:h-24 object-cover rounded-lg shadow-md ring-2 ring-white/20 group-hover:scale-105 transition-transform"
                            />
                            <div className="text-[10px] sm:text-xs mt-1 text-center font-semibold text-muted-foreground">
                              Image {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Chat Sidebar Toggle Button - Mobile Optimized */}
        {websiteCode && !showChat && (
          <Button
            onClick={() => setShowChat(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-2xl hover:scale-110 transition-all duration-300 text-xs sm:text-sm"
            size="sm"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
            <span className="hidden sm:inline">Improve Website</span>
            <span className="sm:hidden ml-1">Improve</span>
          </Button>
        )}

        {/* Chat Sidebar Component */}
        {websiteCode && (
          <WebsiteChat
            currentCode={websiteCode}
            onCodeUpdate={(newCode) => {
              setWebsiteCode(newCode);
              toast({
                title: "✅ Website Updated!",
                description: "Your changes have been applied",
              });
            }}
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            style={style}
          />
        )}
      </div>
    </div>
  );
}
