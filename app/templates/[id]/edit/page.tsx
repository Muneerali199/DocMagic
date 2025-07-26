'use client';

import { notFound } from "next/navigation";
import { TemplateForm } from "@/components/templates/template-form";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Template, TemplateFormValues } from "@/types/template";

interface EditTemplatePageProps {
  params: {
    id: string;
  };
}

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSubmit = async (values: TemplateFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/templates/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      toast({
        title: 'Success',
        description: 'Template updated successfully!',
      });

      router.push('/templates');
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch template');
        }
        const data = await response.json();
        setTemplate(data);
      } catch (error) {
        console.error('Error fetching template:', error);
        toast({
          title: 'Error',
          description: 'Failed to load template. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [params.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!template) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Template</h1>
          <p className="text-muted-foreground">
            Update your document template.
          </p>
        </div>
        
        <div className="max-w-3xl">
          <TemplateForm 
            defaultValues={{
              title: template.title,
              description: template.description,
              type: template.type,
              isPublic: template.isPublic || (template as any).is_public || false, // Handle both isPublic and is_public
              content: template.content,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Save Changes"
          />
        </div>
      </div>
    </div>
  );
}

