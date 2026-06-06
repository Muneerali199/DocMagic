import { Metadata } from "next";
import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard";

export const metadata: Metadata = {
  title: "Analytics | DraftDeckAI",
  description:
    "View document usage statistics, engagement metrics, and improvement suggestions",
  openGraph: {
    title: "Analytics | DraftDeckAI",
    description:
      "View document usage statistics, engagement metrics, and improvement suggestions",
    type: "website",
  },
};

/**
 * Main analytics dashboard page
 */
export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
