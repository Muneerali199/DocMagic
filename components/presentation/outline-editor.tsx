'use client';

import { useState } from 'react';
import { Sparkles, Type, Trash2, Plus } from 'lucide-react';

interface OutlineItem {
  title: string;
  type: string;
  description: string;
  content?: string;
  bullets?: string[];
}

interface OutlineEditorProps {
  outline: OutlineItem[];
  setOutline: (outline: OutlineItem[]) => void;
  slideCount: number;
  setSlideCount: (count: number) => void;
  rawOutlineText: string;
  setRawOutlineText: (text: string) => void;
  outlineMode: 'card-by-card' | 'freeform';
  setOutlineMode: (mode: 'card-by-card' | 'freeform') => void;
}

export function OutlineEditor({
  outline,
  setOutline,
  slideCount,
  setSlideCount,
  rawOutlineText,
  setRawOutlineText,
  outlineMode,
  setOutlineMode
}: OutlineEditorProps) {
  
  const handleRawTextChange = (text: string) => {
    setRawOutlineText(text);
    const cards = text.split('---').filter(c => c.trim().length > 0);
    setSlideCount(cards.length);
  };

  const updateRawTextFromOutline = (newOutline: OutlineItem[]) => {
    const text = newOutline.map(item => {
      // Format: Title on first line, then content/bullets
      let cardText = `${item.title}\n${item.description || item.content || ''}`;
      if (item.bullets && item.bullets.length > 0) {
        cardText += '\n' + item.bullets.map(b => `* ${b}`).join('\n');
      }
      return cardText;
    }).join('\n\n---\n\n');
    setRawOutlineText(text);
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold professional-heading">Prompt editor</h2>
      </div>

      {/* Mode Toggle */}
      <div className="bg-muted/50 p-1 rounded-xl inline-flex mb-4">
        <button 
          onClick={() => setOutlineMode('card-by-card')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${outlineMode === 'card-by-card' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Card-by-card
        </button>
        <button 
          onClick={() => setOutlineMode('freeform')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${outlineMode === 'freeform' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Freeform
        </button>
      </div>

      {/* Text Editor - Only in Freeform Mode */}
      {outlineMode === 'freeform' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[600px] relative">
          <textarea
            value={rawOutlineText}
            onChange={(e) => handleRawTextChange(e.target.value)}
            className="w-full h-full min-h-[550px] bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
            placeholder="Enter your content here..."
          />
          
          <div className="absolute bottom-4 right-6 text-xs text-muted-foreground flex items-center gap-4">
            <span>{rawOutlineText.length}/50000</span>
            <span className="font-bold text-foreground">{slideCount} cards total</span>
          </div>
        </div>
      )}

      {/* Visual Outline Cards Preview - Only in Card-by-Card Mode */}
      {outlineMode === 'card-by-card' && outline.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold professional-heading">Slide Outline Preview</h3>
            <span className="text-sm text-muted-foreground">{outline.length} slides</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {outline.map((item, index) => (
              <div 
                key={index}
                className="bg-card border-2 border-border hover:border-blue-500/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  {/* Slide Number */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bolt-gradient flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Title - Editable */}
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const newOutline = [...outline];
                        newOutline[index] = { ...item, title: e.target.value };
                        setOutline(newOutline);
                        updateRawTextFromOutline(newOutline);
                      }}
                      className="w-full font-bold text-lg bg-transparent border-b-2 border-transparent hover:border-blue-500/30 focus:border-blue-500 outline-none transition-colors px-2 -mx-2 py-1"
                      placeholder="Slide title..."
                    />
                    
                    {/* Description - Editable */}
                    <textarea
                      value={item.description || item.content || ''}
                      onChange={(e) => {
                        const newOutline = [...outline];
                        newOutline[index] = { ...item, description: e.target.value, content: e.target.value };
                        setOutline(newOutline);
                        updateRawTextFromOutline(newOutline);
                      }}
                      className="w-full text-sm text-muted-foreground bg-transparent border border-transparent hover:border-blue-500/30 focus:border-blue-500 outline-none transition-colors px-2 py-1 rounded resize-none"
                      placeholder="Slide description..."
                      rows={2}
                    />
                    
                    {/* Bullets - Editable */}
                    {item.bullets && item.bullets.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {item.bullets.map((bullet, bulletIndex) => (
                          <div key={bulletIndex} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => {
                                const newOutline = [...outline];
                                const newBullets = [...(item.bullets || [])];
                                newBullets[bulletIndex] = e.target.value;
                                newOutline[index] = { ...item, bullets: newBullets };
                                setOutline(newOutline);
                                updateRawTextFromOutline(newOutline);
                              }}
                              className="flex-1 text-sm bg-transparent border-b border-transparent hover:border-blue-500/30 focus:border-blue-500 outline-none transition-colors"
                              placeholder="Bullet point..."
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Slide Type Badge */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                        {item.type || 'content'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      const newOutline = outline.filter((_, i) => i !== index);
                      setOutline(newOutline);
                      setSlideCount(newOutline.length);
                      updateRawTextFromOutline(newOutline);
                    }}
                    className="flex-shrink-0 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-muted-foreground hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Slide Button */}
          <button
            onClick={() => {
              const newSlide = {
                title: `Slide ${outline.length + 1}`,
                type: 'content',
                description: 'Click to edit...',
                content: 'Click to edit...',
                bullets: []
              };
              const newOutline = [...outline, newSlide];
              setOutline(newOutline);
              setSlideCount(newOutline.length);
              updateRawTextFromOutline(newOutline);
            }}
            className="w-full py-3 border-2 border-dashed border-border hover:border-blue-500 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 group"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Add Slide
          </button>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-100 mb-1">
              {outlineMode === 'card-by-card' ? 'Card-by-card Tips' : 'Freeform Tips'}
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              {outlineMode === 'card-by-card' 
                ? "Card-by-card lets you specify exactly where card breaks should go. Type --- to add new cards."
                : "Freeform lets you scale or shrink your content into as many cards as you want. Perfect for transforming long documents."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
