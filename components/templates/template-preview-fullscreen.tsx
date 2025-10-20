'use client';

import React, { useState } from 'react';
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Share2,
  Heart,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface TemplatePreviewFullScreenProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    previewImage?: string;
    previewImages?: string[];
    style: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
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
  onUseTemplate: (templateId: string) => void;
}

export function TemplatePreviewFullScreen({
  isOpen,
  onClose,
  template,
  onUseTemplate,
}: TemplatePreviewFullScreenProps) {
  const [zoom, setZoom] = useState(100);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showInfo, setShowInfo] = useState(true);

  const previewImages = template.previewImages || (template.previewImage ? [template.previewImage] : []);
  const totalSlides = previewImages.length;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  const handleUse = () => {
    onUseTemplate(template.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 z-50 bg-background rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{template.name}</h2>
                <div className="flex gap-1.5">
                  {template.new && (
                    <Badge variant="default" className="bg-green-500">
                      New
                    </Badge>
                  )}
                  {template.popular && (
                    <Badge variant="default" className="bg-orange-500">
                      Popular
                    </Badge>
                  )}
                  {template.pro && (
                    <Badge variant="default" className="bg-purple-500">
                      Pro
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-2 min-w-[3rem] text-center">
                    {zoom}%
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                {/* Info Toggle */}
                <Button
                  variant={showInfo ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="h-4 w-4" />
                </Button>

                {/* Close */}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Preview Area */}
              <div className="flex-1 relative bg-muted/30 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="flex items-center justify-center min-h-full p-8">
                    {previewImages.length > 0 ? (
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                        style={{ transform: `scale(${zoom / 100})` }}
                      >
                        <Image
                          src={previewImages[currentSlide]}
                          alt={`${template.name} - Slide ${currentSlide + 1}`}
                          className="max-w-full h-auto rounded-lg shadow-2xl"
                          width={1280}
                          height={720}
                        />
                      </motion.div>
                    ) : (
                      <div
                        className="w-full max-w-4xl aspect-[16/9] rounded-lg shadow-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${template.style.primary} 0%, ${template.style.secondary} 50%, ${template.style.accent} 100%)`,
                          transform: `scale(${zoom / 100})`,
                        }}
                      />
                    )}
                  </div>
                </ScrollArea>

                {/* Navigation Controls */}
                {totalSlides > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handlePrevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 shadow-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleNextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 shadow-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Slide Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      <div className="flex items-center gap-2">
                        {previewImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={cn(
                              'w-2 h-2 rounded-full transition-all',
                              idx === currentSlide
                                ? 'bg-primary w-8'
                                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Info Sidebar */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-80 border-l bg-background"
                  >
                    <ScrollArea className="h-full">
                      <div className="p-6 space-y-6">
                        {/* Description */}
                        <div>
                          <h3 className="font-semibold mb-2">Description</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>

                        <Separator />

                        {/* Category */}
                        <div>
                          <h3 className="font-semibold mb-2">Category</h3>
                          <Badge variant="outline" className="capitalize">
                            {template.category}
                          </Badge>
                        </div>

                        <Separator />

                        {/* Features */}
                        <div>
                          <h3 className="font-semibold mb-2">Features</h3>
                          <div className="flex flex-wrap gap-2">
                            {template.features.map((feature, idx) => (
                              <Badge key={idx} variant="secondary">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Style */}
                        <div>
                          <h3 className="font-semibold mb-2">Color Palette</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {[
                              template.style.primary,
                              template.style.secondary,
                              template.style.accent,
                              template.style.background,
                              template.style.text,
                            ].map((color, idx) => (
                              <div key={idx} className="space-y-1">
                                <div
                                  className="h-12 rounded-md border shadow-sm"
                                  style={{ backgroundColor: color }}
                                />
                                <p className="text-xs text-center text-muted-foreground font-mono">
                                  {color}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Typography */}
                        <div>
                          <h3 className="font-semibold mb-2">Typography</h3>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Heading</p>
                              <p className="font-semibold">{template.fonts.heading}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Body</p>
                              <p className="font-semibold">{template.fonts.body}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Stats */}
                        {(template.rating || template.usageCount) && (
                          <>
                            <div className="space-y-2">
                              {template.rating && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Rating</span>
                                  <span className="font-semibold">{template.rating.toFixed(1)} / 5.0</span>
                                </div>
                              )}
                              {template.usageCount && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Uses</span>
                                  <span className="font-semibold">
                                    {template.usageCount.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Separator />
                          </>
                        )}

                        {/* Actions */}
                        <div className="space-y-2">
                          <Button onClick={handleUse} className="w-full gap-2" size="lg">
                            <Sparkles className="h-4 w-4" />
                            Use This Template
                          </Button>
                          <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
