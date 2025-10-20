"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  RefreshCw,
  Upload,
  Sparkles,
  Check
} from "lucide-react";
import Image from "next/image";
import { searchImages } from "@/lib/unsplash";
import { generateAlternativeImages } from "@/lib/mistral";
import { cn } from "@/lib/utils";

interface EditableSlide {
  title: string;
  layout: string;
  bulletPoints?: string[];
  content?: string;
  imageUrl?: string;
  imageQuery?: string;
  chartData?: any;
  notes?: string;
}

interface EditableSlideCardProps {
  slide: EditableSlide;
  index: number;
  onUpdate: (index: number, updatedSlide: EditableSlide) => void;
  onDelete: (index: number) => void;
}

export function EditableSlideCard({ slide, index, onUpdate, onDelete }: EditableSlideCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSlide, setEditedSlide] = useState<EditableSlide>(slide);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [alternativeImages, setAlternativeImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const handleSave = () => {
    onUpdate(index, editedSlide);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSlide(slide);
    setIsEditing(false);
  };

  const handleBulletChange = (bulletIndex: number, value: string) => {
    const newBullets = [...(editedSlide.bulletPoints || [])];
    newBullets[bulletIndex] = value;
    setEditedSlide({ ...editedSlide, bulletPoints: newBullets });
  };

  const handleAddBullet = () => {
    setEditedSlide({
      ...editedSlide,
      bulletPoints: [...(editedSlide.bulletPoints || []), '']
    });
  };

  const handleRemoveBullet = (bulletIndex: number) => {
    const newBullets = editedSlide.bulletPoints?.filter((_, i) => i !== bulletIndex) || [];
    setEditedSlide({ ...editedSlide, bulletPoints: newBullets });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setUploadedImageUrl(imageUrl);
        setEditedSlide({ ...editedSlide, imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAlternativeImages = async () => {
    setIsLoadingImages(true);
    setShowImagePicker(true);
    
    try {
      // Generate AI-powered image suggestions
      const suggestions = await generateAlternativeImages(
        editedSlide.title,
        editedSlide.content || editedSlide.bulletPoints?.join(', ') || '',
        6
      );

      // Fetch actual images from Unsplash for each suggestion
      const imagePromises = suggestions.map(async (suggestion) => {
        const images = await searchImages(suggestion.searchQuery, 3);
        return {
          ...suggestion,
          images: images.map(img => ({
            url: img.urls.regular,
            thumb: img.urls.thumb,
            alt: img.alt_description || suggestion.description,
            photographer: img.user?.name,
            photographerUrl: img.links?.download_location
          }))
        };
      });

      const results = await Promise.all(imagePromises);
      setAlternativeImages(results.flatMap(r => r.images));
    } catch (error) {
      console.error('Error generating alternative images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setEditedSlide({ ...editedSlide, imageUrl });
    setShowImagePicker(false);
  };

  if (!isEditing) {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-yellow-400/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Badge variant="outline" className="mb-2 text-xs">
                Slide {index + 1} • {slide.layout}
              </Badge>
              <h3 className="text-lg font-semibold mb-2">{slide.title}</h3>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(index)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {slide.content && (
            <p className="text-sm text-muted-foreground mb-3">{slide.content}</p>
          )}

          {slide.bulletPoints && slide.bulletPoints.length > 0 && (
            <ul className="space-y-2 mb-3">
              {slide.bulletPoints.map((bullet, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {slide.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={slide.imageUrl}
                alt={slide.title || 'Slide image'}
                className="w-full h-32 object-cover"
                width={400}
                height={128}
              />
            </div>
          )}

          {slide.chartData && (
            <Badge variant="secondary" className="mt-3">
              📊 Chart Included
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-yellow-400/50 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Slide Title</label>
            <Input
              value={editedSlide.title}
              onChange={(e) => setEditedSlide({ ...editedSlide, title: e.target.value })}
              placeholder="Enter slide title"
              className="text-lg font-semibold"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium mb-2 block">Content</label>
            <Textarea
              value={editedSlide.content || ''}
              onChange={(e) => setEditedSlide({ ...editedSlide, content: e.target.value })}
              placeholder="Enter slide content"
              rows={3}
            />
          </div>

          {/* Bullet Points */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Bullet Points</label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddBullet}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Bullet
              </Button>
            </div>
            <div className="space-y-2">
              {editedSlide.bulletPoints?.map((bullet, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={bullet}
                    onChange={(e) => handleBulletChange(i, e.target.value)}
                    placeholder={`Bullet point ${i + 1}`}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveBullet(i)}
                    className="h-10 w-10 p-0 text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Image Management */}
          <div>
            <label className="text-sm font-medium mb-2 block">Slide Image</label>
            
            <div className="space-y-3">
              {editedSlide.imageUrl && (
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={editedSlide.imageUrl}
                    alt={editedSlide.title || 'Slide image'}
                    className="w-full h-48 object-cover"
                    width={400}
                    height={192}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditedSlide({ ...editedSlide, imageUrl: '' })}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateAlternativeImages}
                  disabled={isLoadingImages}
                  className="flex-1"
                >
                  {isLoadingImages ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Suggestions
                    </>
                  )}
                </Button>

                <label className="flex-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById(`upload-${index}`)?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <input
                    id={`upload-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Picker */}
              {showImagePicker && alternativeImages.length > 0 && (
                <div className="border-2 border-yellow-400/30 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Choose an Image</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowImagePicker(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {alternativeImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectImage(img.url)}
                        className={cn(
                          "relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                          editedSlide.imageUrl === img.url 
                            ? "border-yellow-400 ring-2 ring-yellow-400" 
                            : "border-gray-200"
                        )}
                      >
                        <Image
                          src={img.thumb}
                          alt={img.alt || 'Alternative image'}
                          className="w-full h-24 object-cover"
                          width={128}
                          height={96}
                        />
                        {editedSlide.imageUrl === img.url && (
                          <div className="absolute top-1 right-1 bg-yellow-400 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EditablePresentationOutline({ 
  slides,
  onSlidesUpdate 
}: { 
  slides: EditableSlide[];
  onSlidesUpdate: (updatedSlides: EditableSlide[]) => void;
}) {
  const handleUpdateSlide = (index: number, updatedSlide: EditableSlide) => {
    const newSlides = [...slides];
    newSlides[index] = updatedSlide;
    onSlidesUpdate(newSlides);
  };

  const handleDeleteSlide = (index: number) => {
    const newSlides = slides.filter((_, i) => i !== index);
    onSlidesUpdate(newSlides);
  };

  const handleAddSlide = () => {
    const newSlide: EditableSlide = {
      title: 'New Slide',
      layout: 'list',
      bulletPoints: ['Point 1', 'Point 2', 'Point 3'],
      content: '',
    };
    onSlidesUpdate([...slides, newSlide]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Edit Your Presentation</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Click on any slide to edit text, upload images, or get AI-powered image suggestions
          </p>
        </div>
        <Button onClick={handleAddSlide} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide, index) => (
          <EditableSlideCard
            key={index}
            slide={slide}
            index={index}
            onUpdate={handleUpdateSlide}
            onDelete={handleDeleteSlide}
          />
        ))}
      </div>
    </div>
  );
}
