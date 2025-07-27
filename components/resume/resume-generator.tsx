"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles, Maximize2, Minimize2, Download } from "lucide-react";
import { ResumeAIAssistant } from "./resume-ai-assistant";
import { GuidedResumeGenerator } from "./guided-resume-generator";
import { ResumePreview } from "./resume-preview";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/use-subscription";
import { ResumeEditorEnhanced } from "@/components/resume/resume-editor-enhanced";

// Define types
type ResumeTemplates = 'modern' | 'professional' | 'creative';

interface ResumeData {
  content?: string;
  name?: string;
  email?: string;
  phone?: string | number;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  portfolio?: string;
  summary?: string;
  experience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    date?: string;
    description?: string[];
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    location?: string;
    date?: string;
    gpa?: string;
    honors?: string;
  }>;
  skills?: {
    technical?: string[];
    programming?: string[];
    tools?: string[];
    soft?: string[];
  };
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
}

interface ResumeEditorEnhancedProps {
  value: string;
  onChange: (content: string) => void;
  onGenerate: () => Promise<void>;
  isGenerating?: boolean;
}

interface GuidedResumeGeneratorProps {
  onResumeGenerated?: (resume: any) => void;
  isGenerating?: boolean;
}

interface ResumeAIAssistantProps {
  resumeContent: string;
  onApplySuggestion: (suggestion: string) => void;
  isGenerating?: boolean;
}

interface ResumePreviewProps {
  resume: ResumeData;
  template: string;
  onChange?: (newResume: ResumeData) => void;
}

export function ResumeGenerator() {
  const { toast } = useToast();
  const { isPro } = useSubscription();
  
  // State management
  const [resumeData, setResumeData] = useState<ResumeData>({
    content: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    experience: [],
    education: [],
    skills: {
      technical: [],
      programming: [],
      tools: [],
      soft: []
    },
    projects: [],
    certifications: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplates>("modern");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prompt, setPrompt] = useState("");

  // Handler for content changes from the editor
  const handleContentChange = (content: string) => {
    setResumeData(prev => ({ ...prev, content }));
  };

  // Handler for content generation from the guided generator
  const handleGuidedGenerate = (generatedContent: string) => {
    setResumeData(prev => ({ ...prev, content: generatedContent }));
    setActiveTab("editor");
    toast({
      title: "Resume generated!",
      description: "Your resume has been generated. You can now edit it further.",
    });
  };

  // Handler for AI suggestions
  const handleAISuggestion = (suggestion: string) => {
    if (typeof suggestion !== 'string') {
      console.error('Invalid suggestion type:', suggestion);
      toast({
        title: "Error",
        description: "Invalid suggestion format. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setResumeData(prev => ({
      ...prev,
      content: suggestion || prev.content || ''
    }));
    
    setActiveTab("editor");
    toast({
      title: "Suggestion applied!",
      description: "The AI's suggestion has been applied to your resume.",
    });
  };

  // Handler for export functionality
  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon.",
    });
  };

  // Handler for generating resume
  const generateResume = async (): Promise<void> => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate a resume",
        variant: "destructive",
      });
      return Promise.resolve();
    }

    setIsGenerating(true);

    return new Promise<void>(async (resolve, reject) => {
      try {
        // TODO: Implement API call to generate resume
        // This is a placeholder for the actual implementation
        const response = await fetch("/api/generate/resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            name,
            email,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate resume");
        }

        const data = await response.json();
        setResumeData(data);

        toast({
          title: "Success!",
          description: "Your resume has been generated successfully.",
        });
        resolve();
      } catch (error) {
        console.error("Error generating resume:", error);
        toast({
          title: "Error",
          description: "Failed to generate resume. Please try again.",
          variant: "destructive",
        });
        reject(error);
      } finally {
        setIsGenerating(false);
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Resume Generator</h1>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsFullView(!isFullView)}
            className="flex items-center gap-2 text-sm px-3 py-1.5"
          >
            {isFullView ? (
              <>
                <Minimize2 className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                Expand
              </>
            )}
          </Button>
          <Button 
            onClick={handleExport} 
            className="flex items-center gap-2 text-sm px-3 py-1.5"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Editor/Guided/AI Assistant */}
        <div className={`${isFullView ? 'hidden' : 'w-1/2'} border-r h-full flex flex-col`}>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="guided">Guided</TabsTrigger>
              <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="editor" className="h-full">
                <ResumeEditorEnhanced
                  value={resumeData.content || ''}
                  onChange={handleContentChange}
                  onGenerate={generateResume}
                  isGenerating={isGenerating}
                />
              </TabsContent>
              
              <TabsContent value="guided">
                <GuidedResumeGenerator 
                  onResumeGenerated={(resume) => {
                    setResumeData(prev => ({
                      ...prev,
                      ...resume,
                      content: (resume.summary || prev.content || '') as string
                    }));
                    setActiveTab("editor");
                  }}
                />
              </TabsContent>
              
              <TabsContent value="ai-assistant">
                <ResumeAIAssistant
                  resumeContent={resumeData.content || ''}
                  onApplySuggestion={handleAISuggestion}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right panel - Preview */}
        <div className={`${isFullView ? 'w-full' : 'w-1/2'} bg-gray-50 p-4 overflow-auto`}>
          <div className={cn("h-full", isFullView ? 'w-full' : 'w-1/2')}>
            <ResumePreview
              resume={resumeData}
              template={selectedTemplate}
              onChange={(newResume) => setResumeData(prev => ({
                ...prev,
                ...newResume,
                content: (newResume.summary || prev.content || '') as string
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeGenerator;
