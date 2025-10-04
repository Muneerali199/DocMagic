'use client';

import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Eye, Sparkles, Crown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Lazy load the preview components
const TemplateLivePreview = lazy(() =>
  import('./template-live-preview').then((mod) => ({ default: mod.TemplateLivePreview }))
);

const TemplateAutoPreview = lazy(() =>
  import('./template-auto-preview').then((mod) => ({ default: mod.TemplateAutoPreview }))
);

interface ColorStyle {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    type?: 'resume' | 'cv' | 'presentation' | 'letter';
    previewImage?: string;
    thumbnailImage?: string;
    style: ColorStyle;
    fonts: {
      heading: string;
      body: string;
    };
    features: string[];
    popular?: boolean;
    new?: boolean;
    pro?: boolean;
    rating?: number;
    usageCount?: number;
  };
  onUse: (templateId: string) => void;
  onPreview: (templateId: string) => void;
  className?: string;
}

export function TemplateCardEnhanced({ template, onUse, onPreview, className }: TemplateCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-300',
        'hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Live Preview */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
        {/* Real-time auto-playing template preview */}
        {template.type === 'presentation' ? (
          <div className="h-full w-full scale-[0.22] origin-top-left transform-gpu">
            <div className="w-[455%] h-[455%]">
              <Suspense
                fallback={
                  <div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(135deg, ${template.style.primary} 0%, ${template.style.secondary} 50%, ${template.style.accent} 100%)`,
                    }}
                  />
                }
              >
                <TemplateAutoPreview
                  templateId={template.id}
                  templateStyle={template.style}
                  fonts={template.fonts}
                  autoPlay={true}
                  interval={3000}
                />
              </Suspense>
            </div>
          </div>
        ) : template.type ? (
          <div className="h-full w-full scale-[0.18] origin-top-left transform-gpu">
            <div className="w-[555%] h-[555%]">
              <Suspense
                fallback={
                  <div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(135deg, ${template.style.primary} 0%, ${template.style.secondary} 50%, ${template.style.accent} 100%)`,
                    }}
                  />
                }
              >
                <TemplateLivePreview
                  templateType={template.type}
                  templateStyle={template.style}
                  fonts={template.fonts}
                />
              </Suspense>
            </div>
          </div>
        ) : (
          // Gradient preview fallback
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${template.style.primary} 0%, ${template.style.secondary} 50%, ${template.style.accent} 100%)`,
            }}
          />
        )}

        {/* Overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onPreview(template.id)}
            className="shadow-lg"
          >
            <Eye className="mr-1 h-4 w-4" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => onUse(template.id)}
            className="shadow-lg"
          >
            <Sparkles className="mr-1 h-4 w-4" />
            Use Template
          </Button>
        </motion.div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {template.new && (
            <Badge variant="default" className="bg-green-500 text-white shadow-lg">
              New
            </Badge>
          )}
          {template.popular && (
            <Badge variant="default" className="bg-orange-500 text-white shadow-lg">
              <Star className="mr-1 h-3 w-3 fill-white" />
              Popular
            </Badge>
          )}
          {template.pro && (
            <Badge variant="default" className="bg-purple-500 text-white shadow-lg">
              <Crown className="mr-1 h-3 w-3 fill-white" />
              Pro
            </Badge>
          )}
        </div>

        {/* Color Palette Indicator */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {[template.style.primary, template.style.secondary, template.style.accent].map((color, idx) => (
            <div
              key={idx}
              className="h-6 w-6 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {template.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {template.description}
          </p>
        </div>

        {/* Category Badge */}
        <Badge variant="outline" className="capitalize">
          {template.category}
        </Badge>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {template.features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/5 text-primary"
            >
              {feature}
            </span>
          ))}
          {template.features.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
              +{template.features.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {/* Rating */}
          {template.rating && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{template.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Usage Count */}
          {template.usageCount && (
            <div className="text-xs text-muted-foreground">
              {template.usageCount.toLocaleString()} uses
            </div>
          )}

          {/* Font Info */}
          <div className="text-xs text-muted-foreground ml-auto">
            {template.fonts.heading} • {template.fonts.body}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
