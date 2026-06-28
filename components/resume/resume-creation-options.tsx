"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Linkedin,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface ResumeCreationOptionsProps {
  isCV: boolean;
  setCurrentStep: (
    step:
      | "dashboard"
      | "selection"
      | "input"
      | "preview"
      | "job-url"
      | "ats-checker",
  ) => void;
  handlePdfImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userName: string;
  setUserName: (value: string) => void;
  userEmail: string;
  setUserEmail: (value: string) => void;
  manualText: string;
  setManualText: (value: string) => void;
  handleManualImport: () => void;
  isImporting: boolean;
  selectedFile: File | null;
  generateFromPdf: () => void;
}

export function ResumeCreationOptions({
  isCV,
  setCurrentStep,
  handlePdfImport,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  manualText,
  setManualText,
  handleManualImport,
  isImporting,
  selectedFile,
  generateFromPdf,
}: ResumeCreationOptionsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-0">
      {/* Left: Import Methods */}
      <Card className="card-sky hover-sky border-2 border-blue-200/50 hover:border-blue-300/70 shadow-xl backdrop-blur-xl bg-card dark:bg-background">
        <CardHeader className="p-4 sm:p-6 relative">
          <div className="pt-8 sm:pt-0">
            <CardTitle className="text-xl sm:text-2xl font-bold professional-heading">
              <span className="bolt-gradient-text">Import Your Profile</span>
              {isCV && (
                <span className="ml-2 text-sm font-normal text-purple-600 dark:text-purple-400">
                  (CV Mode)
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm sm:text-base dark:text-muted-foreground-dark">
              Choose your preferred method to get started
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="pdf" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 glass-effect h-auto">
              <TabsTrigger
                value="pdf"
                className="text-xs sm:text-sm data-[state=active]:sunset-gradient data-[state=active]:text-white py-2 sm:py-2.5"
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                PDF/File
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="text-xs sm:text-sm data-[state=active]:forest-gradient data-[state=active]:text-white py-2 sm:py-2.5"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                Text
              </TabsTrigger>
            </TabsList>

            {/* PDF Tab */}
            <TabsContent value="pdf" className="space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <Label
                  htmlFor="pdf-upload"
                  className="text-sm font-medium dark:text-foreground-dark"
                >
                  Upload Resume PDF or LinkedIn Export
                </Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors cursor-pointer 
                                    ${selectedFile ? "border-green-400 bg-green-50/50 dark:bg-green-800/50" : "border-border dark:border-border-dark bg-input dark:bg-input-dark hover:border-accent dark:hover:border-accent-dark"}`}
                >
                  <input
                    type="file"
                    id="pdf-upload"
                    accept="application/pdf"
                    onChange={handlePdfImport}
                    className="hidden"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer w-full h-full block"
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-800 rounded-xl flex items-center justify-center mb-3">
                          <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-sm font-semibold text-foreground dark:text-foreground-dark break-all max-w-xs">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1 mb-2">
                          Ready to process
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark hover:text-accent dark:hover:text-accent-dark underline">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 text-gray-400 dark:text-gray-300" />
                        <p className="text-xs sm:text-sm font-medium text-foreground dark:text-foreground-dark">
                          Click to upload PDF
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1">
                          LinkedIn profile export only
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {selectedFile && (
                <Button
                  onClick={generateFromPdf}
                  disabled={isImporting}
                  className="w-full sunset-gradient hover:scale-105 transition-all duration-300 text-white shadow-lg text-sm sm:text-base animate-in slide-in-from-bottom-2"
                  size="lg"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span className="font-semibold">
                        Extracting Profile...
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      <span className="font-semibold">
                        Generate Resume with AI
                      </span>
                    </>
                  )}
                </Button>
              )}

              <div className="bg-card dark:bg-background border border-border dark:border-border-dark rounded-lg p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-foreground dark:text-foreground-dark font-medium mb-1.5 sm:mb-2">
                  💡 How to export from LinkedIn:
                </p>
                <ol className="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground-dark space-y-0.5 sm:space-y-1 list-decimal list-inside">
                  <li>Go to your LinkedIn profile</li>
                  <li>Click "More" → "Save to PDF"</li>
                  <li>Upload the downloaded PDF here</li>
                </ol>
              </div>
            </TabsContent>

            {/* Manual Text Tab */}
            <TabsContent value="text" className="space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <Label
                    htmlFor="user-name"
                    className="text-sm font-medium dark:text-foreground-dark"
                  >
                    Your Name *
                  </Label>
                  <Input
                    id="user-name"
                    placeholder="e.g., John Doe"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-input dark:bg-input-dark"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="user-email"
                    className="text-sm font-medium dark:text-foreground-dark"
                  >
                    Your Email *
                  </Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="e.g., john.doe@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="bg-input dark:bg-input-dark"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="manual-text"
                    className="text-sm font-medium flex items-center gap-2 dark:text-foreground-dark"
                  >
                    Job Description / Target Role *
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800 dark:to-blue-800 text-purple-700 dark:text-purple-200 text-xs rounded-full font-bold">
                      AI-Powered ✨
                    </span>
                  </Label>
                  <Textarea
                    id="manual-text"
                    placeholder="Describe the job role you're targeting..."
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="min-h-[180px] bg-input dark:bg-input-dark resize-none"
                  />
                </div>
              </div>
              <Button
                onClick={handleManualImport}
                disabled={isImporting}
                className="w-full forest-gradient hover:scale-105 transition-all duration-300 text-white shadow-lg text-sm sm:text-base"
                size="lg"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span className="font-semibold">
                      Generating Professional Resume...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    <span className="font-semibold">
                      Generate Resume with AI
                    </span>
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Right: Benefits */}
      <Card className="card-coral hover-coral border-2 border-amber-200/50 hover:border-amber-300/70 shadow-xl backdrop-blur-xl hidden lg:block bg-card dark:bg-background">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold professional-heading dark:text-foreground-dark">
            <span className="sunset-gradient-text">
              Why Use Our Builder? ✨
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4 group">
            <div className="w-12 h-12 forest-gradient rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold professional-heading mb-1 dark:text-foreground-dark">
                ATS-Optimized
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                Resumes formatted to pass Applicant Tracking Systems
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="w-12 h-12 bolt-gradient rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold professional-heading mb-1 dark:text-foreground-dark">
                AI-Powered
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                Intelligent parsing extracts data from any format
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="w-12 h-12 cosmic-gradient rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold professional-heading mb-1 dark:text-foreground-dark">
                Export Anywhere
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                Download as PDF or DOCX, ready to send
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="w-12 h-12 sunset-gradient rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20 group-hover:scale-110 transition-transform">
              <Linkedin className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold professional-heading mb-1 dark:text-foreground-dark">
                LinkedIn Integration
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
                Import directly from LinkedIn or PDF export
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 glass-effect rounded-lg border border-border dark:border-border-dark hover:scale-105 transition-transform">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-accent animate-pulse mt-0.5" />
              <p className="text-sm professional-text dark:text-foreground-dark">
                <strong className="bolt-gradient-text">Pro Tip:</strong> For
                best results, use PDF export from LinkedIn. It&apos;s 100%
                reliable and includes all your data!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
