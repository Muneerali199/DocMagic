"use client";

import { useCallback, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ShowcaseCard } from "./showcase-card";
import { useFeed } from "@/hooks/use-feed";
import type { FeedType } from "@/types/showcase";

interface ShowcaseFeedProps {
  showScore?: boolean; // pass true in dev to see score breakdown on cards
}

export function ShowcaseFeed({ showScore = false }: ShowcaseFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedType>("trending");

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as FeedType)}
      className="w-full"
    >
      <TabsList className="mb-6">
        <TabsTrigger value="trending">Trending</TabsTrigger>
        <TabsTrigger value="latest">Latest</TabsTrigger>
        <TabsTrigger value="for-you">For You</TabsTrigger>
      </TabsList>

      <TabsContent value="trending">
        <FeedPane type="trending" showScore={showScore} />
      </TabsContent>

      <TabsContent value="latest">
        <FeedPane type="latest" showScore={showScore} />
      </TabsContent>

      <TabsContent value="for-you">
        <FeedPane type="for-you" showScore={showScore} />
      </TabsContent>
    </Tabs>
  );
}

// FeedPane — one pane per tab
function FeedPane({ type, showScore }: { type: FeedType; showScore: boolean }) {
  const { items, isLoading, isLoadingMore, hasMore, loadMore, error } =
    useFeed(type);

  // When the user scrolls to the bottom of the feed, it automatically loads the next page 
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (!node) return;

      observerRef.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      });

      observerRef.current.observe(node);
    },
    [hasMore, isLoadingMore, loadMore]
  );

  // States
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-16 text-center text-sm text-destructive">{error}</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        {type === "for-you"
          ? "Update your preferences to personalise this feed."
          : "No posts yet. Be the first to publish!"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ShowcaseCard key={item.id} item={item} showScore={showScore} />
      ))}

      {/* Sentinel div — triggers loadMore when scrolled into view */}
      <div ref={sentinelRef} className="h-1" />

      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          You&apos;ve reached the end of this feed.
        </p>
      )}
    </div>
  );
}