"use client";

import { useState } from "react";
import { PresentationPreview } from "./presentation-preview";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Share2, Eye, Lock, Globe } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface PresentationViewerProps {
  presentation: {
    id: string;
    title: string;
    slides: any[];
    template: string;
    prompt: string;
    isPublic: boolean;
    createdAt: string;
    isOwner: boolean;
  };
}

export function PresentationViewer({ presentation }: PresentationViewerProps) {
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
  const [isPublic, setIsPublic] = useState(presentation.isPublic);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/presentation/view/${presentation.id}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const togglePrivacy = async () => {
    if (!presentation.isOwner) return;

    setIsUpdatingPrivacy(true);
    try {
      const response = await fetch(`/api/presentations/${presentation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy setting');
      }

      setIsPublic(!isPublic);
      toast({
        title: "Privacy updated",
        description: `Presentation is now ${!isPublic ? 'public' : 'private'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy setting",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/presentation">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Generator
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{presentation.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isPublic ? (
                    <><Globe className="h-3 w-3" /> Public</>
                  ) : (
                    <><Lock className="h-3 w-3" /> Private</>
                  )}
                  <span>•</span>
                  <span>{new Date(presentation.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {presentation.isOwner && (
                <Button
                  onClick={togglePrivacy}
                  disabled={isUpdatingPrivacy}
                  variant="outline"
                  size="sm"
                  className="glass-effect"
                >
                  {isPublic ? (
                    <><Globe className="h-4 w-4 mr-2" /> Make Private</>
                  ) : (
                    <><Eye className="h-4 w-4 mr-2" /> Make Public</>
                  )}
                </Button>
              )}
              
              {isPublic && (
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="glass-effect"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10 p-4">
        <div className="container mx-auto">
          <div className="glass-effect border border-yellow-400/20 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 shimmer opacity-10"></div>
            <div className="relative z-10">
              <PresentationPreview 
                slides={presentation.slides} 
                template={presentation.template} 
              />
            </div>
          </div>

          {/* Share info for public presentations */}
          {isPublic && (
            <div className="mt-6 text-center">
              <div className="glass-effect p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-2">Share this presentation:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded text-center"
                  />
                  <Button onClick={handleShare} size="sm">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}