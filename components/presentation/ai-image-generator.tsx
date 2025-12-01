'use client';

import { useState, useCallback } from 'react';
import { 
  X, 
  Loader2, 
  Wand2, 
  Image as ImageIcon, 
  FileImage,
  Layout,
  PenTool,
  Grid,
  BarChart3,
  Monitor,
  Sparkles,
  RefreshCw,
  Check,
  Download,
  Palette,
  Lightbulb,
  Smartphone,
  Globe,
  Code,
  Presentation,
  Layers,
  Box
} from 'lucide-react';

interface AIImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string, imageType: string) => void;
  slideTitle?: string;
  slideContent?: string;
  slideType?: string;
  presentationTopic?: string;
  theme?: {
    colors: {
      accent: string;
      background: string;
      foreground: string;
    };
  };
}

type ImageType = 
  | 'illustration' 
  | 'diagram' 
  | 'wireframe' 
  | 'mockup' 
  | 'logo' 
  | 'icon' 
  | 'chart' 
  | 'photo' 
  | 'abstract' 
  | 'infographic' 
  | 'concept' 
  | 'technology';

interface ImageTypeConfig {
  id: ImageType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const IMAGE_TYPES: ImageTypeConfig[] = [
  { id: 'illustration', label: 'Illustration', description: 'Modern vector illustrations', icon: PenTool, color: '#8B5CF6' },
  { id: 'diagram', label: 'Diagram', description: 'Process & flow diagrams', icon: Grid, color: '#3B82F6' },
  { id: 'wireframe', label: 'Wireframe', description: 'UI/UX wireframe mockups', icon: Layout, color: '#6B7280' },
  { id: 'mockup', label: 'Mockup', description: 'Product & device mockups', icon: Smartphone, color: '#10B981' },
  { id: 'infographic', label: 'Infographic', description: 'Data storytelling visuals', icon: BarChart3, color: '#F59E0B' },
  { id: 'chart', label: 'Chart', description: 'Data visualization charts', icon: BarChart3, color: '#EF4444' },
  { id: 'logo', label: 'Logo', description: 'Brand & logo designs', icon: Sparkles, color: '#EC4899' },
  { id: 'icon', label: 'Icon Set', description: 'Professional icon designs', icon: Layers, color: '#14B8A6' },
  { id: 'photo', label: 'Photo', description: 'Professional photography', icon: ImageIcon, color: '#0EA5E9' },
  { id: 'abstract', label: 'Abstract', description: 'Abstract backgrounds', icon: Palette, color: '#A855F7' },
  { id: 'technology', label: 'Technology', description: 'Tech & futuristic visuals', icon: Code, color: '#06B6D4' },
  { id: 'concept', label: 'Concept Art', description: 'Creative visualizations', icon: Lightbulb, color: '#F97316' },
];

interface GeneratedImage {
  url: string;
  type: string;
  prompt: string;
  success?: boolean;
}

export function AIImageGeneratorModal({
  isOpen,
  onClose,
  onImageSelect,
  slideTitle = '',
  slideContent = '',
  slideType = 'content',
  presentationTopic = '',
  theme
}: AIImageGeneratorProps) {
  const [selectedType, setSelectedType] = useState<ImageType>('illustration');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generateCount, setGenerateCount] = useState(4);

  const accentColor = theme?.colors?.accent || '#6366F1';

  // Get topic for generation
  const getTopic = useCallback(() => {
    if (customPrompt.trim()) return customPrompt.trim();
    if (slideTitle) return slideTitle;
    if (presentationTopic) return presentationTopic;
    return 'professional business';
  }, [customPrompt, slideTitle, presentationTopic]);

  // Generate images
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSelectedImageIndex(null);

