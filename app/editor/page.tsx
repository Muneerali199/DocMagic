'use client';

import React, { useState } from 'react';
import { EnhancedEditorToolbar } from '@/components/editor/enhanced-toolbar';
import { VisualEditor } from '@/components/editor/visual-editor';
import { PropertiesPanel } from '@/components/editor/properties-panel';
import { LayersPanel } from '@/components/editor/layers-panel';
import { DesignElementsPanel } from '@/components/editor/design-elements-panel';
import { IconLibraryPanel } from '@/components/editor/icon-library-panel';
import { ImageLibraryPanel } from '@/components/editor/image-library-panel';
import { AIAssistantPanel } from '@/components/editor/ai-assistant-panel';
import { PagesPanel } from '@/components/editor/pages-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Palette, ImageIcon, Shapes, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditorPage() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Enhanced Toolbar - MS Word/Canva Style */}
      <EnhancedEditorToolbar />

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
                AI Assistant
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
              <AIAssistantPanel />
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

        {/* Right Sidebar - Properties & Layers */}
        {rightSidebarOpen && (
          <div className="flex border-l border-gray-700/50 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl">
            <PropertiesPanel />
            <LayersPanel />
          </div>
        )}
      </div>
    </div>
  );
}
