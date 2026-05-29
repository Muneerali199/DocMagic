import { WelcomeEmail } from "@/components/emails/welcome-email";

export default function EmailPreviewPage() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: WelcomeEmail("Owais"),
      }}
    />
  );
}