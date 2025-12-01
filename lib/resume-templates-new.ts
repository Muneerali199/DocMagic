export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  icon: string;
}

export const RESUME_TEMPLATES_NEW: ResumeTemplate[] = [
  // TECH TEMPLATES
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    category: 'Tech',
    description: 'Modern blue header, skills-first layout for developers',
    color: '#2563EB',
    icon: '💻'
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    category: 'Tech',
    description: 'Analytics-focused with ML/AI skills highlighted',
    color: '#7C3AED',
    icon: '📊'
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    category: 'Tech',
    description: 'Infrastructure and automation focused template',
    color: '#059669',
    icon: '⚙️'
  },
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    category: 'Tech',
    description: 'UI/UX focused with portfolio highlights',
    color: '#EC4899',
    icon: '🎨'
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    category: 'Tech',
    description: 'API and database expertise highlighted',
    color: '#0891B2',
    icon: '🔧'
  },
  // BUSINESS TEMPLATES
  {
    id: 'professional',
    name: 'Professional',
    category: 'Business',
    description: 'Classic ATS-friendly design for any industry',
    color: '#1F2937',
    icon: '💼'
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    category: 'Business',
    description: 'Strategic leadership with metrics focus',
    color: '#059669',
    icon: '🎯'
  },
  {
    id: 'marketing-manager',
    name: 'Marketing Manager',
    category: 'Business',
    description: 'ROI and campaign results highlighted',
    color: '#F59E0B',
    icon: '📈'
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    category: 'Business',
    description: 'PMP certified, Agile methodology focus',
    color: '#DC2626',
    icon: '📋'
  },
  {
    id: 'sales-executive',
    name: 'Sales Executive',
    category: 'Business',
    description: 'Quota achievements and revenue focus',
    color: '#EA580C',
    icon: '🤝'
  },
  // FINANCE TEMPLATES
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    category: 'Finance',
    description: 'Modeling and valuation expertise',
    color: '#0891B2',
    icon: '💰'
  },
  {
    id: 'accountant',
    name: 'Accountant',
    category: 'Finance',
    description: 'CPA certified, audit experience',
    color: '#4338CA',
    icon: '📑'
  },
  // CREATIVE TEMPLATES
  {
    id: 'ux-designer',
    name: 'UX/UI Designer',
    category: 'Creative',
    description: 'Portfolio-focused creative layout',
    color: '#EC4899',
    icon: '🎨'
  },
  {
    id: 'graphic-designer',
    name: 'Graphic Designer',
    category: 'Creative',
    description: 'Visual portfolio showcase',
    color: '#8B5CF6',
    icon: '✏️'
  },
  // ACADEMIC TEMPLATES
  {
    id: 'academic-researcher',
    name: 'Academic Researcher',
    category: 'Academic',
    description: 'Publications and research focus',
    color: '#4338CA',
    icon: '🎓'
  },
  {
    id: 'teacher',
    name: 'Teacher/Educator',
    category: 'Academic',
    description: 'Curriculum and student achievement',
    color: '#059669',
    icon: '📚'
  }
];
