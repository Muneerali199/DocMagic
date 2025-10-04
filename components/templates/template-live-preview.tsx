'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TemplatePreviewProps {
  templateType: 'resume' | 'cv' | 'presentation' | 'letter';
  templateStyle: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  className?: string;
  scale?: number;
}

export function TemplateLivePreview({
  templateType,
  templateStyle,
  fonts,
  className,
  scale = 1,
}: TemplatePreviewProps) {
  const renderContent = () => {
    switch (templateType) {
      case 'resume':
        return <ResumePreview style={templateStyle} fonts={fonts} />;
      case 'cv':
        return <CVPreview style={templateStyle} fonts={fonts} />;
      case 'presentation':
        return <PresentationPreview style={templateStyle} fonts={fonts} />;
      case 'letter':
        return <LetterPreview style={templateStyle} fonts={fonts} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      {renderContent()}
    </div>
  );
}

// Resume Preview Component
function ResumePreview({ style, fonts }: { style: any; fonts: any }) {
  return (
    <div
      className="w-full aspect-[8.5/11] bg-white shadow-lg relative overflow-hidden"
      style={{ fontFamily: fonts.body }}
    >
      {/* Header */}
      <div
        className="p-6 pb-4"
        style={{ backgroundColor: style.primary, color: 'white' }}
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: fonts.heading }}
        >
          John Anderson
        </h1>
        <p className="text-sm opacity-90">Senior Software Engineer</p>
        <div className="flex gap-4 text-xs mt-2 opacity-80">
          <span>john@email.com</span>
          <span>•</span>
          <span>(555) 123-4567</span>
          <span>•</span>
          <span>San Francisco, CA</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4" style={{ color: style.text }}>
        {/* Summary */}
        <div>
          <h2
            className="text-lg font-semibold mb-2 pb-1 border-b-2"
            style={{
              fontFamily: fonts.heading,
              color: style.primary,
              borderColor: style.accent,
            }}
          >
            Professional Summary
          </h2>
          <p className="text-xs leading-relaxed opacity-80">
            Results-driven software engineer with 8+ years of experience building scalable
            web applications. Expert in React, Node.js, and cloud technologies.
          </p>
        </div>

        {/* Experience */}
        <div>
          <h2
            className="text-lg font-semibold mb-2 pb-1 border-b-2"
            style={{
              fontFamily: fonts.heading,
              color: style.primary,
              borderColor: style.accent,
            }}
          >
            Experience
          </h2>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold">Senior Software Engineer</h3>
                  <p className="text-xs opacity-70">Tech Solutions Inc.</p>
                </div>
                <span className="text-xs opacity-60">2021 - Present</span>
              </div>
              <ul className="text-xs mt-1 space-y-0.5 opacity-80">
                <li className="flex gap-1">
                  <span style={{ color: style.accent }}>•</span>
                  <span>Led development of microservices architecture</span>
                </li>
                <li className="flex gap-1">
                  <span style={{ color: style.accent }}>•</span>
                  <span>Improved system performance by 40%</span>
                </li>
              </ul>
            </div>
            <div className="opacity-60">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold">Software Engineer</h3>
                  <p className="text-xs opacity-70">Digital Innovations</p>
                </div>
                <span className="text-xs opacity-60">2019 - 2021</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2
            className="text-lg font-semibold mb-2 pb-1 border-b-2"
            style={{
              fontFamily: fonts.heading,
              color: style.primary,
              borderColor: style.accent,
            }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'].map((skill) => (
              <span
                key={skill}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${style.accent}20`,
                  color: style.primary,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// CV Preview Component
function CVPreview({ style, fonts }: { style: any; fonts: any }) {
  return (
    <div
      className="w-full aspect-[8.5/11] bg-white shadow-lg relative overflow-hidden"
      style={{ fontFamily: fonts.body }}
    >
      {/* Two Column Layout */}
      <div className="flex h-full">
        {/* Left Sidebar */}
        <div
          className="w-2/5 p-6"
          style={{ backgroundColor: style.primary, color: 'white' }}
        >
          {/* Photo */}
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold"
            style={{ backgroundColor: 'white', color: style.primary }}
          >
            JD
          </div>

          {/* Name */}
          <h1
            className="text-xl font-bold text-center mb-1"
            style={{ fontFamily: fonts.heading }}
          >
            Dr. Jane Doe
          </h1>
          <p className="text-xs text-center opacity-90 mb-4">Ph.D. in Computer Science</p>

          {/* Contact */}
          <div className="space-y-2 text-xs mb-6">
            <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: fonts.heading }}>
              Contact
            </h3>
            <div className="opacity-90">
              <p>jane.doe@university.edu</p>
              <p>+1 (555) 987-6543</p>
              <p>Boston, MA</p>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2 text-xs">
            <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: fonts.heading }}>
              Skills
            </h3>
            <div className="space-y-1 opacity-90">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Research</span>
                  <span>★★★★★</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Teaching</span>
                  <span>★★★★☆</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Publishing</span>
                  <span>★★★★★</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-6" style={{ color: style.text }}>
          {/* Education */}
          <div className="mb-4">
            <h2
              className="text-lg font-semibold mb-2 pb-1 border-b-2"
              style={{
                fontFamily: fonts.heading,
                color: style.primary,
                borderColor: style.accent,
              }}
            >
              Education
            </h2>
            <div className="space-y-2 text-xs">
              <div>
                <h3 className="font-semibold">Ph.D. in Computer Science</h3>
                <p className="opacity-70">MIT, Cambridge, MA</p>
                <p className="opacity-60">2015 - 2020</p>
              </div>
              <div className="opacity-70">
                <h3 className="font-semibold">M.S. in Computer Science</h3>
                <p className="opacity-70">Stanford University</p>
              </div>
            </div>
          </div>

          {/* Publications */}
          <div className="mb-4">
            <h2
              className="text-lg font-semibold mb-2 pb-1 border-b-2"
              style={{
                fontFamily: fonts.heading,
                color: style.primary,
                borderColor: style.accent,
              }}
            >
              Publications
            </h2>
            <div className="space-y-1.5 text-xs">
              <p className="opacity-80">
                <span className="font-semibold">Doe, J.</span> (2023). "Advanced Machine
                Learning Techniques." Journal of AI Research.
              </p>
              <p className="opacity-70">
                <span className="font-semibold">Doe, J.</span> et al. (2022). "Deep Learning
                Applications." Conference Proceedings.
              </p>
            </div>
          </div>

          {/* Research */}
          <div>
            <h2
              className="text-lg font-semibold mb-2 pb-1 border-b-2"
              style={{
                fontFamily: fonts.heading,
                color: style.primary,
                borderColor: style.accent,
              }}
            >
              Research Experience
            </h2>
            <div className="space-y-2 text-xs">
              <div>
                <h3 className="font-semibold">Research Scientist</h3>
                <p className="opacity-70">AI Research Lab, 2020 - Present</p>
                <p className="opacity-80 mt-1">
                  Leading research in neural networks and machine learning applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Presentation Preview Component (3 slides)
function PresentationPreview({ style, fonts }: { style: any; fonts: any }) {
  return (
    <div className="space-y-2">
      {/* Slide 1 - Title */}
      <div
        className="w-full aspect-[16/9] shadow-lg relative overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${style.primary} 0%, ${style.secondary} 100%)`,
          fontFamily: fonts.body,
        }}
      >
        <div className="text-center px-8">
          <h1
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: fonts.heading }}
          >
            Your Project Title
          </h1>
          <p className="text-xl text-white/90">A Professional Presentation</p>
          <div className="mt-6 text-sm text-white/80">Your Name • October 2025</div>
        </div>
      </div>

      {/* Slide 2 - Content */}
      <div
        className="w-full aspect-[16/9] bg-white shadow-lg relative overflow-hidden p-8"
        style={{ fontFamily: fonts.body, color: style.text }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: fonts.heading, color: style.primary }}
        >
          Key Features
        </h2>
        <div className="space-y-3">
          {['Professional Design', 'Easy to Customize', 'Multiple Layouts'].map(
            (feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: style.accent }}
                >
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{feature}</h3>
                  <p className="text-sm opacity-70">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Slide 3 - Chart/Data */}
      <div
        className="w-full aspect-[16/9] bg-white shadow-lg relative overflow-hidden p-8"
        style={{ fontFamily: fonts.body, color: style.text }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: fonts.heading, color: style.primary }}
        >
          Growth Overview
        </h2>
        <div className="flex items-end justify-around h-40 px-4">
          {[40, 65, 50, 85, 70].map((height, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${height}%`,
                  backgroundColor:
                    idx % 2 === 0 ? style.primary : style.accent,
                }}
              />
              <span className="text-xs opacity-60">Q{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Letter Preview Component
function LetterPreview({ style, fonts }: { style: any; fonts: any }) {
  return (
    <div
      className="w-full aspect-[8.5/11] bg-white shadow-lg relative overflow-hidden p-8"
      style={{ fontFamily: fonts.body, color: style.text }}
    >
      {/* Letterhead */}
      <div
        className="pb-4 mb-6 border-b-2"
        style={{ borderColor: style.primary }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: fonts.heading, color: style.primary }}
        >
          Your Company Name
        </h1>
        <p className="text-xs opacity-70 mt-1">
          123 Business Street • City, State 12345 • contact@company.com
        </p>
      </div>

      {/* Date */}
      <p className="text-sm mb-6">October 3, 2025</p>

      {/* Recipient */}
      <div className="mb-6 text-sm">
        <p className="font-semibold">Mr. John Smith</p>
        <p className="opacity-70">Hiring Manager</p>
        <p className="opacity-70">ABC Corporation</p>
        <p className="opacity-70">456 Corporate Ave</p>
        <p className="opacity-70">City, State 67890</p>
      </div>

      {/* Subject */}
      <p className="font-semibold mb-4" style={{ color: style.primary }}>
        Re: Professional Letter Template
      </p>

      {/* Body */}
      <div className="space-y-3 text-sm leading-relaxed">
        <p>Dear Mr. Smith,</p>
        <p className="opacity-80">
          This is a professional letter template designed with clean typography and an
          elegant layout. The template features customizable colors, fonts, and spacing
          to match your brand identity.
        </p>
        <p className="opacity-80">
          Perfect for business correspondence, cover letters, formal invitations, and
          professional communications. The design maintains readability while presenting
          a polished, professional appearance.
        </p>
        <p className="opacity-80">
          Thank you for your consideration. I look forward to hearing from you.
        </p>
        <p className="mt-6">Sincerely,</p>
        <p className="font-semibold mt-8" style={{ fontFamily: fonts.heading }}>
          Your Name
        </p>
      </div>
    </div>
  );
}
