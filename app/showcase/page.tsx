import { SiteHeader } from "@/components/site-header";
import { ShowcaseFeed } from "@/components/showcase/showcase-feed";

export const dynamic = 'force-dynamic';

export default function ShowcasePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Showcase</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover resumes and presentations from the community.
            </p>
          </div>
          <ShowcaseFeed />
        </div>
      </main>
    </div>
  );
}