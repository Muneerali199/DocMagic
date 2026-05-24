"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DiagramPreview } from "@/components/diagram/diagram-preview";
import { DiagramTemplates } from "@/components/diagram/diagram-templates";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { broadcastDiagramChange, subscribeToDiagramChanges } from "@/lib/collaboration-service";
import { 
  Loader2, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Wand2, 
  Code, 
  Eye, 
  FileImage,
  Share2,
  Save,
  History,
  MessageSquare,
  Workflow,
  GitBranch,
  Database,
  Network,
  Zap
} from "lucide-react";
import { toPng, toSvg } from 'html-to-image';

const DIAGRAM_TYPES = [
  { value: 'flowchart', label: 'Flowchart', icon: '📊' },
  { value: 'sequence', label: 'Sequence Diagram', icon: '🔄' },
  { value: 'classDiagram', label: 'Class Diagram', icon: '📦' },
  { value: 'erDiagram', label: 'ER Diagram', icon: '🗄️' },
  { value: 'stateDiagram', label: 'State Diagram', icon: '⚡' },
  { value: 'gantt', label: 'Gantt Chart', icon: '📅' },
  { value: 'pie', label: 'Pie Chart', icon: '🥧' },
  { value: 'gitGraph', label: 'Git Graph', icon: '🌿' },
  { value: 'mindmap', label: 'Mindmap', icon: '🧠' },
  { value: 'timeline', label: 'Timeline', icon: '⏳' },
  { value: 'journey', label: 'User Journey', icon: '🚶' },
];

const DIAGRAM_EXAMPLES = {
  flowchart: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,
  
  sequence: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great!
    A-)B: See you later!`,
  
  classDiagram: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Dog`,
  
  erDiagram: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
        string name
        string email
        string phone
    }
    ORDER ||--|{ LINE-ITEM : contains
    ORDER {
        int orderNumber
        date orderDate
    }
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
  
  stateDiagram: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : Start
    Processing --> Success : Complete
    Processing --> Failed : Error
    Failed --> Processing : Retry
    Success --> [*]
    Failed --> [*]`,
  
  gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements :done, req, 2024-01-01, 7d
    Design :active, des, 2024-01-08, 10d
    section Development
    Frontend :dev1, 2024-01-18, 14d
    Backend :dev2, 2024-01-18, 14d
    section Testing
    QA Testing :test, 2024-02-01, 7d`,
  
  pie: `pie title Project Distribution
    "Development" : 45
    "Testing" : 20
    "Design" : 15
    "Documentation" : 10
    "Deployment" : 10`,
  
  gitGraph: `gitGraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit`,
  
  mindmap: `mindmap
  root((DraftDeckAI))
    Features
      Resume Builder
      Presentation Maker
      Diagram Generator
    Technology
      Next.js
      AI Integration
      Mermaid
    Benefits
      Fast
      Professional
      Easy to Use`,
  
  timeline: `timeline
    title Product Development Timeline
    2024-Q1 : Planning Phase : Market Research
    2024-Q2 : Development : MVP Launch
    2024-Q3 : Growth : User Acquisition
    2024-Q4 : Scale : Enterprise Features`,
  
  journey: `journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me`
};

interface DiagramGeneratorProps {
  sessionId?: string | null;
}

interface SavedDiagram {
  id: string;
  title: string | null;
  type: string | null;
  code: string | null;
  prompt: string | null;
  created_at: string;
}

interface DiagramVersion {
  id: string;
  version_number: number;
  content: {
    code?: string;
    type?: string;
  };
  changes_summary: string;
  created_at: string;
}

interface DiagramComment {
  id: string;
  diagram_id: string;
  user_id: string;
  user_name: string;
  body: string;
  created_at: string;
}

