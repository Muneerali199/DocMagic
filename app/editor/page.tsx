'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { collaborationService } from '@/lib/collaboration-service';
import { useEditorStore } from '@/lib/editor-store';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { canvas } = useEditorStore();
  
  const templateId = searchParams?.get('template');
  const documentId = searchParams?.get('id');
  
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documentData, setDocumentData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');

  // Load template or document
  useEffect(() => {
    const loadContent = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        if (documentId) {
          // Load existing document
          const response = await fetch(`/api/documents/${documentId}`);
          if (response.ok) {
            const doc = await response.json();
            setDocumentData(doc);
            setDocumentTitle(doc.title || 'Untitled Document');
            toast.success('Document loaded');
          } else {
            toast.error('Document not found');
          }
        } else if (templateId) {
          // Import template data locally since templates are not in database yet
          const { RESUME_TEMPLATES } = await import('@/lib/resume-template-data');
          const template = RESUME_TEMPLATES.find(t => t.id === templateId);
          
          if (!template) {
            toast.error('Template not found');
            return;
          }
          
          // Create a mock document for now (since database might not be ready)
          const mockDocument = {
            id: `temp-${Date.now()}`,
            user_id: user.id,
            title: `${template.title} - Copy`,
            type: template.type,
            content: {
              // Initialize with template data
              template_id: template.id,
              template_name: template.title,
              color_scheme: template.colorScheme,
              // Canvas will be initialized by VisualEditor
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setDocumentData(mockDocument);
          setDocumentTitle(mockDocument.title);
          toast.success(`Template "${template.title}" loaded! Start editing.`);
        }
      } catch (error) {
        console.error('Error loading content:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [templateId, documentId, user, router]);

  // Auto-save functionality
  const handleSave = useCallback(async () => {
    if (!canvas || !documentData || isSaving || !user) return;
    
    // Skip save for temporary documents (not yet in database)
    if (documentData.id.startsWith('temp-')) {
      console.log('Skipping save for temporary document');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const canvasData = canvas.toJSON();
      
      const response = await fetch(`/api/documents/${documentData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: canvasData,
          title: documentTitle,
          updated_at: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        console.error('Save failed:', response.status);
        // Don't show error for temporary documents
        return;
      }
      
      // Broadcast change to collaborators
      if (sessionId) {
        await collaborationService.broadcastChange({
          session_id: sessionId,
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email || 'Anonymous',
          change_type: 'update',
          path: 'canvas',
          new_value: canvasData
        });
      }
      
      toast.success('Saved successfully', { duration: 2000 });
    } catch (error) {
      console.error('Error saving:', error);
      // Silent fail for now since database might not be ready
    } finally {
      setIsSaving(false);
    }
  }, [canvas, documentData, documentTitle, sessionId, user, isSaving]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!documentData) return;
    
    const interval = setInterval(() => {
      handleSave();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [handleSave, documentData]);

  // Handle export
  const handleExport = async () => {
    if (!canvas) {
      toast.error('Nothing to export');
      return;
    }
    
    try {
      toast.info('Exporting document...', { duration: 1000 });
      
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });
      
      const link = document.createElement('a');
      const fileName = documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${fileName}.png`;
      link.href = dataURL;
      link.click();
      
      toast.success('Document exported successfully!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export document');
    }
  };

  // Handle share
  const handleShare = () => {
    setShowCollaboration(!showCollaboration);
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to use the editor</p>
          <Button 
            onClick={() => router.push('/auth/signin')}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-medium">Loading your workspace...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Enhanced Toolbar */}
      <div className="flex-none bg-white border-b border-gray-200 shadow-sm">
        <EnhancedEditorToolbar />
        
        {/* Action Bar */}
        <div className="px-6 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {documentTitle}
              </span>
            </div>
            {isSaving && (
              <span className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
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
              disabled={isSaving || !documentData}
              className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCollaboration(!showCollaboration)}
              className="text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-all"
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

        {/* Left Sidebar - AI Enhancement & Design Elements */}
        {leftSidebarOpen && (
          <Tabs defaultValue="ai" className="w-80 border-r border-gray-200 bg-white flex flex-col shadow-lg">
            <TabsList className="w-full rounded-none justify-start bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-2 h-auto">
              <TabsTrigger 
                value="ai" 
                className="flex-1 text-xs font-semibold text-gray-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-2.5 px-2 rounded-lg"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                AI Enhance
              </TabsTrigger>
              <TabsTrigger 
                value="elements" 
                className="flex-1 text-xs font-semibold text-gray-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-2.5 px-2 rounded-lg"
              >
                <Palette className="w-4 h-4 mr-1.5" />
                Design
              </TabsTrigger>
              <TabsTrigger 
                value="icons" 
                className="flex-1 text-xs font-semibold text-gray-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-2.5 px-2 rounded-lg"
              >
                <Shapes className="w-4 h-4 mr-1.5" />
                Icons
              </TabsTrigger>
              <TabsTrigger 
                value="images" 
                className="flex-1 text-xs font-semibold text-gray-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-2.5 px-2 rounded-lg"
              >
                <ImageIcon className="w-4 h-4 mr-1.5" />
                Images
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ai" className="flex-1 mt-0 overflow-hidden">
              <AIEnhancementPanel 
                documentId={documentData?.id || ''} 
                documentType={documentData?.type || 'resume'} 
              />
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
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
              <VisualEditor />
            </div>
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
          <div className="flex border-l border-gray-200 bg-white shadow-lg">
            {showCollaboration && documentData ? (
              <div className="w-80 p-4 overflow-y-auto">
                <CollaborationPanel
                  documentId={documentData.id}
                  documentType={documentData.type || 'resume'}
                  userId={user.id}
                  userName={user.user_metadata?.full_name || user.email || 'Anonymous'}
                  userEmail={user.email || ''}
                  isOwner={documentData.user_id === user.id}
                />
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

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
