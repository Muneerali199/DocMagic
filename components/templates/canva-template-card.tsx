'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Eye,
  Star,
  Crown,
  Sparkles,
  Clock,
  Users,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Palette,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

interface CanvaTemplateCardProps {
  id: string;
  title: string;
  description?: string;
  type: 'resume' | 'presentation' | 'letter' | 'cv' | 'diagram';
  preview_image: string;
  color_scheme?: string[];
  tags?: string[];
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  usage_count?: number;
  rating?: number;
  isPro?: boolean;
  isFeatured?: boolean;
  category?: string;
  author?: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  createdAt?: string;
  onUseTemplate?: (id: string) => void;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export function CanvaTemplateCard({
  id,
  title,
  description,
  type,
  preview_image,
  color_scheme = ['#6366F1', '#8B5CF6', '#EC4899'],
  tags = [],
  difficulty_level = 'intermediate',
  usage_count = 0,
  rating = 4.5,
  isPro = false,
  isFeatured = false,
  category,
  author,
  createdAt,
  onUseTemplate,
  onSave,
  isSaved = false,
}: CanvaTemplateCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [imageError, setImageError] = useState(false);

  const difficultyConfig = {
    beginner: { label: 'Beginner', color: 'bg-green-100 text-green-700 border-green-200' },
    intermediate: { label: 'Intermediate', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    advanced: { label: 'Advanced', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    professional: { label: 'Professional', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  };

  const typeConfig = {
    resume: { label: 'Resume', icon: '📄', gradient: 'from-blue-500 to-cyan-500' },
    presentation: { label: 'Presentation', icon: '📊', gradient: 'from-purple-500 to-pink-500' },
    letter: { label: 'Letter', icon: '✉️', gradient: 'from-green-500 to-teal-500' },
    cv: { label: 'CV', icon: '📋', gradient: 'from-orange-500 to-red-500' },
    diagram: { label: 'Diagram', icon: '🎨', gradient: 'from-indigo-500 to-purple-500' },
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    if (onSave) {
      onSave(id);
    }
  };

  const handleUseTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUseTemplate) {
      onUseTemplate(id);
    } else {
      router.push(`/editor?template=${id}`);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-300 border-2",
          isHovered ? "shadow-2xl border-primary/50" : "shadow-lg border-transparent hover:border-gray-200"
        )}
        onClick={() => router.push(`/templates/${id}`)}
      >
        {/* Pro Badge */}
        {isPro && (
          <div className="absolute top-3 left-3 z-20">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg flex items-center gap-1 px-3 py-1">
              <Crown className="w-3 h-3" />
              <span className="font-bold text-xs">PRO</span>
            </Badge>
          </div>
        )}

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-lg flex items-center gap-1 px-3 py-1">
              <Sparkles className="w-3 h-3" />
              <span className="font-bold text-xs">Featured</span>
            </Badge>
          </div>
        )}

        {/* Save Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-300",
            isPro || isFeatured ? "top-14" : "",
            isHovered ? "opacity-100 scale-110" : "opacity-0"
          )}
          onClick={handleSaveToggle}
        >
          {saved ? (
            <BookmarkCheck className="w-4 h-4 text-blue-600 fill-blue-600" />
          ) : (
            <Bookmark className="w-4 h-4 text-gray-600" />
          )}
        </Button>

        {/* Preview Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {!imageError ? (
            <Image
              src={preview_image}
              alt={title}
              fill
              className={cn(
                "object-cover transition-transform duration-500",
                isHovered ? "scale-110" : "scale-100"
              )}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={cn(
              "w-full h-full flex flex-col items-center justify-center bg-gradient-to-br",
              typeConfig[type].gradient
            )}>
              <div className="text-6xl mb-4">{typeConfig[type].icon}</div>
              <div className="text-white font-bold text-xl">{title}</div>
            </div>
          )}

          {/* Gradient Overlay on Hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Quick Actions on Hover */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <Button
              size="sm"
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/templates/${id}`);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl font-semibold"
              onClick={handleUseTemplate}
            >
              <Zap className="w-4 h-4 mr-2" />
              Use Template
            </Button>
          </div>

          {/* Color Scheme Dots */}
          {color_scheme && color_scheme.length > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5 z-10">
              {color_scheme.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="w-5 h-5 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title & Type */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-base line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-semibold border flex items-center gap-1 flex-shrink-0",
                  difficultyConfig[difficulty_level].color
                )}
              >
                {difficultyConfig[difficulty_level].label}
              </Badge>
            </div>

            {/* Description */}
            {description && (
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
              </div>

              {/* Usage Count */}
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium">{formatNumber(usage_count)}</span>
              </div>
            </div>

            {/* Category Badge */}
            {category && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium bg-gradient-to-r text-white border-0",
                  typeConfig[type].gradient
                )}
              >
                {typeConfig[type].icon} {category}
              </Badge>
            )}
          </div>

          {/* Author (if available) */}
          {author && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              {author.avatar ? (
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {author.name[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                {author.name}
                {author.verified && (
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
