"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileJson,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ImportSummary {
  total: number;
  documents: number;
  presentations: number;
  diagrams: number;
  letters: number;
  errors: string[];
}

export default function ImportDataPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const fileLabel = useMemo(() => {
    if (!file) return "Choose a DraftDeckAI export JSON file";
    return `${file.name} (${Math.ceil(file.size / 1024)} KB)`;
  }, [file]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    setSummary(null);

    if (!selected) {
      setFile(null);
      return;
    }

    if (
      !selected.name.endsWith(".json") &&
      selected.type !== "application/json"
    ) {
      toast({
        title: "Unsupported file",
        description: "Please select a DraftDeckAI JSON export file.",
        variant: "destructive",
      });
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleImport = async () => {
    if (!file || isImporting) return;

    setIsImporting(true);
    setProgress(20);
    setSummary(null);

    try {
      const payload = JSON.parse(await file.text());
      setProgress(45);

      const response = await fetch("/api/import/user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setProgress(85);
      const result = await response.json();

      if (!response.ok && response.status !== 207) {
        throw new Error(result.error || "Import failed");
      }

      setSummary(result.summary);
      setProgress(100);
      toast({
        title:
          response.status === 207
            ? "Import completed with warnings"
            : "Import complete",
        description: result.message || "Your data import has finished.",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to import this file.",
        variant: "destructive",
      });
      setProgress(0);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/settings")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Import Your Data
            </CardTitle>
            <CardDescription>
              Restore documents, presentations, diagrams, and letters from a
              DraftDeckAI export file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition-colors hover:bg-muted/40">
              <FileJson className="mb-3 h-10 w-10 text-blue-500" />
              <span className="font-medium">{fileLabel}</span>
              <span className="mt-1 text-sm text-muted-foreground">
                JSON exports from the data export page are supported.
              </span>
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Validating and importing...
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {summary && (
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2 font-medium">
                  {summary.errors.length ? (
                    <XCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  Import Summary
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                  <span>Total: {summary.total}</span>
                  <span>Documents: {summary.documents}</span>
                  <span>Presentations: {summary.presentations}</span>
                  <span>Diagrams: {summary.diagrams}</span>
                  <span>Letters: {summary.letters}</span>
                </div>
                {summary.errors.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-destructive">
                    {summary.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!file || isImporting}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            >
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
