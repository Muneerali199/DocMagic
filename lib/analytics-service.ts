import { SupabaseClient } from '@supabase/supabase-js';
import { 
  AnalyticsSummary, 
  TrendPoint, 
  ActivityItem, 
  Suggestion 
} from '@/types/analytics';
import { subDays, format } from 'date-fns';

export class AnalyticsService {
  /**
   * Record a view event
   */
  async trackView(
    supabase: SupabaseClient,
    documentId: string, 
    viewerId: string | null, 
    ipHash: string, 
    referrer?: string, 
    userAgent?: string
  ) {
    return await supabase
      .from('document_views')
      .insert({
        document_id: documentId,
        viewer_id: viewerId,
        viewer_ip_hash: ipHash,
        referrer: referrer || null,
        user_agent: userAgent || null
      })
      .select()
      .single();
  }

  /**
   * Record an engagement event (download, share, copy, print, feedback)
   */
  async trackEngagement(
    supabase: SupabaseClient,
    documentId: string, 
    userId: string | null, 
    eventType: string, 
    eventData: any = {}
  ) {
    return await supabase
      .from('document_engagement')
      .insert({
        document_id: documentId,
        user_id: userId,
        event_type: eventType,
        event_data: eventData
      })
      .select()
      .single();
  }

  /**
   * Update the duration spent on a document view
   */
  async updateViewDuration(supabase: SupabaseClient, viewId: string, durationSeconds: number) {
    return await supabase
      .from('document_views')
      .update({ duration_seconds: durationSeconds })
      .eq('id', viewId);
  }

  /**
   * Get aggregated analytics summary for a document
   */
  async getAnalyticsSummary(supabase: SupabaseClient, documentId: string, days: number = 30): Promise<AnalyticsSummary | null> {
    try {
      // 1. Get basic stats from RPC
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_document_analytics_summary', { doc_id: documentId });

      if (summaryError) throw summaryError;

      // 2. Get views trend
      const viewsTrend = await this.getViewsTrend(supabase, documentId, days);

      // 3. Get engagement breakdown
      const { data: engagementData } = await supabase
        .from('document_engagement')
        .select('event_type')
        .eq('document_id', documentId);
      
      const engagementBreakdown: Record<string, number> = {
        download: 0,
        share: 0,
        copy: 0,
        print: 0,
        feedback: 0,
        edit: 0
      };
      
      engagementData?.forEach(e => {
        engagementBreakdown[e.event_type] = (engagementBreakdown[e.event_type] || 0) + 1;
      });

      // 4. Get top referrers
      const { data: referrersData } = await supabase
        .from('document_views')
        .select('referrer')
        .eq('document_id', documentId)
        .not('referrer', 'is', null);
      
      const referrersMap: Record<string, number> = {};
      referrersData?.forEach(r => {
        if (r.referrer) {
          try {
            const domain = new URL(r.referrer).hostname;
            referrersMap[domain] = (referrersMap[domain] || 0) + 1;
          } catch (e) {
            // Use the full string if it's not a valid URL
            const label = r.referrer.length > 30 ? r.referrer.substring(0, 27) + '...' : r.referrer;
            referrersMap[label] = (referrersMap[label] || 0) + 1;
          }
        }
      });
      const topReferrers = Object.entries(referrersMap)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 5. Get recent activity
      const recentActivity = await this.getRecentActivity(supabase, documentId);

      // 6. Generate suggestions
      const suggestions = await this.generateSuggestions(supabase, documentId, summaryData);

      return {
        ...summaryData,
        views_trend: viewsTrend,
        engagement_breakdown: engagementBreakdown,
        top_referrers: topReferrers,
        recent_activity: recentActivity,
        suggestions: suggestions
      };
    } catch (error) {
      console.error('Error in getAnalyticsSummary:', error);
      return null;
    }
  }

