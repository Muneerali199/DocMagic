import { LoadingScreen } from "@/components/loading-screen";
import { DashboardPageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen
      variant="dashboard"
      title="Loading Export Center"
      description="Preparing your export tools and document data..."
    >
      <DashboardPageSkeleton />
    </LoadingScreen>
  );
}
