"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
  ArrowRight
} from "lucide-react";

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type CodeTab = 'html' | 'css' | 'javascript';

interface WebsiteCode {
  html: string;
  css: string;
  javascript: string;
  pages: {
    [key: string]: {
      html: string;
      title: string;
      description: string;
    };
  };
  assets: {
    colors: string[];
    fonts: string[];
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

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
      <div className="absolute inset-0 overflow-hidden">
        <div className="mesh-gradient opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-r from-amber-400/8 to-orange-400/8 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {/* Header - Matching Landing Page Style */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-blue-200/30 mb-6 hover:scale-105 transition-transform duration-300">
            <Code className="h-5 w-5 text-blue-500 animate-pulse" />
            <span className="text-sm font-semibold bolt-gradient-text">AI Website Builder</span>
            <Sparkles className="h-5 w-5 text-purple-500 animate-bounce" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="block mb-2">Create Stunning Websites</span>
            <span className="bolt-gradient-text">In Seconds with AI</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Describe your website and watch AI build complete, production-ready code with live preview
          </p>
        </div>

        {/* Input Section */}
        {!websiteCode && (
          <div className="glass-effect rounded-2xl p-6 sm:p-8 border-2 border-blue-200/30 backdrop-blur-xl shadow-xl">
            <div className="space-y-6">
              <div>
                <Label htmlFor="prompt" className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                  Describe Your Website
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="E.g., Create a modern landing page for a SaaS product with a hero section, features grid, pricing table, and contact form. Use blue and purple colors."
                  className="min-h-[120px] text-base glass-effect border-blue-200/30 focus:border-blue-400/60 focus:ring-blue-400/20 resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div>
                <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5 text-purple-500 animate-pulse" />
                  Choose a Style
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`group p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-lg shadow-md hover:shadow-lg ${
                        style === s.id
                          ? 'border-blue-400 glass-effect scale-105 ring-2 ring-blue-400/20'
                          : 'border-gray-200/50 hover:border-blue-300/70 glass-effect hover:scale-105'
                      }`}
                    >
                      <div className={`w-full h-12 rounded-lg ${s.color} mb-2 shadow-md ring-2 ring-white/20 group-hover:scale-110 transition-transform`}></div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-white">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={generateWebsite}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bolt-gradient text-white font-semibold py-6 text-lg rounded-xl hover:scale-105 transition-all duration-300 bolt-glow relative overflow-hidden shadow-lg"
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating Your Website...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Generate Website with AI</span>
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
        )}

        {/* Preview & Code Section */}
        {websiteCode && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setWebsiteCode(null)}
                className="glass-effect border-2 border-blue-200/50 hover:border-blue-300/70 hover:scale-105 transition-all duration-300 backdrop-blur-lg shadow-md"
                variant="outline"
              >
                ← New Website
              </Button>
              <Button
                onClick={downloadCode}
                className="glass-effect border-2 border-emerald-200/50 hover:border-emerald-300/70 hover:scale-105 transition-all duration-300 backdrop-blur-lg shadow-md gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Download Files
              </Button>
              <Button
                onClick={exportToFigma}
                className="glass-effect border-2 border-purple-200/50 hover:border-purple-300/70 hover:scale-105 transition-all duration-300 backdrop-blur-lg shadow-md gap-2"
                variant="outline"
              >
                <Figma className="h-4 w-4" />
                Export to Figma
              </Button>
            </div>

            {/* Preview & Code Tabs */}
            <div className="glass-effect rounded-2xl p-6 border-2 border-blue-200/30 backdrop-blur-xl shadow-xl">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 glass-effect border border-blue-200/30">
                  <TabsTrigger value="preview" className="gap-2 data-[state=active]:bolt-gradient data-[state=active]:text-white">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-2 data-[state=active]:bolt-gradient data-[state=active]:text-white">
                    <FileCode className="h-4 w-4" />
                    View Code
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4 mt-6">
                  {/* Viewport Controls */}
                  <div className="flex justify-center gap-2">
                    <Button
                      className={viewMode === 'desktop' ? 'bolt-gradient text-white' : 'glass-effect border-2 border-blue-200/50 hover:border-blue-300/70'}
                      variant={viewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('desktop')}
                    >
                      <Monitor className="h-4 w-4 mr-1" />
                      Desktop
                    </Button>
                    <Button
                      className={viewMode === 'tablet' ? 'bolt-gradient text-white' : 'glass-effect border-2 border-blue-200/50 hover:border-blue-300/70'}
                      variant={viewMode === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('tablet')}
                    >
                      <Tablet className="h-4 w-4 mr-1" />
                      Tablet
                    </Button>
                    <Button
                      className={viewMode === 'mobile' ? 'bolt-gradient text-white' : 'glass-effect border-2 border-blue-200/50 hover:border-blue-300/70'}
                      variant={viewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('mobile')}
                    >
                      <Smartphone className="h-4 w-4 mr-1" />
                      Mobile
                    </Button>
                  </div>

                  {/* Preview Frame */}
                  <div className="glass-effect rounded-xl p-4 border border-blue-200/30">
                    <div className="bg-white rounded-lg shadow-2xl overflow-hidden mx-auto transition-all duration-300 ring-2 ring-blue-200/20" style={{ width: getViewportWidth() }}>
                      <iframe
                        ref={iframeRef}
                        srcDoc={previewHtml}
                        className="w-full h-[600px] border-0"
                        title="Website Preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="space-y-4 mt-6">
                  {/* Code Type Tabs */}
                  <div className="flex gap-2 flex-wrap">
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
                  <div className="glass-effect rounded-xl p-4 bg-gray-900/95 text-green-400 font-mono text-sm overflow-auto max-h-[600px] border border-blue-200/30">
                    <pre className="whitespace-pre-wrap">
                      {activeCodeTab === 'html' && websiteCode.html}
                      {activeCodeTab === 'css' && websiteCode.css}
                      {activeCodeTab === 'javascript' && websiteCode.javascript}
                    </pre>
                  </div>

                  {/* Color Palette */}
                  {websiteCode.assets.colors.length > 0 && (
                    <div className="glass-effect rounded-xl p-6 border-2 border-purple-200/30 backdrop-blur-lg">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Palette className="h-5 w-5 text-purple-500" />
                        Color Palette
                      </h3>
                      <div className="flex gap-3 flex-wrap">
                        {websiteCode.assets.colors.map((color, index) => (
                          <div key={index} className="text-center group">
                            <div
                              className="w-16 h-16 rounded-xl shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                            <div className="text-xs mt-2 font-mono font-semibold">{color}</div>
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
      </div>
    </div>
  );
}
