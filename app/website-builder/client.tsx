"use client";

import { WebsiteBuilder } from "@/components/website/website-builder";
import { CreateDocumentGuard } from "@/components/ui/auth-guard";
import { SiteHeader } from "@/components/site-header";

export function WebsiteBuilderClient() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>
      
      <SiteHeader />
      <main className="flex-1 relative z-10">
        <CreateDocumentGuard>
          <WebsiteBuilder />
        </CreateDocumentGuard>
      </main>
    </div>
  );
}
