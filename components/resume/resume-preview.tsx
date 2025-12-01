import React, { useState, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Github, Globe, Mail, Phone, MapPin, Download, Edit, Check, X, Sparkles, FileText, Briefcase, GraduationCap, Code, Award, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx';
import { saveAs } from 'file-saver';
import { RESUME_TEMPLATES } from '@/lib/resume-template-data';

interface ResumeData {
  name?: string;
  email?: string;
  phone?: string | number;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  portfolio?: string;
  summary?: string;
  experience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    date?: string;
    description?: string[];
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    location?: string;
    date?: string;
    gpa?: string;
    honors?: string;
  }>;
  skills?: {
    technical?: string[];
    programming?: string[];
    tools?: string[];
    soft?: string[];
  };
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
    credential?: string;
  }>;
  atsScore?: number;
  keywordOptimization?: {
    targetKeywords?: string[];
    includedKeywords?: string[];
    density?: string;
  };
}

interface ResumePreviewProps {
  resume: ResumeData;
  template: string;
  onChange?: (newResume: ResumeData) => void;
  showControls?: boolean; // Whether to show edit/export buttons inside preview
  isCV?: boolean; // true for CV (2+ pages), false for resume (1 page)
  layoutMode?: 'responsive' | 'fixed'; // 'responsive' reflows, 'fixed' keeps A4 width
  viewType?: 'mobile' | 'print'; // 'mobile' optimized for reading, 'print' exact A4 layout
  enableEditing?: boolean; // Force editing mode on init
}

export interface ResumePreviewRef {
  exportToPDF: () => Promise<void>;
  exportToWord: () => void;
  toggleEdit: () => void;
  isEditing: boolean;
}

