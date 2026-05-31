import { LoadingScreen } from "@/components/loading-screen";
import { ResumePageSkeleton } from "@/components/skeletons";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <LoadingScreen
        variant="resume"
        fullScreen={false}
        className="min-h-[calc(100vh-4rem)] rounded-none"
      >
        <ResumePageSkeleton />
      </LoadingScreen>
    </div>
  );
}
