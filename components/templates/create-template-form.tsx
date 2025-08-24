'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { TemplateForm } from './template-form';
import { useState } from 'react';
import { TemplateFormValues } from '@/types/template';
import { useAutosave } from '@/hooks/useAutosave';

export function CreateTemplateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<TemplateFormValues>({
    title: "",
    description: "",
    type: "resume", 
    isPublic: false 
  });

  // ✅ Use autosave
  useAutosave<TemplateFormValues>(
    "create-template-form", 
    formValues, 
    (saved) => setFormValues(saved)
  );
  
  const handleSubmit = async (values: TemplateFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const data = await response.json();
      
      toast({
        title: 'Success',
        description: 'Template created successfully!',
      });
      localStorage.removeItem("create-template-form");
      router.push('/templates');
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Create New Template</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to create a new template
        </p>
      </div>

      <TemplateForm
        values={formValues}
        onChange={setFormValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText={isSubmitting ? 'Creating...' : 'Create Template'}
        submitButtonVariant="default"
      />
    </div>
  );
}
