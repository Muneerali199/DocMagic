"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Sparkles, 
  X, 
  Check,
  RefreshCw,
  Trash2,
  Download
} from "lucide-react";
import { searchImages } from "@/lib/unsplash";
import { generateAlternativeImages } from "@/lib/mistral";
import { cn } from "@/lib/utils";

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  slideIndex: number;
  slideTitle: string;
  slideContent: string;
  currentImage?: string;
  onImageUpdate: (slideIndex: number, imageUrl: string) => void;
  onImageRemove: (slideIndex: number) => void;
}

export function PostGenerationImageEditor({
  isOpen,
  onClose,
  slideIndex,
  slideTitle,
  slideContent,
  currentImage,
  onImageUpdate,
  onImageRemove
}: ImageEditorProps) {
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"ai" | "search" | "upload">("ai");

  const handleGetAISuggestions = async () => {
    setIsLoadingAI(true);
    try {
      // Get 9 AI-powered suggestions
      const suggestions = await generateAlternativeImages(
        slideTitle,
        slideContent,
        9
      );

      // Fetch images for each suggestion
      const imagePromises = suggestions.map(async (suggestion) => {
        const images = await searchImages(suggestion.searchQuery, 4);
        return images.map(img => ({
          url: img.urls.regular,
          thumb: img.urls.small,
          alt: img.alt_description || suggestion.description,
          photographer: img.user?.name,
          photographerUrl: img.user?.links?.html,
          downloadLocation: img.links?.download_location,
          description: suggestion.description
        }));
      });

      const results = await Promise.all(imagePromises);
      setAiSuggestions(results.flat());
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const images = await searchImages(searchQuery, 20);
      setSearchResults(images.map(img => ({
        url: img.urls.regular,
        thumb: img.urls.small,
        alt: img.alt_description || searchQuery,
        photographer: img.user?.name,
        photographerUrl: img.user?.links?.html,
        downloadLocation: img.links?.download_location
      })));
    } catch (error) {
      console.error("Error searching images:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    onImageUpdate(slideIndex, imageUrl);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onImageRemove(slideIndex);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Edit Slide Image
          </DialogTitle>
          <DialogDescription>
            Slide {slideIndex + 1}: {slideTitle}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Search Unsplash
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Custom
            </TabsTrigger>
          </TabsList>

          {/* AI Suggestions Tab */}
          <TabsContent value="ai" className="flex-1 overflow-auto mt-4">
            {currentImage && (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <Label className="text-sm font-medium mb-2 block">Current Image</Label>
                <div className="relative">
                  <img 
                    src={currentImage} 
                    alt="Current" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            )}

            {aiSuggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-16 w-16 text-yellow-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Get AI-Powered Image Suggestions</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Our AI will analyze your slide content and suggest perfectly matched, 
                  professional images from Unsplash.
                </p>
                <Button 
                  onClick={handleGetAISuggestions} 
                  disabled={isLoadingAI}
                  size="lg"
                >
                  {isLoadingAI ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get AI Suggestions
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    {aiSuggestions.length} AI-Curated Images
                  </Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGetAISuggestions}
                    disabled={isLoadingAI}
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-1", isLoadingAI && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {aiSuggestions.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleImageSelect(img.url)}
                      className={cn(
                        "relative group rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                        currentImage === img.url 
                          ? "border-yellow-400 ring-2 ring-yellow-400" 
                          : "border-gray-200 hover:border-yellow-300"
                      )}
                    >
                      <img 
                        src={img.thumb} 
                        alt={img.alt}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      {currentImage === img.url && (
                        <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      {img.photographer && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-xs text-white truncate">
                            by {img.photographer}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for images... (e.g., 'business meeting', 'tech innovation')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {searchResults.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleImageSelect(img.url)}
                      className={cn(
                        "relative group rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                        currentImage === img.url 
                          ? "border-yellow-400 ring-2 ring-yellow-400" 
                          : "border-gray-200 hover:border-yellow-300"
                      )}
                    >
                      <img 
                        src={img.thumb} 
                        alt={img.alt}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      {currentImage === img.url && (
                        <div className="absolute top-1 right-1 bg-yellow-400 rounded-full p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="flex-1 mt-4">
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Your Own Image</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                Perfect for logos, screenshots, custom graphics, or branded content
              </p>
              <label>
                <Button size="lg">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: JPG, PNG, GIF (max 10MB)
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
