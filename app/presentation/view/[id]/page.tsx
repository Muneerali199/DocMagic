"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { exportAsPDF } from '@/lib/presentation-export';

interface Slide {
  slideNumber: number;
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  imageUrl?: string;
  design?: {
    background?: string;
  };
}

interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  template: string;
  created_at: string;
  user_id: string;
}

export default function ViewPresentationPage() {
  const params = useParams();
  const id = params?.id as string;

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "landscape",
  );

  useEffect(() => {
    if (!id) return;

    const abortController = new AbortController();

    async function loadPresentation() {
      try {
        const response = await fetch(`/api/presentations/${id}`, {
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error("Presentation not found");
        }

        const data = await response.json();
        setPresentation(data);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error loading presentation:", err);
        setError("Failed to load presentation");
      } finally {
        setLoading(false);
      }
    }

    loadPresentation();

    return () => {
      abortController.abort();
    };
  }, [id]);

  async function handleExportPDF() {
    try {
      setExportError("");
      setExporting(true);

      if (!presentation) {
        throw new Error("Presentation not loaded");
      }

      const slideElements = Array.from(
        document.querySelectorAll("[data-presentation-slide]"),
      ) as HTMLElement[];

      if (!slideElements.length) {
        throw new Error("No slides found");
      }

      await exportAsPDF(slideElements, presentation.title || "presentation", {
        format: "pdf",
        quality: 2,
        orientation,
      });
    } catch (err) {
      console.error("PDF export failed:", err);
      setExportError("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground" aria-live="polite">
            Loading presentation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Presentation Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error ||
              "This presentation may have been deleted or the link is invalid."}
          </p>
          <Link
            href="/presentation"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Create Your Own
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold">{presentation.title}</h1>
              <p className="text-sm text-muted-foreground">
                Shared presentation • View only
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="orientation"
                  className="text-sm text-muted-foreground font-medium"
                >
                  Orientation
                </label>
                <select
                  id="orientation"
                  value={orientation}
                  onChange={(e) =>
                    setOrientation(e.target.value as "portrait" | "landscape")
                  }
                  className="px-3 py-2 rounded-xl border border-border bg-background text-sm"
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>

              <Button
                type="button"
                onClick={handleExportPDF}
                isLoading={exporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
              >
                <Download className="w-4 h-4" />
                Export as PDF
              </Button>

              <Link
                href="/presentation"
                className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Create Your Own
              </Link>
            </div>
          </div>

          {exportError ? (
            <div
              aria-live="assertive"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {exportError}
            </div>
          ) : null}
        </div>
      </div>

      <div className="pt-24 pb-16 max-w-6xl mx-auto px-6">
        <div
          className="space-y-12"
          role="region"
          aria-label="Presentation slides"
        >
          {presentation.slides.map((slide, index) => (
            <div
              key={index}
              data-presentation-slide
              role="article"
              aria-label={`Slide ${slide.slideNumber}: ${slide.title}`}
              className="bg-card rounded-[2rem] shadow-xl border border-border overflow-hidden"
            >
              <div
                className="p-12 md:p-16 min-h-[600px] flex items-center justify-center relative"
                style={{
                  background:
                    slide.design?.background ||
                    "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                }}
              >
                <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full text-sm font-bold text-white">
                  SLIDE {slide.slideNumber}
                </div>

                <div className="max-w-5xl w-full relative z-10 text-white">
                  <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                    {slide.title}
                  </h2>

                  {slide.subtitle && (
                    <p className="text-2xl md:text-3xl mb-10 font-light opacity-90">
                      {slide.subtitle}
                    </p>
                  )}

                  {slide.content && !slide.bullets && (
                    <p className="text-xl md:text-2xl leading-relaxed opacity-90">
                      {slide.content}
                    </p>
                  )}

                  {slide.bullets && slide.bullets.length > 0 && (
                    <div className="grid gap-4 mt-10">
                      {slide.bullets.map((bullet, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-lg font-bold">
                            {idx + 1}
                          </div>
                          <span className="text-xl md:text-2xl font-medium leading-relaxed flex-1 opacity-95">
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Want to create your own stunning presentations?
          </p>
          <Link
            href="/presentation"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-lg"
          >
            Create Free Presentation
          </Link>
        </div>
      </div>
    </div>
  );
}
