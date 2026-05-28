import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { ResumePDFDocument } from './lib/resume/pdf-exporter';

const dummyResume = {
  name: "Alex Developer",
  email: "alex@example.com",
  phone: "555-0199",
  location: "San Francisco, CA",
  summary: "A passionate full-stack developer with 5+ years of experience building scalable web applications using React, Node.js, and modern cloud infrastructure.",
  experience: [
    {
      title: "Senior Frontend Engineer",
      company: "Tech Solutions Inc.",
      location: "Remote",
      date: "Jan 2021 - Present",
      description: [
        "Architected a massive React application serving 1M+ DAU.",
        "Improved rendering performance by 40% through code splitting and memoization."
      ]
    }
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      institution: "State University",
      date: "2015 - 2019",
      gpa: "3.8"
    }
  ],
  skills: {
    technical: ["React", "TypeScript", "Next.js", "Node.js"],
    tools: ["Git", "Docker", "AWS", "Vercel"]
  }
};

async function generateTestPDF() {
  console.log("Generating test PDF...");
  await renderToFile(
    <ResumePDFDocument resume={dummyResume} templateId="software-engineering-resume" />,
    'test_resume_output.pdf'
  );
  console.log("PDF successfully generated to test_resume_output.pdf");
}

generateTestPDF().catch(console.error);
