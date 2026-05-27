import { SiteHeader } from "@/components/site-header";
import { ATSAnalyzer } from "@/components/resume/ats-analyzer";
export const dynamic = 'force-dynamic';
export default function ATSPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-10">
          <h1 className="text-4xl font-bold mb-2">ATS Resume Checker</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Check your resume's ATS compatibility score and get personalized improvement suggestions
          </p>
          <ATSAnalyzer />
        </div>
      </main>
    </div>
  );
}