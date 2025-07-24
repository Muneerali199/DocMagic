'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Zap,
  Award,
  Link as LinkIcon,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

type ResumeStep = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'links' | 'review';

interface ResumeNavigationProps {
  currentStep: ResumeStep;
  onStepChange: (step: ResumeStep) => void;
  progress?: number;
}

export function ResumeNavigation({ currentStep, onStepChange, progress = 0 }: ResumeNavigationProps) {
  const steps: { id: ResumeStep; title: string; icon: any }[] = [
    { id: 'personal', title: 'Info', icon: User },
    { id: 'summary', title: 'Professional Summary', icon: FileText },
    { id: 'experience', title: 'Work Experience', icon: Briefcase },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'skills', title: 'Skills', icon: Code },
    { id: 'projects', title: 'Projects', icon: Zap },
    { id: 'certifications', title: 'Certifications', icon: Award },
    { id: 'links', title: 'Professional Links', icon: LinkIcon },
    { id: 'review', title: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-center gap-2 mb-2 overflow-x-auto pb-2 resume-nav">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer resume-nav-item",
                currentStep === step.id
                  ? "active bg-primary text-white font-semibold shadow-md"
                  : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
              )}
              onClick={() => onStepChange(step.id)}
            >
              <step.icon className="h-4 w-4 resume-nav-icon" />
              <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              <span className="text-sm font-medium sm:hidden">{index + 1}</span>
            </button>
            {index < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
      
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden resume-nav-progress">
        <div 
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full resume-nav-progress-bar" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}