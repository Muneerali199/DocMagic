import { useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook to automatically track document views and provide imperative event tracking
 */
export function useDocumentAnalytics(documentId: string | null) {
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const viewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  /**
   * Imperatively track an engagement event (download, share, etc.)
   */
  const trackEvent = useCallback(async (eventType: string, eventData?: any) => {
    if (!documentId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          documentId,
          eventType,
          eventData,
        }),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;

    // Reset state for new documentId
    viewIdRef.current = null;
    startTimeRef.current = Date.now();

    // Track view mount
    const trackView = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            documentId,
            eventType: 'view',
          }),
        });

        const data = await response.json();
        if (data.viewId) {
          viewIdRef.current = data.viewId;
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();

    // Track duration on unmount
    return () => {
      if (viewIdRef.current) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const body = JSON.stringify({
          documentId,
          eventType: 'duration',
          viewId: viewIdRef.current,
          duration,
        });

        // Use sendBeacon for reliable unmount tracking if supported
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/track', blob);
        } else {
          // Fallback
          fetch('/api/analytics/track', {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body,
          });
        }
      }
    };
  }, [documentId]);

  return { trackEvent };
}
