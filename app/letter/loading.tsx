import { LoadingScreen } from "@/components/loading-screen";
import { LetterPageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen variant="letter">
      <LetterPageSkeleton />
    </LoadingScreen>
  );
}
