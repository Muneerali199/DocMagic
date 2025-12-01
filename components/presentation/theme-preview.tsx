import React from 'react';
import { PresentationTheme } from '@/lib/presentation-themes';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';

interface ThemePreviewProps {
  theme: PresentationTheme;
}

export function ThemePreview({ theme }: ThemePreviewProps) {
  const { colors, font } = theme;

  return (
    <div 
      className="w-full h-full rounded-xl overflow-hidden shadow-2xl flex flex-col relative transition-all duration-500"
      style={{ 
        backgroundColor: colors.background,
        color: colors.foreground,
        fontFamily: font,
        border: `1px solid ${colors.border}`
      }}
    >
      {/* Header Bar */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="text-xs opacity-50 font-mono">Theme Preview</div>
      </div>

      {/* Content Area */}
      <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: colors.accent, color: colors.background }}>
            HELLO 👋
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            This is a theme preview
          </h1>
          <p className="text-lg opacity-80 leading-relaxed max-w-md">
            This is body text. You can change your fonts, colors and images later in the theme editor. You can also create your own custom branded theme.
          </p>
          <div className="mt-6">
            <a href="#" className="inline-flex items-center gap-2 border-b-2 pb-0.5 font-medium hover:opacity-80 transition-opacity" style={{ borderColor: colors.accent, color: colors.accent }}>
              This is a link <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Smart Layout Section */}
        <div className="mb-12 p-6 rounded-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: colors.muted }}>
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">This is a smart layout</h3>
              <p className="opacity-70 text-sm">It acts as a text box. You can get these by typing /smart</p>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-video rounded-lg mb-3 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: colors.muted }}>
                <ImageIcon className="w-8 h-8 opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="font-bold text-sm mb-1">Image {i}</h4>
              <p className="text-xs opacity-60">This is the description of the image.</p>
            </div>
          ))}
        </div>

        {/* Big Heading */}
        <div className="text-center py-12 border-t" style={{ borderColor: colors.border }}>
          <h2 className="text-5xl font-black opacity-10 tracking-tight">BIG HEADING</h2>
        </div>
      </div>
    </div>
  );
}
