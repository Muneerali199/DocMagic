'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileText, Download, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  title: string;
  description: string;
  type: string;
  content: any;
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function UseTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/templates/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Template not found');
            return;
          }
          throw new Error('Failed to fetch template');
        }
        
        const data = await response.json();
        setTemplate(data);
      } catch (error) {
        console.error('Error fetching template:', error);
        setError('Failed to load template');
        toast.error('Failed to load template');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchTemplate();
    }
  }, [params.id]);

  const handleUseTemplate = () => {
    if (!template) return;
    
    // Navigate to the appropriate editor based on template type
    switch (template.type) {
      case 'resume':
        router.push(`/resume?templateId=${template.id}`);
        break;
      case 'cv':
        router.push(`/cv?templateId=${template.id}`);
        break;
      case 'letter':
        router.push(`/letter?templateId=${template.id}`);
        break;
      case 'presentation':
        router.push(`/presentation?templateId=${template.id}`);
        break;
      default:
        // For other types, you might want to create a generic document editor
        toast.error('Template type not supported yet');
        break;
    }
  };

  const handleEditTemplate = () => {
    if (!template) return;
    router.push(`/templates/${template.id}/edit`);
  };

  const handleDownloadTemplate = () => {
    if (!template) return;
    
    // Create a downloadable JSON file of the template
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${template.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Template downloaded successfully');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Template Not Found</h2>
            <p className="text-muted-foreground text-center">
              {error || 'The template you are looking for does not exist or you do not have permission to access it.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === template.user_id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Templates
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{template.title}</h1>
        <p className="text-muted-foreground text-lg">
          {template.description || 'No description available'}
        </p>
        <div className="flex items-center gap-2 mt-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {template.type}
          </span>
          {template.is_public && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Public
            </span>
          )}
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Template Preview</CardTitle>
          <CardDescription>
            This template contains pre-configured content and formatting that you can customize.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-6 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Template content preview is not available in this view. 
              Click "Use Template" to start creating your document with this template.
            </p>
            {template.content && (
              <div className="text-xs text-muted-foreground">
                <strong>Template includes:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Pre-formatted layout and styling</li>
                  <li>Placeholder content and sections</li>
                  <li>Professional design elements</li>
                  <li>Customizable fields and sections</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleUseTemplate} size="lg" className="flex-1">
          <FileText className="mr-2 h-4 w-4" />
          Use This Template
        </Button>
        
        <Button variant="outline" onClick={handleDownloadTemplate} size="lg">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        
        {isOwner && (
          <Button variant="outline" onClick={handleEditTemplate} size="lg">
            <Edit className="mr-2 h-4 w-4" />
            Edit Template
          </Button>
        )}
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>
          <strong>Created:</strong> {new Date(template.created_at).toLocaleDateString()}
        </p>
        {template.updated_at !== template.created_at && (
          <p>
            <strong>Last updated:</strong> {new Date(template.updated_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
