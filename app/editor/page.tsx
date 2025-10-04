'use client';

import React from 'react';
import { EnhancedEditorToolbar } from '@/components/editor/enhanced-toolbar';
import { VisualEditor } from '@/components/editor/visual-editor';
import { PropertiesPanel } from '@/components/editor/properties-panel';
import { LayersPanel } from '@/components/editor/layers-panel';
import { DesignElementsPanel } from '@/components/editor/design-elements-panel';
import { IconLibraryPanel } from '@/components/editor/icon-library-panel';
import { PagesPanel } from '@/components/editor/pages-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EditorPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Enhanced Toolbar - MS Word/Canva Style */}
      <EnhancedEditorToolbar />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Design Elements & Icons (Phase 3) */}
        <Tabs defaultValue="elements" className="w-80 border-r border-gray-300 bg-white flex flex-col shadow-lg">
          <TabsList className="w-full rounded-none justify-start bg-gradient-to-r from-blue-100 to-purple-100 border-b">
            <TabsTrigger value="elements" className="flex-1 font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Elements</TabsTrigger>
            <TabsTrigger value="icons" className="flex-1 font-semibold data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm">Icons</TabsTrigger>
          </TabsList>
          <TabsContent value="elements" className="flex-1 mt-0 overflow-hidden">
            <DesignElementsPanel />
          </TabsContent>
          <TabsContent value="icons" className="flex-1 mt-0 overflow-hidden">
            <IconLibraryPanel />
          </TabsContent>
        </Tabs>

        {/* Center Area - Canvas + Pages Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
            <VisualEditor />
          </div>
          
          {/* Bottom Right - Pages Panel */}
          <PagesPanel />
        </div>

        {/* Right Sidebar - Properties & Layers */}
        <div className="flex">
          <PropertiesPanel />
          <LayersPanel />
        </div>
      </div>
    </div>
  );
}
