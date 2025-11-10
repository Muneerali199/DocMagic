'use client';

import React, { useState } from 'react';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  education: Array<{ degree: string; school: string; year: string; gpa: string; }>;
  experience: Array<{ title: string; company: string; location: string; duration: string; points: string[]; }>;
  projects: Array<{ name: string; tech: string; duration: string; points: string[]; }>;
  skills: { languages: string; technologies: string; tools: string; };
  achievements: string[];
}

interface EditableResumeProps {
  data: ResumeData;
  onUpdate: (data: ResumeData) => void;
}

export default function EditableResume({ data, onUpdate }: EditableResumeProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const updateField = (field: keyof ResumeData, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="bg-white shadow-2xl rounded-lg p-12 border max-w-4xl mx-auto relative" id="resume-content">
      {/* Editing indicator */}
      <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
        ✏️ Live Editing
      </div>
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-blue-600">
        <input
          type="text"
          value={data.name}
          onChange={(e) => updateField('name', e.target.value)}
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField(null)}
          className={`text-4xl font-bold text-center w-full border-none outline-none rounded px-2 text-gray-900 mb-4 transition-all ${
            focusedField === 'name' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
          }`}
          placeholder="Your Full Name"
        />
        <div className="flex justify-center gap-4 text-sm flex-wrap">
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="text-center border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-700"
            placeholder="email@example.com"
          />
          <span className="text-gray-400">|</span>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="text-center border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-700"
            placeholder="+1-234-567-8900"
          />
        </div>
        <div className="flex justify-center gap-4 text-sm mt-2 flex-wrap">
          <input
            type="text"
            value={data.linkedin}
            onChange={(e) => updateField('linkedin', e.target.value)}
            className="text-center border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-blue-600"
            placeholder="linkedin.com/in/yourname"
          />
          <span className="text-gray-400">|</span>
          <input
            type="text"
            value={data.github}
            onChange={(e) => updateField('github', e.target.value)}
            className="text-center border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-blue-600"
            placeholder="github.com/yourname"
          />
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black border-b-2 border-blue-600 pb-2 mb-4">Education</h2>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-4">
            <input
              type="text"
              value={edu.degree}
              onChange={(e) => {
                const newEdu = [...data.education];
                newEdu[i].degree = e.target.value;
                updateField('education', newEdu);
              }}
              className="font-bold mb-2 w-full border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-black"
              placeholder="Degree"
            />
            <div className="flex gap-2 text-gray-700">
              <input
                type="text"
                value={edu.school}
                onChange={(e) => {
                  const newEdu = [...data.education];
                  newEdu[i].school = e.target.value;
                  updateField('education', newEdu);
                }}
                className="flex-1 border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2"
                placeholder="School"
              />
              <input
                type="text"
                value={edu.year}
                onChange={(e) => {
                  const newEdu = [...data.education];
                  newEdu[i].year = e.target.value;
                  updateField('education', newEdu);
                }}
                className="w-32 border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2"
                placeholder="Year"
              />
              <input
                type="text"
                value={edu.gpa}
                onChange={(e) => {
                  const newEdu = [...data.education];
                  newEdu[i].gpa = e.target.value;
                  updateField('education', newEdu);
                }}
                className="w-24 border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2"
                placeholder="GPA"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black border-b-2 border-blue-600 pb-2 mb-4">Experience</h2>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-6">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={exp.title}
                onChange={(e) => {
                  const newExp = [...data.experience];
                  newExp[i].title = e.target.value;
                  updateField('experience', newExp);
                }}
                className="flex-1 font-bold border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-black"
                placeholder="Job Title"
              />
              <input
                type="text"
                value={exp.duration}
                onChange={(e) => {
                  const newExp = [...data.experience];
                  newExp[i].duration = e.target.value;
                  updateField('experience', newExp);
                }}
                className="w-48 italic border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-700"
                placeholder="Duration"
              />
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={exp.company}
                onChange={(e) => {
                  const newExp = [...data.experience];
                  newExp[i].company = e.target.value;
                  updateField('experience', newExp);
                }}
                className="flex-1 border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-700"
                placeholder="Company"
              />
              <input
                type="text"
                value={exp.location}
                onChange={(e) => {
                  const newExp = [...data.experience];
                  newExp[i].location = e.target.value;
                  updateField('experience', newExp);
                }}
                className="w-40 border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-700"
                placeholder="Location"
              />
            </div>
            <ul className="list-disc ml-6 space-y-2">
              {exp.points.map((point, pi) => (
                <li key={pi}>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const newExp = [...data.experience];
                      newExp[i].points[pi] = e.target.value;
                      updateField('experience', newExp);
                    }}
                    className="w-full border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-900"
                    placeholder="Achievement point"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black border-b-2 border-blue-600 pb-2 mb-4">Projects</h2>
        {data.projects.map((proj, i) => (
          <div key={i} className="mb-6">
            <input
              type="text"
              value={proj.name}
              onChange={(e) => {
                const newProj = [...data.projects];
                newProj[i].name = e.target.value;
                updateField('projects', newProj);
              }}
              className="font-bold mb-2 w-full border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-black"
              placeholder="Project Name"
            />
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={proj.tech}
                onChange={(e) => {
                  const newProj = [...data.projects];
                  newProj[i].tech = e.target.value;
                  updateField('projects', newProj);
                }}
                className="flex-1 italic border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-700"
                placeholder="Technologies"
              />
              <input
                type="text"
                value={proj.duration}
                onChange={(e) => {
                  const newProj = [...data.projects];
                  newProj[i].duration = e.target.value;
                  updateField('projects', newProj);
                }}
                className="w-40 border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-700"
                placeholder="Duration"
              />
            </div>
            <ul className="list-disc ml-6 space-y-2">
              {proj.points.map((point, pi) => (
                <li key={pi}>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const newProj = [...data.projects];
                      newProj[i].points[pi] = e.target.value;
                      updateField('projects', newProj);
                    }}
                    className="w-full border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-900"
                    placeholder="Project detail"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black border-b-2 border-blue-600 pb-2 mb-4">Technical Skills</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">Languages:</label>
            <input
              type="text"
              value={data.skills.languages}
              onChange={(e) => updateField('skills', { ...data.skills, languages: e.target.value })}
              className="w-full border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-900"
              placeholder="JavaScript, Python, Java"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Technologies:</label>
            <input
              type="text"
              value={data.skills.technologies}
              onChange={(e) => updateField('skills', { ...data.skills, technologies: e.target.value })}
              className="w-full border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-900"
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Tools:</label>
            <input
              type="text"
              value={data.skills.tools}
              onChange={(e) => updateField('skills', { ...data.skills, tools: e.target.value })}
              className="w-full border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-900"
              placeholder="Git, Docker, AWS"
            />
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black border-b-2 border-blue-600 pb-2 mb-4">Achievements</h2>
        <ul className="list-disc ml-6 space-y-2">
          {data.achievements.map((ach, i) => (
            <li key={i}>
              <input
                type="text"
                value={ach}
                onChange={(e) => {
                  const newAch = [...data.achievements];
                  newAch[i] = e.target.value;
                  updateField('achievements', newAch);
                }}
                className="w-full border-none outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 text-gray-900"
                placeholder="Achievement"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
