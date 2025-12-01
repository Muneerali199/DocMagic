'use client';

import React from 'react';

interface ResumeData {
  name?: string;
  email?: string;
  phone?: string | number;
  linkedin?: string;
  github?: string;
  education?: Array<{
    degree?: string;
    institution?: string;
    location?: string;
    date?: string;
    gpa?: string;
  }>;
  experience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    date?: string;
    description?: string[];
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }>;
  skills?: {
    programming?: string[];
    technical?: string[];
    tools?: string[];
  };
}

interface NITPatnaTemplateProps {
  data: ResumeData;
  onEdit?: (field: string, value: any) => void;
  editable?: boolean;
}

export default function NITPatnaTemplate({ data, onEdit, editable = true }: NITPatnaTemplateProps) {
  const handleEdit = (field: string, value: any) => {
    if (editable && onEdit) {
      onEdit(field, value);
    }
  };

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white p-10 font-serif text-black" style={{ minHeight: '297mm' }}>
      {/* Name - Centered, Bold, Large */}
      <div className="text-center mb-4">
        {editable ? (
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => handleEdit('name', e.target.value)}
            className="text-2xl font-bold uppercase text-center w-full border-none focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
            placeholder="YOUR NAME"
          />
        ) : (
          <h1 className="text-2xl font-bold uppercase">{data.name}</h1>
        )}
      </div>

      {/* Contact Info - Single line with borders */}
      <div className="text-center text-xs border-t border-b border-black py-2 mb-6">
        {editable ? (
          <div className="flex justify-center gap-3 flex-wrap">
            <input type="text" value={data.email || ''} onChange={(e) => handleEdit('email', e.target.value)} className="border-none focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1" placeholder="email@example.com" />
            <span>|</span>
            <input type="text" value={data.phone || ''} onChange={(e) => handleEdit('phone', e.target.value)} className="border-none focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1" placeholder="+91-1234567890" />
            <span>|</span>
            <input type="text" value={data.linkedin || ''} onChange={(e) => handleEdit('linkedin', e.target.value)} className="border-none focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1" placeholder="linkedin.com/in/yourname" />
            <span>|</span>
            <input type="text" value={data.github || ''} onChange={(e) => handleEdit('github', e.target.value)} className="border-none focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1" placeholder="github.com/yourname" />
          </div>
        ) : (
          <span>{data.email} | {data.phone} | {data.linkedin} | {data.github}</span>
        )}
      </div>

      {/* EDUCATION */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-black mb-3">Education</h2>
        {data.education?.map((edu, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <div>
                <span className="font-bold">{edu.institution}</span>
                <span className="ml-3 text-gray-600">{edu.location}</span>
              </div>
              <span className="font-semibold">{edu.date}</span>
            </div>
            <div className="text-xs italic">{edu.degree}</div>
            {edu.gpa && <div className="text-xs">CGPA: {edu.gpa}</div>}
          </div>
        ))}
      </div>

      {/* EXPERIENCE */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-black mb-3">Experience</h2>
        {data.experience?.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <div>
                <span className="font-bold">{exp.title}</span>
                <span className="mx-2">|</span>
                <span className="italic">{exp.company}</span>
              </div>
              <span className="font-semibold">{exp.date}</span>
            </div>
            <ul className="list-disc ml-5 text-xs space-y-1">
              {exp.description?.map((desc, j) => (
                <li key={j}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* PROJECTS */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-black mb-3">Projects</h2>
        {data.projects?.map((proj, i) => (
          <div key={i} className="mb-3">
            <div className="text-xs">
              <span className="font-bold">{proj.name}</span>
              {proj.link && (
                <>
                  <span className="mx-2">|</span>
                  <span className="underline">{proj.link}</span>
                </>
              )}
            </div>
            <div className="text-xs mt-1">{proj.description}</div>
            {proj.technologies && (
              <div className="text-xs italic mt-1">
                Tech Stack: {proj.technologies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* TECHNICAL SKILLS */}
      <div>
        <h2 className="text-sm font-bold uppercase border-b border-black mb-3">Technical Skills</h2>
        <div className="text-xs space-y-1">
          {data.skills?.programming && (
            <div>
              <span className="font-semibold">Languages:</span> {data.skills.programming.join(', ')}
            </div>
          )}
          {data.skills?.technical && (
            <div>
              <span className="font-semibold">Technologies:</span> {data.skills.technical.join(', ')}
            </div>
          )}
          {data.skills?.tools && (
            <div>
              <span className="font-semibold">Tools:</span> {data.skills.tools.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
