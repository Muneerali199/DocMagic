import { Metadata } from "next";
import { WebsiteBuilderClient } from "./client";

export const metadata: Metadata = {
  title: "AI Website Builder | DocMagic",
  description: "Create stunning websites with AI in seconds. Generate HTML, CSS, and JavaScript code instantly.",
};

export default function WebsiteBuilderPage() {
  return <WebsiteBuilderClient />;
}
