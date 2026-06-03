"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ExportButton } from "@/components/dashboard/export-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Presentation, 
  Network, 
  Mail, 
  Sparkles, 
  Download,
  Shield,
  Clock,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface ExportStats {
  resumes: number;
  presentations: number;
  diagrams: number;
  letters: number;
  generated: number;
  total: number;
}

const contentTypeConfig = {
  resumes: {
    icon: FileText,
    label: "Resumes",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    gradient: "from-blue-500 to-cyan-500",
  },
  presentations: {
    icon: Presentation,
    label: "Presentations",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    gradient: "from-purple-500 to-pink-500",
  },
  generated: {
    icon: Sparkles,
    label: "AI Documents",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    gradient: "from-blue-600 to-indigo-600",
  },
  diagrams: {
    icon: Network,
    label: "Diagrams",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    gradient: "from-green-500 to-emerald-500",
  },
  letters: {
    icon: Mail,
    label: "Letters",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    gradient: "from-orange-500 to-amber-500",
  },
};

export default function ExportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        router.push("/auth/signin");
        return;
      }

      // Fetch counts from all tables in parallel
      const [
        documentsResult,
        presentationsResult,
        diagramsResult,
        lettersResult,
      ] = await Promise.all([
        supabase
          .from("documents")
          .select("type", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("presentations")
          .select("*", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("diagrams")
          .select("*", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("letters")
          .select("*", { count: "exact" })
          .eq("user_id", user.id),
      ]);

      // Count resumes vs generated documents
      const allDocuments = documentsResult.data || [];
      const resumeCount = allDocuments.filter((d: { type: string }) => d.type === "resume").length;
      const generatedCount = allDocuments.filter((d: { type: string }) => d.type === "generated").length;

      const totalStats: ExportStats = {
        resumes: resumeCount,
        presentations: presentationsResult.data?.length || 0,
        diagrams: diagramsResult.data?.length || 0,
        letters: lettersResult.data?.length || 0,
        generated: generatedCount,
        total: resumeCount + (presentationsResult.data?.length || 0) + 
               (diagramsResult.data?.length || 0) + (lettersResult.data?.length || 0) + 
               generatedCount,
      };

      setStats(totalStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to load export data statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportStart = () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate progress for visual feedback
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleExportComplete = () => {
    setExportProgress(100);
    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24" />
        <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18" />
        
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center glass-effect p-8 rounded-2xl">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24" />
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18" />
      
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <SiteHeader />
      
      <div className="flex-1 p-4 md:p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/history")}
              className="mb-4 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4 shimmer">
              <Download className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Data Export</span>
              <Shield className="h-4 w-4 text-blue-500" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bolt-gradient-text">
                Export Your Data
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Download all your content as a structured JSON file. This feature helps you 
              maintain data portability and complies with GDPR data portability requirements.
            </p>
          </div>

          {/* Content Summary Cards */}
          <Card className="glass-effect border border-border/40 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                What will be exported?
              </CardTitle>
              <CardDescription>
                The following content types will be included in your export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats && Object.entries(contentTypeConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  const count = stats[key as keyof ExportStats] as number;
                  
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor} backdrop-blur-sm transition-all duration-300 ${
                        count > 0 ? "opacity-100" : "opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{config.label}</p>
                          <p className={`text-sm ${config.color} font-medium`}>
                            {count} {count === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bolt-gradient flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Total Items</p>
                      <p className="text-sm text-muted-foreground">
                        Across all content types
                      </p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold bolt-gradient-text">
                    {stats?.total || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Format Info */}
          <Card className="glass-effect border border-border/40 mb-6">
            <CardHeader>
              <CardTitle>Export Format</CardTitle>
              <CardDescription>
                Details about the exported data structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">JSON Format</p>
                  <p className="text-sm text-muted-foreground">
                    All data is exported in a structured JSON format that is easy to read 
                    and can be imported into other systems.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Complete Data</p>
                  <p className="text-sm text-muted-foreground">
                    The export includes all your content with metadata such as creation dates, 
                    titles, descriptions, and the complete content data.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Timestamped</p>
                  <p className="text-sm text-muted-foreground">
                    Each export includes a timestamp and your data is organized by content 
                    type for easy reference.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Bar (visible during export) */}
          {isExporting && (
            <Card className="glass-effect border border-border/40 mb-6">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Exporting your data...</span>
                    <span className="font-medium">{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Button */}
          <Card className="glass-effect border border-border/40">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">Ready to export?</p>
                  <p className="text-sm text-muted-foreground">
                    Click the button to download all your data as a JSON file.
                  </p>
                </div>
                <ExportButton
                  disabled={!stats || stats.total === 0}
                  onExportStart={handleExportStart}
                  onExportComplete={handleExportComplete}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Your data belongs to you. This export feature helps you maintain 
              <span className="font-medium text-foreground"> data portability </span> 
              in compliance with GDPR requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
