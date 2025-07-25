/**
 * Analytics utility functions for tracking document events throughout the application
 */

export interface AnalyticsEventData {
  document_id?: string;
  event_type: 'created' | 'viewed' | 'edited' | 'shared' | 'downloaded' | 'exported';
  metadata?: Record<string, any>;
  generation_time?: number;
  export_time?: number;
  template_used?: string;
  view_duration?: number;
  is_anonymous?: boolean;
}

/**
 * Track analytics events - safe to call on both client and server
 */
export async function trackAnalyticsEvent(eventData: AnalyticsEventData): Promise<void> {
  // Only track on client-side
  if (typeof window === 'undefined') return;

  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      console.warn('Failed to track analytics event:', eventData);
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
}

/**
 * Helper functions for common analytics events
 */
export const AnalyticsEvents = {
  documentCreated: (documentId: string, type: string, template?: string, generationTime?: number) => {
    return trackAnalyticsEvent({
      document_id: documentId,
      event_type: 'created',
      metadata: { document_type: type },
      template_used: template,
      generation_time: generationTime,
    });
  },

  documentViewed: (documentId: string, viewDuration?: number, isAnonymous?: boolean) => {
    return trackAnalyticsEvent({
      document_id: documentId,
      event_type: 'viewed',
      view_duration: viewDuration,
      is_anonymous: isAnonymous,
    });
  },

  documentEdited: (documentId: string, metadata?: Record<string, any>) => {
    return trackAnalyticsEvent({
      document_id: documentId,
      event_type: 'edited',
      metadata,
    });
  },

  documentShared: (documentId: string, shareType?: string) => {
    return trackAnalyticsEvent({
      document_id: documentId,
      event_type: 'shared',
      metadata: { share_type: shareType },
    });
  },

  documentDownloaded: (documentId: string, format: string, exportTime?: number) => {
    return trackAnalyticsEvent({
      document_id: documentId,
      event_type: 'downloaded',
      metadata: { format },
      export_time: exportTime,
    });
  },

  documentExported: (documentId: string, format: string, exportTime?: number) => {
    return trackAnalyticsEvent({
      document_id: documentId,
      event_type: 'exported',
      metadata: { format },
      export_time: exportTime,
    });
  },
};

/**
 * Performance timing utilities
 */
export class PerformanceTimer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
  }

  end(): number {
    const endTime = performance.now();
    const duration = Math.round(endTime - this.startTime);
    console.debug(`${this.label}: ${duration}ms`);
    return duration;
  }

  endAndTrack(documentId: string, eventType: 'generation_time' | 'export_time') {
    const duration = this.end();
    
    if (eventType === 'generation_time') {
      trackAnalyticsEvent({
        document_id: documentId,
        event_type: 'created',
        generation_time: duration,
      });
    } else if (eventType === 'export_time') {
      trackAnalyticsEvent({
        document_id: documentId,
        event_type: 'exported',
        export_time: duration,
      });
    }

    return duration;
  }
}

/**
 * View duration tracking for documents
 */
export class ViewDurationTracker {
  private startTime: number;
  private documentId: string;
  private isAnonymous: boolean;

  constructor(documentId: string, isAnonymous: boolean = false) {
    this.documentId = documentId;
    this.isAnonymous = isAnonymous;
    this.startTime = Date.now();
  }

  end() {
    const duration = Math.round((Date.now() - this.startTime) / 1000); // in seconds
    
    AnalyticsEvents.documentViewed(this.documentId, duration, this.isAnonymous);
    
    return duration;
  }
}

/**
 * Analytics data aggregation utilities
 */
export const AnalyticsUtils = {
  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(totalViews: number, totalDocuments: number): number {
    if (totalDocuments === 0) return 0;
    return Math.round((totalViews / totalDocuments) * 100) / 100;
  },

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  },

  /**
   * Format time for display (milliseconds to seconds)
   */
  formatTime(milliseconds: number): string {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  },

  /**
   * Get time period label
   */
  getTimeframLabel(timeframe: string): string {
    switch (timeframe) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      default: return 'Custom period';
    }
  },

  /**
   * Generate chart colors
   */
  getChartColors(): string[] {
    return [
      '#6366f1', // indigo
      '#8b5cf6', // violet 
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#f97316', // orange
      '#ef4444', // red
    ];
  },

  /**
   * Calculate percentage change
   */
  calculatePercentageChange(current: number, previous: number): { value: number; type: 'positive' | 'negative' | 'neutral' } {
    if (previous === 0) {
      return { value: current > 0 ? 100 : 0, type: current > 0 ? 'positive' : 'neutral' };
    }
    
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
    };
  }
};
