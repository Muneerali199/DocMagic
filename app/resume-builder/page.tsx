import { Metadata } from "next";
import ResumeBuilderPageClient from "@/components/resume-builder/resume-builder-page-client";

export const metadata: Metadata = {
  title: "Resume Builder | DraftDeckAI",
  description:
    "Create ATS-optimized resumes with AI-powered editing and real-time preview",
  openGraph: {
    title: "Resume Builder | DraftDeckAI",
    description:
      "Create ATS-optimized resumes with AI-powered editing and real-time preview",
    type: "website",
  },
};

export default function Page() {
  return <ResumeBuilderPageClient />;
}