export function DiagramGenerator({ sessionId }: DiagramGeneratorProps) {
  const [diagramCode, setDiagramCode] = useState(DIAGRAM_EXAMPLES.flowchart);
  const [previewDiagramCode, setPreviewDiagramCode] = useState(DIAGRAM_EXAMPLES.flowchart);
  const [selectedTemplate, setSelectedTemplate] = useState("flowchart");
  const [prompt, setPrompt] = useState("");
  const [selectedDiagramType, setSelectedDiagramType] = useState("flowchart");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingDiagram, setIsSavingDiagram] = useState(false);
  const [isLoadingDiagrams, setIsLoadingDiagrams] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [savedDiagrams, setSavedDiagrams] = useState<SavedDiagram[]>([]);
  const [diagramVersions, setDiagramVersions] = useState<DiagramVersion[]>([]);
  const [diagramComments, setDiagramComments] = useState<DiagramComment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<'png' | 'svg' | null>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const { toast } = useToast();
  const { user } = useAuth();
  const diagramRef = useRef<HTMLDivElement>(null);
  const previewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    return () => {
      if (previewDebounceRef.current) {
        clearTimeout(previewDebounceRef.current);
      }
    };
  }, []);

  const updateDiagramCode = useCallback((code: string, debouncePreview = false) => {
    setDiagramCode(code);

    if (previewDebounceRef.current) {
      clearTimeout(previewDebounceRef.current);
    }

    if (debouncePreview) {
      previewDebounceRef.current = setTimeout(() => {
        setPreviewDiagramCode(code);
        previewDebounceRef.current = null;
      }, 500);
    } else {
      setPreviewDiagramCode(code);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToDiagramChanges(sessionId, (change) => {
      if (change.session_id !== sessionId) return;

      updateDiagramCode(change.mermaid_code);
      setSelectedDiagramType(change.diagram_type);
      setSelectedTemplate(change.diagram_type);
    });

    return unsubscribe;
  }, [sessionId, updateDiagramCode]);

  const syncDiagramChange = (mermaidCode: string, diagramType: string) => {
    if (!sessionId) return;

    broadcastDiagramChange(sessionId, mermaidCode, diagramType).catch((error) => {
      console.error('Diagram collaboration error:', error);
    });
  };

  const loadSavedDiagrams = useCallback(async () => {
    setIsLoadingDiagrams(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error('Please sign in to load saved diagrams');
      }

      const { data, error } = await supabase
        .from('diagrams')
        .select('id,title,type,code,prompt,created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSavedDiagrams(data || []);
    } catch (error) {
      console.error('Load diagrams error:', error);
      toast({
        title: "Load failed",
        description: error instanceof Error ? error.message : "Failed to load saved diagrams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDiagrams(false);
    }
  }, [supabase, toast]);

  const loadDiagramVersions = useCallback(async (diagramId = currentDiagramId) => {
    if (!diagramId) {
      setDiagramVersions([]);
      return;
    }

    setIsLoadingVersions(true);

    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('id,version_number,content,changes_summary,created_at')
        .eq('document_id', diagramId)
        .order('version_number', { ascending: false });

      if (error) {
        throw error;
      }

      setDiagramVersions((data || []) as DiagramVersion[]);
    } catch (error) {
      console.error('Load versions error:', error);
      toast({
        title: "Load failed",
        description: error instanceof Error ? error.message : "Failed to load diagram history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingVersions(false);
    }
  }, [currentDiagramId, supabase, toast]);

  const loadDiagramComments = useCallback(async (diagramId = currentDiagramId) => {
    if (!diagramId) {
      setDiagramComments([]);
      return;
    }

    setIsLoadingComments(true);

    try {
      const { data, error } = await supabase
        .from('diagram_comments')
        .select('id,diagram_id,user_id,user_name,body,created_at')
        .eq('diagram_id', diagramId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setDiagramComments(data || []);
    } catch (error) {
      console.error('Load comments error:', error);
      toast({
        title: "Load failed",
        description: error instanceof Error ? error.message : "Failed to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComments(false);
    }
  }, [currentDiagramId, supabase, toast]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    if (value === 'my-diagrams') {
      loadSavedDiagrams();
    }

    if (value === 'history') {
      loadDiagramVersions();
    }

    if (value === 'comments') {
      loadDiagramComments();
    }
  };

  const saveDiagram = async () => {
    setIsSavingDiagram(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error('Please sign in to save diagrams');
      }

      const title = prompt.trim().slice(0, 50) || "Untitled Diagram";

      let savedDiagram;

      if (currentDiagramId) {
        const { data: updated, error } = await supabase
          .from('diagrams')
          .update({
            title,
            type: selectedDiagramType,
            code: diagramCode,
            prompt,
          })
          .eq('id', currentDiagramId)
          .select('id')
          .single();

        if (error || !updated) {
          throw error || new Error('Failed to update diagram');
        }

        savedDiagram = updated;
      } else {
        const { data: inserted, error } = await supabase
          .from('diagrams')
          .insert({
            user_id: session.user.id,
            title,
            type: selectedDiagramType,
            code: diagramCode,
            prompt,
          })
          .select('id')
          .single();

        if (error || !inserted) {
          throw error || new Error('Failed to save diagram');
        }

        savedDiagram = inserted;
        setCurrentDiagramId(inserted.id);
      }

      const { count, error: countError } = await supabase
        .from('document_versions')
        .select('id', { count: 'exact', head: true })
        .eq('document_id', savedDiagram.id);

      if (countError) {
        throw countError;
      }

      const { error: versionError } = await supabase.from('document_versions').insert({
        document_id: savedDiagram.id,
        version_number: (count || 0) + 1,
        content: {
          code: diagramCode,
          type: selectedDiagramType,
        },
        changes_summary: "Manual save",
        created_by: session.user.id,
        created_by_name: session.user.email || "Anonymous",
        is_auto_save: false,
      });

      if (versionError) {
        throw versionError;
      }

      toast({
        title: "Diagram saved",
        description: "Your diagram has been saved successfully",
      });

      if (activeTab === 'my-diagrams') {
        loadSavedDiagrams();
      }

      if (activeTab === 'history') {
        loadDiagramVersions(savedDiagram.id);
      }

      if (activeTab === 'comments') {
        loadDiagramComments(savedDiagram.id);
      }
    } catch (error) {
      console.error('Save diagram error:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save diagram. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingDiagram(false);
    }
  };

  const submitComment = async () => {
    if (!currentDiagramId || !commentBody.trim()) return;

    setIsSubmittingComment(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error('Please sign in to add comments');
      }

      const { error } = await supabase.from('diagram_comments').insert({
        diagram_id: currentDiagramId,
        user_id: session.user.id,
        user_name: session.user.email || "Anonymous",
        body: commentBody.trim(),
      });

      if (error) {
        throw error;
      }

      setCommentBody("");
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
      loadDiagramComments(currentDiagramId);
    } catch (error) {
      console.error('Submit comment error:', error);
      toast({
        title: "Comment failed",
        description: error instanceof Error ? error.message : "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const loadDiagram = (diagram: SavedDiagram) => {
    const type = diagram.type || "flowchart";
    const code = diagram.code || "";

    setCurrentDiagramId(diagram.id);
    setSelectedDiagramType(type);
    setSelectedTemplate(type);
    setPrompt(diagram.prompt || "");
    updateDiagramCode(code);
    syncDiagramChange(code, type);
    setActiveTab("editor");
  };

  const loadVersion = (version: DiagramVersion) => {
    const type = version.content?.type || selectedDiagramType;
    const code = version.content?.code || "";

    setSelectedDiagramType(type);
    setSelectedTemplate(type);
    updateDiagramCode(code);
    syncDiagramChange(code, type);
    setActiveTab("editor");
  };

  const handleTemplateSelect = (template: string) => {
    const code = DIAGRAM_EXAMPLES[template as keyof typeof DIAGRAM_EXAMPLES] || DIAGRAM_EXAMPLES.flowchart;

    setSelectedTemplate(template);
    updateDiagramCode(code);
    syncDiagramChange(code, template);
  };

  const generateDiagramFromPrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your diagram",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate diagrams",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to get authentication token');
      }

      const response = await fetch('/api/generate/diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          diagramType: selectedDiagramType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.message || errorData.error || 'Failed to generate diagram';
        const hint = errorData.hint ? `\n\n💡 ${errorData.hint}` : '';
        throw new Error(errorMessage + hint);
      }

      const data = await response.json();
      
      // Validate response has required fields
      if (!data || !data.code) {
        throw new Error('Invalid response from API - missing diagram code');
      }
      
      if (data.code.trim().length === 0) {
        throw new Error('Generated diagram code is empty');
      }
      
      updateDiagramCode(data.code);
      syncDiagramChange(data.code, selectedDiagramType);
      setActiveTab("preview");
      
      toast({
        title: "🎯 AI Diagram Generated!",
        description: data.title || "Your diagram has been created successfully",
      });
    } catch (error) {
      console.error('Diagram generation error:', error);
      let errorMessage = "Failed to generate diagram. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('parse')) {
          errorMessage = "AI response format error. Try a simpler description like 'Create a flowchart for user registration'";
        } else if (error.message.includes('missing')) {
          errorMessage = "Invalid diagram generated. Try rephrasing your description.";
        } else if (error.message.includes('empty')) {
          errorMessage = "Generated diagram is empty. Try a more detailed description.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    setIsCopying(true);
    
    try {
      await navigator.clipboard.writeText(diagramCode);
      
      toast({
        title: "Copied to clipboard!",
        description: "Mermaid code has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsCopying(false), 2000);
    }
  };

  const exportDiagram = async (format: 'png' | 'svg') => {
    if (!diagramRef.current) return;
    
    setExportingFormat(format);
    
    try {
      const element = diagramRef.current.querySelector('#mermaid-diagram');
      if (!element) throw new Error('Diagram element not found');
      
      let dataUrl: string;
      
      // Enhanced export options to preserve colors and styling
      const exportOptions = {
        backgroundColor: '#ffffff',
        quality: 1.0,
        pixelRatio: 3, // Higher resolution for better quality
        cacheBust: true,
        width: element.scrollWidth + 60, // Add padding
        height: element.scrollHeight + 60, // Add padding
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          padding: '30px',
        },
        // Include all CSS styles
        includeQueryParams: true,
        skipAutoScale: false,
        // Ensure fonts and colors are embedded
        fontEmbedCSS: true,
        filter: (node: HTMLElement) => {
          // Ensure all text elements are captured with black color
          if (node.tagName === 'text' || node.tagName === 'tspan') {
            node.setAttribute('fill', '#000000');
            node.style.fill = '#000000';
          }
          return true;
        },
      };
      
      if (format === 'png') {
        dataUrl = await toPng(element as HTMLElement, exportOptions);
      } else {
        dataUrl = await toSvg(element as HTMLElement, {
          ...exportOptions,
          // For SVG, ensure all styles are inline
          skipFonts: false,
        });
      }
      
      // Create download link with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.download = `diagram-${timestamp}.${format}`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: `Diagram exported as ${format.toUpperCase()}!`,
        description: "Your diagram has been downloaded with full styling preserved",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: `Failed to export diagram as ${format.toUpperCase()}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setExportingFormat(null);
    }
  };

  const shareDiagram = async () => {
    try {
      const shareData = {
        title: 'DraftDeckAI Diagram',
        text: 'Check out this diagram I created with DraftDeckAI!',
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Diagram link has been copied to your clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to share diagram. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-center mb-4 sm:mb-6 px-2 overflow-x-auto">
          <TabsList role="tablist" className="glass-effect border border-yellow-400/20 p-1 h-auto flex-nowrap"  style={{ scrollbarWidth: 'none' }}>
            <TabsTrigger
              value="editor"
              className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Code Editor</span>
              <span className="sm:hidden">Editor</span>
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Workflow className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="my-diagrams"
              className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">My Diagrams</span>
              <span className="sm:hidden">Saved</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="data-[state=active]:bolt-gradient data-[state=active]:text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Comments
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="space-y-4 sm:space-y-6 px-2 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 lg:gap-8 auto-rows-max lg:auto-rows-auto">
            {/* Left Side - Code Editor */}
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full glass-effect mb-2 sm:mb-3">
                  <Code className="h-3 w-3 text-yellow-500" />
                  <span className="text-[10px] sm:text-xs font-medium">Mermaid Editor</span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2 bolt-gradient-text">
                  Write Your Diagram
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Use Mermaid syntax to create professional diagrams with live preview
                </p>
              </div>

              <div className="space-y-4">
                {/* AI Prompt Section */}
                <div className="glass-effect p-4 rounded-xl border-2 border-yellow-400/30 space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-yellow-500" />
                    AI Diagram Generator
                  </Label>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="diagramType" className="text-xs text-muted-foreground mb-1.5 block">
                        Diagram Type
                      </Label>
                      <Select value={selectedDiagramType} onValueChange={setSelectedDiagramType}>
                        <SelectTrigger id="diagramType" aria-label="Select diagram type" className="glass-effect border-yellow-400/20">
                          <SelectValue placeholder="Select diagram type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAGRAM_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <span className="flex items-center gap-2">
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="aiPrompt" className="text-xs text-muted-foreground mb-1.5 block flex items-center justify-between">
                        <span>Describe Your Diagram</span>
                        <span className="text-[10px] text-yellow-600 font-medium">Be specific & concise</span>
                      </Label>
                      <Textarea
                        id="aiPrompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        aria-label="Describe Your Diagram"
                        placeholder={
                          selectedDiagramType === 'flowchart' 
                            ? "E.g., User login process with email verification and password reset options"
                            : selectedDiagramType === 'sequence'
                            ? "E.g., Customer places order with payment processing and order confirmation"
                            : selectedDiagramType === 'classDiagram'
                            ? "E.g., E-commerce system with User, Product, Order, and Payment classes"
                            : selectedDiagramType === 'erDiagram'
                            ? "E.g., Database for blog with Users, Posts, Comments, and Tags entities"
                            : "Describe what your diagram should show..."
                        }
                        className="min-h-[100px] text-sm glass-effect border-yellow-400/20 focus:border-yellow-400/60 resize-none"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        💡 Tip: Be specific and concise. Example: "Show a flowchart with start, check password, success, and error states"
                      </p>
                      
                      {/* Quick Example Prompts */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                          onClick={() => {
                            if (selectedDiagramType === 'flowchart') {
                              setPrompt('User registration flow: enter email, verify, create password, confirm account');
                            }
                          }}
                          className="text-xs px-2 py-1 rounded border border-yellow-400/20 hover:bg-yellow-50 transition-colors text-left text-muted-foreground hover:text-foreground"
                        >
                          📝 User Registration
                        </button>
                        <button
                          onClick={() => {
                            if (selectedDiagramType === 'flowchart') {
                              setPrompt('E-commerce checkout: add to cart, enter shipping, payment, order confirmation');
                            }
                          }}
                          className="text-xs px-2 py-1 rounded border border-yellow-400/20 hover:bg-yellow-50 transition-colors text-left text-muted-foreground hover:text-foreground"
                        >
                          🛒 Checkout Flow
                        </button>
                        <button
                          onClick={() => {
                            if (selectedDiagramType === 'flowchart') {
                              setPrompt('API request handling: receive request, validate, process, return response');
                            }
                          }}
                          className="text-xs px-2 py-1 rounded border border-yellow-400/20 hover:bg-yellow-50 transition-colors text-left text-muted-foreground hover:text-foreground"
                        >
                          🔗 API Flow
                        </button>
                        <button
                          onClick={() => {
                            if (selectedDiagramType === 'flowchart') {
                              setPrompt('Project timeline: planning, design, development, testing, deployment');
                            }
                          }}
                          className="text-xs px-2 py-1 rounded border border-yellow-400/20 hover:bg-yellow-50 transition-colors text-left text-muted-foreground hover:text-foreground"
                        >
                          📅 Project Timeline
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={generateDiagramFromPrompt}
                      disabled={isGenerating || !prompt.trim()}
                      aria-label="Generate diagram from prompt"
                      className="w-full bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Quick Template Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    Quick Templates
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(DIAGRAM_EXAMPLES).map((template) => (
                      <Button
                        key={template}
                        variant={selectedTemplate === template ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTemplateSelect(template)}
                        className="text-xs capitalize"
                      >
                        {template === 'classDiagram' ? 'Class' : 
                         template === 'erDiagram' ? 'ER Diagram' :
                         template === 'gitGraph' ? 'Git Graph' :
                         template === 'stateDiagram' ? 'State' :
                         template}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Code Editor */}
                <div className="space-y-2">
                  <Label htmlFor="diagramCode" className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Mermaid Code
                  </Label>
                  <Textarea
                    id="diagramCode"
                    value={diagramCode}
                    onChange={(e) => {
                      updateDiagramCode(e.target.value, true);
                      syncDiagramChange(e.target.value, selectedDiagramType);
                    }}
                    aria-label="Edit Mermaid diagram code"
                    placeholder="Enter your Mermaid diagram code here..."
                    className="min-h-[300px] font-mono text-sm glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20 resize-none"
                  />
                  <Button
                    onClick={generateDiagramFromPrompt}
                    disabled={isGenerating || !prompt.trim()}
                    aria-label="Generate diagram from prompt"
                    className="w-full bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>

                {/* Mobile Action Toolbar - visible on mobile only, Export panel handles desktop */}
                <div className="lg:hidden glass-effect p-3 rounded-xl border border-yellow-400/20">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
                    <Download className="h-3.5 w-3.5 text-yellow-500" />
                    Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => exportDiagram('png')}
                      disabled={exportingFormat === 'png'}
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 min-h-[44px]"
                    >
                      {exportingFormat === 'png' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileImage className="mr-2 h-4 w-4" />
                      )}
                      Export PNG
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportDiagram('svg')}
                      disabled={exportingFormat === 'svg'}
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 min-h-[44px]"
                    >
                      {exportingFormat === 'svg' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Export SVG
                    </Button>
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      disabled={isCopying}
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 min-h-[44px]"
                    >
                      {isCopying ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      Copy Code
                    </Button>
                    <Button
                      variant="outline"
                      onClick={saveDiagram}
                      disabled={isSavingDiagram}
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 min-h-[44px]"
                    >
                      {isSavingDiagram ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={shareDiagram}
                      className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 min-h-[44px] col-span-2"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
                {/* Desktop Copy Code Button */}
                <div className="hidden lg:flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    disabled={isCopying}
                    className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 flex-1"
                  >
                    {isCopying ? (
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy Code
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side - Live Preview - Sticky on Desktop */}
            <div className="space-y-3 sm:space-y-4 lg:sticky lg:top-4 lg:h-fit">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full glass-effect mb-2 sm:mb-3">
                  <Eye className="h-3 w-3 text-blue-500" />
                  <span className="text-[10px] sm:text-xs font-medium">Live Preview</span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold bolt-gradient-text">Preview</h2>
              </div>

              <div ref={diagramRef} aria-live="polite" className="glass-effect border-2 border-yellow-400/30 rounded-xl overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white relative min-h-[300px] sm:min-h-[450px] lg:min-h-[550px] shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="absolute inset-0 shimmer opacity-20"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl -z-10"></div>
                <div className="relative z-10 h-full">
                  <DiagramPreview code={previewDiagramCode} />
                </div>
              </div>

              {/* Export Options - Hidden on Mobile, Shown on Desktop */}
              <div className="hidden lg:block glass-effect p-4 rounded-xl border border-yellow-400/20">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Download className="h-4 w-4 text-yellow-500" />
                  Export
                </h3>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => exportDiagram('png')}
                    disabled={exportingFormat === 'png'}
                    className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                  >
                    {exportingFormat === 'png' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileImage className="mr-2 h-4 w-4" />
                    )}
                    Export PNG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportDiagram('svg')}
                    disabled={exportingFormat === 'svg'}
                    className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                  >
                    {exportingFormat === 'svg' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export SVG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    disabled={isCopying}
                    className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                  >
                    {isCopying ? (
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={saveDiagram}
                    disabled={isSavingDiagram}
                    className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                  >
                    {isSavingDiagram ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={shareDiagram}
                    className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="pt-4">
          <div className="glass-effect p-6 rounded-xl border border-yellow-400/20 relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-20"></div>
            <div className="relative z-10">
              <DiagramTemplates
                onSelectTemplate={(template, code) => {
                  setSelectedTemplate(template);
                  updateDiagramCode(code);
                  syncDiagramChange(code, template);
                  setActiveTab("editor");
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-diagrams" className="pt-4 px-2 sm:px-0">
          <div className="glass-effect p-4 sm:p-6 rounded-xl border border-yellow-400/20 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold bolt-gradient-text">My Diagrams</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Load a saved diagram into the editor
                </p>
              </div>
              <Button
                variant="outline"
                onClick={loadSavedDiagrams}
                disabled={isLoadingDiagrams}
                className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
              >
                {isLoadingDiagrams ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>

            {isLoadingDiagrams ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading diagrams...
              </div>
            ) : savedDiagrams.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No saved diagrams yet
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedDiagrams.map((diagram) => (
                  <button
                    key={diagram.id}
                    onClick={() => loadDiagram(diagram)}
                    className="text-left glass-effect rounded-lg border border-yellow-400/20 p-4 hover:border-yellow-400/60 transition-colors"
                  >
                    <div className="font-medium text-sm line-clamp-2">
                      {diagram.title || "Untitled Diagram"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 capitalize">
                      {diagram.type || "diagram"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="pt-4 px-2 sm:px-0">
          <div className="glass-effect p-4 sm:p-6 rounded-xl border border-yellow-400/20 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold bolt-gradient-text">History</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Load a saved version of the current diagram
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => loadDiagramVersions()}
                disabled={isLoadingVersions || !currentDiagramId}
                className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
              >
                {isLoadingVersions ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <History className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>

            {!currentDiagramId ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                Save or load a diagram to view history
              </div>
            ) : isLoadingVersions ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading history...
              </div>
            ) : diagramVersions.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No versions yet
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {diagramVersions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => loadVersion(version)}
                    className="text-left glass-effect rounded-lg border border-yellow-400/20 p-4 hover:border-yellow-400/60 transition-colors"
                  >
                    <div className="font-medium text-sm">
                      Version {version.version_number}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {version.changes_summary}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(version.created_at).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="pt-4 px-2 sm:px-0">
          <div className="glass-effect p-4 sm:p-6 rounded-xl border border-yellow-400/20 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold bolt-gradient-text">Comments</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Discuss the current diagram
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => loadDiagramComments()}
                disabled={isLoadingComments || !currentDiagramId}
                className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
              >
                {isLoadingComments ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>

            {!currentDiagramId ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                Save a diagram first to add comments
              </div>
            ) : (
              <>
                {isLoadingComments ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading comments...
                  </div>
                ) : diagramComments.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    No comments yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diagramComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="glass-effect rounded-lg border border-yellow-400/20 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium text-sm">
                            {comment.user_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                          {comment.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 border-t border-yellow-400/20 pt-4">
                  <Label htmlFor="diagramComment" className="text-sm font-medium">
                    Add Comment
                  </Label>
                  <Textarea
                    id="diagramComment"
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    aria-label="Add diagram comment"
                    placeholder="Write a comment..."
                    className="min-h-[100px] text-sm glass-effect border-yellow-400/20 focus:border-yellow-400/60 resize-none"
                  />
                  <Button
                    onClick={submitComment}
                    disabled={!currentDiagramId || !commentBody.trim() || isSubmittingComment}
                    className="bolt-gradient text-white font-semibold"
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="mr-2 h-4 w-4" />
                    )}
                    Submit
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="pt-3 sm:pt-4 px-2 sm:px-0">
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center animate-fade-in">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 bolt-gradient-text">
                Full Screen Diagram View
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto px-4">
                Beautiful, responsive view optimized for both desktop and mobile devices
              </p>
            </div>

            <div ref={diagramRef} aria-live="polite" className="glass-effect border-2 border-yellow-400/30 rounded-xl overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white relative min-h-[400px] sm:min-h-[500px] md:min-h-[700px] shadow-2xl">
              <div className="absolute inset-0 shimmer opacity-20"></div>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
              <div className="relative z-10 h-full w-full flex flex-col">
                <DiagramPreview code={previewDiagramCode} fullScreen />
              </div>
            </div>

            {/* Full Export Panel - Responsive Grid */}
            <div className="glass-effect p-4 sm:p-6 rounded-xl border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-50/50 to-transparent">
              <h3 className="text-lg sm:text-xl font-medium mb-4 flex items-center gap-2">
                <Download className="h-5 w-5 text-yellow-500" />
                Export & Share Options
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
                <Button
                  onClick={() => exportDiagram('png')}
                  disabled={exportingFormat === 'png'}
                  className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300 text-sm sm:text-base py-2 sm:py-3"
                >
                  <FileImage className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">PNG Export</span>
                  <span className="sm:hidden">PNG</span>
                </Button>
                <Button
                  onClick={saveDiagram}
                  disabled={isSavingDiagram}
                  variant="outline"
                  className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 text-sm sm:text-base py-2 sm:py-3"
                >
                  {isSavingDiagram ? (
                    <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  Save
                </Button>
                <Button
                  onClick={() => exportDiagram('svg')}
                  disabled={exportingFormat === 'svg'}
                  variant="outline"
                  className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 text-sm sm:text-base py-2 sm:py-3"
                >
                  <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">SVG Export</span>
                  <span className="sm:hidden">SVG</span>
                </Button>
                <Button
                  onClick={copyToClipboard}
                  disabled={isCopying}
                  variant="outline"
                  className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 text-sm sm:text-base py-2 sm:py-3"
                >
                  {isCopying ? (
                    <Check className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  ) : (
                    <Copy className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="hidden sm:inline">Copy Code</span>
                  <span className="sm:hidden">Copy</span>
                </Button>
                <Button
                  onClick={shareDiagram}
                  variant="outline"
                  className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 text-sm sm:text-base py-2 sm:py-3"
                >
                  <Share2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Share</span>
                  <span className="sm:hidden">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
