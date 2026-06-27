import { Metadata } from 'next';
import UsageDashboard from '@/components/dashboard/usage-dashboard';

export const metadata: Metadata = {
  title: 'Usage Dashboard | DraftDeckAI',
  description:
    'Track your AI credit consumption, documents created, templates used, and generation history with visual analytics.',
};

/**
 * /dashboard/usage – Visual analytics dashboard for usage tracking.
 * Implements Issue #847: Add usage dashboard with visual analytics breakdown.
 */
export default function UsageDashboardPage() {
  return <UsageDashboard />;
}
