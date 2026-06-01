"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clipboard,
  Copy,
  FileText,
  Loader2,
  Printer,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

type SavedResume = {
  id: string;
  title: string;
  content: unknown;
};

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "confident", label: "Confident" },
  { value: "friendly", label: "Friendly" },
  { value: "concise", label: "Concise" },
];

function resumeContentToText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content;

  const value = content as any;
  const resumeData = value.resumeData ?? value;

  if (typeof resumeData === "string") return resumeData;

  try {
    return JSON.stringify(resumeData, null, 2);
  } catch {
    return "";
  }
}

export default function CoverLetterFromResume() {
  const { user, isLoading: authLoading } = useUser();
  const supabase = useMemo(() => createClient(), []);

  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResumes() {
      if (!user) {
        setResumes([]);
        setSelectedResumeId("");
        setResume("");
        return;
      }

      setLoadingResumes(true);

      const resumeResult = await (supabase as any)
        .from("resumes")
        .select("id, title, content")
        .eq("user_id", user.id);

      let savedResumes = resumeResult.data as SavedResume[] | null;

      if (!savedResumes?.length) {
        const documentsResult = await (supabase as any)
          .from("documents")
          .select("id, title, content")
          .eq("user_id", user.id)
          .eq("type", "resume")
          .order("updated_at", { ascending: false });

        savedResumes = documentsResult.data as SavedResume[] | null;
      }

      setResumes(savedResumes ?? []);
      setLoadingResumes(false);
    }

    fetchResumes().catch(() => {
      setResumes([]);
      setLoadingResumes(false);
      toast.error("Could not load saved resumes");
    });
  }, [supabase, user]);

  const selectedResume = resumes.find((item) => item.id === selectedResumeId);

  function handleResumeSelect(id: string) {
    setSelectedResumeId(id);
    const selected = resumes.find((item) => item.id === id);
    setResume(resumeContentToText(selected?.content));
  }

  async function generate() {
    setError("");
    setOutput("");

    if (!resume.trim() || !jobDescription.trim()) {
      setError("Select a resume and paste a job description to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate/cover-letter-from-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to generate cover letter");
      } else {
        setOutput(data?.text || "");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  }

  async function copyOutput() {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      toast.success("Cover letter copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  function printOutput() {
    if (!output) return;
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <Button
            asChild
            variant="ghost"
            className="w-fit text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <Link href="/letter">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
                <Sparkles className="mr-2 h-4 w-4" />
                Resume powered cover letters
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                  Build a tailored cover letter from a saved resume.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Choose a resume, paste the target role, and generate a polished
                  one-page letter ready to copy or print.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {["Saved resume", "Job match", "Paper preview"].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                      Step
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Inputs</h2>
              <p className="text-sm text-slate-300">
                Select your source resume and target role.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-100">Saved resume</Label>
              <Select
                value={selectedResumeId}
                onValueChange={handleResumeSelect}
                disabled={authLoading || loadingResumes || resumes.length === 0}
              >
                <SelectTrigger className="border-white/10 bg-slate-950/70 text-white">
                  <SelectValue
                    placeholder={
                      loadingResumes ? "Loading resumes..." : "Choose a resume"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title || "Untitled Resume"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!authLoading && !user ? (
                <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
                  Sign in to load your saved resumes.
                </p>
              ) : null}
              {user && !loadingResumes && resumes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-cyan-300/30 bg-cyan-300/10 p-4 text-sm text-cyan-50">
                  No saved resumes yet. Build and save a resume first, then come
                  back to generate a tailored cover letter.
                </div>
              ) : null}
              {selectedResume ? (
                <p className="text-xs text-slate-400">
                  Using {selectedResume.title || "Untitled Resume"}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-100">Job description</Label>
              <Textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={10}
                placeholder="Paste the job description, responsibilities, and must-have skills."
                className="min-h-[240px] border-white/10 bg-slate-950/70 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-100">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="border-white/10 bg-slate-950/70 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error ? (
              <p className="rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            <Button
              onClick={generate}
              disabled={loading || !resume.trim() || !jobDescription.trim()}
              className="h-12 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {loading ? "Generating..." : "Generate cover letter"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 text-slate-950 shadow-2xl sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Paper preview
              </p>
              <h2 className="text-2xl font-bold">Generated letter</h2>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={copyOutput}
                disabled={!output}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={printOutput}
                disabled={!output}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          <div className="min-h-[620px] rounded-sm bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-10 print:min-h-0 print:shadow-none print:ring-0">
            {output ? (
              <article className="prose prose-slate max-w-none whitespace-pre-wrap text-[15px] leading-7">
                {output}
              </article>
            ) : (
              <div className="flex min-h-[520px] flex-col items-center justify-center rounded-sm border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Clipboard className="mb-4 h-10 w-10 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-800">
                  Your cover letter will appear here.
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Select a saved resume, paste the job description, and generate
                  a tailored paper-ready preview.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
