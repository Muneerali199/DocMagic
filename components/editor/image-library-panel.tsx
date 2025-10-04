'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageIcon, Search } from 'lucide-react';
import Image from 'next/image';
import { fabric } from 'fabric';

const placeholderImages = [
  '/images/placeholders/photo1.jpg',
  '/images/placeholders/photo2.jpg',
  '/images/placeholders/photo3.jpg',
  '/images/placeholders/photo4.jpg',
  '/images/placeholders/photo5.jpg',
];

export function ImageLibraryPanel() {
  const { canvas } = useEditorStore();
  const [query, setQuery] = useState('');

  const addImageToCanvas = (src: string) => {
    if (!canvas) return;

    fabric.Image.fromURL(src, (img) => {
      img.set({ left: 120, top: 120, scaleX: 0.6, scaleY: 0.6 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const [unsplashResults, setUnsplashResults] = useState<string[]>([]);

  const fetchUnsplash = async (q: string) => {
    // Use source.unsplash.com to get random images for query without API key
    // We'll generate a small set of image URLs by requesting 6 unique random images
    const results: string[] = [];
    try {
      for (let i = 0; i < 6; i++) {
        const url = `https://source.unsplash.com/collection/190727/${800}x${600}?${encodeURIComponent(q)}&sig=${Date.now() + i}`;
        results.push(url);
      }
      setUnsplashResults(results);
    } catch (err) {
      console.error('Unsplash fetch error', err);
    }
  };

  const handleUploadFiles = (files: FileList | null) => {
    if (!files || !canvas) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (src) {
          fabric.Image.fromURL(src, (img) => {
            img.set({ left: 140, top: 140, scaleX: 0.6, scaleY: 0.6 });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const filtered = (query ? unsplashResults : placeholderImages).filter((p) => p.includes(query) || !query);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <h3 className="font-bold text-lg mb-3 text-gray-900">Image Library</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search images..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 h-9" />
        </div>
      </div>

      <div className="p-3 flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => fetchUnsplash(query || 'nature')}>Refresh</Button>
            <label className="inline-flex items-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleUploadFiles(e.target.files)}
                className="hidden"
              />
              <Button size="sm" variant="ghost">Upload</Button>
            </label>
          </div>
          <div className="text-sm text-muted-foreground">Click an image to add to canvas</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((src) => (
            <Button key={src} variant="outline" className="p-0 h-32 overflow-hidden" onClick={() => addImageToCanvas(src)}>
              <div className="relative w-full h-32">
                <Image src={src} alt="placeholder" fill style={{ objectFit: 'cover' }} />
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t bg-gradient-to-r from-gray-50 to-gray-100">
        <p className="text-xs text-gray-600 text-center font-medium">Images are placeholders — Unsplash integration planned</p>
      </div>
    </div>
  );
}
