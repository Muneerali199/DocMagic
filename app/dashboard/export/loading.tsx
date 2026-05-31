import { LoadingScreen } from "@/components/loading-screen";
import { DashboardPageSkeleton } from "@/components/skeletons";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <LoadingScreen
        variant="dashboard"
        title="Loading Export Center"
        description="Preparing your export tools and document data..."
        fullScreen={false}
        className="min-h-[calc(100vh-4rem)] rounded-none"
      >
        <DashboardPageSkeleton />
      </LoadingScreen>
    </div>
  );
}
