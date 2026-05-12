import { Shield } from "lucide-react";

export const metadata = { title: "Privacy Policy – DraftDeckAI" };

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-blue-600" />
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>
      <p className="text-muted-foreground text-sm">Last updated: {new Date().getFullYear()}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Information We Collect</h2>
        <p className="text-muted-foreground leading-relaxed">
          We collect information you provide directly (e.g. account registration, document content) and
          usage data such as pages visited and features used. We do not sell your personal data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How We Use Your Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          Your data is used solely to provide and improve DraftDeckAI services, authenticate your
          account, process payments, and send transactional emails.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data Storage &amp; Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          Data is stored securely via Supabase (PostgreSQL). We apply industry-standard encryption in
          transit (TLS) and at rest.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Third-Party Services</h2>
        <p className="text-muted-foreground leading-relaxed">
          We integrate with Supabase, Stripe, Mistral AI, and Google Gemini. Each service operates
          under its own privacy policy.
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
