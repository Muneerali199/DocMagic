import { Metadata } from "next";
import { WebsiteBuilder } from "@/components/website/website-builder";

export const metadata: Metadata = {
  title: "AI Website Builder | DocMagic",
  description: "Create stunning websites with AI in seconds. Generate HTML, CSS, and JavaScript code instantly.",
};

export default function WebsiteBuilderPage() {
  return <WebsiteBuilder />;
}
