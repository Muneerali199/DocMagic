'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Download, 
  Share2, 
  Star, 
  Users, 
  Calendar,
  Tag,
  Briefcase,
  FileText,
  Presentation,
  Mail,
  GraduationCap,
  X
} from 'lucide-react';
import { Template } from '@/types/templates';
import { getTemplateTypeIcon, getDefaultTemplateContent } from '@/lib/templates';
import { useRouter } from 'next/navigation';

interface TemplatePreviewModalProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate?: (template: Template) => void;
}

export function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
  onUseTemplate
}: TemplatePreviewModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('preview');

  if (!template) return null;

  const handleUseTemplate = () => {
    if (onUseTemplate) {
      onUseTemplate(template);
    } else {
      router.push(`/templates/${template.id}/use`);
    }
    onOpenChange(false);
  };

  const renderTemplateContent = () => {
    try {
      switch (template.type) {
        case 'resume':
          return renderResumePreview();
        case 'presentation':
          return renderPresentationPreview();
        case 'letter':
          return renderLetterPreview();
        case 'cv':
          return renderCVPreview();
        default:
          return <div className="text-muted-foreground">Preview not available for this template type.</div>;
      }
    } catch (error) {
      console.error('Error rendering template preview:', error);
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            Unable to render preview for this template.
          </div>
          <div className="text-sm text-muted-foreground">
            Template: {template.title} ({template.type})
          </div>
        </div>
      );
    }
  };

  const renderResumePreview = () => {
    const content = template.content as any;
    const defaultContent = getDefaultTemplateContent('resume');

    // Use template content if available, otherwise use default content with sample data
    const personalInfo = content?.personalInfo || {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      location: 'New York, NY',
      website: 'linkedin.com/in/johndoe',
      summary: 'Experienced professional with a proven track record of delivering high-quality results. Skilled in project management, team leadership, and strategic planning with expertise in driving business growth and operational excellence.'
    };
    
    const sections = content?.sections?.length > 0 ? content.sections : [
      {
        id: 'experience',
        title: 'Professional Experience',
        items: [
          {
            position: 'Senior Software Engineer',
            company: 'Tech Solutions Inc.',
            location: 'New York, NY',
            duration: '2021 - Present',
            achievements: [
              'Led development of scalable web applications serving 100K+ users',
              'Improved system performance by 40% through optimization initiatives',
              'Mentored junior developers and established coding best practices'
            ]
          },
          {
            position: 'Software Engineer',
            company: 'Digital Innovations LLC',
            location: 'Boston, MA',
            duration: '2019 - 2021',
            achievements: [
              'Developed and maintained multiple client-facing applications',
              'Collaborated with cross-functional teams to deliver projects on time',
              'Implemented automated testing reducing bugs by 30%'
            ]
          }
        ]
      },
      {
        id: 'education',
        title: 'Education',
        items: [
          {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'University of Technology',
            location: 'Boston, MA',
            duration: '2015 - 2019',
            achievements: ['Magna Cum Laude', 'Dean\'s List (6 semesters)']
          }
        ]
      },
      {
        id: 'skills',
        title: 'Technical Skills',
        items: [
          {
            category: 'Programming Languages',
            skills: 'JavaScript, Python, Java, TypeScript, SQL'
          },
          {
            category: 'Frameworks & Libraries',
            skills: 'React, Node.js, Express, Django, Spring Boot'
          },
          {
            category: 'Tools & Technologies',
            skills: 'Git, Docker, AWS, MongoDB, PostgreSQL'
          }
        ]
      }
    ];

    return (
      <div className="space-y-6 p-6 bg-white border rounded-lg">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {personalInfo.name || '[Your Name]'}
          </h1>
          <div className="text-sm text-gray-600 mt-2 space-x-2">
            <span>{personalInfo.email || '[email@example.com]'}</span>
            <span>•</span>
            <span>{personalInfo.phone || '[phone]'}</span>
            <span>•</span>
            <span>{personalInfo.location || '[location]'}</span>
          </div>
          {personalInfo.website && (
            <div className="text-sm text-blue-600 mt-1">
              {personalInfo.website}
            </div>
          )}
        </div>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Sections */}
        {sections.map((section: any, index: number) => (
          <div key={section.id || index}>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h2>
            {section.items?.slice(0, 2).map((item: any, itemIndex: number) => (
              <div key={itemIndex} className="mb-4 last:mb-0">
                {item.position && (
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900">{item.position}</h3>
                    <span className="text-sm text-gray-600">{item.duration}</span>
                  </div>
                )}
                {item.company && (
                  <div className="text-sm text-gray-700 mb-2">
                    {item.company} • {item.location}
                  </div>
                )}
                {item.achievements && (
                  <ul className="text-sm text-gray-700 space-y-1">
                    {item.achievements.slice(0, 3).map((achievement: string, achIndex: number) => (
                      <li key={achIndex} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {item.skills && (
                  <div className="text-sm text-gray-700">
                    <strong>{item.category}:</strong> {item.skills}
                  </div>
                )}
              </div>
            ))}
            {section.items?.length > 2 && (
              <div className="text-sm text-gray-500 italic">
                ... and {section.items.length - 2} more items
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPresentationPreview = () => {
    const content = template.content as any;

    // Handle case where slides might not exist or be structured differently
    const slides = content?.slides?.length > 0 ? content.slides : [];
    const title = content?.title || template.title || 'Professional Presentation';

    // Create sample slides for preview if none exist
    const sampleSlides = slides.length > 0 ? slides : [
      {
        id: '1',
        type: 'title',
        content: {
          title: title,
          subtitle: 'Professional presentation template with modern design'
        }
      },
      {
        id: '2',
        type: 'content',
        content: {
          title: 'Key Features',
          bullets: [
            'Clean and professional design',
            'Easy to customize and edit',
            'Perfect for business presentations'
          ]
        }
      },
      {
        id: '3',
        type: 'content',
        content: {
          title: 'What You Get',
          bullets: [
            'Multiple slide layouts',
            'Consistent formatting',
            'Professional typography'
          ]
        }
      },
      {
        id: '4',
        type: 'content',
        content: {
          title: 'Perfect For',
          bullets: [
            'Business meetings',
            'Client presentations',
            'Team updates'
          ]
        }
      }
    ];

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-sm text-gray-600">{sampleSlides.length} slides</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {sampleSlides.slice(0, 4).map((slide: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 bg-white aspect-video flex flex-col justify-center min-h-[200px]">
              <div className="text-xs text-gray-500 mb-2">Slide {index + 1}</div>
              <h3 className="font-medium text-sm mb-2 text-gray-900">{slide.content?.title || slide.title || `Slide ${index + 1}`}</h3>
              {(slide.content?.subtitle || slide.subtitle) && (
                <p className="text-xs text-gray-600 mb-2">{slide.content?.subtitle || slide.subtitle}</p>
              )}
              {(slide.content?.bullets || slide.bullets) && (
                <ul className="text-xs text-gray-700 space-y-1">
                  {(slide.content?.bullets || slide.bullets).slice(0, 3).map((bullet: string, bulletIndex: number) => (
                    <li key={bulletIndex} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
              {/* Show any other content if bullets/subtitle don't exist */}
              {!slide.content?.bullets && !slide.bullets && !slide.content?.subtitle && !slide.subtitle && (
                <div className="text-xs text-gray-600">
                  {slide.content?.description || slide.description || 'Slide content'}
                </div>
              )}
            </div>
          ))}
        </div>

        {sampleSlides.length > 4 && (
          <div className="text-center text-sm text-gray-500">
            ... and {sampleSlides.length - 4} more slides
          </div>
        )}
        
        <div className="text-center text-sm text-gray-500">
          This template provides structure for creating professional presentations
        </div>
      </div>
    );
  };

  const renderLetterPreview = () => {
    const content = template.content as any;

    // Use template content if available, otherwise use sample data
    const senderInfo = content?.sender || {
      name: 'John Doe',
      address: '123 Main Street',
      city_state_zip: 'New York, NY 10001',
      phone: '(555) 123-4567',
      email: 'john.doe@email.com',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    const recipientInfo = content?.recipient || {
      name: 'Jane Smith',
      title: 'Hiring Manager',
      company: 'ABC Corporation',
      address: '456 Business Ave',
      city_state_zip: 'New York, NY 10002'
    };

    const letterContent = content?.content || {
      subject: 'Application for Software Engineer Position',
      greeting: 'Dear Ms. Smith,',
      opening_paragraph: 'I am writing to express my strong interest in the Software Engineer position at ABC Corporation. With my background in software development and passion for innovative technology solutions, I am excited about the opportunity to contribute to your team.',
      body_paragraph_1: 'In my previous role as a Software Developer, I successfully led multiple projects that improved system efficiency by 30% and reduced processing time significantly. My experience with modern frameworks and agile methodologies aligns perfectly with your team\'s requirements.',
      closing: 'Thank you for considering my application. I look forward to discussing how my skills and enthusiasm can contribute to ABC Corporation\'s continued success.',
      signature: 'John Doe'
    };

    return (
      <div className="bg-white p-8 border rounded-lg max-w-2xl mx-auto">
        {/* Sender Info */}
        <div className="mb-6">
          <div className="font-medium">{senderInfo.name}</div>
          <div className="text-sm text-gray-600">
            <div>{senderInfo.address}</div>
            <div>{senderInfo.city_state_zip}</div>
            <div>{senderInfo.phone}</div>
            <div>{senderInfo.email}</div>
          </div>
        </div>

        {/* Date */}
        <div className="mb-6 text-sm">
          {senderInfo.date}
        </div>

        {/* Recipient */}
        <div className="mb-6">
          <div className="font-medium">{recipientInfo.name}</div>
          <div className="text-sm text-gray-600">
            <div>{recipientInfo.title}</div>
            <div>{recipientInfo.company}</div>
            <div>{recipientInfo.address}</div>
            <div>{recipientInfo.city_state_zip}</div>
          </div>
        </div>

        {/* Letter Content */}
        <div className="space-y-4 text-sm">
          <div>
            <strong>Subject: {letterContent.subject}</strong>
          </div>

          <div>{letterContent.greeting}</div>

          <p className="leading-relaxed">{letterContent.opening_paragraph}</p>

          <p className="leading-relaxed">{letterContent.body_paragraph_1}</p>

          <p className="leading-relaxed">{letterContent.closing}</p>

          <div className="mt-6">
            <div className="font-medium">{letterContent.signature}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderCVPreview = () => {
    const content = template.content as any;

    // Handle missing content
    const personalInfo = content.personalInfo || {};
    const sections = content.sections || [];

    if (sections.length === 0) {
      return (
        <div className="space-y-6 p-6 bg-white border rounded-lg">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {template.title}
            </h1>
            <div className="text-sm text-gray-600 mt-2">
              Academic CV Template
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Template Features</h2>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Comprehensive academic formatting</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Sections for education, research, and publications</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Professional academic layout</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Customizable sections for different academic fields</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6 bg-white border rounded-lg">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {personalInfo.name || '[Your Name]'}
          </h1>
          {personalInfo.title && (
            <div className="text-lg text-gray-700 mt-1">{personalInfo.title}</div>
          )}
          <div className="text-sm text-gray-600 mt-2 space-x-2">
            <span>{personalInfo.email || '[email@example.com]'}</span>
            <span>•</span>
            <span>{personalInfo.phone || '[phone]'}</span>
          </div>
          {personalInfo.orcid && (
            <div className="text-sm text-blue-600 mt-1">
              ORCID: {personalInfo.orcid}
            </div>
          )}
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Sections Preview */}
        {sections.slice(0, 3).map((section: any, index: number) => (
          <div key={section.id || index}>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h2>
            {section.items?.slice(0, 2).map((item: any, itemIndex: number) => (
              <div key={itemIndex} className="mb-3 text-sm">
                {item.degree && (
                  <div className="font-medium">{item.degree}</div>
                )}
                {item.position && (
                  <div className="font-medium">{item.position}</div>
                )}
                {item.institution && (
                  <div className="text-gray-700">{item.institution}</div>
                )}
                {item.year && (
                  <div className="text-gray-600">{item.year}</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const templateMetadata = template as any;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-start space-x-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">{getTemplateTypeIcon(template.type)}</span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg sm:text-xl truncate">{template.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {template.description}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="text-xs sm:text-sm">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Preview</span>
              <span className="sm:hidden">View</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Details</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="metadata" className="text-xs sm:text-sm">
              <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Info</span>
              <span className="sm:hidden">Meta</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 mt-4">
            <ScrollArea className="h-[50vh] sm:h-[60vh]">
              <div className="px-1">
                {renderTemplateContent()}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="details" className="flex-1 mt-4">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Template Structure</h3>
                  <div className="text-sm text-muted-foreground">
                    This template includes the following sections and features:
                  </div>
                </div>
                
                {template.content && typeof template.content === 'object' && (
                  <div className="space-y-3">
                    {Object.keys(template.content).map((key) => (
                      <div key={key} className="border rounded-lg p-3">
                        <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {typeof (template.content as any)[key] === 'object' 
                            ? `Contains ${Object.keys((template.content as any)[key]).length} items`
                            : 'Configuration included'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="metadata" className="flex-1 mt-4">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Type</div>
                    <Badge variant="outline" className="mt-1">
                      {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </Badge>
                  </div>
                  
                  {templateMetadata.industry && (
                    <div>
                      <div className="text-sm font-medium">Industry</div>
                      <div className="text-sm text-muted-foreground mt-1 capitalize">
                        {templateMetadata.industry}
                      </div>
                    </div>
                  )}
                  
                  {templateMetadata.difficulty_level && (
                    <div>
                      <div className="text-sm font-medium">Difficulty</div>
                      <Badge 
                        variant={templateMetadata.difficulty_level === 'beginner' ? 'default' : 
                               templateMetadata.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}
                        className="mt-1"
                      >
                        {templateMetadata.difficulty_level}
                      </Badge>
                    </div>
                  )}
                  
                  {templateMetadata.usage_count && (
                    <div>
                      <div className="text-sm font-medium">Usage Count</div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {templateMetadata.usage_count.toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {templateMetadata.rating && (
                    <div>
                      <div className="text-sm font-medium">Rating</div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {templateMetadata.rating}/5.0
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm font-medium">Last Updated</div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(template.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Visibility</div>
                    <Badge variant={template.is_public ? 'default' : 'secondary'} className="mt-1">
                      {template.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
                
                {templateMetadata.tags && templateMetadata.tags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {templateMetadata.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator />
        
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
          <div className="flex space-x-2 order-2 sm:order-1">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
          
          <div className="flex space-x-2 order-1 sm:order-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
              Close
            </Button>
            <Button onClick={handleUseTemplate} className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">Use This Template</span>
              <span className="sm:hidden">Use Template</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
