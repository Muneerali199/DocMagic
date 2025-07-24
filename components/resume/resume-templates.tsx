import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, X, Download, Edit, Palette, Sparkles, Star, Zap, FileText, Briefcase, GraduationCap, Code, Award, Link as LinkIcon, Github, Linkedin, Globe, Mail, Phone, MapPin, User } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateWordDocument, formatResumeForWord } from "@/lib/word-export";

interface ResumeTemplatesProps {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
  onEditTemplate: (template: string) => void;
  onDownloadTemplate: (template: string) => void;
}

export function ResumeTemplates({
  selectedTemplate,
  onSelectTemplate,
  onEditTemplate,
  onDownloadTemplate,
}: ResumeTemplatesProps) {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [customTemplate, setCustomTemplate] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  const templates = [
    {
      id: "professional",
      name: "Professional",
      description: "Timeless design for corporate environments",
      preview: "bg-gradient-to-br from-white to-gray-50",
      accentColor: "from-gray-700 to-gray-900",
      textColor: "text-gray-800",
      bgColor: "bg-white",
      borderColor: "border-gray-200",
      isPremium: false,
      features: ["Clean Layout", "Corporate Style", "ATS Optimized"]
    },
    {
      id: "modern",
      name: "Modern",
      description: "Sleek contemporary layout with visual hierarchy",
      preview: "bg-gradient-to-br from-white to-blue-50",
      accentColor: "from-blue-500 to-blue-700",
      textColor: "text-blue-800",
      bgColor: "bg-white",
      borderColor: "border-blue-100",
      isPremium: false,
      features: ["Bold Headers", "Modern Design", "Visual Emphasis"]
    },
    {
      id: "creative",
      name: "Creative",
      description: "Bold design for portfolios and creative fields",
      preview: "bg-gradient-to-br from-white to-purple-50",
      accentColor: "from-purple-500 to-purple-700",
      textColor: "text-purple-800",
      bgColor: "bg-white",
      borderColor: "border-purple-100",
      isPremium: true,
      features: ["Unique Layout", "Visual Impact", "Creative Focus"]
    },
    {
      id: "minimalist",
      name: "Minimalist",
      description: "Clean aesthetics with maximum readability",
      preview: "bg-gradient-to-br from-white to-gray-100",
      accentColor: "from-gray-400 to-gray-600",
      textColor: "text-gray-700",
      bgColor: "bg-white",
      borderColor: "border-gray-150",
      isPremium: false,
      features: ["Minimal Design", "Maximum Content", "Perfect Spacing"]
    },
    {
      id: "executive",
      name: "Executive",
      description: "Sophisticated design for senior positions",
      preview: "bg-gradient-to-br from-white to-amber-50",
      accentColor: "from-amber-600 to-amber-800",
      textColor: "text-amber-900",
      bgColor: "bg-white",
      borderColor: "border-amber-200",
      isPremium: true,
      features: ["Executive Style", "Leadership Focus", "Premium Look"]
    },
    {
      id: "technical",
      name: "Technical",
      description: "Optimized for technical roles and skills",
      preview: "bg-gradient-to-br from-white to-emerald-50",
      accentColor: "from-emerald-600 to-emerald-800",
      textColor: "text-emerald-900",
      bgColor: "bg-white",
      borderColor: "border-emerald-200",
      isPremium: true,
      features: ["Skills Emphasis", "Technical Focus", "Code-Friendly"]
    }
  ];

  const sampleResumeData = {
    name: "Alexandra Chen",
    title: "Senior UX Designer",
    contact: {
      email: "alex.chen@example.com",
      phone: "(415) 555-0192",
      location: "San Francisco, CA",
      portfolio: "alexchen.design"
    },
    summary: "Innovative designer with 8+ years of experience creating user-centered digital products. Specialized in SaaS platforms and mobile applications with a focus on accessibility and inclusive design.",
    experience: [
      {
        role: "Lead UX Designer",
        company: "TechSolutions Inc.",
        period: "2020 - Present",
        details: [
          "Led redesign of flagship product that increased user retention by 32%",
          "Managed team of 5 designers across 3 product verticals",
          "Implemented design system used by 50+ product teams"
        ]
      },
      {
        role: "UI/UX Designer",
        company: "DigitalAgency LLC",
        period: "2017 - 2020",
        details: [
          "Designed 15+ client websites with average 4.8/5 satisfaction score",
          "Created wireframes and prototypes for enterprise applications",
          "Conducted user research and usability testing sessions"
        ]
      }
    ],
    education: [
      {
        degree: "M.Sc. Human-Computer Interaction",
        institution: "Stanford University",
        year: "2016"
      },
      {
        degree: "B.A. Graphic Design",
        institution: "California College of Arts",
        year: "2014"
      }
    ],
    skills: [
      "User Research", "Figma", "Prototyping", 
      "Design Systems", "Accessibility", "UX Writing",
      "HTML/CSS", "User Testing", "Information Architecture"
    ],
    projects: [
      {
        name: "Healthcare Portal Redesign",
        description: "Redesigned patient portal for major hospital system, improving completion rates by 45%"
      },
      {
        name: "Mobile Banking App",
        description: "Led design for award-winning financial app with 1M+ downloads"
      }
    ],
    links: {
      linkedin: "linkedin.com/in/alexchen",
      github: "github.com/alexchen",
      website: "alexchen.design",
      portfolio: "behance.net/alexchen"
    }
  };

  const initializeCustomTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setCustomTemplate({
      id: template.id,
      name: template.name,
      colors: {
        primary: template.id === 'professional' ? '#1f2937' : 
                template.id === 'modern' ? '#1e40af' : 
                template.id === 'creative' ? '#7e22ce' : 
                template.id === 'minimalist' ? '#4b5563' : 
                template.id === 'executive' ? '#92400e' : '#047857',
        secondary: template.id === 'professional' ? '#4b5563' : 
                  template.id === 'modern' ? '#3b82f6' : 
                  template.id === 'creative' ? '#a855f7' : 
                  template.id === 'minimalist' ? '#9ca3af' : 
                  template.id === 'executive' ? '#d97706' : '#10b981',
        background: '#ffffff',
        text: template.id === 'professional' ? '#111827' : 
              template.id === 'modern' ? '#1e3a8a' : 
              template.id === 'creative' ? '#581c87' : 
              template.id === 'minimalist' ? '#374151' : 
              template.id === 'executive' ? '#78350f' : '#064e3b',
        accent: template.id === 'professional' ? '#e5e7eb' : 
               template.id === 'modern' ? '#dbeafe' : 
               template.id === 'creative' ? '#f3e8ff' : 
               template.id === 'minimalist' ? '#f3f4f6' : 
               template.id === 'executive' ? '#fef3c7' : '#d1fae5'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        size: 'medium'
      },
      layout: {
        headerStyle: template.id === 'professional' ? 'classic' : 
                    template.id === 'modern' ? 'modern' : 
                    template.id === 'creative' ? 'creative' : 
                    template.id === 'minimalist' ? 'minimal' : 
                    template.id === 'executive' ? 'executive' : 'technical',
        sectionStyle: template.id === 'professional' ? 'bordered' : 
                     template.id === 'modern' ? 'gradient' : 
                     template.id === 'creative' ? 'timeline' : 
                     template.id === 'minimalist' ? 'simple' : 
                     template.id === 'executive' ? 'elegant' : 'technical',
        columns: template.id === 'professional' || template.id === 'executive' ? 'two' : 'one'
      },
      sections: {
        summary: true,
        experience: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        links: true
      }
    });
  };

  const renderProfessionalTemplate = () => (
    <div className={cn("p-8 h-full", "bg-white")} id="resume-preview">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800">
              {sampleResumeData.name}
            </h1>
            <p className="text-lg text-gray-600 mt-1">{sampleResumeData.title}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm">{sampleResumeData.contact.email}</p>
            <p className="text-sm">{sampleResumeData.contact.phone}</p>
            <p className="text-sm">{sampleResumeData.contact.location}</p>
          </div>
        </div>

        <div className="h-px w-full my-6 bg-gradient-to-r from-gray-700 to-gray-900" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 text-gray-800">
                Professional Summary
              </h2>
              <p className="text-gray-700">{sampleResumeData.summary}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 text-gray-800">
                Work Experience
              </h2>
              <div className="space-y-6">
                {sampleResumeData.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                      <p className="text-sm text-gray-500">{exp.period}</p>
                    </div>
                    <p className="text-gray-600 italic mb-2">{exp.company}</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      {exp.details.map((detail, j) => (
                        <li key={j}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 text-gray-800">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {sampleResumeData.skills.map((skill, i) => (
                  <span 
                    key={i}
                    className={
                      i % 3 === 0 
                        ? "px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800" 
                        : i % 3 === 1
                          ? "px-3 py-1 rounded-full text-sm bg-gradient-to-r from-gray-700 to-gray-900 text-white"
                          : "px-3 py-1 rounded-full text-sm bg-white border text-gray-700"
                    }
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 text-gray-800">
                Education
              </h2>
              <div className="space-y-4">
                {sampleResumeData.education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 text-gray-800">
                Key Projects
              </h2>
              <div className="space-y-3">
                {sampleResumeData.projects.map((project, i) => (
                  <div key={i}>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 text-gray-800">
                Professional Links
              </h2>
              <div className="space-y-2">
                {Object.entries(sampleResumeData.links).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    {key === 'linkedin' && <Linkedin className="h-4 w-4 text-blue-600" />}
                    {key === 'github' && <Github className="h-4 w-4 text-gray-800" />}
                    {key === 'website' && <Globe className="h-4 w-4 text-green-600" />}
                    {key === 'portfolio' && <Briefcase className="h-4 w-4 text-purple-600" />}
                    <a href={`https://${value}`} className="text-sm text-gray-700 hover:underline">{value}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModernTemplate = () => (
    <div className="p-8 h-full bg-white" id="resume-preview">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 rounded-lg mb-8 bg-gradient-to-r from-blue-500 to-blue-700">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {sampleResumeData.name}
          </h1>
          <p className="text-white/90 mt-1">{sampleResumeData.title}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-blue-500" />
            <span>{sampleResumeData.contact.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-blue-500" />
            <span>{sampleResumeData.contact.phone}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
            <span>{sampleResumeData.contact.location}</span>
          </div>
          <div className="flex items-center">
            <Globe className="h-4 w-4 mr-2 text-blue-500" />
            <span>{sampleResumeData.contact.portfolio}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                <span className="w-8 h-1 mr-3 inline-block bg-gradient-to-r from-blue-500 to-blue-700"></span>
                About Me
              </h2>
              <p className="text-gray-700">{sampleResumeData.summary}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                <span className="w-8 h-1 mr-3 inline-block bg-gradient-to-r from-blue-500 to-blue-700"></span>
                Experience
              </h2>
              <div className="space-y-6">
                {sampleResumeData.experience.map((exp, i) => (
                  <div key={i} className="border-l-4 pl-4 border-blue-500">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                      <p className="text-sm text-gray-500">{exp.period}</p>
                    </div>
                    <p className="text-gray-600 font-medium mb-2">{exp.company}</p>
                    <ul className="list-[square] pl-5 space-y-1.5 text-gray-700">
                      {exp.details.map((detail, j) => (
                        <li key={j}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                <span className="w-8 h-1 mr-3 inline-block bg-gradient-to-r from-blue-500 to-blue-700"></span>
                Skills
              </h2>
              <div className="space-y-2">
                {sampleResumeData.skills.map((skill, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                <span className="w-8 h-1 mr-3 inline-block bg-gradient-to-r from-blue-500 to-blue-700"></span>
                Education
              </h2>
              <div className="space-y-4">
                {sampleResumeData.education.map((edu, i) => (
                  <div key={i} className="border-l-4 pl-4 border-blue-500">
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                <span className="w-8 h-1 mr-3 inline-block bg-gradient-to-r from-blue-500 to-blue-700"></span>
                Projects
              </h2>
              <div className="space-y-3">
                {sampleResumeData.projects.map((project, i) => (
                  <div key={i}>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                <span className="w-8 h-1 mr-3 inline-block bg-gradient-to-r from-blue-500 to-blue-700"></span>
                Connect
              </h2>
              <div className="space-y-2">
                {Object.entries(sampleResumeData.links).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    {key === 'linkedin' && <Linkedin className="h-4 w-4 text-blue-600" />}
                    {key === 'github' && <Github className="h-4 w-4 text-gray-800" />}
                    {key === 'website' && <Globe className="h-4 w-4 text-green-600" />}
                    {key === 'portfolio' && <Briefcase className="h-4 w-4 text-purple-600" />}
                    <a href={`https://${value}`} className="text-sm text-blue-600 hover:underline">{value}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreativeTemplate = () => (
    <div className="p-8 h-full bg-white" id="resume-preview">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-purple-800">
              {sampleResumeData.name}
            </h1>
            <div className="text-2xl font-medium mb-4 text-purple-800">
              {sampleResumeData.title}
            </div>
            <p className="text-gray-700">{sampleResumeData.summary}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-purple-600" />
              <span>{sampleResumeData.contact.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-purple-600" />
              <span>{sampleResumeData.contact.phone}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-600" />
              <span>{sampleResumeData.contact.location}</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-purple-600" />
              <span>{sampleResumeData.contact.portfolio}</span>
            </div>
          </div>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-purple-100"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-lg font-medium text-purple-800">
              Professional Journey
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-purple-800">
                Expertise
              </h2>
              <div className="space-y-3">
                {sampleResumeData.skills.map((skill, i) => (
                  <div key={i}>
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full mr-2 bg-gradient-to-r from-purple-500 to-purple-700"></div>
                      <span className="font-medium text-gray-900">{skill}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-700" 
                        style={{ width: `${70 + (i * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-purple-800">
                Education
              </h2>
              <div className="space-y-4">
                {sampleResumeData.education.map((edu, i) => (
                  <div key={i} className="pl-4 border-l-4 border-purple-500">
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4 text-purple-800">
                Connect
              </h2>
              <div className="space-y-2">
                {Object.entries(sampleResumeData.links).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    {key === 'linkedin' && <Linkedin className="h-5 w-5 text-purple-600" />}
                    {key === 'github' && <Github className="h-5 w-5 text-purple-600" />}
                    {key === 'website' && <Globe className="h-5 w-5 text-purple-600" />}
                    {key === 'portfolio' && <Briefcase className="h-5 w-5 text-purple-600" />}
                    <a href={`https://${value}`} className="text-sm text-purple-600 hover:underline">{value}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-purple-800">
                Work Experience
              </h2>
              <div className="space-y-8">
                {sampleResumeData.experience.map((exp, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-purple-500 bg-white"></div>
                    <div className="absolute left-[15px] h-full w-0.5 bg-purple-300"></div>
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">{exp.role}</h3>
                        <p className="text-sm text-gray-500">{exp.period}</p>
                      </div>
                      <p className="text-lg font-medium mb-3 text-purple-800">
                        {exp.company}
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {exp.details.map((detail, j) => (
                          <li key={j}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 text-purple-800">
                Notable Projects
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {sampleResumeData.projects.map((project, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-lg border border-purple-100 bg-white"
                  >
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimalistTemplate = () => (
    <div className="p-8 h-full bg-white" id="resume-preview">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-light tracking-wide text-gray-900">
            {sampleResumeData.name}
          </h1>
          <p className="text-gray-500 mt-1">{sampleResumeData.title}</p>
        </div>

        <div className="h-px w-full my-8 bg-gradient-to-r from-gray-400 to-gray-600" />

        <div className="space-y-10">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-1 text-gray-400" />
              <span>{sampleResumeData.contact.email}</span>
            </div>
            <span>•</span>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-1 text-gray-400" />
              <span>{sampleResumeData.contact.phone}</span>
            </div>
            <span>•</span>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              <span>{sampleResumeData.contact.location}</span>
            </div>
            <span>•</span>
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-1 text-gray-400" />
              <span>{sampleResumeData.contact.portfolio}</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-normal mb-3 tracking-wider text-gray-700">
              PROFILE
            </h2>
            <p className="text-gray-700 leading-relaxed">{sampleResumeData.summary}</p>
          </div>

          <div>
            <h2 className="text-lg font-normal mb-3 tracking-wider text-gray-700">
              EXPERIENCE
            </h2>
            <div className="space-y-6">
              {sampleResumeData.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <h3 className="font-normal text-gray-900">{exp.role}</h3>
                    <p className="text-sm text-gray-500">{exp.period}</p>
                  </div>
                  <p className="text-gray-600 mb-2">{exp.company}</p>
                  <div className="space-y-1 text-gray-700">
                    {exp.details.map((detail, j) => (
                      <p key={j}>• {detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-normal mb-3 tracking-wider text-gray-700">
                EDUCATION
              </h2>
              <div className="space-y-4">
                {sampleResumeData.education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-normal mb-3 tracking-wider text-gray-700">
                SKILLS
              </h2>
              <div className="flex flex-wrap gap-2">
                {sampleResumeData.skills.map((skill, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 text-sm text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-normal mb-3 tracking-wider text-gray-700">
              LINKS
            </h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(sampleResumeData.links).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  {key === 'linkedin' && <Linkedin className="h-4 w-4 text-gray-500" />}
                  {key === 'github' && <Github className="h-4 w-4 text-gray-500" />}
                  {key === 'website' && <Globe className="h-4 w-4 text-gray-500" />}
                  {key === 'portfolio' && <Briefcase className="h-4 w-4 text-gray-500" />}
                  <a href={`https://${value}`} className="text-sm text-gray-700 hover:underline">{value}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExecutiveTemplate = () => (
    <div className="p-8 h-full bg-white" id="resume-preview">
      <div className="max-w-4xl mx-auto">
        <div className="border-b-4 border-amber-700 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-amber-900">
            {sampleResumeData.name}
          </h1>
          <p className="text-xl text-amber-800 mt-2 font-medium">{sampleResumeData.title}</p>
          
          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-amber-700" />
              <span>{sampleResumeData.contact.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-amber-700" />
              <span>{sampleResumeData.contact.phone}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-amber-700" />
              <span>{sampleResumeData.contact.location}</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-amber-700" />
              <span>{sampleResumeData.contact.portfolio}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-amber-900 mb-4 border-b-2 border-amber-200 pb-2">
                Executive Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{sampleResumeData.summary}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-amber-900 mb-4 border-b-2 border-amber-200 pb-2">
                Leadership Experience
              </h2>
              <div className="space-y-6">
                {sampleResumeData.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-gray-900 text-lg">{exp.role}</h3>
                      <p className="text-amber-800 font-medium">{exp.period}</p>
                    </div>
                    <p className="text-amber-900 font-semibold mb-2">{exp.company}</p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {exp.details.map((detail, j) => (
                        <li key={j}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-amber-900 mb-4 border-b-2 border-amber-200 pb-2">
                Key Projects & Initiatives
              </h2>
              <div className="space-y-4">
                {sampleResumeData.projects.map((project, i) => (
                  <div key={i} className="border-l-4 border-amber-300 pl-4">
                    <h3 className="font-bold text-gray-900">{project.name}</h3>
                    <p className="text-gray-700">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
              <h2 className="text-xl font-bold text-amber-900 mb-4 border-b-2 border-amber-200 pb-2">
                Core Competencies
              </h2>
              <div className="space-y-2">
                {sampleResumeData.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-700"></div>
                    <span className="text-gray-800">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-amber-900 mb-4 border-b-2 border-amber-200 pb-2">
                Education
              </h2>
              <div className="space-y-4">
                {sampleResumeData.education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.institution}</p>
                    <p className="text-amber-800">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-amber-900 mb-4 border-b-2 border-amber-200 pb-2">
                Professional Network
              </h2>
              <div className="space-y-3">
                {Object.entries(sampleResumeData.links).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    {key === 'linkedin' && <Linkedin className="h-4 w-4 text-amber-700" />}
                    {key === 'github' && <Github className="h-4 w-4 text-amber-700" />}
                    {key === 'website' && <Globe className="h-4 w-4 text-amber-700" />}
                    {key === 'portfolio' && <Briefcase className="h-4 w-4 text-amber-700" />}
                    <a href={`https://${value}`} className="text-gray-800 hover:text-amber-800 hover:underline">{value}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTechnicalTemplate = () => (
    <div className="p-8 h-full bg-white" id="resume-preview">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b-2 border-emerald-200">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">
              {sampleResumeData.name}
            </h1>
            <p className="text-lg text-emerald-700 mt-1">{sampleResumeData.title}</p>
          </div>
          <div className="mt-4 md:mt-0 space-y-1 text-right">
            <div className="flex items-center justify-end gap-2">
              <Mail className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">{sampleResumeData.contact.email}</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Phone className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">{sampleResumeData.contact.phone}</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">{sampleResumeData.contact.location}</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Globe className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">{sampleResumeData.contact.portfolio}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <h2 className="text-lg font-bold text-emerald-800 mb-3 flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Technical Skills
              </h2>
              <div className="space-y-3">
                {sampleResumeData.skills.map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{skill}</span>
                      <span className="text-xs text-emerald-700">{90 - (i * 5)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-emerald-600 h-1.5 rounded-full" 
                        style={{ width: `${90 - (i * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-3 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education
              </h2>
              <div className="space-y-4">
                {sampleResumeData.education.map((edu, i) => (
                  <div key={i} className="border-l-2 border-emerald-300 pl-3">
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    <p className="text-xs text-emerald-700">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-3 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2" />
                Online Profiles
              </h2>
              <div className="space-y-2">
                {Object.entries(sampleResumeData.links).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    {key === 'linkedin' && <Linkedin className="h-4 w-4 text-emerald-700" />}
                    {key === 'github' && <Github className="h-4 w-4 text-emerald-700" />}
                    {key === 'website' && <Globe className="h-4 w-4 text-emerald-700" />}
                    {key === 'portfolio' && <Briefcase className="h-4 w-4 text-emerald-700" />}
                    <a href={`https://${value}`} className="text-sm text-emerald-700 hover:underline">{value}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Professional Summary
              </h2>
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <p className="text-gray-700">{sampleResumeData.summary}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-3 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Work Experience
              </h2>
              <div className="space-y-5">
                {sampleResumeData.experience.map((exp, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-emerald-100">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                      <p className="text-xs text-emerald-700 font-medium">{exp.period}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      {exp.details.map((detail, j) => (
                        <li key={j}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-3 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Technical Projects
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sampleResumeData.projects.map((project, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-emerald-100">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {['React', 'Node.js', 'TypeScript'].map((tech, j) => (
                        <span key={j} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFullPreview = (templateId: string) => {
    const TemplateComponents = {
      professional: renderProfessionalTemplate(),
      modern: renderModernTemplate(),
      creative: renderCreativeTemplate(),
      minimalist: renderMinimalistTemplate(),
      executive: renderExecutiveTemplate(),
      technical: renderTechnicalTemplate()
    };

    return (
      <div className="w-full h-full">
        {TemplateComponents[templateId as keyof typeof TemplateComponents] || 
         TemplateComponents.professional}
      </div>
    );
  };

  const handleUseTemplate = () => {
    if (previewTemplate) {
      onSelectTemplate(previewTemplate);
      setPreviewTemplate(null);
      router.push('/resume/edit'); // Navigate to edit page
    }
  };

  const handleCustomizeTemplate = () => {
    if (previewTemplate) {
      initializeCustomTemplate(previewTemplate);
      setIsCustomizing(true);
    }
  };

  const handleSaveCustomTemplate = () => {
    if (customTemplate) {
      // Here you would save the customized template
      onSelectTemplate(customTemplate.id);
      setIsCustomizing(false);
      setPreviewTemplate(null);
      
      toast({
        title: "Template customized!",
        description: "Your custom template has been saved.",
      });
    }
  };

  const exportToPDF = async () => {
    if (!previewTemplate) return;
    
    setIsExporting(true);
    
    try {
      const element = document.getElementById('resume-preview');
      if (!element) throw new Error('Preview element not found');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate ratio to fit the image within the PDF
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`resume-${previewTemplate}.pdf`);
      
      toast({
        title: "PDF Exported!",
        description: "Your resume has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export failed",
        description: "Failed to export resume to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToWord = async () => {
    if (!previewTemplate) return;
    
    setIsExporting(true);
    
    try {
      // For template preview, we need to create a sample resume data
      const sampleResume = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        summary: "Experienced software engineer with expertise in modern web technologies and cloud platforms.",
        experience: [
          {
            title: "Senior Software Engineer",
            company: "Tech Corp",
            location: "San Francisco, CA",
            date: "2020 - Present",
            description: [
              "• Led development of scalable web applications",
              "• Mentored junior developers and conducted code reviews",
              "• Implemented CI/CD pipelines and automated testing"
            ]
          }
        ],
        education: [
          {
            degree: "Bachelor of Science in Computer Science",
            institution: "University of California",
            location: "Berkeley, CA",
            date: "2018",
            gpa: "3.8/4.0"
          }
        ],
        skills: {
          technical: ["JavaScript", "TypeScript", "React", "Node.js"],
          programming: ["Python", "Java", "Go"],
          tools: ["Docker", "AWS", "Git", "Jenkins"],
          soft: ["Leadership", "Communication", "Problem Solving"]
        }
      };
      
      const wordData = formatResumeForWord(sampleResume);
      const blob = await generateWordDocument(wordData, 'resume');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-template-${previewTemplate}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Template exported!",
        description: "Your resume template has been downloaded as a Word document.",
      });
    } catch (error) {
      console.error('Error exporting to Word:', error);
      toast({
        title: "Export failed",
        description: "Failed to export template to Word. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const renderCustomizationPanel = () => {
    if (!customTemplate) return null;
    
    return (
      <div className="space-y-6">
        <Tabs defaultValue="colors">
          <TabsList className="w-full">
            <TabsTrigger value="colors" className="flex-1">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="fonts" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex-1">
              <Briefcase className="h-4 w-4 mr-2" />
              Sections
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Color Scheme</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: customTemplate.colors.primary }}
                  />
                  <Input 
                    type="color" 
                    value={customTemplate.colors.primary}
                    onChange={(e) => setCustomTemplate({
                      ...customTemplate,
                      colors: { ...customTemplate.colors, primary: e.target.value }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: customTemplate.colors.secondary }}
                  />
                  <Input 
                    type="color" 
                    value={customTemplate.colors.secondary}
                    onChange={(e) => setCustomTemplate({
                      ...customTemplate,
                      colors: { ...customTemplate.colors, secondary: e.target.value }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: customTemplate.colors.text }}
                  />
                  <Input 
                    type="color" 
                    value={customTemplate.colors.text}
                    onChange={(e) => setCustomTemplate({
                      ...customTemplate,
                      colors: { ...customTemplate.colors, text: e.target.value }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: customTemplate.colors.background }}
                  />
                  <Input 
                    type="color" 
                    value={customTemplate.colors.background}
                    onChange={(e) => setCustomTemplate({
                      ...customTemplate,
                      colors: { ...customTemplate.colors, background: e.target.value }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Color Presets</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Professional', primary: '#1f2937', secondary: '#4b5563', text: '#111827', background: '#ffffff', accent: '#e5e7eb' },
                  { name: 'Modern Blue', primary: '#1e40af', secondary: '#3b82f6', text: '#1e3a8a', background: '#ffffff', accent: '#dbeafe' },
                  { name: 'Creative Purple', primary: '#7e22ce', secondary: '#a855f7', text: '#581c87', background: '#ffffff', accent: '#f3e8ff' },
                  { name: 'Minimalist', primary: '#4b5563', secondary: '#9ca3af', text: '#374151', background: '#ffffff', accent: '#f3f4f6' },
                  { name: 'Executive Gold', primary: '#92400e', secondary: '#d97706', text: '#78350f', background: '#ffffff', accent: '#fef3c7' },
                  { name: 'Tech Green', primary: '#047857', secondary: '#10b981', text: '#064e3b', background: '#ffffff', accent: '#d1fae5' }
                ].map((preset, i) => (
                  <Button 
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomTemplate({
                      ...customTemplate,
                      colors: preset
                    })}
                    className="flex items-center gap-1"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span>{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fonts" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Typography</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <select 
                  value={customTemplate.fonts.heading}
                  onChange={(e) => setCustomTemplate({
                    ...customTemplate,
                    fonts: { ...customTemplate.fonts, heading: e.target.value }
                  })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="Inter">Inter (Sans-serif)</option>
                  <option value="Merriweather">Merriweather (Serif)</option>
                  <option value="Roboto">Roboto (Sans-serif)</option>
                  <option value="Playfair Display">Playfair Display (Serif)</option>
                  <option value="Montserrat">Montserrat (Sans-serif)</option>
                  <option value="Lora">Lora (Serif)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Body Font</Label>
                <select 
                  value={customTemplate.fonts.body}
                  onChange={(e) => setCustomTemplate({
                    ...customTemplate,
                    fonts: { ...customTemplate.fonts, body: e.target.value }
                  })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="Inter">Inter (Sans-serif)</option>
                  <option value="Merriweather">Merriweather (Serif)</option>
                  <option value="Roboto">Roboto (Sans-serif)</option>
                  <option value="Open Sans">Open Sans (Sans-serif)</option>
                  <option value="Source Sans Pro">Source Sans Pro (Sans-serif)</option>
                  <option value="PT Serif">PT Serif (Serif)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Font Size</Label>
                <select 
                  value={customTemplate.fonts.size}
                  onChange={(e) => setCustomTemplate({
                    ...customTemplate,
                    fonts: { ...customTemplate.fonts, size: e.target.value }
                  })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Font Combinations</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Modern', heading: 'Inter', body: 'Inter', size: 'medium' },
                  { name: 'Classic', heading: 'Merriweather', body: 'Source Sans Pro', size: 'medium' },
                  { name: 'Professional', heading: 'Montserrat', body: 'Open Sans', size: 'medium' },
                  { name: 'Elegant', heading: 'Playfair Display', body: 'Lora', size: 'medium' },
                  { name: 'Technical', heading: 'Roboto', body: 'Roboto', size: 'medium' }
                ].map((preset, i) => (
                  <Button 
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomTemplate({
                      ...customTemplate,
                      fonts: preset
                    })}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Layout Options</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Header Style</Label>
                <select 
                  value={customTemplate.layout.headerStyle}
                  onChange={(e) => setCustomTemplate({
                    ...customTemplate,
                    layout: { ...customTemplate.layout, headerStyle: e.target.value }
                  })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="classic">Classic (Name and contact info)</option>
                  <option value="modern">Modern (With colored background)</option>
                  <option value="creative">Creative (Side-by-side layout)</option>
                  <option value="minimal">Minimal (Simple text only)</option>
                  <option value="executive">Executive (Bold with border)</option>
                  <option value="technical">Technical (With icons)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Section Style</Label>
                <select 
                  value={customTemplate.layout.sectionStyle}
                  onChange={(e) => setCustomTemplate({
                    ...customTemplate,
                    layout: { ...customTemplate.layout, sectionStyle: e.target.value }
                  })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="bordered">Bordered (With underlines)</option>
                  <option value="gradient">Gradient (With color accents)</option>
                  <option value="timeline">Timeline (For experience)</option>
                  <option value="simple">Simple (Minimal decoration)</option>
                  <option value="elegant">Elegant (With spacing)</option>
                  <option value="technical">Technical (With cards)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Column Layout</Label>
                <select 
                  value={customTemplate.layout.columns}
                  onChange={(e) => setCustomTemplate({
                    ...customTemplate,
                    layout: { ...customTemplate.layout, columns: e.target.value }
                  })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="one">Single Column</option>
                  <option value="two">Two Columns</option>
                  <option value="sidebar">Main + Sidebar</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Layout Presets</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Professional', headerStyle: 'classic', sectionStyle: 'bordered', columns: 'two' },
                  { name: 'Modern', headerStyle: 'modern', sectionStyle: 'gradient', columns: 'one' },
                  { name: 'Creative', headerStyle: 'creative', sectionStyle: 'timeline', columns: 'sidebar' },
                  { name: 'Minimalist', headerStyle: 'minimal', sectionStyle: 'simple', columns: 'one' },
                  { name: 'Executive', headerStyle: 'executive', sectionStyle: 'elegant', columns: 'two' },
                  { name: 'Technical', headerStyle: 'technical', sectionStyle: 'technical', columns: 'sidebar' }
                ].map((preset, i) => (
                  <Button 
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomTemplate({
                      ...customTemplate,
                      layout: preset
                    })}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sections" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Section Visibility</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="summary-toggle">Professional Summary</Label>
                </div>
                <Switch 
                  id="summary-toggle"
                  checked={customTemplate.sections.summary}
                  onCheckedChange={(checked) => setCustomTemplate({
                    ...customTemplate,
                    sections: { ...customTemplate.sections, summary: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="experience-toggle">Work Experience</Label>
                </div>
                <Switch 
                  id="experience-toggle"
                  checked={customTemplate.sections.experience}
                  onCheckedChange={(checked) => setCustomTemplate({
                    ...customTemplate,
                    sections: { ...customTemplate.sections, experience: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="education-toggle">Education</Label>
                </div>
                <Switch 
                  id="education-toggle"
                  checked={customTemplate.sections.education}
                  onCheckedChange={(checked) => setCustomTemplate({
                    ...customTemplate,
                    sections: { ...customTemplate.sections, education: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="skills-toggle">Skills</Label>
                </div>
                <Switch 
                  id="skills-toggle"
                  checked={customTemplate.sections.skills}
                  onCheckedChange={(checked) => setCustomTemplate({
                    ...customTemplate,
                    sections: { ...customTemplate.sections, skills: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="projects-toggle">Projects</Label>
                </div>
                <Switch 
                  id="projects-toggle"
                  checked={customTemplate.sections.projects}
                  onCheckedChange={(checked) => setCustomTemplate({
                    ...customTemplate,
                    sections: { ...customTemplate.sections, projects: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="certifications-toggle">Certifications</Label>
                </div>
                <Switch 
                  id="certifications-toggle"
                  checked={customTemplate.sections.certifications}
                  onCheckedChange={(checked) => setCustomTemplate({
                    ...customTemplate,
                    sections: { ...customTemplate.sections, certifications: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="links-toggle">Professional Links</Label>
                </div>
                <Switch 
                  id="links-toggle"
                  checked={customTemplate.sections.links}
                  onCheckedChange={(checked) => setCustomTemplate({
                    ...customTemplate,
                    sections: { ...customTemplate.sections, links: checked }
                  })}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Section Presets</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'All Sections', sections: { summary: true, experience: true, education: true, skills: true, projects: true, certifications: true, links: true } },
                  { name: 'Minimal', sections: { summary: true, experience: true, education: true, skills: true, projects: false, certifications: false, links: true } },
                  { name: 'Technical', sections: { summary: true, experience: true, education: true, skills: true, projects: true, certifications: true, links: true } },
                  { name: 'Executive', sections: { summary: true, experience: true, education: true, skills: true, projects: false, certifications: false, links: false } }
                ].map((preset, i) => (
                  <Button 
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomTemplate({
                      ...customTemplate,
                      sections: preset.sections
                    })}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsCustomizing(false);
              setCustomTemplate(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveCustomTemplate}>
            <Sparkles className="h-4 w-4 mr-2" />
            Save Custom Template
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Resume Templates</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Select a template that best represents your professional style. 
          Click any template to preview and customize your resume.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={cn(
              "relative cursor-pointer transition-all duration-200 hover:z-10",
              selectedTemplate === template.id 
                ? "scale-[1.02] ring-2 ring-primary ring-offset-2 rounded-lg z-10" 
                : "hover:scale-[1.01]"
            )}
            onClick={() => setPreviewTemplate(template.id)}
          >
            {selectedTemplate === template.id && (
              <div className="absolute -top-2 -right-2 z-10 bg-background rounded-full p-1 shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-primary fill-primary/20" />
              </div>
            )}
            
            {template.isPremium && (
              <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-1 shadow-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
            )}
            
            <Card className="overflow-hidden h-full border-0 shadow-sm group">
              <div className={cn(
                "h-48 relative overflow-hidden transition-all",
                template.preview
              )}>
                <div className="absolute inset-0 flex flex-col p-4">
                  <div className={cn(
                    "h-7 w-32 rounded-sm mb-3 bg-gradient-to-r",
                    template.accentColor
                  )} />
                  
                  <div className="flex gap-3 mb-4">
                    <div className="h-2 w-20 bg-gray-300 rounded-full" />
                    <div className="h-2 w-16 bg-gray-300 rounded-full" />
                  </div>
                  
                  <div className="mb-2">
                    <div className={cn(
                      "h-4 w-24 mb-1 rounded-sm bg-gradient-to-r opacity-90",
                      template.accentColor
                    )} />
                    <div className="h-2 w-full bg-gray-200 rounded-full mb-1" />
                    <div className="h-2 w-4/5 bg-gray-200 rounded-full" />
                  </div>
                  
                  <div className="mt-3">
                    <div className={cn(
                      "h-4 w-28 mb-1 rounded-sm bg-gradient-to-r opacity-90",
                      template.accentColor
                    )} />
                    <div className="flex gap-2 flex-wrap">
                      {[6, 8, 5].map((w, i) => (
                        <div 
                          key={i}
                          className={cn(
                            "h-6 rounded-md px-2",
                            i % 2 === 0 
                              ? "bg-gray-200" 
                              : `bg-gradient-to-r ${template.accentColor} opacity-80`
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
              </div>
              
              <CardContent className="p-4 bg-background">
                <div className="flex items-start justify-between mb-2">
                  <h3 className={cn("font-semibold text-lg", template.textColor)}>
                    {template.name}
                  </h3>
                  {template.isPremium && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-xs font-medium">
                      <Star className="h-3 w-3" />
                      Premium
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {template.description}
                </p>
                
                {/* Features */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Template Features */}
      <div className="text-center">
        <div className="glass-effect p-6 rounded-xl border border-yellow-400/20 max-w-4xl mx-auto">
          <h3 className="font-semibold mb-4 bolt-gradient-text text-lg">All Templates Include:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center justify-center gap-2 p-3 glass-effect rounded-lg">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>ATS-Optimized Format</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 glass-effect rounded-lg">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Customizable Design</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 glass-effect rounded-lg">
              <Star className="h-4 w-4 text-purple-500" />
              <span>Professional Sections</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 glass-effect rounded-lg">
              <Download className="h-4 w-4 text-green-500" />
              <span>Multiple Export Options</span>
            </div>
          </div>
        </div>
      </div>

      {/* Template Preview Dialog */}
      <Dialog 
        open={!!previewTemplate && !isCustomizing} 
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-6xl p-0 overflow-hidden h-[90vh]">
          <DialogHeader className="p-6 pb-0">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {templates.find(t => t.id === previewTemplate)?.name} Template
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="gap-2"
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
                  onClick={exportToWord}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Word
                </Button>
                <Button 
                  onClick={handleCustomizeTemplate}
                  className="gap-2"
                >
                  <Palette className="h-4 w-4" />
                  Customize
                </Button>
                <Button 
                  onClick={handleUseTemplate}
                  className="gap-2 bolt-gradient text-white"
                >
                  <Edit className="h-4 w-4" />
                  Use Template
                </Button>
                <button 
                  onClick={() => setPreviewTemplate(null)}
                  className="rounded-full p-2 hover:bg-gray-100 ml-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </DialogHeader>
          <div className="h-full overflow-y-auto p-6">
            {previewTemplate && (
              <div className="h-full shadow-lg border rounded-lg overflow-hidden">
                {renderFullPreview(previewTemplate)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Customization Dialog */}
      <Dialog 
        open={isCustomizing} 
        onOpenChange={(open) => !open && setIsCustomizing(false)}
      >
        <DialogContent className="max-w-6xl p-6 overflow-hidden h-[90vh]">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Customize Template
          </DialogTitle>
          <DialogDescription>
            Personalize your resume template with custom colors, fonts, and layout options.
          </DialogDescription>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-120px)] overflow-hidden">
            <div className="overflow-y-auto pr-4">
              {renderCustomizationPanel()}
            </div>
            
            <div className="border rounded-lg overflow-hidden shadow-md h-full">
              <div className="h-full overflow-y-auto">
                {customTemplate && renderFullPreview(customTemplate.id)}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCustomizing(false);
                setCustomTemplate(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCustomTemplate} className="bolt-gradient text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              Save & Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}