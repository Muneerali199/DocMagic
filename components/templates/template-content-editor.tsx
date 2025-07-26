'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Template } from '@/types/templates';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDefaultTemplateContent, validateTemplateContent, TEMPLATE_TYPES } from '@/lib/templates';
import { TemplateContent, TemplateSection, TemplateItem } from '@/types/templates';

// Create a type from the TEMPLATE_TYPES array
type TemplateType = typeof TEMPLATE_TYPES[number];

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(TEMPLATE_TYPES as unknown as [string, ...string[]]),
  isPublic: z.boolean().default(false),
  content: z.record(z.any()),
});

type TemplateFormValues = z.infer<typeof formSchema>;

interface TemplateContentEditorProps {
  template?: Partial<Template>;
  onSubmit: (values: TemplateFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TemplateContentEditor({
  template,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TemplateContentEditorProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [contentError, setContentError] = useState<string | null>(null);
  
  const defaultValues: Partial<TemplateFormValues> = {
    title: template?.title || 'Untitled Template',
    description: template?.description || '',
    type: (template?.type as TemplateType) || 'resume',
    isPublic: template?.is_public || false,
    content: template?.content || getDefaultTemplateContent(template?.type as TemplateType || 'resume'),
  };
  
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const watchType = form.watch('type');
  const watchContent = form.watch('content');
  
  // Reset content when type changes
  useEffect(() => {
    if (template?.id) return; // Don't reset content for existing templates
    
    form.setValue('content', getDefaultTemplateContent(watchType as TemplateType));
  }, [watchType, form, template?.id]);
  
  // Validate content when it changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'content' || !name) {
        const isValid = validateTemplateContent(
          form.getValues('type') as TemplateType,
          form.getValues('content')
        );
        setContentError(isValid ? null : 'Content is not valid for the selected template type');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  const handleSubmit = (values: TemplateFormValues) => {
    const isValid = validateTemplateContent(values.type as TemplateType, values.content);
    
    if (!isValid) {
      setContentError('Content is not valid for the selected template type');
      return;
    }
    
    onSubmit(values);
  };
  
  const renderContentEditor = () => {
    const type = form.getValues('type') as TemplateType;
    
    switch (type) {
      case 'resume':
      case 'cv':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Personal Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="content.personalInfo.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content.personalInfo.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Summary</Label>
              <FormField
                control={form.control}
                name="content.personalInfo.summary"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Experienced professional with a passion for..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Work Experience</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const experiences = form.getValues('content.sections') || [];
                    const newExperience = {
                      id: `exp-${Date.now()}`,
                      title: 'Job Title',
                      company: 'Company Name',
                      startDate: '',
                      endDate: '',
                      description: '',
                    };
                    form.setValue('content.sections', [...experiences, newExperience]);
                  }}
                >
                  Add Experience
                </Button>
              </div>
              
              {/* Dynamic experience fields */}
              {form.getValues('content.sections')?.map((exp: any, index: number) => (
                <Card key={exp.id} className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Experience #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const experiences = form.getValues('content.sections') || [];
                        form.setValue(
                          'content.sections',
                          experiences.filter((e: any) => e.id !== exp.id)
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`content.sections.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Senior Developer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`content.sections.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Tech Corp Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`content.sections.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="month" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`content.sections.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (leave empty for current)</FormLabel>
                          <FormControl>
                            <Input type="month" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`content.sections.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Key responsibilities and achievements..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 'presentation':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="content.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presentation Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Presentation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Label>Slides</Label>
              <div className="space-y-4">
                {form.getValues('content.slides')?.map((slide: any, index: number) => (
                  <Card key={slide.id} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Slide {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const slides = form.getValues('content.slides') || [];
                          form.setValue(
                            'content.slides',
                            slides.filter((s: any) => s.id !== slide.id)
                          );
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`content.slides.${index}.content.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Slide Title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`content.slides.${index}.content.subtitle`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input placeholder="Slide Subtitle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`content.slides.${index}.content.body`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Slide content..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const slides = form.getValues('content.slides') || [];
                    const newSlide = {
                      id: `slide-${Date.now()}`,
                      type: 'content',
                      content: {
                        title: '',
                        subtitle: '',
                        body: '',
                      },
                    };
                    form.setValue('content.slides', [...slides, newSlide]);
                  }}
                >
                  Add Slide
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'letter':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="content.recipient.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Hiring Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content.recipient.position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Hiring Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content.recipient.company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content.recipient.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Company St, City, State ZIP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="content.content.greeting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Greeting</FormLabel>
                    <FormControl>
                      <Input placeholder="Dear Hiring Manager," {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content.content.body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="I am writing to express my interest in the [Position] position at [Company]."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="content.content.closing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing</FormLabel>
                      <FormControl>
                        <Input placeholder="Sincerely," {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content.content.signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Select a template type to edit its content
          </div>
        );
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            {renderContentEditor()}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Template" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief description of this template..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          disabled={!!template?.id} // Don't allow changing type after creation
                        >
                          {TEMPLATE_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Make this template public
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Anyone with the link can view this template
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {contentError && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {contentError}
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !!contentError}>
            {isSubmitting ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
