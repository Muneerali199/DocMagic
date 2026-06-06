import { Metadata } from "next";
import ViewPresentationClient from "@/components/presentation/view-presentation-client";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: "Presentation | DraftDeckAI",
    description: "View AI-generated presentation from DraftDeckAI",
    openGraph: {
      title: "Presentation | DraftDeckAI",
      description: "View AI-generated presentation from DraftDeckAI",
      type: "article",
    },
  };
}

export default function Page() {
  return <ViewPresentationClient />;
}
