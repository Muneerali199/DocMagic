import { LoadingScreen } from "@/components/loading-screen";
import { DashboardPageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen
      variant="dashboard"
      title="Loading Analytics"
      description="Preparing charts, metrics, and document insights..."
    >
      <DashboardPageSkeleton />
    </LoadingScreen>
  );
}
