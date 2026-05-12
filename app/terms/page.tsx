import { FileText } from "lucide-react";

export const metadata = { title: "Terms of Service – DraftDeckAI" };

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="flex items-center gap-3">
        <FileText className="h-7 w-7 text-blue-600" />
        <h1 className="text-3xl font-bold">Terms of Service</h1>
      </div>
      <p className="text-muted-foreground text-sm">Last updated: {new Date().getFullYear()}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Acceptance of Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          By accessing or using DraftDeckAI you agree to be bound by these Terms. If you do not agree,
          please do not use the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Use of Service</h2>
        <p className="text-muted-foreground leading-relaxed">
          DraftDeckAI grants you a limited, non-exclusive, non-transferable licence to use the platform
          for personal or professional document creation. You may not resell, reverse-engineer, or
          misuse the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Credits &amp; Payments</h2>
        <p className="text-muted-foreground leading-relaxed">
          Credits are consumed per action as described on the Pricing page. Purchased credits are
          non-refundable except where required by applicable law. Free-tier credits reset monthly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Intellectual Property</h2>
        <p className="text-muted-foreground leading-relaxed">
          You retain ownership of content you create. DraftDeckAI retains ownership of the platform,
          UI, and underlying AI integrations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          DraftDeckAI is provided &quot;as is&quot; without warranties of any kind. We are not liable for
          indirect, incidental, or consequential damages arising from your use of the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Changes to Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update these Terms at any time. Continued use of the service after changes constitutes
          acceptance of the revised Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          Questions? Reach us via the{" "}
          <a href="/contact" className="text-blue-600 hover:underline">
            Contact page
          </a>
          .
        </p>
      </section>
    </main>
  );
}