    try {
      const response = await fetch('/api/generate/slide-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: getTopic(),
          imageType: selectedType,
          slideType,
          slideTitle,
          slideContent: slideContent?.substring(0, 500),
          customPrompt: customPrompt.trim() || undefined,
          size: '1024x576',
          count: generateCount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate images');
      }

      setGeneratedImages(data.images || []);
      
      if (data.fallback) {
        setError('API key not configured. Showing placeholders.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate images');
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle image selection
  const handleSelectImage = () => {
    if (selectedImageIndex !== null && generatedImages[selectedImageIndex]) {
      const selected = generatedImages[selectedImageIndex];
      onImageSelect(selected.url, selected.type);
      onClose();
    }
  };

  // Quick prompt suggestions
  const quickPrompts = [
    { label: 'Growth Chart', prompt: 'business growth chart with upward trend' },
    { label: 'Team Collaboration', prompt: 'professional team working together' },
    { label: 'Innovation', prompt: 'innovative technology concept' },
    { label: 'Success', prompt: 'achievement and success celebration' },
    { label: 'Strategy', prompt: 'business strategy and planning' },
    { label: 'Data Analysis', prompt: 'data analytics dashboard' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: theme?.colors?.background || '#1a1a2e' }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: `${theme?.colors?.foreground || '#fff'}15` }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Wand2 className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <h2 
                className="text-xl font-bold"
                style={{ color: theme?.colors?.foreground || '#fff' }}
              >
                AI Image Generator
              </h2>
              <p 
                className="text-sm opacity-70"
                style={{ color: theme?.colors?.foreground || '#fff' }}
              >
                Generate stunning visuals for your presentation
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: theme?.colors?.foreground || '#fff' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Options */}
            <div className="space-y-6">
              {/* Image Type Selection */}
              <div>
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: theme?.colors?.foreground || '#fff' }}
                >
                  Choose Image Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {IMAGE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                        }`}
                        style={{
                          borderColor: isSelected ? type.color : `${theme?.colors?.foreground || '#fff'}15`,
                          backgroundColor: isSelected ? `${type.color}15` : 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4" style={{ color: type.color }} />
                          <span 
                            className="text-xs font-medium"
                            style={{ color: theme?.colors?.foreground || '#fff' }}
                          >
                            {type.label}
                          </span>
                        </div>
                        <p 
                          className="text-[10px] opacity-60 truncate"
                          style={{ color: theme?.colors?.foreground || '#fff' }}
                        >
                          {type.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme?.colors?.foreground || '#fff' }}
                >
                  Describe what you want (optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={`e.g., "${slideTitle || presentationTopic || 'modern business concept'}"`}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border bg-transparent resize-none text-sm focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: `${theme?.colors?.foreground || '#fff'}20`,
                    color: theme?.colors?.foreground || '#fff',
                    // @ts-ignore
                    '--tw-ring-color': accentColor
                  }}
                />
                
                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickPrompts.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => setCustomPrompt(qp.prompt)}
                      className="px-3 py-1 text-xs rounded-full border transition-colors hover:bg-white/5"
                      style={{ 
                        borderColor: `${theme?.colors?.foreground || '#fff'}20`,
                        color: theme?.colors?.foreground || '#fff'
                      }}
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Count */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme?.colors?.foreground || '#fff' }}
                >
                  Number of variations: {generateCount}
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: accentColor }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating {generateCount} images...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}s
                  </>
                )}
              </button>

              {/* Current Slide Info */}
              {(slideTitle || presentationTopic) && (
                <div 
                  className="p-4 rounded-xl border"
                  style={{ 
                    borderColor: `${theme?.colors?.foreground || '#fff'}15`,
                    backgroundColor: `${theme?.colors?.foreground || '#fff'}05`
                  }}
                >
                  <p 
                    className="text-xs font-medium mb-1 opacity-60"
                    style={{ color: theme?.colors?.foreground || '#fff' }}
                  >
                    Generating for:
                  </p>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: theme?.colors?.foreground || '#fff' }}
                  >
                    {slideTitle || presentationTopic}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Generated Images */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label 
                  className="text-sm font-medium"
                  style={{ color: theme?.colors?.foreground || '#fff' }}
                >
                  Generated Images
                </label>
                {generatedImages.length > 0 && (
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="text-xs flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                    style={{ color: theme?.colors?.foreground || '#fff' }}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                )}
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {generatedImages.length === 0 && !isGenerating ? (
                <div 
                  className="h-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center"
                  style={{ borderColor: `${theme?.colors?.foreground || '#fff'}20` }}
                >
                  <FileImage 
                    className="w-12 h-12 mb-3 opacity-30" 
                    style={{ color: theme?.colors?.foreground || '#fff' }}
                  />
                  <p 
                    className="text-sm opacity-50"
                    style={{ color: theme?.colors?.foreground || '#fff' }}
                  >
                    Select type and click generate
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {isGenerating ? (
                    Array(generateCount).fill(0).map((_, i) => (
                      <div 
                        key={i}
                        className="aspect-video rounded-xl animate-pulse"
                        style={{ backgroundColor: `${theme?.colors?.foreground || '#fff'}10` }}
                      />
                    ))
                  ) : (
                    generatedImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          selectedImageIndex === index ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                        }`}
                        style={{
                          borderColor: selectedImageIndex === index 
                            ? accentColor 
                            : `${theme?.colors?.foreground || '#fff'}15`
                        }}
                      >
                        <img
                          src={img.url}
                          alt={`Generated ${img.type}`}
                          className="w-full h-full object-cover"
                        />
                        {selectedImageIndex === index && (
                          <div 
                            className="absolute inset-0 bg-black/40 flex items-center justify-center"
                          >
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: accentColor }}
                            >
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                        {!img.success && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-red-500/80 text-white text-xs">
                            Failed
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-between shrink-0"
          style={{ borderColor: `${theme?.colors?.foreground || '#fff'}15` }}
        >
          <p 
            className="text-xs opacity-50"
            style={{ color: theme?.colors?.foreground || '#fff' }}
          >
            Powered by FLUX AI • High-quality image generation
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
              style={{ color: theme?.colors?.foreground || '#fff' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSelectImage}
              disabled={selectedImageIndex === null}
              className="px-6 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: accentColor }}
            >
              Use This Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIImageGeneratorModal;
