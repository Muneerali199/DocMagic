"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  List, 
  BarChart3, 
  Image as ImageIcon, 
  ArrowRight,
  Brain,
  Camera,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Sparkles
} from "lucide-react";
import Image from "next/image";

interface SlideOutline {
  title: string;
  type: string;
  description: string;
  content?: string;
  bullets?: string[];
  chartData?: any;
  imageQuery?: string;
  imageUrl?: string;
}

interface SlideOutlinePreviewProps {
  outlines: SlideOutline[];
  onOutlinesUpdate?: (updatedOutlines: SlideOutline[]) => void;
  editable?: boolean;
}

export function SlideOutlinePreview({ outlines, onOutlinesUpdate, editable = true }: SlideOutlinePreviewProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedOutlines, setEditedOutlines] = useState<SlideOutline[]>(outlines);
  const [localOutline, setLocalOutline] = useState<SlideOutline | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setLocalOutline({ ...editedOutlines[index] });
  };

  const handleSave = (index: number) => {
    if (localOutline) {
      const updated = [...editedOutlines];
      updated[index] = localOutline;
      setEditedOutlines(updated);
      onOutlinesUpdate?.(updated);
    }
    setEditingIndex(null);
    setLocalOutline(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setLocalOutline(null);
  };

  const handleDelete = (index: number) => {
    const updated = editedOutlines.filter((_, i) => i !== index);
    setEditedOutlines(updated);
    onOutlinesUpdate?.(updated);
  };

  const handleAddBullet = () => {
    if (localOutline) {
      setLocalOutline({
        ...localOutline,
        bullets: [...(localOutline.bullets || []), ""]
      });
    }
  };

  const handleBulletChange = (bulletIndex: number, value: string) => {
    if (localOutline) {
      const updated = [...(localOutline.bullets || [])];
      updated[bulletIndex] = value;
      setLocalOutline({
        ...localOutline,
        bullets: updated
      });
    }
  };

  const handleRemoveBullet = (bulletIndex: number) => {
    if (localOutline) {
      const updated = (localOutline.bullets || []).filter((_, i) => i !== bulletIndex);
      setLocalOutline({
        ...localOutline,
        bullets: updated
      });
    }
  };
  const getSlideIcon = (type: string) => {
    switch (type) {
      case 'cover':
        return <FileText className="h-4 w-4" />;
      case 'list':
        return <List className="h-4 w-4" />;
      case 'chart':
        return <BarChart3 className="h-4 w-4" />;
      case 'split':
        return <ImageIcon className="h-4 w-4" />;
      case 'process':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSlideTypeLabel = (type: string) => {
    switch (type) {
      case 'cover':
        return 'Hero Slide';
      case 'list':
        return 'Key Points';
      case 'chart':
        return 'Data Visual';
      case 'split':
        return 'Split Layout';
      case 'process':
        return 'Process Flow';
      case 'text':
        return 'Content Focus';
      default:
        return 'Standard';
    }
  };

  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case 'cover':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
      case 'list':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'chart':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300';
      case 'split':
        return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300';
      case 'process':
        return 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border-pink-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Slide Outline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editedOutlines.map((outline, index) => (
          <Card 
            key={index} 
            className="glass-effect border-yellow-400/20 hover:shadow-xl transition-all duration-300 group relative overflow-hidden hover:scale-105"
          >
            {/* Slide number indicator */}
            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bolt-gradient flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {index + 1}
            </div>

            {/* AI badge */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                <Brain className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>

            <CardContent className="p-6 pt-12">
              {editingIndex === index && localOutline ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slide Title</label>
                    <Input
                      value={localOutline.title}
                      onChange={(e) => setLocalOutline({ ...localOutline, title: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={localOutline.description}
                      onChange={(e) => setLocalOutline({ ...localOutline, description: e.target.value })}
                      className="w-full min-h-[80px]"
                    />
                  </div>

                  {localOutline.bullets && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Bullet Points</label>
                        <Button size="sm" variant="outline" onClick={handleAddBullet}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      {localOutline.bullets.map((bullet, bIndex) => (
                        <div key={bIndex} className="flex gap-2">
                          <Input
                            value={bullet}
                            onChange={(e) => handleBulletChange(bIndex, e.target.value)}
                            className="flex-1"
                            placeholder={`Point ${bIndex + 1}`}
                          />
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleRemoveBullet(bIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleSave(index)}
                      className="flex-1 bolt-gradient text-white"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-4">
                  {/* Edit/Delete buttons */}
                  {editable && (
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(index)}
                        className="h-8"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(index)}
                        className="h-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Slide type badge */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSlideTypeColor(outline.type)} flex items-center gap-1 font-medium`}
                    >
                      {getSlideIcon(outline.type)}
                      {getSlideTypeLabel(outline.type)}
                    </Badge>
                  </div>

                  {/* Slide title */}
                  <h3 className="font-bold text-lg group-hover:bolt-gradient-text transition-all leading-tight">
                    {outline.title}
                  </h3>

                  {/* Slide description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {outline.description}
                  </p>

                {/* Content preview */}
                {outline.content && (
                  <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <span className="font-medium">Content Preview: </span>
                    {outline.content.substring(0, 100)}...
                  </div>
                )}

                {/* Features */}
                <div className="space-y-2">
                  {/* Bullets preview */}
                  {outline.bullets && outline.bullets.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <List className="h-3 w-3 text-green-500" />
                      <span className="font-medium">{outline.bullets.length} key points</span>
                    </div>
                  )}

                  {/* Image preview */}
                  {(outline.imageUrl || outline.imageQuery) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Camera className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">Professional image included</span>
                    </div>
                  )}
                </div>

                {/* Visual preview mockup */}
                <div className="mt-4 h-24 rounded-lg bg-gradient-to-br from-muted/50 to-muted/80 border border-border/50 flex items-center justify-center group-hover:from-yellow-50 group-hover:to-blue-50 transition-all relative overflow-hidden">
                  {/* Show actual image preview if available */}
                  {outline.imageUrl && (
                    <Image
                      src={outline.imageUrl}
                      alt={outline.title || 'Slide image'}
                      className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity rounded-lg"
                      fill={true}
                      sizes="100vw"
                    />
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors relative z-10">
                    {getSlideIcon(outline.type)}
                    <span className="text-sm font-medium">Canva-Style Design</span>
                    <Sparkles className="h-4 w-4 group-hover:text-yellow-500 transition-colors animate-pulse" />
                  </div>
                </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}