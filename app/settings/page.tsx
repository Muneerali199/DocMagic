import { Metadata } from "next";
import SettingsPageClient from "@/components/settings/settings-page-client";

export const metadata: Metadata = {
  title: "Settings | DraftDeckAI",
  description:
    "Manage your account settings, preferences, and subscription in DraftDeckAI",
  openGraph: {
    title: "Settings | DraftDeckAI",
    description:
      "Manage your account settings, preferences, and subscription in DraftDeckAI",
    type: "website",
  },
};

export default function Page() {
  return <SettingsPageClient />;
}
