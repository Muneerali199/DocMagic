// COMPREHENSIVE RESUME TEMPLATES - FULLY EDITABLE
// Each template has a unique design matching its preview

import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase, GraduationCap, Code } from 'lucide-react';

interface ResumeData {
  name?: string;
  email?: string;
  phone?: string | number;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
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
  }>;
}

interface TemplateProps {
  resume: ResumeData;
  isEditing: boolean;
  EditableText: any;
  EditableList: any;
  updateField: (path: string[], value: any) => void;
  editableResume: ResumeData;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// 1. DEEDY RESUME - Two-column modern design
export const DeedyTemplate: React.FC<TemplateProps> = ({
  resume,
  isEditing,
  EditableText,
  updateField,
  editableResume,
  primaryColor,
  secondaryColor,
  accentColor
}) => (
  <div className="w-full bg-white overflow-auto print:overflow-visible" id="resume-content">
    <div className="w-full md:max-w-[794px] mx-auto print:w-[794px] min-h-[1123px] flex">
      {/* LEFT COLUMN - Dark sidebar */}
      <div className="w-[35%] p-6 text-white" style={{ backgroundColor: primaryColor }}>
        {/* Name */}
        <div className="mb-6">
          {isEditing ? (
            <EditableText value={editableResume.name || ""} onChange={(v: string) => updateField(["name"], v)} className="text-xl font-bold text-white" />
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
            {resume.education?.map((edu, i) => (
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
            {resume.experience?.map((exp, i) => (
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
              {resume.projects.map((proj, i) => (
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

// 2. BLACK & WHITE PROFESSIONAL - Clean ATS-friendly
export const BlackWhiteProfessionalTemplate: React.FC<TemplateProps> = ({
  resume,
  isEditing,
  EditableText,
  updateField,
  editableResume
}) => (
  <div className="w-full bg-white overflow-auto print:overflow-visible" id="resume-content">
    <div className="w-full md:max-w-[794px] mx-auto print:w-[794px] min-h-[1123px] p-8 font-sans">
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-black">
        {isEditing ? (
          <EditableText value={editableResume.name || ""} onChange={(v: string) => updateField(["name"], v)} className="text-3xl font-bold mb-2" />
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
          {resume.experience?.map((exp, i) => (
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
        {resume.education?.map((edu, i) => (
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

// Export all templates
export const RESUME_TEMPLATE_RENDERERS = {
  'deedy-resume': DeedyTemplate,
  'black-white-professional': BlackWhiteProfessionalTemplate,
};

// Template metadata for the selector
const TEMPLATE_OPTIONS = [
  {
    id: 'deedy-resume',
    name: 'Deedy Resume',
    description: 'Modern two-column design with clean typography',
    preview: '📄',
  },
  {
    id: 'black-white-professional',
    name: 'Professional B&W',
    description: 'Classic black and white professional style',
    preview: '📋',
  },
];

// ResumeTemplates selector component
interface ResumeTemplatesProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  onEditTemplate?: () => void;
  onDownloadTemplate?: () => void;
}

export const ResumeTemplates: React.FC<ResumeTemplatesProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TEMPLATE_OPTIONS.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] ${
              selectedTemplate === template.id
                ? 'border-yellow-400 bg-yellow-400/10 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-yellow-400/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{template.preview}</span>
              <div>
                <p className="font-semibold">{template.name}</p>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            </div>
            {selectedTemplate === template.id && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-2">
                ✓ Selected
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};