'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { EnhancedEditorToolbar } from '@/components/editor/enhanced-toolbar';
import { VisualEditor } from '@/components/editor/visual-editor';
import { PropertiesPanel } from '@/components/editor/properties-panel';
import { LayersPanel } from '@/components/editor/layers-panel';
import { DesignElementsPanel } from '@/components/editor/design-elements-panel';
import { IconLibraryPanel } from '@/components/editor/icon-library-panel';
import { ImageLibraryPanel } from '@/components/editor/image-library-panel';
import { AIEnhancementPanel } from '@/components/editor/ai-enhancement-panel';
import { CollaborationPanel } from '@/components/templates/collaboration-panel';
import { PagesPanel } from '@/components/editor/pages-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Palette, 
  ImageIcon, 
  Shapes, 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  Users,
  Save,
  Download,
  Share2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { collaborationService } from '@/lib/collaboration-service';
import { useEditorStore } from '@/lib/editor-store';

export default function UnifiedEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { canvas } = useEditorStore();
  
  const templateType = params?.type as string;
  const templateId = params?.id as string;
  
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [documentData, setDocumentData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        
        // Fetch template data
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) throw new Error('Failed to load template');
        
        const template = await response.json();
        setDocumentData(template);
        
        // Initialize collaboration session
        if (user) {
          const session = await collaborationService.createSession(
            templateId,
            templateType as any,
            user.id
          );
          
          if (session) {
            setSessionId(session.id);
            await collaborationService.joinSession(
              session.id,
              user.id,
              user.user_metadata?.full_name || user.email || 'Anonymous',
              user.email || '',
              'editor'
            );
          }
        }
        
        toast.success('Template loaded successfully');
      } catch (error) {
        console.error('Error loading template:', error);
        toast.error('Failed to load template');
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId && user) {
      loadTemplate();
    }
  }, [templateId, templateType, user]);

  // Auto-save functionality
  const handleSave = useCallback(async () => {
    if (!canvas || !documentData || isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Get canvas data
      const canvasData = canvas.toJSON();
      
      // Save to database
      const response = await fetch(`/api/documents/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: canvasData,
          type: templateType,
          updated_at: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      // Broadcast change to collaborators
      if (sessionId && user) {
        await collaborationService.broadcastChange({
          session_id: sessionId,
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email || 'Anonymous',
          change_type: 'update',
          path: 'canvas',
          new_value: canvasData
        });
      }
      
      toast.success('Document saved');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }, [canvas, documentData, templateId, templateType, sessionId, user, isSaving]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [handleSave]);

  // Handle export
  const handleExport = async () => {
    if (!canvas) return;
    
    try {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });
      
      const link = document.createElement('a');
      link.download = `${documentData?.title || 'document'}.png`;
      link.href = dataURL;
      link.click();
      
      toast.success('Document exported');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export document');
    }
  };

  // Handle share
  const handleShare = () => {
    setShowCollaboration(!showCollaboration);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionId && user) {
        collaborationService.leaveSession(sessionId, user.id);
      }
    };
  }, [sessionId, user]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-6">Please sign in to use the editor</p>
          <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Enhanced Toolbar with Save/Export/Share */}
      <div className="flex-none">
        <EnhancedEditorToolbar />
        <div className="bg-gray-800/90 border-b border-gray-700/50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {documentData?.title || 'Untitled Document'}
            </span>
            {isSaving && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="text-white hover:bg-gray-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="text-white hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-white hover:bg-gray-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCollaboration(!showCollaboration)}
              className="text-white hover:bg-gray-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Collaborate
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="absolute left-2 top-4 z-50 bg-gray-800/90 hover:bg-gray-700 text-white border border-gray-600 shadow-lg"
        >
          {leftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </Button>

        {/* Left Sidebar - AI Assistant & Design Elements */}
        {leftSidebarOpen && (
          <Tabs defaultValue="ai" className="w-80 border-r border-gray-700/50 bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col shadow-2xl backdrop-blur-sm">
            <TabsList className="w-full rounded-none justify-start bg-gray-800/80 border-b border-gray-700/50 p-1.5 h-auto backdrop-blur-md">
              <TabsTrigger 
                value="ai" 
                className="flex-1 text-xs font-bold text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all py-3 px-2 rounded-md"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                AI Enhance
              </TabsTrigger>
              <TabsTrigger 
                value="elements" 
                className="flex-1 text-xs font-bold text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all py-3 px-2 rounded-md"
              >
                <Palette className="w-4 h-4 mr-1.5" />
                Design
              </TabsTrigger>
              <TabsTrigger 
                value="icons" 
                className="flex-1 text-xs font-bold text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all py-3 px-2 rounded-md"
              >
                <Shapes className="w-4 h-4 mr-1.5" />
                Icons
              </TabsTrigger>
              <TabsTrigger 
                value="images" 
                className="flex-1 text-xs font-bold text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all py-3 px-2 rounded-md"
              >
                <ImageIcon className="w-4 h-4 mr-1.5" />
                Images
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ai" className="flex-1 mt-0 overflow-hidden">
              <AIEnhancementPanel documentId={templateId} documentType={templateType as any} />
            </TabsContent>
            <TabsContent value="elements" className="flex-1 mt-0 overflow-hidden">
              <DesignElementsPanel />
            </TabsContent>
            <TabsContent value="icons" className="flex-1 mt-0 overflow-hidden">
              <IconLibraryPanel />
            </TabsContent>
            <TabsContent value="images" className="flex-1 mt-0 overflow-hidden">
              <ImageLibraryPanel />
            </TabsContent>
          </Tabs>
        )}

        {/* Center Area - Canvas + Pages Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-800 via-gray-750 to-gray-800">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <VisualEditor />
          </div>
          
          {/* Bottom - Pages Panel */}
          <PagesPanel />
        </div>

        {/* Right Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className="absolute right-2 top-4 z-50 bg-gray-800/90 hover:bg-gray-700 text-white border border-gray-600 shadow-lg"
        >
          {rightSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </Button>

        {/* Right Sidebar - Properties, Layers & Collaboration */}
        {rightSidebarOpen && (
          <div className="flex border-l border-gray-700/50 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl">
            {showCollaboration ? (
              <div className="w-80 p-4 overflow-y-auto">
                {user && (
                  <CollaborationPanel
                    documentId={templateId}
                    documentType={templateType as any}
                    userId={user.id}
                    userName={user.user_metadata?.full_name || user.email || 'Anonymous'}
                    userEmail={user.email || ''}
                    isOwner={true}
                  />
                )}
              </div>
            ) : (
              <>
                <PropertiesPanel />
                <LayersPanel />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
