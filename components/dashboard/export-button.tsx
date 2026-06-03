"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  disabled?: boolean;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export function ExportButton({ 
  disabled = false, 
  onExportStart, 
  onExportComplete 
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    onExportStart?.();

    try {
      const response = await fetch("/api/export", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to export your data");
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export data");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "draftdeckai-export.json";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful!",
        description: "Your data has been downloaded as a JSON file",
      });

      // Notify parent only on success
      onExportComplete?.();
    } catch (error: unknown) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold h-12 px-6"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileJson className="mr-2 h-5 w-5" />
          Export All as JSON
        </>
      )}
    </Button>
  );
}
