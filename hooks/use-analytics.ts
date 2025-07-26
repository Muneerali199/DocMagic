import { useCallback } from 'react';

interface AnalyticsEvent {
  document_id?: string;
  event_type: 'created' | 'viewed' | 'edited' | 'shared' | 'downloaded' | 'exported';
  metadata?: Record<string, any>;
  generation_time?: number;
  export_time?: number;
  template_used?: string;
  view_duration?: number;
  is_anonymous?: boolean;
}

export function useAnalytics() {
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        console.warn('Failed to track analytics event:', event);
      }
    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  }, []);

  const trackDocumentCreated = useCallback((
    document_id: string, 
    type: string, 
    template?: string,
    generation_time?: number
  ) => {
    trackEvent({
      document_id,
      event_type: 'created',
      metadata: { document_type: type },
      template_used: template,
      generation_time,
    });
  }, [trackEvent]);

  const trackDocumentViewed = useCallback((
    document_id: string, 
    view_duration?: number,
    is_anonymous?: boolean
  ) => {
    trackEvent({
      document_id,
      event_type: 'viewed',
      view_duration,
      is_anonymous,
    });
  }, [trackEvent]);

  const trackDocumentEdited = useCallback((document_id: string) => {
    trackEvent({
      document_id,
      event_type: 'edited',
    });
  }, [trackEvent]);

  const trackDocumentShared = useCallback((document_id: string, share_type?: string) => {
    trackEvent({
      document_id,
      event_type: 'shared',
      metadata: { share_type },
    });
  }, [trackEvent]);

  const trackDocumentDownloaded = useCallback((
    document_id: string, 
    format: string,
    export_time?: number
  ) => {
    trackEvent({
      document_id,
      event_type: 'downloaded',
      metadata: { format },
      export_time,
    });
  }, [trackEvent]);

  const trackDocumentExported = useCallback((
    document_id: string, 
    format: string,
    export_time?: number
  ) => {
    trackEvent({
      document_id,
      event_type: 'exported',
      metadata: { format },
      export_time,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackDocumentCreated,
    trackDocumentViewed,
    trackDocumentEdited,
    trackDocumentShared,
    trackDocumentDownloaded,
    trackDocumentExported,
  };
}
