import { LoadingScreen } from "@/components/loading-screen";
import { PresentationPageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen variant="presentation">
      <PresentationPageSkeleton />
    </LoadingScreen>
  );
}
