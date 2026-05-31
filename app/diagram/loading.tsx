import { LoadingScreen } from "@/components/loading-screen";
import { DiagramPageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen variant="diagram">
      <DiagramPageSkeleton />
    </LoadingScreen>
  );
}
