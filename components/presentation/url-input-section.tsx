"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Globe, CheckCircle, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type InputMode = 'text' | 'url';

interface UrlInputSectionProps {
  prompt: string;
  setPrompt: (value: string) => void;
  isGenerating: boolean;
  onUrlExtracted?: (content: string) => void;
}

export function UrlInputSection({ 
  prompt, 
  setPrompt, 
  isGenerating,
  onUrlExtracted 
}: UrlInputSectionProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const { toast } = useToast();

  const fetchUrlContent = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "Please enter a URL",
        description: "Enter a valid website URL to extract content from",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingUrl(true);

    try {
      const response = await fetch('/api/fetch-url-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: websiteUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch URL content');
      }

      const data = await response.json();
      
      // Set the extracted content as the prompt
      const contentSummary = `Create a presentation based on this content from ${data.title}:\n\n${data.content}`;
      setExtractedContent(data.content);
      setPrompt(contentSummary);
      
      if (onUrlExtracted) {
        onUrlExtracted(data.content);
      }

      toast({
        title: "✅ Content Extracted Successfully!",
        description: `Extracted ${data.wordCount} words from "${data.title}". Ready to generate presentation!`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to fetch URL",
        description: error.message || "Could not extract content from the URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingUrl(false);
    }
  };

  return (
    <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)} className="w-full">
      <TabsList className="grid w-full grid-cols-2 glass-effect">
        <TabsTrigger value="text" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Text Input
        </TabsTrigger>
        <TabsTrigger value="url" className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          From URL
        </TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="space-y-2 mt-4">
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
          disabled={isGenerating || isFetchingUrl}
        />
      </TabsContent>

      <TabsContent value="url" className="space-y-3 mt-4">
        <Label htmlFor="websiteUrl" className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          Website URL
        </Label>
        <Input
          id="websiteUrl"
          type="url"
          placeholder="https://example.com/article"
          className="glass-effect border-blue-400/30 focus:border-blue-400/60 focus:ring-blue-400/20"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          disabled={isGenerating || isFetchingUrl}
        />
        <Button
          onClick={fetchUrlContent}
          disabled={isFetchingUrl || !websiteUrl.trim() || isGenerating}
          variant="outline"
          className="w-full glass-effect border-blue-400/30 hover:border-blue-400/60"
        >
          {isFetchingUrl ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting content...
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Extract Content from URL
            </>
          )}
        </Button>
        {extractedContent && (
          <div className="p-3 glass-effect rounded-lg border border-green-400/20 bg-green-50/10">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Content extracted successfully!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {extractedContent.split(/\s+/).length} words extracted. Ready to generate presentation.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
