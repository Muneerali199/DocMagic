'use client';

import { useRef, useEffect, useState } from "react";
import { Heart, Bookmark, Share2, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEngage } from "@/hooks/use-engage";
import type { FeedItem } from "@/types/showcase";

interface ShowcaseCardProps {
  item:       FeedItem;
  showScore?: boolean; // enable in dev for ranking explainability
}

const LEVEL_STYLES: Record<string, string> = {
  junior: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  mid:    "bg-blue-100  text-blue-800  dark:bg-blue-900  dark:text-blue-200",
  senior: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export function ShowcaseCard({ item, showScore = false }: ShowcaseCardProps) {
  const cardRef                 = useRef<HTMLDivElement>(null);
  const { engage, onVisible, onHidden } = useEngage(item.id);
  const [liked,   setLiked]     = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);

  // Intersection observer for view + dwell
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onVisible();
        else                      onHidden();
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      onHidden(); // flush dwell when card unmounts
    };
  }, [onVisible, onHidden]);

  //  Engagement handlers
  const handleLike = () => {
    setLiked((prev) => {
     const next = !prev;
     if (next) engage("like");
     return next;
  });
};

  const handleSave = () => {
    setSaved((prev) => {
    const next = !prev;
    if (next) engage("save");
    return next;
  });
};

  const handleShare = () => {
    const url = `${window.location.origin}/showcase/${item.id}`;
    navigator.clipboard.writeText(url).catch(() => null);
    engage("share");
  };

  const handleReport = () => {
    const reason = window.prompt("Reason for reporting (min 5 characters):");
    if (!reason || reason.trim().length < 5) return;

    fetch(`/api/showcase/${item.id}/report`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ reason }),
    }).catch(() => null);
  };

  return (
    <div
      ref={cardRef}
      className="group relative rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <a
            href={`/showcase/${item.id}`}
            className="text-base font-semibold text-foreground line-clamp-2 hover:underline"
          >
            {item.title}
          </a>
          <p className="mt-0.5 text-sm text-muted-foreground">{item.role}</p>
        </div>

        <Badge variant="outline" className="shrink-0 capitalize text-xs">
          {item.type}
        </Badge>
      </div>

      {/* ── Author ── */}
      {item.author_name && (
        <div className="mt-3 flex items-center gap-2">
          {item.author_avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.author_avatar}
              alt={item.author_name}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {item.author_name[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs text-muted-foreground">{item.author_name}</span>
        </div>
      )}

      {/* ── Tags ── */}
      {(item.tags.length > 0 || item.experience_level) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
          {item.experience_level && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                LEVEL_STYLES[item.experience_level] ?? ""
              }`}
            >
              {item.experience_level}
            </span>
          )}
        </div>
      )}

      {/* ── Score breakdown (dev / debug) ── */}
      {showScore && item.score_breakdown && (
        <div className="mt-3">
          <button
            onClick={() => setScoreOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {scoreOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Score: {item.final_score.toFixed(4)}
          </button>
          {scoreOpen && (
            <div className="mt-1.5 pl-4 space-y-0.5 text-xs text-muted-foreground">
              <p>Quality:    {item.score_breakdown.quality.contribution.toFixed(3)}</p>
              <p>Engagement: {item.score_breakdown.engagement.contribution.toFixed(3)}
                {item.score_breakdown.engagement.burst_penalised ? " ⚠ burst penalised" : ""}
              </p>
              <p>Freshness:  {item.score_breakdown.freshness.contribution.toFixed(3)}
                {" "}({item.score_breakdown.freshness.age_hours.toFixed(1)}h old)
              </p>
              {item.score_breakdown.relevance && (
                <p>Relevance:  {item.score_breakdown.relevance.contribution.toFixed(3)}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Action bar ── */}
      <div className="mt-4 flex items-center gap-1">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2.5 ${liked ? "text-red-500" : ""}`}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Like</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2.5 ${saved ? "text-yellow-500" : ""}`}
                onClick={handleSave}
              >
                <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy link</TooltipContent>
          </Tooltip>

          {/* Report — only visible on hover */}
          <div className="ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleReport}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Report</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}