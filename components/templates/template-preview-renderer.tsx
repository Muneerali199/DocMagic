'use client';

import { ProfessionalTemplate } from '../resume-editor/templates/professional-template';
import { SoftwareEngineerTemplate } from '../resume-editor/templates/software-engineer-template';
import { ExecutiveTemplate } from '../resume-editor/templates/executive-template';
import { TwoColumnTemplate } from '../resume-editor/templates/two-column-template';
import { ModernMinimalTemplate } from '../resume-editor/templates/modern-minimal-template';
import { CompactTemplate } from '../resume-editor/templates/compact-template';
import { AcademicTemplate } from '../resume-editor/templates/academic-template';

interface TemplatePreviewProps {
  templateId: string;
}

const sampleData = {
  name: 'JOHN ANDERSON',
  email: 'john.anderson@email.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/johnanderson',
  github: 'github.com/johnanderson',
  summary: 'Results-driven professional with 5+ years of experience in software development and project management. Proven track record of delivering high-quality solutions that drive business growth and improve operational efficiency.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      date: 'Jan 2021 - Present',
      description: [
        'Led development of microservices architecture serving 1M+ daily active users',
        'Improved system performance by 40% through optimization strategies',
        'Mentored team of 5 junior developers and conducted code reviews'
      ]
    },
    {
      title: 'Software Engineer',
      company: 'StartUp Inc',
      location: 'San Francisco, CA',
      date: 'Jun 2019 - Dec 2020',
      description: [
        'Developed RESTful APIs using Node.js serving 500K+ requests daily',
        'Built responsive web applications using React and Redux',
        'Reduced bug count by 35% through comprehensive testing'
      ]
    }
  ],
  education: [
    {
      degree: 'B.S. Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      date: '2015 - 2019',
      gpa: '3.8/4.0'
    }
  ],
  skills: {
    programming: ['JavaScript', 'Python', 'Java', 'TypeScript'],
    technical: ['React', 'Node.js', 'AWS', 'Docker', 'MongoDB'],
    tools: ['Git', 'Docker', 'Kubernetes', 'Jenkins']
  },
  projects: [
    {
      name: 'E-Commerce Platform',
      description: 'Built scalable e-commerce solution with payment integration serving 100K+ users',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS']
    },
    {
      name: 'Task Management App',
      description: 'Developed collaborative task management application with real-time updates',
      technologies: ['React', 'Firebase', 'Material-UI']
    }
  ],
  certifications: [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023' },
    { name: 'Professional Scrum Master', issuer: 'Scrum.org', date: '2022' }
  ]
};

export function TemplatePreviewRenderer({ templateId }: TemplatePreviewProps) {
  // Scale down for preview - templates are designed for full page
  const previewStyle = {
    transform: 'scale(0.25)',
    transformOrigin: 'top left',
    width: '400%',
    height: '400%',
    backgroundColor: '#ffffff'
  };

  const renderTemplate = () => {
    switch (templateId) {
      case 'software-engineer':
      case 'data-scientist':
      case 'devops-engineer':
      case 'frontend-developer':
      case 'backend-developer':
        return <SoftwareEngineerTemplate data={sampleData} />;
      case 'product-manager':
      case 'project-manager':
      case 'sales-executive':
        return <ExecutiveTemplate data={sampleData} />;
      case 'marketing-manager':
      case 'financial-analyst':
        return <TwoColumnTemplate data={sampleData} />;
      case 'ux-designer':
      case 'graphic-designer':
        return <ModernMinimalTemplate data={sampleData} />;
      case 'accountant':
        return <CompactTemplate data={sampleData} />;
      case 'academic-researcher':
      case 'teacher':
        return <AcademicTemplate data={sampleData} />;
      default:
        return <ProfessionalTemplate data={sampleData} />;
    }
  };

  return (
    <div style={previewStyle}>
      {renderTemplate()}
    </div>
  );
}
