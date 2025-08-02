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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, Wand2, FileText, Presentation, Mail, User } from "lucide-react";
import { TemplateFormValues } from "@/types/template";
import { useState } from 'react';

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
  aiPrompt: z.string().optional(),
  useAI: z.boolean().default(false),
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
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "resume",
      isPublic: false,
      useAI: false,
      aiPrompt: "",
      ...defaultValues,
    },
  });

  const documentType = form.watch("type");
  const useAI = form.watch("useAI");

  const generateAITemplate = async () => {
    const aiPrompt = form.getValues("aiPrompt");
    const type = form.getValues("type");

    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide a description for AI generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          type: type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate template');
      }

      const data = await response.json();

      // Update form with AI-generated content
      if (data.title) {
        form.setValue("title", data.title);
      }
      if (data.description) {
        form.setValue("description", data.description);
      }
      if (data.content) {
        form.setValue("content", data.content);
      }

      toast({
        title: "Success",
        description: "AI template generated successfully!",
      });
    } catch (error) {
      console.error('Error generating AI template:', error);
      toast({
        title: "Error",
        description: "Failed to generate template with AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

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

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'resume':
      case 'cv':
        return <User className="h-4 w-4" />;
      case 'presentation':
        return <Presentation className="h-4 w-4" />;
      case 'letter':
        return <Mail className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 sm:space-y-8">
          {/* AI Generation Section - More Prominent */}
          <Card className="border-2 border-yellow-300 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-yellow-800/20 shadow-lg">
            <CardHeader className="pb-4 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 bg-yellow-500 dark:bg-yellow-600 rounded-full flex-shrink-0">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl text-foreground">
                      ✨ Create with AI Magic
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1 text-sm">
                      Let our AI create a professional template for you in seconds
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600 self-start sm:self-center flex-shrink-0">
                  <Wand2 className="h-3 w-3 mr-1" />
                  <span className="text-xs sm:text-sm">AI Powered</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* AI Toggle with better styling */}
              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white/70 dark:bg-gray-800/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <FormField
                  control={form.control}
                  name="useAI"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start sm:items-center space-x-3 space-y-0 flex-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 dark:data-[state=checked]:bg-yellow-600 dark:data-[state=checked]:border-yellow-600 mt-0.5 sm:mt-0"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none flex-1 min-w-0">
                        <FormLabel className="text-sm sm:text-base font-semibold text-foreground cursor-pointer">
                          🚀 Use AI to generate my template
                        </FormLabel>
                        <FormDescription className="text-muted-foreground text-xs sm:text-sm">
                          Save time and get professional results instantly
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* AI Prompt Section */}
              {useAI && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <FormField
                    control={form.control}
                    name="aiPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-semibold text-foreground">
                          📝 Describe your ideal template
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Example: Create a modern resume template for a software engineer with clean design, sections for technical skills, work experience, projects, and education. Use a professional blue color scheme."
                            className="resize-none min-h-[100px] sm:min-h-[120px] border-yellow-200 dark:border-yellow-700 focus:border-yellow-400 dark:focus:border-yellow-500 focus:ring-yellow-400 dark:focus:ring-yellow-500 text-sm sm:text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground text-xs sm:text-sm">
                          💡 Be specific about style, sections, colors, and purpose for best results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    onClick={generateAITemplate}
                    disabled={isGeneratingAI || !form.getValues("aiPrompt")?.trim()}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600 hover:from-yellow-600 hover:to-orange-600 dark:hover:from-yellow-700 dark:hover:to-orange-700 text-white font-semibold py-3 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span className="hidden sm:inline">✨ Creating your template...</span>
                        <span className="sm:hidden">✨ Creating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">🎯 Generate Template with AI</span>
                        <span className="sm:hidden">🎯 Generate with AI</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Quick AI Examples */}
              {!useAI && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white/50 dark:bg-gray-800/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="text-sm font-medium text-foreground mb-1">💼 Resume Example</div>
                    <div className="text-xs text-muted-foreground">"Modern tech resume with skills matrix"</div>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-gray-800/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="text-sm font-medium text-foreground mb-1">📊 Presentation Example</div>
                    <div className="text-xs text-muted-foreground">"Business pitch deck with charts"</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Manual Template Creation */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Template Details
              </CardTitle>
              <CardDescription className="text-sm">
                {useAI ? "✅ Review and modify the AI-generated details below:" : "📝 Fill in the template details manually:"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base font-medium">📄 Template Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Modern Software Engineer Resume"
                          className="h-10 sm:h-11 text-sm sm:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        A clear, descriptive name for your template
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
                      <FormLabel className="text-sm sm:text-base font-medium">📋 Document Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                            <SelectValue placeholder="Choose document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="resume">
                            <div className="flex items-center gap-2 sm:gap-3 py-1">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                              <div>
                                <div className="font-medium text-sm">Resume</div>
                                <div className="text-xs text-gray-500">Professional resume template</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="cv">
                            <div className="flex items-center gap-2 sm:gap-3 py-1">
                              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              <div>
                                <div className="font-medium text-sm">CV</div>
                                <div className="text-xs text-gray-500">Academic curriculum vitae</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="letter">
                            <div className="flex items-center gap-2 sm:gap-3 py-1">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                              <div>
                                <div className="font-medium text-sm">Cover Letter</div>
                                <div className="text-xs text-gray-500">Professional cover letter</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="presentation">
                            <div className="flex items-center gap-2 sm:gap-3 py-1">
                              <Presentation className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                              <div>
                                <div className="font-medium text-sm">Presentation</div>
                                <div className="text-xs text-gray-500">Slide deck template</div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs sm:text-sm">
                        Select the type of document this template will create
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
                    <FormLabel className="text-sm sm:text-base font-medium">📝 Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A clean, modern resume template perfect for tech professionals with emphasis on skills and achievements..."
                        className="resize-none min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      Help others understand what this template is best used for
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-3 sm:p-4 bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5 sm:mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none flex-1 min-w-0">
                        <FormLabel className="text-sm sm:text-base font-medium cursor-pointer">
                          🌐 Make this template public
                        </FormLabel>
                        <FormDescription className="text-xs sm:text-sm">
                          Public templates can be discovered and used by other users. You'll still own and control the template.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Template content preview */}
          <Card className="border-2 border-dashed border-border bg-muted/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                {getDocumentIcon(documentType)}
                🎨 Template Preview
              </CardTitle>
              <CardDescription className="text-sm">
                {useAI && form.getValues("content")
                  ? "✨ AI-generated template content will appear here"
                  : `📋 Your ${documentType} template content will be created based on your selections`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-xs sm:text-sm text-muted-foreground p-4 sm:p-6 bg-card rounded-lg border border-border min-h-[100px] sm:min-h-[120px] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-3xl sm:text-4xl">
                    {documentType === 'resume' && '📄'}
                    {documentType === 'cv' && '📋'}
                    {documentType === 'letter' && '✉️'}
                    {documentType === 'presentation' && '📊'}
                  </div>
                  <div className="font-medium text-foreground text-sm sm:text-base">
                    {documentType === 'resume' && 'Resume template editor will be displayed here'}
                    {documentType === 'cv' && 'CV template editor will be displayed here'}
                    {documentType === 'letter' && 'Cover letter template editor will be displayed here'}
                    {documentType === 'presentation' && 'Presentation template editor will be displayed here'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Template structure and styling options will appear after creation
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 sm:pt-6 border-t border-border">
            <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
              💡 Tip: You can always edit your template after creating it
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 order-1 sm:order-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting || isGeneratingAI}
                className="w-full sm:w-auto min-w-[100px] text-sm sm:text-base"
              >
                <span className="hidden sm:inline">← Cancel</span>
                <span className="sm:hidden">Cancel</span>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isGeneratingAI}
                variant={submitButtonVariant}
                className="w-full sm:w-auto min-w-[160px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Creating...</span>
                    <span className="sm:hidden">Saving...</span>
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{submitButtonText} ✨</span>
                    <span className="sm:hidden">{submitButtonText.split(' ')[0]} ✨</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
