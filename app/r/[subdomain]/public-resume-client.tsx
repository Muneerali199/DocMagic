"use client";

import Link from "next/link";
import { Download, Linkedin, Share2, Twitter } from "lucide-react";

import { ResumePreview } from "@/components/resume/resume-preview";
import { Button } from "@/components/ui/button";

type ResumeData = {
  name?: string;
  summary?: string;
  [key: string]: unknown;
};

type PublicResumeClientProps = {
  resumeData: ResumeData;
  isCV: boolean;
  subdomain: string;
  publicUrl: string;
};

function buildShareText(resumeData: ResumeData, isCV: boolean) {
  const name = resumeData.name?.trim();
  return name
    ? `View ${name}'s ${isCV ? "CV" : "resume"} on DraftDeckAI`
    : `View this professional ${isCV ? "CV" : "resume"} on DraftDeckAI`;
}

export function PublicResumeClient({
  resumeData,
  isCV,
  subdomain,
  publicUrl,
}: PublicResumeClientProps) {
  const shareText = buildShareText(resumeData, isCV);
  const encodedUrl = encodeURIComponent(publicUrl);
  const encodedText = encodeURIComponent(shareText);
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-gray-900">
              {resumeData.name || "Professional Resume"}
            </h1>
            <p className="truncate text-sm text-gray-600">
              {subdomain}.draftdeckai.app
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a href={xShareUrl} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
                X
              </a>
            </Button>
            <Button asChild size="sm" className="bolt-gradient gap-2 text-white">
              <Link href="/resume">
                <Download className="h-4 w-4" />
                Create Your Own
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <section className="mb-4 flex flex-col gap-3 rounded-lg border border-blue-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Build a polished resume like this in minutes.
            </p>
            <p className="text-sm text-gray-600">
              Use DraftDeckAI to create, edit, and publish your own professional resume.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer">
                <Share2 className="h-4 w-4" />
                Share on LinkedIn
              </a>
            </Button>
            <Button asChild size="sm" className="bolt-gradient text-white">
              <Link href="/resume">Create Resume</Link>
            </Button>
          </div>
        </section>

        <div className="overflow-hidden rounded-lg bg-white shadow-2xl">
          <ResumePreview
            resume={resumeData}
            template="modern"
            showControls={false}
            isCV={isCV}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="mb-4 text-sm text-gray-600">
            Powered by{" "}
            <Link href="/" className="font-semibold text-blue-600 hover:underline">
              DraftDeckAI
            </Link>
          </p>
          <Button asChild className="bolt-gradient text-white shadow-lg transition-transform hover:scale-105">
            <Link href="/resume">
              <Download className="mr-2 h-4 w-4" />
              Create Your Professional Resume
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
