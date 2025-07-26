import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { TemplateFormValues } from "@/types/template";

import { z } from 'zod';

// Define the form schema
export const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  type: z.enum(["resume", "presentation", "letter", "cv"], {
    required_error: "Please select a document type.",
  }),
  content: z.record(z.any()).optional(),
  isPublic: z.boolean().default(false),
});

interface TemplateFormProps {
  defaultValues?: Partial<TemplateFormValues>;
  onSubmit: (values: TemplateFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText?: string;
  submitButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showPublicToggle?: boolean;
}

export function TemplateForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitButtonText = "Create Template",
  submitButtonVariant = "default",
  showPublicToggle = true,
}: TemplateFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "resume",
      isPublic: false,
      ...defaultValues,
    },
  });

  const documentType = form.watch("type");

  const handleSubmit = async (values: TemplateFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the template. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Template" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive name for your template.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a document type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="resume">Resume</SelectItem>
                    <SelectItem value="cv">CV</SelectItem>
                    <SelectItem value="letter">Cover Letter</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of document this template is for.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of what this template is for..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a short description to help identify this template.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {showPublicToggle && (
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Make this template public</FormLabel>
                  <FormDescription>
                    Public templates can be viewed by anyone with the link. Only you can edit or delete them.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Template content editor would go here */}
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-medium">Template Content</h3>
          <p className="text-sm text-muted-foreground">
            {documentType === 'resume' && 'Resume template editor will be displayed here.'}
            {documentType === 'cv' && 'CV template editor will be displayed here.'}
            {documentType === 'letter' && 'Cover letter template editor will be displayed here.'}
            {documentType === 'presentation' && 'Presentation template editor will be displayed here.'}
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} variant={submitButtonVariant}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
