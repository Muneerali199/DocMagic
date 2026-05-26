import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { getBaseUrl } from "@/lib/config";
import { PublicResumeClient } from "./public-resume-client";

type ResumeData = {
  name?: string;
  summary?: string;
  [key: string]: unknown;
  experience?: Array<{
    title?: string;
    company?: string;
  }>;
};

type PublishedResume = {
  resume_data: ResumeData;
  is_cv: boolean;
  updated_at: string;
};

type PublicResumePageProps = {
  params: {
    subdomain: string;
  };
};

const defaultOgImage = "/android-chrome-512x512.png";

const demoPublishedResume: PublishedResume = {
  is_cv: false,
  updated_at: new Date().toISOString(),
  resume_data: {
    name: "Demo Candidate",
    summary:
      "Product-minded software engineer with experience building polished web applications, AI-assisted document workflows, and user-focused interfaces.",
    experience: [
      {
        title: "Frontend Engineer",
        company: "DraftDeckAI",
      },
    ],
    email: "demo@example.com",
    location: "Remote",
    skills: {
      technical: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
      programming: ["JavaScript", "TypeScript"],
      tools: ["Supabase", "Vercel", "GitHub"],
      soft: ["Product thinking", "Collaboration", "Communication"],
    },
    projects: [
      {
        name: "Public Resume Showcase",
        description:
          "A shareable resume page with social previews, share links, and a lightweight create-resume CTA.",
        technologies: ["Next.js", "Supabase", "Open Graph"],
      },
    ],
    education: [
      {
        degree: "B.S. Computer Science",
        institution: "Demo University",
        date: "2024",
      },
    ],
  },
};

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your-supabase-anon-key-here"
  );
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithTimeout,
      },
    }
  );
}

async function getPublishedResume(subdomain: string): Promise<PublishedResume | null> {
  if (!hasSupabaseConfig() && process.env.NODE_ENV !== "production") {
    return demoPublishedResume;
  }

  const { data, error } = await getSupabaseClient()
    .from("published_resumes")
    .select("resume_data, is_cv, updated_at")
    .eq("subdomain", subdomain)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PublishedResume;
}

function getResumeTitle(resume: ResumeData | undefined, isCV?: boolean) {
  const name = resume?.name?.trim();
  return name
    ? `${name}'s ${isCV ? "CV" : "Resume"}`
    : `Professional ${isCV ? "CV" : "Resume"}`;
}

function getResumeDescription(resume: ResumeData | undefined) {
  const summary = resume?.summary?.trim();
  if (summary) {
    return summary.length > 160 ? `${summary.slice(0, 157).trim()}...` : summary;
  }

  const headline = resume?.experience?.find((item) => item.title || item.company);
  if (headline?.title && headline.company) {
    return `View ${headline.title} experience at ${headline.company}, shared with DraftDeckAI.`;
  }

  if (headline?.title) {
    return `View ${headline.title} experience, shared with DraftDeckAI.`;
  }

  return "View this professional resume created and shared with DraftDeckAI.";
}

function getPublicResumeUrl(subdomain: string) {
  return `${getBaseUrl()}/r/${encodeURIComponent(subdomain)}`;
}

export async function generateMetadata({
  params,
}: PublicResumePageProps): Promise<Metadata> {
  const publishedResume = await getPublishedResume(params.subdomain);
  const canonicalUrl = getPublicResumeUrl(params.subdomain);
  const imageUrl = new URL(defaultOgImage, getBaseUrl()).toString();

  if (!publishedResume) {
    return {
      title: "Resume Not Found | DraftDeckAI",
      description: "This public resume does not exist or has been removed.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${getResumeTitle(publishedResume.resume_data, publishedResume.is_cv)} | DraftDeckAI`;
  const description = getResumeDescription(publishedResume.resume_data);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: "DraftDeckAI",
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: "DraftDeckAI",
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PublicResumePage({ params }: PublicResumePageProps) {
  const publishedResume = await getPublishedResume(params.subdomain);

  if (!publishedResume) {
    notFound();
  }

  return (
    <PublicResumeClient
      resumeData={publishedResume.resume_data}
      isCV={publishedResume.is_cv}
      subdomain={params.subdomain}
      publicUrl={getPublicResumeUrl(params.subdomain)}
    />
  );
}
