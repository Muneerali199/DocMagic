'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Download, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import NITPatnaTemplate from '@/components/resume/templates/nit-patna';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const INITIAL_DATA = {
  name: 'Your Name',
  email: 'yourname@email.com',
  phone: '+91-1234567890',
  linkedin: 'linkedin.com/in/yourname',
  github: 'github.com/yourname',
  education: [
    {
      degree: 'B.Tech., Computer Science and Engineering',
      institution: 'National Institute of Technology, Patna',
      location: 'Patna, Bihar',
      date: '2020 - 2024',
      gpa: '8.5/10.0'
    },
    {
      degree: 'Senior Secondary (XII), Science',
      institution: 'Your School Name, CBSE',
      location: 'Your City',
      date: '2020',
      gpa: '90%'
    }
  ],
  experience: [
    {
      title: 'Software Development Intern',
      company: 'Company Name',
      location: 'City, India',
      date: 'May 2023 - July 2023',
      description: [
        'Developed and maintained web applications using React.js and Node.js',
        'Implemented RESTful APIs serving 100K+ requests daily with 99.9% uptime',
        'Collaborated with cross-functional teams to deliver features ahead of schedule'
      ]
    }
  ],
  projects: [
    {
      name: 'E-Commerce Platform',
      description: 'Built a full-stack e-commerce application with user authentication, product catalog, and payment integration',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe API'],
      link: 'github.com/yourname/ecommerce'
    }
  ],
  skills: {
    programming: ['C++', 'Python', 'JavaScript', 'Java'],
    technical: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'SQL', 'Git'],
    tools: ['VS Code', 'Linux', 'Docker', 'AWS']
  }
};

function ResumeBuilderSimple() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const templateId = searchParams?.get('template') || 'nit-patna-resume';
  
  const [resumeData, setResumeData] = useState(INITIAL_DATA);
  const [isExporting, setIsExporting] = useState(false);

  const handleEdit = (field: string, value: any) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('resume-content');
      if (!element) throw new Error('Resume not found');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resumeData.name?.replace(/\\s+/g, '-').toLowerCase() || 'resume'}.pdf`);
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold">NIT Patna Resume Builder</h1>
          <p className="text-sm text-gray-600">Click any text to edit</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToPDF} disabled={isExporting}>
            {isExporting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Export PDF</>
            )}
          </Button>
          <Button onClick={() => toast.success('Saved!')}>
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>
      </div>

      {/* Resume Content */}
      <div className="py-8">
        <div id="resume-content" className="bg-white shadow-2xl mx-auto">
          <NITPatnaTemplate 
            data={resumeData} 
            onEdit={handleEdit}
            editable={true}
          />
        </div>
      </div>
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <ResumeBuilderSimple />
    </Suspense>
  );
}
