import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { DocumentCard } from "@/components/document-card";
import { File as FileIcon, FileText, Presentation as LayoutPresentation, Mail } from "lucide-react";
import SettingsPage from "./settings/page";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />

        <section id="document-types" className="py-24">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Choose Your Document Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DocumentCard
                title="Resume"
                description="Create a professional resume tailored to your target role and company"
                icon={<FileIcon className="h-6 w-6" />}
                href="/resume"
              />
              <DocumentCard
                title="Presentation"
                description="Generate beautiful slide decks from simple text prompts"
                icon={<LayoutPresentation className="h-6 w-6" />}
                href="/presentation"
              />
              <DocumentCard
                title="CV"
                description="Build a comprehensive curriculum vitae highlighting your achievements"
                icon={<FileText className="h-6 w-6" />}
                href="/cv"
              />
              <DocumentCard
                title="Letter"
                description="Draft professional letters for any purpose in seconds"
                icon={<Mail className="h-6 w-6" />}
                href="/letter"
              />
            </div>
          </div>
        </section>

        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <div>
        <SettingsPage/>
      </div>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-24">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} DocMagic. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:underline">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:underline">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
