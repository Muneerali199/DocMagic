'use client';

import { useCallback, useRef } from "react";
import type { EngagementEventType } from "@/types/showcase";

export function useEngage(postId: string) {
  const dwellStart = useRef<number | null>(null);

  // Core event sender
  const engage = useCallback(
    (eventType: EngagementEventType, dwellMs?: number) => {
      // Fire-and-forget — never block the UI thread
      fetch(`/api/showcase/${postId}/engage`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          event_type: eventType,
          ...(dwellMs !== undefined ? { dwell_ms: dwellMs } : {}),
        }),
      }).catch(() => {
        // Silently swallow engagement errors — not user-facing
      });
    },
    [postId]
  );

  // Dwell tracking 
  // Call onVisible when the card enters the viewport (IntersectionObserver).
  // Call onHidden when it leaves or the component unmounts.

  const onVisible = useCallback(() => {
    dwellStart.current = Date.now();
    engage("view");
  }, [engage]);

  const onHidden = useCallback(() => {
    if (dwellStart.current === null) return;
    const dwell_ms = Date.now() - dwellStart.current;
    dwellStart.current = null;

    // Only count meaningful dwell — at least 1 second
    if (dwell_ms >= 1000) {
      engage("dwell", dwell_ms);
    }
  }, [engage]);

  return { engage, onVisible, onHidden };
}