  /**
   * Get daily view trend
   */
  async getViewsTrend(supabase: SupabaseClient, documentId: string, days: number = 30): Promise<TrendPoint[]> {
    const startDate = subDays(new Date(), days);
    
    const { data } = await supabase
      .from('document_views')
      .select('viewed_at, viewer_ip_hash')
      .eq('document_id', documentId)
      .gte('viewed_at', startDate.toISOString());

    const trendMap: Record<string, { views: number, unique_views: Set<string> }> = {};
    
    for (let i = 0; i <= days; i++) {
      const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      trendMap[dateStr] = { views: 0, unique_views: new Set() };
    }

    data?.forEach(v => {
      const dateStr = format(new Date(v.viewed_at), 'yyyy-MM-dd');
      if (trendMap[dateStr]) {
        trendMap[dateStr].views++;
        trendMap[dateStr].unique_views.add(v.viewer_ip_hash);
      }
    });

    return Object.entries(trendMap)
      .map(([date, stats]) => ({
        date,
        views: stats.views,
        unique_views: stats.unique_views.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get combined recent activity for a document
   */
  private async getRecentActivity(supabase: SupabaseClient, documentId: string): Promise<ActivityItem[]> {
    const [views, engagement, versions] = await Promise.all([
      supabase.from('document_views').select('*').eq('document_id', documentId).order('viewed_at', { ascending: false }).limit(5),
      supabase.from('document_engagement').select('*').eq('document_id', documentId).order('created_at', { ascending: false }).limit(5),
      supabase.from('document_versions').select('*').eq('document_id', documentId).order('created_at', { ascending: false }).limit(5)
    ]);

    const activity: ActivityItem[] = [];

    views.data?.forEach(v => {
      activity.push({
        type: 'view',
        description: 'Document viewed',
        timestamp: v.viewed_at
      });
    });

    engagement.data?.forEach(e => {
      activity.push({
        type: e.event_type as any,
        description: `Document ${e.event_type}`,
        timestamp: e.created_at
      });
    });

    versions.data?.forEach(v => {
      activity.push({
        type: 'edit',
        description: `Version ${v.version_number} saved: ${v.changes_summary}`,
        timestamp: v.created_at,
        actor_name: v.created_by_name
      });
    });

    return activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  }

  /**
   * Generate actionable suggestions based on metrics
   */
  private async generateSuggestions(supabase: SupabaseClient, documentId: string, summary: any): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    const { total_views, total_shares, total_downloads, avg_view_duration, total_edits } = summary;

    const { data: doc } = await supabase.from('documents').select('created_at').eq('id', documentId).single();
    const ageInDays = doc ? (new Date().getTime() - new Date(doc.created_at).getTime()) / (1000 * 3600 * 24) : 0;

    if (total_views > 50 && total_shares === 0) {
      suggestions.push({
        id: 'add-share-cta',
        category: 'engagement',
        title: 'High traffic, low shares',
        description: 'Your document gets traffic but no shares. Add a prominent share call-to-action!',
        priority: 'high',
        action_label: 'Share Document',
        action_href: `/documents/${documentId}/share`
      });
    }

    if (total_views > 10 && avg_view_duration < 15) {
      suggestions.push({
        id: 'improve-intro',
        category: 'content',
        title: 'Low engagement time',
        description: 'Readers leave quickly. Consider shortening or improving the introduction to hook them.',
        priority: 'medium'
      });
    }

    if (total_edits === 0 && ageInDays > 30) {
      suggestions.push({
        id: 'refresh-content',
        category: 'content',
        title: 'Content is getting stale',
        description: "This document hasn't been updated in over a month. Refresh it with the latest info!",
        priority: 'medium',
        action_label: 'Edit Now',
        action_href: `/documents/${documentId}/edit`
      });
    }

    if (total_views === 0 && ageInDays > 7) {
      suggestions.push({
        id: 'no-views',
        category: 'sharing',
        title: 'No views yet',
        description: 'This document hasn\'t been viewed yet. Share it or make it public to get traffic.',
        priority: 'high',
        action_label: 'Share',
        action_href: `/documents/${documentId}/share`
      });
    }

    if (total_downloads > total_views * 0.3) {
      suggestions.push({
        id: 'add-watermark',
        category: 'branding',
        title: 'Great download rate!',
        description: 'Your document is being downloaded frequently. Consider adding a watermark for branding.',
        priority: 'low'
      });
    }

    return suggestions;
  }
}

export const analyticsService = new AnalyticsService();
