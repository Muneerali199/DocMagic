export interface DocumentViewEvent {
  id: string;
  document_id: string;
  viewer_id: string | null;
  viewer_ip_hash: string;
  referrer: string | null;
  user_agent: string | null;
  duration_seconds: number;
  viewed_at: string;
}

export interface DocumentEngagementEvent {
  id: string;
  document_id: string;
  user_id: string | null;
  event_type: 'download' | 'share' | 'copy' | 'print' | 'feedback' | 'edit';
  event_data: Record<string, any>;
  created_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  unique_views: number;
  total_edits: number;
  total_downloads: number;
  total_shares: number;
  avg_view_duration: number;       // seconds
  views_trend: TrendPoint[];       // last 30 days
  engagement_breakdown: Record<string, number>;
  top_referrers: { referrer: string; count: number }[];
  recent_activity: ActivityItem[];
  suggestions: Suggestion[];
}

export interface TrendPoint {
  date: string;       // ISO date
  views: number;
  unique_views: number;
}

export interface ActivityItem {
  type: 'view' | 'edit' | 'download' | 'share' | 'feedback' | 'copy' | 'print';
  description: string;
  timestamp: string;
  actor_name?: string;
}

export interface Suggestion {
  id: string;
  category: 'content' | 'engagement' | 'seo' | 'sharing' | 'branding';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_label?: string;
  action_href?: string;
}
