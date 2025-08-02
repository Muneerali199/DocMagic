"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface DiagramPreviewProps {
  code: string;
  fullScreen?: boolean;
}

export function DiagramPreview({ code, fullScreen = false }: DiagramPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import mermaid to avoid SSR issues
    const loadMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          },
          sequence: {
            useMaxWidth: true,
            wrap: true
          },
          gantt: {
            useMaxWidth: true
          },
          journey: {
            useMaxWidth: true
          },
          gitGraph: {
            useMaxWidth: true
          },
          er: {
            useMaxWidth: true
          },
          class: {
            useMaxWidth: true
          }
        });
        
        setMermaidLoaded(true);
      } catch (err) {
        console.error('Failed to load Mermaid:', err);
        setError('Failed to load diagram renderer');
        setIsLoading(false);
      }
    };

    loadMermaid();
  }, []);

  useEffect(() => {
    if (!mermaidLoaded || !code.trim()) {
      setIsLoading(false);
      return;
    }

    const renderDiagram = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const mermaid = (await import('mermaid')).default;
        
        // Basic validation to check if code looks like Mermaid syntax
        const trimmedCode = code.trim();
        const validDiagramTypes = [
          'flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 
          'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie',
          'gitGraph', 'mindmap', 'timeline', 'quadrantChart'
        ];
        
        const hasValidDiagramType = validDiagramTypes.some(type => 
          trimmedCode.toLowerCase().startsWith(type.toLowerCase())
        );
        
        if (!hasValidDiagramType) {
          throw new Error('Please start your diagram with a valid Mermaid diagram type (e.g., flowchart, sequenceDiagram, classDiagram, etc.)');
        }
        
        if (containerRef.current) {
          // Clear previous content
          containerRef.current.innerHTML = '';
          
          // Create a unique ID for this diagram
          const diagramId = `mermaid-diagram-${Date.now()}`;
          
          // Validate and render the diagram
          const { svg } = await mermaid.render(diagramId, code);
          
          // Create container div with the expected ID
          const diagramContainer = document.createElement('div');
          diagramContainer.id = 'mermaid-diagram';
          diagramContainer.innerHTML = svg;
          diagramContainer.style.display = 'flex';
          diagramContainer.style.justifyContent = 'center';
          diagramContainer.style.alignItems = 'center';
          diagramContainer.style.minHeight = fullScreen ? '500px' : '300px';
          diagramContainer.style.padding = '20px';
          
          containerRef.current.appendChild(diagramContainer);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        let errorMessage = 'Invalid diagram syntax. Please check your Mermaid code.';
        
        if (err instanceof Error) {
          if (err.message.includes('No diagram type detected')) {
            errorMessage = 'No valid diagram type detected. Please start with a diagram type like "flowchart TD", "sequenceDiagram", "classDiagram", etc.';
          } else if (err.message.includes('Please start your diagram')) {
            errorMessage = err.message;
          } else if (err.message.includes('Parse error')) {
            errorMessage = 'Syntax error in your diagram code. Please check for missing brackets, quotes, or invalid characters.';
          }
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the rendering to avoid too many re-renders
    const timeoutId = setTimeout(renderDiagram, 500);
    return () => clearTimeout(timeoutId);
  }, [code, mermaidLoaded, fullScreen]);

  if (!code.trim()) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[300px]">
        <CardContent className="text-center">
          <div className="text-muted-foreground">
            <p className="font-medium">No diagram code provided</p>
            <p className="text-sm mt-1">Enter Mermaid syntax to see your diagram</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`w-full ${fullScreen ? 'min-h-[600px]' : 'min-h-[300px]'} relative`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-muted-foreground">Rendering diagram...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className={`w-full ${fullScreen ? 'min-h-[600px]' : 'min-h-[300px]'} overflow-auto`}
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}
      />
    </div>
  );
}