export const ResumePreview = forwardRef<ResumePreviewRef, ResumePreviewProps>(
  ({ resume, template, onChange, showControls = false, isCV = false, layoutMode = 'responsive', viewType = 'print', enableEditing = false }, ref) => {
  const currentTemplate = RESUME_TEMPLATES.find(t => t.id === template) || RESUME_TEMPLATES[0];
  const primaryColor = currentTemplate.colorScheme[0];
  const secondaryColor = currentTemplate.colorScheme[2] || currentTemplate.colorScheme[0];
  const accentColor = currentTemplate.colorScheme[3] || '#F0F9FF';
  
  const [isEditing, setIsEditing] = useState(enableEditing);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const [editableResume, setEditableResume] = useState<ResumeData>({
    ...resume,
    phone: resume.phone?.toString() || "",
    experience: resume.experience?.map(exp => ({
      ...exp,
      description: exp.description?.map(d => d || "") || []
    })) || [],
    education: resume.education?.map(edu => ({
      ...edu,
      date: edu.date || ""
    })) || [],
    skills: resume.skills || {
      technical: [],
      programming: [],
      tools: [],
      soft: []
    },
    projects: resume.projects?.map(proj => ({
      ...proj,
      name: proj.name || "",
      description: proj.description || "",
      technologies: proj.technologies || []
    })) || []
  });

  function updateField(path: string[], value: any) {
    setEditableResume((prev: ResumeData) => {
      const newResume = { ...prev };
      let current: any = newResume;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      if (onChange) onChange(newResume);
      return newResume;
    });
  }

  const EditableText = ({
    value,
    onChange,
    className,
    multiline,
  }: {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    multiline?: boolean;
  }) => {
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full resize-none bg-transparent border-none p-0 m-0 font-sans text-gray-900 focus:outline-none focus:ring-0",
            className
          )}
          rows={3}
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "bg-transparent border-none p-0 m-0 font-sans text-gray-900 focus:outline-none focus:ring-0 w-full",
          className
        )}
      />
    );
  };

  const EditableList = ({
    items,
    onChange,
    className,
  }: {
    items: string[];
    onChange: (newItems: string[]) => void;
    className?: string;
  }) => {
    function updateItem(idx: number, val: string) {
      const newItems = [...items];
      newItems[idx] = val;
      onChange(newItems);
    }
    function addItem() {
      onChange([...items, ""]);
    }
    function removeItem(idx: number) {
      const newItems = items.filter((_, i) => i !== idx);
      onChange(newItems);
    }
    return (
      <div className={className}>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center mb-1">
            <EditableText
              value={item}
              onChange={(val) => updateItem(i, val)}
              className="flex-grow"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-red-500 font-bold hover:text-red-700 px-2"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="text-blue-600 underline text-sm mt-1 hover:text-blue-800"
        >
          + Add
        </button>
      </div>
    );
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const element = document.getElementById('resume-content');
      if (!element) throw new Error('Resume content element not found');
      
      // Store original styles
      const originalOverflow = element.style.overflow;
      element.style.overflow = 'visible';
      
      const canvas = await html2canvas(element, {
        scale: 3, // Good quality without being too large
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
        windowHeight: element.scrollHeight,
      });
      
      // Restore original styles
      element.style.overflow = originalOverflow;
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit properly
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      
      const scaledWidth = pdfWidth;
      const scaledHeight = imgHeight * ratio;
      
      // For Resume: Fit to 1 page, For CV: Allow multiple pages
      if (isCV) {
        // CV mode: Allow multiple pages
        let heightLeft = scaledHeight;
        let position = 0;
        
        // Add image with no margins - full width
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
          position = heightLeft - scaledHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;
        }
      } else {
        // Resume mode: Fit to 1 page - full width, no side margins
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight, undefined, 'FAST');
      }
      
      const fileName = isCV 
        ? `${resume.name?.replace(/\s+/g, '-').toLowerCase() || 'cv'}-cv.pdf`
        : `${resume.name?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.pdf`;
      
      pdf.save(fileName);
      
      toast({
        title: `${isCV ? 'CV' : 'Resume'} exported!`,
        description: `Your ${isCV ? 'CV' : 'resume'} has been downloaded as a PDF.`,
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export failed",
        description: `Failed to export ${isCV ? 'CV' : 'resume'} to PDF. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToWord = async () => {
    try {
      setIsExporting(true);
      
      // Create document sections
      const sections = [];
      
      // Header - Name and Contact
      sections.push(
        new Paragraph({
          text: resume.name || "Your Name",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
      
      // Contact Info
      const contactInfo = [
        resume.email,
        resume.phone?.toString(),
        resume.location,
        resume.linkedin,
        resume.github,
        resume.website
      ].filter(Boolean).join(' | ');
      
      if (contactInfo) {
        sections.push(
          new Paragraph({
            text: contactInfo,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        );
      }
      
      // Summary
      if (resume.summary) {
        sections.push(
          new Paragraph({
            text: "SUMMARY",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            text: resume.summary,
            spacing: { after: 400 },
          })
        );
      }
      
      // Experience
      if (resume.experience && resume.experience.length > 0) {
        sections.push(
          new Paragraph({
            text: "WORK EXPERIENCE",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          })
        );
        
        resume.experience.forEach((exp) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: exp.title || "", bold: true }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: exp.company || "",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: exp.date || "",
              spacing: { after: 200 },
            })
          );
          
          if (exp.description && exp.description.length > 0) {
            exp.description.forEach((desc) => {
              sections.push(
                new Paragraph({
                  text: `• ${desc}`,
                  spacing: { after: 100 },
                })
              );
            });
          }
          
          sections.push(new Paragraph({ text: "", spacing: { after: 200 } }));
        });
      }
      
      // Education
      if (resume.education && resume.education.length > 0) {
        sections.push(
          new Paragraph({
            text: "EDUCATION",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          })
        );
        
        resume.education.forEach((edu) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: edu.degree || "", bold: true }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: edu.institution || "",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: edu.date || "",
              spacing: { after: 200 },
            })
          );
        });
      }
      
      // Skills
      if (resume.skills) {
        sections.push(
          new Paragraph({
            text: "SKILLS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          })
        );
        
        if (resume.skills.technical && resume.skills.technical.length > 0) {
          sections.push(
            new Paragraph({
              text: `Technical Skills: ${resume.skills.technical.join(', ')}`,
              spacing: { after: 100 },
            })
          );
        }
        
        if (resume.skills.programming && resume.skills.programming.length > 0) {
          sections.push(
            new Paragraph({
              text: `Programming: ${resume.skills.programming.join(', ')}`,
              spacing: { after: 100 },
            })
          );
        }
        
        if (resume.skills.tools && resume.skills.tools.length > 0) {
          sections.push(
            new Paragraph({
              text: `Tools: ${resume.skills.tools.join(', ')}`,
              spacing: { after: 100 },
            })
          );
        }
        
        if (resume.skills.soft && resume.skills.soft.length > 0) {
          sections.push(
            new Paragraph({
              text: `Soft Skills: ${resume.skills.soft.join(', ')}`,
              spacing: { after: 200 },
            })
          );
        }
      }
      
      // Projects
      if (resume.projects && resume.projects.length > 0) {
        sections.push(
          new Paragraph({
            text: "PROJECTS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          })
        );
        
        resume.projects.forEach((project) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: project.name || "", bold: true }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: project.description || "",
              spacing: { after: 100 },
            })
          );
          
          if (project.technologies && project.technologies.length > 0) {
            sections.push(
              new Paragraph({
                text: `Technologies: ${project.technologies.join(', ')}`,
                spacing: { after: 200 },
              })
            );
          }
        });
      }
      
      // Certifications
      if (resume.certifications && resume.certifications.length > 0) {
        sections.push(
          new Paragraph({
            text: "CERTIFICATIONS",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          })
        );
        
        resume.certifications.forEach((cert) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: cert.name || "", bold: true }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `${cert.issuer || ""} - ${cert.date || ""}`,
              spacing: { after: 200 },
            })
          );
        });
      }
      
      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: sections,
        }],
      });
      
      // Generate and save
      const blob = await Packer.toBlob(doc);
      const fileName = isCV 
        ? `${resume.name?.replace(/\s+/g, '-').toLowerCase() || 'cv'}-cv.docx`
        : `${resume.name?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.docx`;
      
      saveAs(blob, fileName);
      
      toast({
        title: `${isCV ? 'CV' : 'Resume'} exported to Word!`,
        description: `${fileName} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error exporting to Word:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting to Word format.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    exportToPDF,
    exportToWord,
    toggleEdit,
    isEditing,
  }));

  const renderProfessionalTemplate = () => (
    <div className="w-full bg-white text-gray-900 overflow-auto print:overflow-visible" id="resume-content">
      <div className="p-4 sm:p-6 md:p-8 w-full md:max-w-[794px] mx-auto font-sans print:p-6 print:w-[794px]" style={{ minHeight: '1123px', fontSize: 'clamp(12px, 2.5vw, 14px)', lineHeight: '1.5' }}>
        {/* Header Section */}
        <div className="text-center mb-4 sm:mb-6 border-b border-gray-200 pb-4 sm:pb-6">
          {isEditing ? (
            <>
              <EditableText
                value={editableResume.name || ""}
                onChange={(val) => updateField(["name"], val)}
                className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center"
              />
              <div className="flex justify-center gap-4 text-sm text-gray-600 mt-2 flex-wrap">
                <EditableText
                  value={editableResume.email || ""}
                  onChange={(val) => updateField(["email"], val)}
                  className="text-center"
                />
                <EditableText
                  value={editableResume.phone?.toString() || ""}
                  onChange={(val) => updateField(["phone"], val)}
                  className="text-center"
                />
                <EditableText
                  value={editableResume.location || ""}
                  onChange={(val) => updateField(["location"], val)}
                  className="text-center"
                />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 print:text-2xl" style={{ color: primaryColor }}>
                {resume.name || "Your Name"}
              </h1>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mt-2 print:text-xs" style={{ color: '#4b5563' }}>
                {resume.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{resume.email}</span>
                  </div>
                )}
                {resume.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{resume.phone.toString()}</span>
                  </div>
                )}
                {resume.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{resume.location}</span>
                  </div>
                )}
              </div>
              
              {/* Professional Links */}
              {(resume.linkedin || resume.github || resume.website || resume.portfolio) && (
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mt-3 print:text-xs" style={{ color: '#4b5563' }}>
                  {resume.linkedin && (
                    <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Linkedin className="h-3 w-3" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {resume.github && (
                    <a href={resume.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-700 hover:underline">
                      <Github className="h-3 w-3" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {resume.website && (
                    <a href={resume.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 hover:underline">
                      <Globe className="h-3 w-3" />
                      <span>Website</span>
                    </a>
                  )}
                  {resume.portfolio && (
                    <a href={resume.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-purple-600 hover:underline">
                      <Globe className="h-3 w-3" />
                      <span>Portfolio</span>
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary Section */}
        {(editableResume.summary || resume.summary) && (
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3 print:text-base" style={{ color: primaryColor, borderColor: secondaryColor }}>
              Professional Summary
            </h2>
            {isEditing ? (
              <EditableText
                value={editableResume.summary || ""}
                onChange={(val) => updateField(["summary"], val)}
                multiline
                className="text-sm text-gray-700 leading-relaxed"
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed print:text-xs" style={{ color: '#374151' }}>
                {resume.summary}
              </p>
            )}
          </div>
        )}

        {/* Experience Section */}
        {(editableResume.experience?.length || resume.experience?.length) ? (
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-2 sm:mb-3 print:text-base" style={{ color: primaryColor, borderColor: secondaryColor }}>
              Work Experience
            </h2>
            <div className="space-y-4">
              {(isEditing ? editableResume.experience : resume.experience)?.map((exp, i) => (
                <div key={i} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      {isEditing ? (
                        <>
                          <EditableText
                            value={exp.title || ""}
                            onChange={(val) =>
                              updateField(["experience", i.toString(), "title"], val)
                            }
                            className="font-medium text-gray-800 text-base mb-1"
                          />
                          <EditableText
                            value={exp.company || ""}
                            onChange={(val) =>
                              updateField(["experience", i.toString(), "company"], val)
                            }
                            className="text-sm text-gray-600"
                          />
                          {exp.location && (
                            <EditableText
                              value={exp.location || ""}
                              onChange={(val) =>
                                updateField(["experience", i.toString(), "location"], val)
                              }
                              className="text-sm text-gray-500"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <h3 className="font-medium text-gray-800 text-base print:text-sm" style={{ color: primaryColor }}>
                            {exp.title || "Job Title"}
                          </h3>
                          <p className="text-sm text-gray-600 print:text-xs" style={{ color: '#4b5563' }}>
                            {exp.company || "Company Name"}
                            {exp.location && ` • ${exp.location}`}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      {isEditing ? (
                        <EditableText
                          value={exp.date || ""}
                          onChange={(val) =>
                            updateField(["experience", i.toString(), "date"], val)
                          }
                          className="text-sm text-gray-500"
                        />
                      ) : (
                        <span className="text-sm text-gray-500 print:text-xs" style={{ color: '#6b7280' }}>
                          {exp.date || "Date Range"}
                        </span>
                      )}
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <div className="mt-2">
                      {isEditing ? (
                        <EditableList
                          items={exp.description}
                          onChange={(newDesc) =>
                            updateField(["experience", i.toString(), "description"], newDesc)
                          }
                        />
                      ) : (
                        <ul className="list-disc text-sm text-gray-700 pl-5 mt-2 space-y-1 print:text-xs" style={{ color: '#374151' }}>
                          {exp.description.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Education Section */}
        {(editableResume.education?.length || resume.education?.length) ? (
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-2 sm:mb-3 print:text-base" style={{ color: primaryColor, borderColor: secondaryColor }}>
              Education
            </h2>
            <div className="space-y-3">
              {(isEditing ? editableResume.education : resume.education)?.map((edu, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div className="flex-1">
                    {isEditing ? (
                      <>
                        <EditableText
                          value={edu.degree || ""}
                          onChange={(val) =>
                            updateField(["education", i.toString(), "degree"], val)
                          }
                          className="font-medium text-gray-800"
                        />
                        <EditableText
                          value={edu.institution || ""}
                          onChange={(val) =>
                            updateField(["education", i.toString(), "institution"], val)
                          }
                          className="text-sm text-gray-600"
                        />
                        {edu.location && (
                          <EditableText
                            value={edu.location || ""}
                            onChange={(val) =>
                              updateField(["education", i.toString(), "location"], val)
                            }
                            className="text-sm text-gray-500"
                          />
                        )}
                        {edu.gpa && (
                          <EditableText
                            value={edu.gpa || ""}
                            onChange={(val) =>
                              updateField(["education", i.toString(), "gpa"], val)
                            }
                            className="text-sm text-gray-500"
                          />
                        )}
                        {edu.honors && (
                          <EditableText
                            value={edu.honors || ""}
                            onChange={(val) =>
                              updateField(["education", i.toString(), "honors"], val)
                            }
                            className="text-sm text-gray-500"
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <h3 className="font-medium text-gray-800 print:text-sm" style={{ color: primaryColor }}>
                          {edu.degree || "Degree"}
                        </h3>
                        <p className="text-sm text-gray-600 print:text-xs" style={{ color: '#4b5563' }}>
                          {edu.institution || "Institution"}
                          {edu.location && ` • ${edu.location}`}
                        </p>
                        {edu.gpa && (
                          <p className="text-sm text-gray-500 print:text-xs" style={{ color: '#6b7280' }}>
                            GPA: {edu.gpa}
                          </p>
                        )}
                        {edu.honors && (
                          <p className="text-sm text-gray-500 print:text-xs" style={{ color: '#6b7280' }}>
                            {edu.honors}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    {isEditing ? (
                      <EditableText
                        value={edu.date || ""}
                        onChange={(val) => updateField(["education", i.toString(), "date"], val)}
                        className="text-sm text-gray-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-500 print:text-xs" style={{ color: '#6b7280' }}>
                        {edu.date || "Year"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Skills Section */}
        {(editableResume.skills || resume.skills) && (
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-2 sm:mb-3 print:text-base" style={{ color: primaryColor, borderColor: secondaryColor }}>
              Skills
            </h2>
            
            {isEditing ? (
              <div className="space-y-3">
                {Object.entries(editableResume.skills || {}).map(([category, skillList]) => (
                  skillList && skillList.length > 0 ? (
                    <div key={category}>
                      <h3 className="font-medium text-gray-700 capitalize text-sm mb-1 print:text-xs" style={{ color: '#374151' }}>{category}</h3>
                      <EditableList
                        items={skillList as string[]}
                        onChange={(newSkills) => updateField(["skills", category], newSkills)}
                        className="flex flex-wrap gap-2"
                      />
                    </div>
                  ) : null
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(resume.skills || {}).map(([category, skillList]) => (
                  skillList && (skillList as string[]).length > 0 ? (
                    <div key={category}>
                      <h3 className="font-medium text-gray-700 capitalize text-sm mb-1 print:text-xs" style={{ color: '#374151' }}>{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {(skillList as string[]).map((skill, i) => (
                          <span
                            key={i}
                            className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-800 border print:text-xs print:px-2 print:py-0.5"
                            style={{ color: '#1f2937', backgroundColor: '#f3f4f6' }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Section */}
        {(editableResume.projects?.length || resume.projects?.length) ? (
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-2 sm:mb-3 print:text-base" style={{ color: primaryColor, borderColor: secondaryColor }}>
              Projects
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                {editableResume.projects?.map((project, i) => (
                  <div key={i} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex justify-between items-start mb-1">
                      <EditableText
                        value={project.name || ""}
                        onChange={(val) =>
                          updateField(["projects", i.toString(), "name"], val)
                        }
                        className="font-medium text-gray-800 mb-1"
                      />
                      {project.link && (
                        <EditableText
                          value={project.link || ""}
                          onChange={(val) =>
                            updateField(["projects", i.toString(), "link"], val)
                          }
                          className="text-xs text-blue-600"
                        />
                      )}
                    </div>
                    <EditableText
                      value={project.description || ""}
                      onChange={(val) =>
                        updateField(["projects", i.toString(), "description"], val)
                      }
                      multiline
                      className="text-sm text-gray-700"
                    />
                    {project.technologies && (
                      <div className="mt-1">
                        <EditableText
                          value={(project.technologies || []).join(", ")}
                          onChange={(val) =>
                            updateField(["projects", i.toString(), "technologies"], val.split(", "))
                          }
                          className="text-xs text-gray-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {resume.projects?.map((project, i) => (
                  <div key={i} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-800 print:text-sm" style={{ color: primaryColor }}>
                        {project.name || "Project Name"}
                      </h3>
                      {project.link && (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline print:text-xs"
                          style={{ color: '#2563eb' }}
                        >
                          View Project
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 print:text-xs" style={{ color: '#374151' }}>
                      {project.description || "Project description"}
                    </p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.technologies.map((tech, j) => (
                          <Badge 
                            key={j} 
                            variant="outline" 
                            className="text-xs bg-gray-50 text-gray-600 border-gray-200 print:text-xs"
                            style={{ color: primaryColor, backgroundColor: accentColor }}
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Certifications Section */}
        {(editableResume.certifications?.length || resume.certifications?.length) ? (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3 print:text-base" style={{ color: primaryColor, borderColor: secondaryColor }}>
              Certifications
            </h2>
            {isEditing ? (
              <div className="space-y-3">
                {editableResume.certifications?.map((cert, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div className="flex-1">
                      <EditableText
                        value={cert.name || ""}
                        onChange={(val) =>
                          updateField(["certifications", i.toString(), "name"], val)
                        }
                        className="font-medium text-gray-800"
                      />
                      <EditableText
                        value={cert.issuer || ""}
                        onChange={(val) =>
                          updateField(["certifications", i.toString(), "issuer"], val)
                        }
                        className="text-sm text-gray-600"
                      />
                      {cert.credential && (
                        <EditableText
                          value={cert.credential || ""}
                          onChange={(val) =>
                            updateField(["certifications", i.toString(), "credential"], val)
                          }
                          className="text-xs text-gray-500"
                        />
                      )}
                    </div>
                    <div className="text-right">
                      <EditableText
                        value={cert.date || ""}
                        onChange={(val) =>
                          updateField(["certifications", i.toString(), "date"], val)
                        }
                        className="text-sm text-gray-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {resume.certifications?.map((cert, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 print:text-sm" style={{ color: '#1f2937' }}>
                        {cert.name || "Certification Name"}
                      </h3>
                      <p className="text-sm text-gray-600 print:text-xs" style={{ color: '#4b5563' }}>
                        {cert.issuer || "Issuing Organization"}
                      </p>
                      {cert.credential && (
                        <p className="text-xs text-gray-500 print:text-xs" style={{ color: '#6b7280' }}>
                          Credential ID: {cert.credential}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500 print:text-xs" style={{ color: '#6b7280' }}>
                        {cert.date || "Issue Date"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* ATS Score Section (only shown in preview, not editable) */}
        {resume.atsScore && !isEditing && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                resume.atsScore >= 90 ? 'bg-green-500' : 
                resume.atsScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {resume.atsScore}
              </div>
              <h3 className="font-medium text-gray-700">ATS Optimization Score</h3>
            </div>
            
            {resume.keywordOptimization && (
              <div className="text-xs text-gray-600">
                <p>Optimized for: {resume.keywordOptimization.targetKeywords?.join(', ')}</p>
                <p>Keyword density: {resume.keywordOptimization.density}</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Controls - Only show if showControls is true */}
        {showControls && (
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between print:hidden">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-1"
              >
                {isExporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToWord}
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Word
              </Button>
            </div>
            
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditableResume({
                      ...resume,
                      phone: resume.phone?.toString() || "",
                      experience: resume.experience?.map(exp => ({
                        ...exp,
                        description: exp.description?.map(d => d || "") || []
                      })) || [],
                      education: resume.education?.map(edu => ({
                        ...edu,
                        date: edu.date || ""
                      })) || [],
                      skills: resume.skills || {
                        technical: [],
                        programming: [],
                        tools: [],
                        soft: []
                      },
                      projects: resume.projects?.map(proj => ({
                        ...proj,
                        name: proj.name || "",
                        description: proj.description || "",
                        technologies: proj.technologies || []
                      })) || []
                    });
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit {isCV ? 'CV' : 'Resume'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Get template-specific styles - supporting extended templates
  const getTemplateStyles = () => {
    // Import extended templates to get color schemes
    try {
      const { RESUME_TEMPLATES_EXTENDED } = require('@/lib/resume-templates-extended');
      const templateData = RESUME_TEMPLATES_EXTENDED.find((t: any) => t.id === template);
      
      if (templateData) {
        return {
          accentColor: templateData.colors.primary,
          headerBg: `bg-gradient-to-r`,
          sectionColor: `text-${templateData.category}-700`,
          borderColor: `border-${templateData.category}-200`,
        };
      }
    } catch (error) {
      // Fallback to basic templates if extended templates not available
    }
    
    // Legacy template support
    switch (template) {
      case 'modern':
      case 'tech-minimal':
      case 'fullstack-modern':
      case 'business-analyst':
      case 'digital-marketer':
        return {
          accentColor: '#1F2937',
          headerBg: 'bg-gradient-to-r from-gray-800 to-gray-900',
          sectionColor: 'text-gray-900',
          borderColor: 'border-gray-300',
        };
      case 'creative':
      case 'graphic-designer':
      case 'content-creator':
      case 'marketing-creative':
      case 'devops-pro':
      case 'hr-professional':
      case 'recruiter':
      case 'teacher':
      case 'academic-researcher':
        return {
          accentColor: '#9333EA',
          headerBg: 'bg-gradient-to-r from-purple-600 to-purple-700',
          sectionColor: 'text-purple-700',
          borderColor: 'border-purple-200',
        };
      case 'minimalist':
      case 'corporate-professional':
      case 'accountant':
        return {
          accentColor: '#6B7280',
          headerBg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          sectionColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
      case 'executive':
      case 'executive-suite':
      case 'entrepreneur':
      case 'sales-executive':
        return {
          accentColor: '#D97706',
          headerBg: 'bg-gradient-to-r from-amber-600 to-amber-700',
          sectionColor: 'text-amber-700',
          borderColor: 'border-amber-200',
        };
      case 'technical':
      case 'mobile-dev':
      case 'photographer':
      case 'mechanical-engineer':
      case 'finance-analyst':
        return {
          accentColor: '#059669',
          headerBg: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
          sectionColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
        };
      case 'healthcare-professional':
        return {
          accentColor: '#EF4444',
          headerBg: 'bg-gradient-to-r from-red-600 to-red-700',
          sectionColor: 'text-red-700',
          borderColor: 'border-red-200',
        };
      case 'professional':
      default:
        return {
          accentColor: '#1F2937',
          headerBg: 'bg-gradient-to-r from-gray-700 to-gray-800',
          sectionColor: 'text-gray-800',
          borderColor: 'border-gray-200',
        };
    }
  };

  const styles = getTemplateStyles();

  // Render template with dynamic styling
  return (
    <div 
      className={`
        bg-white text-black 
        ${viewType === 'mobile' ? 'overflow-visible w-full' : 'overflow-hidden'} 
        print:overflow-visible 
        ${layoutMode === 'fixed' && viewType === 'print' ? 'w-[210mm] min-w-[210mm]' : 'w-full max-w-full'}
      `} 
      id="resume-content" 
      style={{ backgroundColor: '#ffffff', color: '#000000' }}
    >
      <div 
        className={`
          ${layoutMode === 'fixed' && viewType === 'print' ? 'w-[210mm]' : 'w-full'} 
          mx-auto 
          font-serif 
          ${viewType === 'mobile' 
            ? 'px-4 sm:px-6 py-6 sm:py-8 max-w-full' 
            : 'p-4 sm:p-6 md:p-8'
          } 
          print:w-[210mm] print:p-[20mm] 
          relative
        `} 
        style={{
          // Only set minHeight for print view, let mobile view flow naturally
          ...(viewType === 'print' && isCV ? { minHeight: '297mm' } : {}),
          fontSize: viewType === 'mobile' 
            ? 'clamp(14px, 3.5vw, 16px)' 
            : 'clamp(10pt, 2.5vw, ' + (isCV ? '11pt' : '10pt') + ')',
          lineHeight: viewType === 'mobile' ? '1.6' : isCV ? '1.6' : '1.4',
          backgroundColor: '#ffffff',
          color: '#000000',
          // Ensure mobile view takes full width
          ...(viewType === 'mobile' ? { 
            maxWidth: '100%', 
            width: '100%', 
            boxSizing: 'border-box',
            overflowX: 'hidden'
          } : {}),
        }}
      >
        {/* Visual Page Break Indicator for Print View */}
        {viewType === 'print' && isCV && (
          <div className="absolute left-0 right-0 border-b-2 border-dashed border-gray-300 print:hidden pointer-events-none" style={{ top: '297mm' }}>
            <span className="absolute right-0 -top-6 text-xs text-gray-400 bg-white px-2">Page 1 End</span>
          </div>
        )}
        {/* Header Section - LaTeX Style */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8" style={{ marginBottom: isCV ? '32px' : '16px' }}>
          {isEditing ? (
            <>
              <EditableText
                value={editableResume.name || ""}
                onChange={(val) => updateField(["name"], val)}
                className="text-2xl sm:text-3xl font-bold mb-2 text-center text-gray-900"
              />
              <div className="flex justify-center gap-4 text-sm text-gray-600 mt-2 flex-wrap">
                <EditableText
                  value={editableResume.email || ""}
                  onChange={(val) => updateField(["email"], val)}
                  className="text-center"
                />
                <EditableText
                  value={editableResume.phone?.toString() || ""}
                  onChange={(val) => updateField(["phone"], val)}
                  className="text-center"
                />
                <EditableText
                  value={editableResume.location || ""}
                  onChange={(val) => updateField(["location"], val)}
                  className="text-center"
                />
              </div>
            </>
          ) : (
            <>
              {/* Name - Large and Bold */}
              <h1 
                className={`font-bold ${viewType === 'mobile' ? 'text-2xl sm:text-3xl mb-4 sm:mb-6' : 'text-4xl mb-4'} uppercase tracking-wide`} 
                style={{ 
                  fontSize: viewType === 'mobile' ? 'clamp(20px, 6vw, 28px)' : '32pt', 
                  color: '#000000', 
                  lineHeight: viewType === 'mobile' ? '1.3' : '1.2',
                  wordBreak: viewType === 'mobile' ? 'break-word' : 'normal',
                }}
              >
                {resume.name || "YOUR NAME"}
              </h1>
              
              {/* Contact Info - Single Line with Separators */}
              <div 
                className="flex flex-wrap justify-center items-center gap-2 text-sm" 
                style={{ 
                  fontSize: viewType === 'mobile' ? 'clamp(12px, 3vw, 14px)' : '10pt', 
                  color: '#000000', 
                  gap: viewType === 'mobile' ? '6px' : undefined 
                }}
              >
                {resume.github && (
                  <>
                    <a href={resume.github} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      <Github className="h-3 w-3" />
                      <span>github.com/{resume.github.split('/').pop()}</span>
                    </a>
                    <span className="text-gray-400">|</span>
                  </>
                )}
                {resume.linkedin && (
                  <>
                    <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      <Linkedin className="h-3 w-3" />
                      <span>linkedin.com/in/{resume.linkedin.split('/').pop()}</span>
                    </a>
                    <span className="text-gray-400">|</span>
                  </>
                )}
                {resume.website && (
                  <>
                    <a href={resume.website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{resume.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                    <span className="text-gray-400">|</span>
                  </>
                )}
                {resume.email && (
                  <>
                    <a href={`mailto:${resume.email}`} className="hover:underline flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{resume.email}</span>
                    </a>
                    {resume.phone && <span className="text-gray-400">|</span>}
                  </>
                )}
                {resume.phone && (
                  <a href={`tel:${resume.phone}`} className="hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{resume.phone.toString()}</span>
                  </a>
                )}
              </div>
            </>
          )}
        </div>

        {/* Summary Section */}
        {(editableResume.summary || resume.summary) && (
          <div className="mb-6">
            <h2 className={`font-bold uppercase ${viewType === 'mobile' ? 'text-xl mb-4 mt-6' : 'text-xl mb-4'}`} style={{ fontSize: viewType === 'mobile' ? '20px' : '14pt', borderBottom: '1px solid #000', paddingBottom: viewType === 'mobile' ? '6px' : '4pt', color: '#000000', marginTop: viewType === 'mobile' ? '24px' : undefined }}>
              SUMMARY
            </h2>
            {isEditing ? (
              <EditableText
                value={editableResume.summary || ""}
                onChange={(val) => updateField(["summary"], val)}
                multiline
                className="text-sm text-gray-700 leading-relaxed print:text-xs"
              />
            ) : (
              <p className="text-justify leading-relaxed" style={{ fontSize: viewType === 'mobile' ? '15px' : '11pt', color: '#000000', lineHeight: viewType === 'mobile' ? '1.7' : undefined }}>{resume.summary}</p>
            )}
          </div>
        )}

        {/* Experience Section */}
        {editableResume.experience && editableResume.experience.length > 0 && (
          <div className="mb-3 sm:mb-4 md:mb-6" style={{ marginBottom: isCV ? '24px' : '12px' }}>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 uppercase" style={{ fontSize: 'clamp(12pt, 3vw, 14pt)', borderBottom: '1px solid #000', paddingBottom: '4pt', color: '#000000' }}>
              WORK EXPERIENCE
            </h2>
            <div className="space-y-4">
              {editableResume.experience.map((exp: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                    <div className="flex-1">
                      {isEditing ? (
                        <EditableText
                          value={exp.title || ""}
                          onChange={(val) => updateField(["experience", idx, "title"], val)}
                          className="font-semibold text-gray-800 print:text-sm"
                        />
                      ) : (
                        <h3 className="font-bold" style={{ fontSize: viewType === 'mobile' ? '17px' : '12pt', color: '#000000', marginBottom: viewType === 'mobile' ? '4px' : undefined }}>{exp.title}</h3>
                      )}
                      {isEditing ? (
                        <EditableText
                          value={exp.company || ""}
                          onChange={(val) => updateField(["experience", idx, "company"], val)}
                          className="text-sm print:text-xs text-gray-700"
                        />
                      ) : (
                        <p style={{ fontSize: viewType === 'mobile' ? '15px' : '11pt', color: '#000000' }}>{exp.company}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-600 print:text-xs">
                      {isEditing ? (
                        <EditableText
                          value={exp.date || ""}
                          onChange={(val) => updateField(["experience", idx, "date"], val)}
                          className="text-sm text-gray-600 print:text-xs"
                        />
                      ) : (
                        <span>{exp.date}</span>
                      )}
                      {exp.location && (
                        <>
                          <br />
                          {isEditing ? (
                            <EditableText
                              value={exp.location || ""}
                              onChange={(val) => updateField(["experience", idx, "location"], val)}
                              className="text-xs text-gray-500 print:text-xs"
                            />
                          ) : (
                            <span className="text-xs text-gray-500 print:text-xs">{exp.location}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mt-2 print:text-xs">
                      {isEditing ? (
                        <EditableList
                          items={exp.description}
                          onChange={(newDesc) => updateField(["experience", idx, "description"], newDesc)}
                          className="list-disc list-inside space-y-1 text-sm text-gray-700 print:text-xs"
                        />
                      ) : (
                        exp.description.map((desc: string, i: number) => (
                          <li key={i} className="ml-2">{desc}</li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {editableResume.education && editableResume.education.length > 0 && (
          <div className="mb-3 sm:mb-4 md:mb-6" style={{ marginBottom: isCV ? '24px' : '12px' }}>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 uppercase" style={{ fontSize: 'clamp(12pt, 3vw, 14pt)', borderBottom: '1px solid #000', paddingBottom: '4pt', color: '#000000' }}>
              EDUCATION
            </h2>
            <div className="space-y-3">
              {editableResume.education.map((edu: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      {isEditing ? (
                        <EditableText
                          value={edu.degree || ""}
                          onChange={(val) => updateField(["education", idx, "degree"], val)}
                          className="font-semibold text-gray-800 print:text-sm"
                        />
                      ) : (
                        <h3 className="font-bold" style={{ fontSize: viewType === 'mobile' ? '17px' : '12pt', color: '#000000', marginBottom: viewType === 'mobile' ? '4px' : undefined }}>{edu.degree}</h3>
                      )}
                      {isEditing ? (
                        <EditableText
                          value={edu.institution || ""}
                          onChange={(val) => updateField(["education", idx, "institution"], val)}
                          className="text-sm print:text-xs text-gray-700"
                        />
                      ) : (
                        <p style={{ fontSize: viewType === 'mobile' ? '15px' : '11pt', color: '#000000' }}>{edu.institution}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-600 print:text-xs">
                      {isEditing ? (
                        <EditableText
                          value={edu.date || ""}
                          onChange={(val) => updateField(["education", idx, "date"], val)}
                          className="text-sm text-gray-600 print:text-xs"
                        />
                      ) : (
                        <span>{edu.date}</span>
                      )}
                      {edu.location && (
                        <>
                          <br />
                          {isEditing ? (
                            <EditableText
                              value={edu.location || ""}
                              onChange={(val) => updateField(["education", idx, "location"], val)}
                              className="text-xs text-gray-500 print:text-xs"
                            />
                          ) : (
                            <span className="text-xs text-gray-500 print:text-xs">{edu.location}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {(edu.gpa || edu.honors) && (
                    <div className="text-sm text-gray-600 mt-1 print:text-xs">
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                      {edu.gpa && edu.honors && <span> • </span>}
                      {edu.honors && <span>{edu.honors}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {editableResume.skills && Object.values(editableResume.skills).some((arr: any) => arr && arr.length > 0) && (
          <div className="mb-3 sm:mb-4 md:mb-6" style={{ marginBottom: isCV ? '24px' : '12px' }}>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 uppercase" style={{ fontSize: 'clamp(12pt, 3vw, 14pt)', borderBottom: '1px solid #000', paddingBottom: '4pt', color: '#000000' }}>
              SKILLS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {editableResume.skills.technical && editableResume.skills.technical.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2 print:text-xs">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {editableResume.skills.technical.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs print:text-xs bg-gray-200 text-gray-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {editableResume.skills.programming && editableResume.skills.programming.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2 print:text-xs">Programming</h3>
                  <div className="flex flex-wrap gap-2">
                    {editableResume.skills.programming.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs print:text-xs bg-gray-200 text-gray-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {editableResume.skills.tools && editableResume.skills.tools.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2 print:text-xs">Tools & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {editableResume.skills.tools.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs print:text-xs bg-gray-200 text-gray-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {editableResume.skills.soft && editableResume.skills.soft.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2 print:text-xs">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {editableResume.skills.soft.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs print:text-xs bg-gray-200 text-gray-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {editableResume.projects && editableResume.projects.length > 0 && (
          <div className="mb-3 sm:mb-4 md:mb-6" style={{ marginBottom: isCV ? '24px' : '12px' }}>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 uppercase" style={{ fontSize: 'clamp(12pt, 3vw, 14pt)', borderBottom: '1px solid #000', paddingBottom: '4pt', color: '#000000' }}>
              PROJECTS
            </h2>
            <div className="space-y-3">
              {editableResume.projects.map((project: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold" style={{ fontSize: '12pt', color: '#000000' }}>{project.name}</h3>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline flex items-center gap-1 text-gray-700 hover:text-gray-900">
                        <LinkIcon className="h-3 w-3" />
                        View
                      </a>
                    )}
                  </div>
                  <p className="mb-2" style={{ fontSize: '11pt', color: '#000000' }}>{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs print:text-xs border-gray-400 text-gray-700">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {editableResume.certifications && editableResume.certifications.length > 0 && (
          <div className="mb-3 sm:mb-4 md:mb-6" style={{ marginBottom: isCV ? '24px' : '12px' }}>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 uppercase" style={{ fontSize: 'clamp(12pt, 3vw, 14pt)', borderBottom: '1px solid #000', paddingBottom: '4pt', color: '#000000' }}>
              CERTIFICATIONS
            </h2>
            <div className="space-y-2">
              {editableResume.certifications.map((cert: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm print:text-sm">{cert.name}</h3>
                      <p className="text-sm print:text-xs text-gray-700">{cert.issuer}</p>
                    </div>
                    <span className="text-sm text-gray-600 print:text-xs">{cert.date}</span>
                  </div>
                  {cert.credential && (
                    <p className="text-xs text-gray-500 mt-1 print:text-xs">ID: {cert.credential}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit/Export Controls */}
        {showControls && (
          <div className="mt-8 flex gap-2 justify-center print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleEdit}
              className="flex items-center gap-1"
            >
              {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {isEditing ? "Save" : "Edit"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-1"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderModernTemplate = () => (
    <div className="w-full bg-white text-gray-900 overflow-auto print:overflow-visible" id="resume-content">
      <div className="w-full md:max-w-[794px] mx-auto font-sans print:w-[794px] min-h-[1123px] flex flex-col md:flex-row shadow-lg print:shadow-none bg-white">
        {/* Sidebar */}
        <div className="w-full md:w-[30%] bg-slate-50 p-6 border-r border-gray-200 print:bg-slate-50 print:w-[30%]">
          {/* Contact Info */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">Contact</h3>
            <div className="space-y-3 text-sm">
              {isEditing ? (
                <>
                  <EditableText value={editableResume.email || ""} onChange={v => updateField(["email"], v)} className="text-slate-700" />
                  <EditableText value={editableResume.phone?.toString() || ""} onChange={v => updateField(["phone"], v)} className="text-slate-700" />
                  <EditableText value={editableResume.location || ""} onChange={v => updateField(["location"], v)} className="text-slate-700" />
                  <EditableText value={editableResume.linkedin || ""} onChange={v => updateField(["linkedin"], v)} className="text-slate-700" />
                </>
              ) : (
                <>
                  {resume.email && <div className="flex items-center gap-2 break-all"><Mail className="w-3 h-3 shrink-0" /> {resume.email}</div>}
                  {resume.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3 shrink-0" /> {resume.phone}</div>}
                  {resume.location && <div className="flex items-center gap-2"><MapPin className="w-3 h-3 shrink-0" /> {resume.location}</div>}
                  {resume.linkedin && <div className="flex items-center gap-2 break-all"><Linkedin className="w-3 h-3 shrink-0" /> LinkedIn</div>}
                </>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">Education</h3>
            <div className="space-y-4">
              {(isEditing ? editableResume.education : resume.education)?.map((edu, i) => (
                <div key={i}>
                  <div className="font-bold text-slate-800 text-sm">{edu.institution}</div>
                  <div className="text-slate-600 text-xs">{edu.degree}</div>
                  <div className="text-slate-500 text-xs italic">{edu.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-1">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editableResume.skills?.technical : resume.skills?.technical)?.map((skill, i) => (
                <span key={i} className="bg-white border border-slate-200 px-2 py-1 rounded text-xs text-slate-700">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-[70%] p-8 print:w-[70%]">
          {/* Header */}
          <div className="mb-8">
            {isEditing ? (
              <EditableText value={editableResume.name || ""} onChange={v => updateField(["name"], v)} className="text-4xl font-bold text-slate-900 mb-2" />
            ) : (
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{resume.name}</h1>
            )}
            {isEditing ? (
              <EditableText value={editableResume.summary || ""} onChange={v => updateField(["summary"], v)} multiline className="text-slate-600 leading-relaxed w-full" />
            ) : (
              <p className="text-slate-600 leading-relaxed">{resume.summary}</p>
            )}
          </div>

          {/* Experience */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" style={{ color: primaryColor }} /> Experience
            </h2>
            <div className="space-y-6">
              {(isEditing ? editableResume.experience : resume.experience)?.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2" style={{ borderColor: accentColor }}>
                  <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-800">{exp.title}</h3>
                    <span className="text-xs text-slate-500 font-medium">{exp.date}</span>
                  </div>
                  <div className="text-sm mb-2" style={{ color: primaryColor }}>{exp.company}</div>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {exp.description?.map((desc, j) => (
                      <li key={j}>{desc}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" style={{ color: primaryColor }} /> Projects
            </h2>
            <div className="grid gap-4">
              {(isEditing ? editableResume.projects : resume.projects)?.map((proj, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="font-bold text-slate-800 mb-1">{proj.name}</div>
                  <p className="text-sm text-slate-600 mb-2">{proj.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {proj.technologies?.map((tech, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 rounded" style={{ color: primaryColor, backgroundColor: accentColor }}>{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // DEEDY RESUME - Two-column modern design with dark sidebar
  const renderDeedyTemplate = () => (
    <div className="w-full bg-white overflow-auto print:overflow-visible" id="resume-content">
      <div className="w-full md:max-w-[794px] mx-auto print:w-[794px] min-h-[1123px] flex">
        {/* LEFT COLUMN - Dark sidebar */}
        <div className="w-[35%] p-6 text-white" style={{ backgroundColor: primaryColor }}>
          {/* Name */}
          <div className="mb-6">
            {isEditing ? (
              <EditableText value={editableResume.name || ""} onChange={(v) => updateField(["name"], v)} className="text-xl font-bold text-white" />
            ) : (
              <h1 className="text-xl font-bold break-words">{resume.name}</h1>
            )}
          </div>

          {/* Contact */}
          <div className="mb-6 text-xs space-y-2">
            <h2 className="text-sm font-bold uppercase mb-3" style={{ color: accentColor }}>Contact</h2>
            {resume.email && <div className="flex items-start gap-2"><Mail className="w-3 h-3 mt-0.5 shrink-0" /><span className="break-all">{resume.email}</span></div>}
            {resume.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3 shrink-0" />{resume.phone}</div>}
            {resume.location && <div className="flex items-start gap-2"><MapPin className="w-3 h-3 mt-0.5 shrink-0" /><span>{resume.location}</span></div>}
          </div>

          {/* Education */}
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase mb-3" style={{ color: accentColor }}>Education</h2>
            <div className="text-xs space-y-3">
              {(isEditing ? editableResume.education : resume.education)?.map((edu, i) => (
                <div key={i}>
                  <div className="font-bold">{edu.institution}</div>
                  <div className="opacity-90">{edu.degree}</div>
                  <div className="opacity-75 text-xs">{edu.date}</div>
                  {edu.gpa && <div className="opacity-75">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-sm font-bold uppercase mb-3" style={{ color: accentColor }}>Skills</h2>
            <div className="text-xs space-y-2">
              {resume.skills?.programming && (
                <div>
                  <div className="font-semibold mb-1">Programming</div>
                  <div className="opacity-90">{resume.skills.programming.join(" • ")}</div>
                </div>
              )}
              {resume.skills?.technical && (
                <div>
                  <div className="font-semibold mb-1">Technologies</div>
                  <div className="opacity-90">{resume.skills.technical.join(" • ")}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Content */}
        <div className="w-[65%] p-6">
          {/* Summary */}
          {resume.summary && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase mb-2 pb-1 border-b-2" style={{ borderColor: primaryColor }}>Profile</h2>
              <p className="text-xs text-gray-700 leading-relaxed">{resume.summary}</p>
            </div>
          )}

          {/* Experience */}
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase mb-3 pb-1 border-b-2" style={{ borderColor: primaryColor }}>Experience</h2>
            <div className="space-y-4">
              {(isEditing ? editableResume.experience : resume.experience)?.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-sm">{exp.title}</h3>
                    <span className="text-xs font-semibold" style={{ color: primaryColor }}>{exp.date}</span>
                  </div>
                  <div className="text-xs font-medium text-gray-600 mb-1">{exp.company} • {exp.location}</div>
                  <ul className="list-disc ml-4 text-xs text-gray-700 space-y-0.5">
                    {exp.description?.map((desc, j) => <li key={j}>{desc}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase mb-3 pb-1 border-b-2" style={{ borderColor: primaryColor }}>Projects</h2>
              <div className="space-y-3">
                {(isEditing ? editableResume.projects : resume.projects)?.map((proj, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-xs">{proj.name}</h3>
                    <p className="text-xs text-gray-700">{proj.description}</p>
                    {proj.technologies && (
                      <div className="text-xs mt-1 flex flex-wrap gap-1">
                        {proj.technologies.map((tech, j) => (
                          <span key={j} className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: secondaryColor }}>{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // BLACK & WHITE PROFESSIONAL - Clean ATS-friendly
  const renderBlackWhiteTemplate = () => (
    <div className="w-full bg-white overflow-auto print:overflow-visible" id="resume-content">
      <div className="w-full md:max-w-[794px] mx-auto print:w-[794px] min-h-[1123px] p-8 font-sans">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-black">
          {isEditing ? (
            <EditableText value={editableResume.name || ""} onChange={(v) => updateField(["name"], v)} className="text-3xl font-bold mb-2" />
          ) : (
            <h1 className="text-3xl font-bold mb-2">{resume.name}</h1>
          )}
          <div className="text-sm space-x-3">
            {resume.email} • {resume.phone} • {resume.location}
          </div>
          {(resume.linkedin || resume.github) && (
            <div className="text-sm space-x-3 mt-1">
              {resume.linkedin && <span>{resume.linkedin}</span>}
              {resume.github && <span>• {resume.github}</span>}
            </div>
          )}
        </div>

        {/* Professional Summary */}
        {resume.summary && (
          <div className="mb-5">
            <h2 className="text-base font-bold uppercase border-b border-black mb-2">Summary</h2>
            <p className="text-sm leading-relaxed">{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        <div className="mb-5">
          <h2 className="text-base font-bold uppercase border-b border-black mb-3">Professional Experience</h2>
          <div className="space-y-4">
            {(isEditing ? editableResume.experience : resume.experience)?.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-sm">{exp.title}</h3>
                  <span className="text-sm">{exp.date}</span>
                </div>
                <div className="text-sm italic mb-1">{exp.company}, {exp.location}</div>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  {exp.description?.map((desc, j) => <li key={j}>{desc}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-5">
          <h2 className="text-base font-bold uppercase border-b border-black mb-3">Education</h2>
          {(isEditing ? editableResume.education : resume.education)?.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <div>
                  <div className="font-bold text-sm">{edu.degree}</div>
                  <div className="text-sm">{edu.institution}, {edu.location}</div>
                </div>
                <div className="text-sm">{edu.date}</div>
              </div>
              {edu.gpa && <div className="text-sm">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-base font-bold uppercase border-b border-black mb-2">Skills</h2>
          <div className="text-sm">
            {resume.skills?.technical && <div className="mb-1"><span className="font-semibold">Technical:</span> {resume.skills.technical.join(", ")}</div>}
            {resume.skills?.programming && <div className="mb-1"><span className="font-semibold">Programming:</span> {resume.skills.programming.join(", ")}</div>}
            {resume.skills?.tools && <div><span className="font-semibold">Tools:</span> {resume.skills.tools.join(", ")}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAcademicTemplate = () => (
    <div className="w-full bg-white text-black overflow-auto print:overflow-visible" id="resume-content">
      <div className="w-full md:max-w-[794px] mx-auto font-serif print:w-[794px] min-h-[1123px] p-8 md:p-12 bg-white shadow-lg print:shadow-none">
        {/* Header */}
        <div className="text-center border-b-2 pb-4 mb-6" style={{ borderColor: primaryColor }}>
          {isEditing ? (
            <EditableText value={editableResume.name || ""} onChange={v => updateField(["name"], v)} className="text-3xl font-bold text-center mb-2" />
          ) : (
            <h1 className="text-3xl font-bold mb-2">{resume.name}</h1>
          )}
          <div className="text-sm flex justify-center gap-4 flex-wrap">
            <span>{resume.email}</span>
            <span>•</span>
            <span>{resume.phone}</span>
            <span>•</span>
            <span>{resume.location}</span>
          </div>
        </div>

        {/* Education */}
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b mb-3" style={{ borderColor: primaryColor, color: primaryColor }}>Education</h2>
          <div className="space-y-3">
            {(isEditing ? editableResume.education : resume.education)?.map((edu, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <div className="font-bold">{edu.institution}</div>
                  <div className="italic">{edu.degree}</div>
                </div>
                <div className="text-right">
                  <div>{edu.location}</div>
                  <div className="italic">{edu.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b mb-3" style={{ borderColor: primaryColor, color: primaryColor }}>Experience</h2>
          <div className="space-y-4">
            {(isEditing ? editableResume.experience : resume.experience)?.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <div className="font-bold">{exp.company}</div>
                  <div className="italic">{exp.date}</div>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="italic">{exp.title}</div>
                  <div>{exp.location}</div>
                </div>
                <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                  {exp.description?.map((desc, j) => (
                    <li key={j}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b mb-3" style={{ borderColor: primaryColor, color: primaryColor }}>Skills</h2>
          <div className="text-sm">
            <span className="font-bold">Technical: </span>
            {resume.skills?.technical?.join(", ")}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreativeTemplate = () => (
    <div className="w-full bg-white text-gray-900 overflow-auto print:overflow-visible" id="resume-content">
      <div className="w-full md:max-w-[794px] mx-auto font-sans print:w-[794px] min-h-[1123px] bg-white shadow-lg print:shadow-none">
        {/* Header */}
        <div className="text-white p-8 md:p-12" style={{ backgroundColor: primaryColor }}>
          {isEditing ? (
            <EditableText value={editableResume.name || ""} onChange={v => updateField(["name"], v)} className="text-4xl md:text-5xl font-bold mb-4 text-white" />
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{resume.name}</h1>
          )}
          <div className="text-lg mb-6" style={{ color: 'rgba(255,255,255,0.8)' }}>{resume.experience?.[0]?.title || "Professional"}</div>
          <div className="flex flex-wrap gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {resume.email}</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {resume.phone}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {resume.location}</div>
          </div>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: primaryColor }}>
                <span className="w-8 h-1 block" style={{ backgroundColor: secondaryColor }}></span> PROFILE
              </h2>
              <p className="text-gray-600 leading-relaxed">{resume.summary}</p>
            </section>

            {/* Experience */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: primaryColor }}>
                <span className="w-8 h-1 block" style={{ backgroundColor: secondaryColor }}></span> EXPERIENCE
              </h2>
              <div className="space-y-8">
                {(isEditing ? editableResume.experience : resume.experience)?.map((exp, i) => (
                  <div key={i} className="relative pl-8 border-l-2" style={{ borderColor: accentColor }}>
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white" style={{ backgroundColor: secondaryColor }}></div>
                    <h3 className="font-bold text-gray-900 text-lg">{exp.title}</h3>
                    <div className="font-medium mb-2" style={{ color: secondaryColor }}>{exp.company} | {exp.date}</div>
                    <p className="text-gray-600 text-sm">{exp.description?.[0]}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Education */}
            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>EDUCATION</h2>
              <div className="space-y-4">
                {(isEditing ? editableResume.education : resume.education)?.map((edu, i) => (
                  <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: accentColor }}>
                    <div className="font-bold text-gray-900">{edu.institution}</div>
                    <div className="text-sm" style={{ color: secondaryColor }}>{edu.degree}</div>
                    <div className="text-gray-500 text-xs mt-1">{edu.date}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>SKILLS</h2>
              <div className="flex flex-wrap gap-2">
                {(isEditing ? editableResume.skills?.technical : resume.skills?.technical)?.map((skill, i) => (
                  <span key={i} className="bg-white border px-3 py-1 rounded-full text-sm font-medium shadow-sm" style={{ borderColor: accentColor, color: secondaryColor }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTechTemplate = () => (
    <div className="w-full bg-white text-gray-900 overflow-auto print:overflow-visible" id="resume-content">
      <div className="w-full md:max-w-[794px] mx-auto font-sans print:w-[794px] min-h-[1123px] p-8 bg-white shadow-lg print:shadow-none">
        {/* Header */}
        <div className="border-b-2 pb-6 mb-6" style={{ borderColor: primaryColor }}>
          <div className="flex justify-between items-end">
            <div>
              {isEditing ? (
                <EditableText value={editableResume.name || ""} onChange={v => updateField(["name"], v)} className="text-4xl font-bold uppercase tracking-tight text-gray-900 mb-2" />
              ) : (
                <h1 className="text-4xl font-bold uppercase tracking-tight text-gray-900 mb-2" style={{ color: primaryColor }}>{resume.name}</h1>
              )}
              {isEditing ? (
                <EditableText value={editableResume.summary || ""} onChange={v => updateField(["summary"], v)} multiline className="text-gray-600 max-w-xl" />
              ) : (
                <p className="text-gray-600 max-w-xl">{resume.summary}</p>
              )}
            </div>
            <div className="text-right text-sm space-y-1">
              {isEditing ? (
                <>
                  <EditableText value={editableResume.email || ""} onChange={v => updateField(["email"], v)} className="text-right" />
                  <EditableText value={editableResume.phone?.toString() || ""} onChange={v => updateField(["phone"], v)} className="text-right" />
                  <EditableText value={editableResume.location || ""} onChange={v => updateField(["location"], v)} className="text-right" />
                  <EditableText value={editableResume.linkedin || ""} onChange={v => updateField(["linkedin"], v)} className="text-right" />
                  <EditableText value={editableResume.github || ""} onChange={v => updateField(["github"], v)} className="text-right" />
                </>
              ) : (
                <>
                  {resume.email && <div className="flex items-center justify-end gap-2">{resume.email} <Mail className="w-3 h-3" /></div>}
                  {resume.phone && <div className="flex items-center justify-end gap-2">{resume.phone} <Phone className="w-3 h-3" /></div>}
                  {resume.location && <div className="flex items-center justify-end gap-2">{resume.location} <MapPin className="w-3 h-3" /></div>}
                  {resume.linkedin && <div className="flex items-center justify-end gap-2">LinkedIn <Linkedin className="w-3 h-3" /></div>}
                  {resume.github && <div className="flex items-center justify-end gap-2">GitHub <Github className="w-3 h-3" /></div>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Skills - Top for Tech */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3 border-b pb-1" style={{ color: secondaryColor, borderColor: accentColor }}>Technical Skills</h2>
          <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <div className="font-semibold text-gray-700">Languages:</div>
            <div>{isEditing ? editableResume.skills?.programming?.join(", ") : resume.skills?.programming?.join(", ")}</div>
            
            <div className="font-semibold text-gray-700">Technologies:</div>
            <div>{isEditing ? editableResume.skills?.technical?.join(", ") : resume.skills?.technical?.join(", ")}</div>
            
            <div className="font-semibold text-gray-700">Tools:</div>
            <div>{isEditing ? editableResume.skills?.tools?.join(", ") : resume.skills?.tools?.join(", ")}</div>
          </div>
        </div>

        {/* Experience */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b pb-1" style={{ color: secondaryColor, borderColor: accentColor }}>Experience</h2>
          <div className="space-y-6">
            {(isEditing ? editableResume.experience : resume.experience)?.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-lg text-gray-900">{exp.title}</h3>
                  <span className="text-sm font-medium" style={{ color: primaryColor }}>{exp.date}</span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <div className="text-base font-medium text-gray-700">{exp.company}</div>
                  <div className="text-xs text-gray-500">{exp.location}</div>
                </div>
                <ul className="list-disc list-outside ml-4 text-sm text-gray-600 space-y-1">
                  {exp.description?.map((desc, j) => (
                    <li key={j}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b pb-1" style={{ color: secondaryColor, borderColor: accentColor }}>Projects</h2>
          <div className="space-y-4">
            {(isEditing ? editableResume.projects : resume.projects)?.map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base text-gray-900">{proj.name}</h3>
                  <div className="flex gap-2">
                    {proj.technologies?.map((tech, j) => (
                      <span key={j} className="text-xs px-1.5 py-0.5 rounded border" style={{ borderColor: accentColor, color: secondaryColor }}>{tech}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{proj.description}</p>
                {proj.link && <a href={proj.link} className="text-xs hover:underline mt-1 block" style={{ color: primaryColor }}>View Project &rarr;</a>}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b pb-1" style={{ color: secondaryColor, borderColor: accentColor }}>Education</h2>
          <div className="space-y-4">
            {(isEditing ? editableResume.education : resume.education)?.map((edu, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <div className="font-bold text-gray-900">{edu.institution}</div>
                  <div className="text-sm text-gray-700">{edu.degree}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: primaryColor }}>{edu.date}</div>
                  <div className="text-xs text-gray-500">{edu.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNITPatnaTemplate = () => (
    <div className="w-full bg-white text-black overflow-auto print:overflow-visible" id="resume-content">
      <div className="w-full md:max-w-[794px] mx-auto font-serif print:w-[794px] min-h-[1123px] p-6 bg-white shadow-lg print:shadow-none">
        {/* Header with Name */}
        <div className="text-center mb-3">
          {isEditing ? (
            <EditableText value={editableResume.name || ""} onChange={v => updateField(["name"], v)} className="text-2xl font-bold text-center uppercase" />
          ) : (
            <h1 className="text-2xl font-bold uppercase">{resume.name}</h1>
          )}
        </div>

        {/* Contact Info - Single Line */}
        <div className="text-center text-xs mb-4 border-b border-t border-black py-1">
          {isEditing ? (
            <div className="flex justify-center gap-2 flex-wrap">
              <EditableText value={editableResume.email || ""} onChange={v => updateField(["email"], v)} className="text-center" />
              <span>|</span>
              <EditableText value={editableResume.phone?.toString() || ""} onChange={v => updateField(["phone"], v)} className="text-center" />
              <span>|</span>
              <EditableText value={editableResume.linkedin || ""} onChange={v => updateField(["linkedin"], v)} className="text-center" />
              <span>|</span>
              <EditableText value={editableResume.github || ""} onChange={v => updateField(["github"], v)} className="text-center" />
            </div>
          ) : (
            <div>
              {resume.email} | {resume.phone} | {resume.linkedin} | {resume.github}
            </div>
          )}
        </div>

        {/* Education Section */}
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase mb-2 border-b border-black">Education</h2>
          <div className="space-y-2">
            {(isEditing ? editableResume.education : resume.education)?.map((edu, i) => (
              <div key={i} className={isEditing ? "border border-dashed border-blue-300 p-2 rounded hover:bg-blue-50" : ""}>
                <div className="flex justify-between text-xs">
                  <div className="flex-1">
                    {isEditing ? (
                      <>
                        <EditableText value={edu.institution || ""} onChange={v => updateField(["education", i, "institution"], v)} className="font-bold" />
                        <EditableText value={edu.location || ""} onChange={v => updateField(["education", i, "location"], v)} className="ml-2 text-gray-600" />
                      </>
                    ) : (
                      <>
                        <span className="font-bold">{edu.institution}</span>
                        <span className="ml-2 text-gray-600">{edu.location}</span>
                      </>
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <EditableText value={edu.date || ""} onChange={v => updateField(["education", i, "date"], v)} className="font-semibold" />
                    ) : (
                      <span className="font-semibold">{edu.date}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs italic">
                  {isEditing ? (
                    <EditableText value={edu.degree || ""} onChange={v => updateField(["education", i, "degree"], v)} />
                  ) : (
                    edu.degree
                  )}
                </div>
                {(isEditing || edu.gpa) && (
                  <div className="text-xs">
                    {isEditing ? (
                      <>CGPA: <EditableText value={edu.gpa || ""} onChange={v => updateField(["education", i, "gpa"], v)} className="inline-block w-20" /></>
                    ) : (
                      <>CGPA: {edu.gpa}</>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase mb-2 border-b border-black">Experience</h2>
          <div className="space-y-3">
            {(isEditing ? editableResume.experience : resume.experience)?.map((exp, i) => (
              <div key={i} className={isEditing ? "border border-dashed border-blue-300 p-2 rounded hover:bg-blue-50" : ""}>
                <div className="flex justify-between text-xs">
                  <div className="flex-1">
                    {isEditing ? (
                      <>
                        <EditableText value={exp.title || ""} onChange={v => updateField(["experience", i, "title"], v)} className="font-bold" />
                        <span className="mx-1">|</span>
                        <EditableText value={exp.company || ""} onChange={v => updateField(["experience", i, "company"], v)} className="italic" />
                      </>
                    ) : (
                      <>
                        <span className="font-bold">{exp.title}</span>
                        <span className="mx-1">|</span>
                        <span className="italic">{exp.company}</span>
                      </>
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <EditableText value={exp.date || ""} onChange={v => updateField(["experience", i, "date"], v)} className="font-semibold" />
                    ) : (
                      <span className="font-semibold">{exp.date}</span>
                    )}
                  </div>
                </div>
                <ul className="list-disc ml-4 text-xs space-y-0.5">
                  {exp.description?.map((desc, j) => (
                    <li key={j}>
                      {isEditing ? (
                        <EditableText value={desc} onChange={v => updateField(["experience", i, "description", j], v)} multiline />
                      ) : (
                        desc
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase mb-2 border-b border-black">Projects</h2>
          <div className="space-y-2">
            {(isEditing ? editableResume.projects : resume.projects)?.map((proj, i) => (
              <div key={i} className={isEditing ? "border border-dashed border-blue-300 p-2 rounded hover:bg-blue-50" : ""}>
                <div className="text-xs">
                  {isEditing ? (
                    <>
                      <EditableText value={proj.name || ""} onChange={v => updateField(["projects", i, "name"], v)} className="font-bold" />
                      {(isEditing || proj.link) && (
                        <>
                          <span className="mx-1">|</span>
                          <EditableText value={proj.link || ""} onChange={v => updateField(["projects", i, "link"], v)} className="underline" />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="font-bold">{proj.name}</span>
                      {proj.link && (
                        <>
                          <span className="mx-1">|</span>
                          <a href={proj.link} className="underline">{proj.link}</a>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className="text-xs">
                  {isEditing ? (
                    <EditableText value={proj.description || ""} onChange={v => updateField(["projects", i, "description"], v)} multiline />
                  ) : (
                    proj.description
                  )}
                </div>
                {(isEditing || proj.technologies) && (
                  <div className="text-xs italic">
                    {isEditing ? (
                      <>Tech Stack: <EditableText value={proj.technologies?.join(", ") || ""} onChange={v => updateField(["projects", i, "technologies"], v.split(",").map(s => s.trim()))} /></>
                    ) : (
                      <>Tech Stack: {proj.technologies?.join(", ")}</>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Skills */}
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase mb-2 border-b border-black">Technical Skills</h2>
          <div className="text-xs space-y-1">
            {(isEditing || resume.skills?.programming) && (
              <div className={isEditing ? "border border-dashed border-blue-300 p-2 rounded hover:bg-blue-50" : ""}>
                <span className="font-semibold">Languages:</span>{" "}
                {isEditing ? (
                  <EditableText value={editableResume.skills?.programming?.join(", ") || ""} onChange={v => updateField(["skills", "programming"], v.split(",").map(s => s.trim()))} />
                ) : (
                  resume.skills?.programming?.join(", ")
                )}
              </div>
            )}
            {(isEditing || resume.skills?.technical) && (
              <div className={isEditing ? "border border-dashed border-blue-300 p-2 rounded hover:bg-blue-50" : ""}>
                <span className="font-semibold">Technologies:</span>{" "}
                {isEditing ? (
                  <EditableText value={editableResume.skills?.technical?.join(", ") || ""} onChange={v => updateField(["skills", "technical"], v.split(",").map(s => s.trim()))} />
                ) : (
                  resume.skills?.technical?.join(", ")
                )}
              </div>
            )}
            {(isEditing || resume.skills?.tools) && (
              <div className={isEditing ? "border border-dashed border-blue-300 p-2 rounded hover:bg-blue-50" : ""}>
                <span className="font-semibold">Tools:</span>{" "}
                {isEditing ? (
                  <EditableText value={editableResume.skills?.tools?.join(", ") || ""} onChange={v => updateField(["skills", "tools"], v.split(",").map(s => s.trim()))} />
                ) : (
                  resume.skills?.tools?.join(", ")
                )}
              </div>
            )}
          </div>
        </div>

        {/* Achievements/Certifications */}
        {(isEditing || (resume.certifications && resume.certifications.length > 0)) && (
          <div>
            <h2 className="text-sm font-bold uppercase mb-2 border-b border-black">Achievements & Certifications</h2>
            <ul className="list-disc ml-4 text-xs space-y-0.5">
              {(isEditing ? editableResume.certifications : resume.certifications)?.map((cert, i) => (
                <li key={i} className={isEditing ? "border border-dashed border-blue-300 p-1 rounded hover:bg-blue-50" : ""}>
                  {isEditing ? (
                    <>
                      <EditableText value={cert.name || ""} onChange={v => updateField(["certifications", i, "name"], v)} /> - <EditableText value={cert.issuer || ""} onChange={v => updateField(["certifications", i, "issuer"], v)} />
                    </>
                  ) : (
                    <>{cert.name} - {cert.issuer}</>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  // Main Render Switch - Each template maps to ONE specific layout
  console.log('ResumePreview rendering template:', template);
  
  switch (true) {
    // Tech/Engineering Templates - Clean single-column with skills at top
    case template === 'software-engineering-resume':
    case template === 'it-manager-cv':
      return renderTechTemplate();

    // Deedy Resume - Two-column with dark sidebar
    case template === 'deedy-resume':
      return renderDeedyTemplate();

    // Modern Templates - Sidebar with modern design  
    case template === 'blue-white-modern-professional':
    case template.includes('modern'):
      return renderModernTemplate();

    // Black & White Professional - Clean ATS-friendly
    case template === 'black-white-professional':
      return renderBlackWhiteTemplate();
    
    // Academic Templates - Traditional academic format
    case template === 'nit-patna-resume':
      return renderNITPatnaTemplate();
    
    case template === 'autocv-template':
    case template.includes('academic'):
      return renderAcademicTemplate();

    // Creative Templates - Bold creative design
    case template === 'altacv-template':
    case template === 'blue-black-geometric-creative':
    case template.includes('creative'):
      return renderCreativeTemplate();

    // Professional/Corporate Templates (Default) - Clean professional
    default:
      return renderProfessionalTemplate();
  }
});

ResumePreview.displayName = 'ResumePreview';