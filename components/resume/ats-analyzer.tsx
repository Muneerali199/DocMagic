"use client";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  XCircle,
  Sparkles,
} from "lucide-react";
import { useAutosave } from "@/hooks/useAutosave";

export function ATSAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
   const [fileBase64, setFileBase64] = useState<string | undefined>(undefined);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  // ✅ Handle drop: convert file + set state at the same time
  const onDrop = (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    fileToBase64(uploadedFile)
      .then((base64) => {
        setFile(uploadedFile);
        setFileBase64(base64); // ready immediately for autosave
      })
      .catch(console.error);
  };
  
   // ✅ Autosave job description + file metadata + base64
  useAutosave(
    "autosave-ats",
    {
      jobDescription,
      fileName: file?.name,
      fileType: file?.type,
      fileBase64,
    },
    (restored) => {
      if (!restored) return;

      if (typeof restored.jobDescription === "string") {
        setJobDescription(restored.jobDescription);
      }

      if (restored.fileBase64 && restored.fileName) {
  try {
    const byteString = atob(restored.fileBase64.split(",")[1]); // strip `data:...;base64,`
    const mimeString = restored.fileBase64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });
    const restoredFile = new File([blob], restored.fileName, { type: restored.fileType || mimeString });

    setFile(restoredFile);
    setFileBase64(restored.fileBase64);
  } catch (err) {
    console.error("Failed to restore file from autosave", err);
    setFile(null);
    setFileBase64(undefined);
  }
} else {
  setFile(null);
  setFileBase64(undefined);
}
    }
  );
  
 const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "text/plain": [".txt"],
  },
  maxFiles: 1,
  onDrop, 
  onDropRejected: () => {
    toast({
      title: "Invalid file",
      description: "Please upload a .txt, .pdf, .doc, or .docx file",
      variant: "destructive",
    });
  },
  });

  const analyzeResume = async () => {
    if (!file || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please upload a resume and enter the job description",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/analyze/resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Status: ${res.status}`);
      }

      const data = await res.json();
      setAnalysis(data);

      toast({
        title: "Analysis Complete",
        description: `Your resume scored ${data.score}% ATS compatibility`,
      });
    } catch (err) {
      console.error("Error analyzing resume:", err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const displayAnalysis = analysis;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT SIDE - Upload & Description */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : "Drag & drop your resume, or click to select"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, DOC, DOCX, and TXT
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Textarea
            placeholder="Paste the job description here..."
            className="min-h-[200px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <Button
            onClick={analyzeResume}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Resume Analysis
              </>
            )}
          </Button>
        </div>

        {/* RIGHT SIDE - Analysis Output */}
        <div>
          {displayAnalysis ? (
            <div className="space-y-6">
              {/* Score */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center h-20 w-20 rounded-full bg-background border-4 mb-4 ${
                    displayAnalysis.score >= 80
                      ? "border-green-500"
                      : displayAnalysis.score >= 60
                      ? "border-yellow-500"
                      : "border-red-500"
                  }`}
                >
                  <span className="text-2xl font-bold">{displayAnalysis.score}%</span>
                </div>
                <h3 className="text-xl font-semibold">ATS Compatibility Score</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {displayAnalysis.score >= 80
                    ? "Excellent match!"
                    : displayAnalysis.score >= 60
                    ? "Good match, but could improve"
                    : "Needs significant improvements"}
                </p>
              </div>

              {/* Section Scores */}
              {displayAnalysis.analysis?.sectionScores && (
                <div>
                  <h4 className="font-medium mb-2">Section Scores</h4>
                  <div className="space-y-2">
                    {Object.entries(displayAnalysis.analysis.sectionScores).map(
                      ([section, score]) => (
                        <div key={section}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{section}</span>
                            <span>{String(score)}%</span>
                          </div>
                          <Progress value={score as number} />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {displayAnalysis.analysis?.keywordMatch && (
                <div>
                  <h4 className="font-medium mb-2">Keyword Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium flex items-center gap-1 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Found ({displayAnalysis.analysis.keywordMatch.found?.length || 0})
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {displayAnalysis.analysis.keywordMatch.found?.map((k: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium flex items-center gap-1 mb-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Missing ({displayAnalysis.analysis.keywordMatch.missing?.length || 0})
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {displayAnalysis.analysis.keywordMatch.missing?.map((k: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Improvements */}
              {displayAnalysis.improvements?.critical && (
                <div>
                  <h4 className="font-medium mb-2">Critical Improvements</h4>
                  <ul className="space-y-2 text-sm text-red-600">
                    {displayAnalysis.improvements.critical.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {displayAnalysis.improvements?.recommended && (
                <div>
                  <h4 className="font-medium mb-2">Recommended Enhancements</h4>
                  <ul className="space-y-2 text-sm text-yellow-600">
                    {displayAnalysis.improvements.recommended.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {displayAnalysis.improvements?.aiSuggestions && (
                <div>
                  <h4 className="font-medium mb-2">AI Suggestions</h4>
                  <div className="space-y-2">
                    {displayAnalysis.improvements.aiSuggestions.map((suggestion: string, i: number) => (
                      <div key={i} className="flex gap-2 p-3 bg-blue-50 rounded-lg text-sm">
                        <Sparkles className="h-4 w-4 mt-1 flex-shrink-0 text-blue-500" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="flex items-center justify-center min-h-[500px]">
              <CardContent className="py-10 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-3">
                  {isAnalyzing
                    ? "Analyzing your resume with AI..."
                    : "Upload your resume and job description to get started"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}