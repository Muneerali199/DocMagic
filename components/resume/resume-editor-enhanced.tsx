'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Edit, Sparkles } from 'lucide-react';
import { ResumeAIAssistant } from './resume-ai-assistant';

type ResumeEditorEnhancedProps = {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
};

export function ResumeEditorEnhanced({
  value,
  onChange,
  onGenerate,
  isGenerating,
}: ResumeEditorEnhancedProps) {
  const [activeTab, setActiveTab] = useState('editor');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const handleApplySuggestion = (suggestion: string) => {
    // You can implement logic to parse the suggestion and apply it to the resume
    // For now, we'll just log it
    console.log('Applying suggestion:', suggestion);
    // In a real implementation, you might want to parse the markdown
    // and apply specific changes to the resume content
    onChange(suggestion);
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="h-full flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="editor">
              <Edit className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="ai-assistant">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="hidden md:flex border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {showAIAssistant ? 'Hide' : 'Show'} AI Assistant
            </Button>
            <Button
              onClick={onGenerate}
              disabled={isGenerating || !value.trim()}
              className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              {isGenerating ? 'Generating...' : 'Generate Resume'}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className={cn(
            'flex-1 overflow-auto transition-all duration-300',
            showAIAssistant ? 'w-1/2 pr-2' : 'w-full'
          )}>
            <TabsContent value="editor" className="h-full m-0">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste your resume content here or describe what you're looking for..."
                className="h-full min-h-[500px] w-full"
              />
            </TabsContent>
            <TabsContent value="ai-assistant" className="h-full m-0">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">AI Resume Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResumeAIAssistant 
                    resumeContent={value}
                    onApplySuggestion={handleApplySuggestion}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {showAIAssistant && (
            <div className="w-1/2 pl-4 border-l">
              <ResumeAIAssistant 
                resumeContent={value}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}

// Helper function to handle class names
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
