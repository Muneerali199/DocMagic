import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates | DraftDeckAI",
  description: "Browse our collection of professional templates for resumes, presentations, and letters. Find the perfect design for your next document.",
  openGraph: {
    title: "Templates | DraftDeckAI",
    description: "Browse our collection of professional templates for resumes, presentations, and letters. Find the perfect design for your next document.",
    url: "https://draftdeckai.com/templates",
  },
  twitter: {
    title: "Templates | DraftDeckAI",
    description: "Browse our collection of professional templates for resumes, presentations, and letters. Find the perfect design for your next document.",
  },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
