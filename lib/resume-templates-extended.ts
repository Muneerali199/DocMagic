// Extended Resume Templates with Role-Based Categories

export interface ResumeTemplateExtended {
  id: string;
  name: string;
  description: string;
  category: 'developer' | 'business' | 'creative' | 'healthcare' | 'education' | 'sales' | 'hr' | 'engineering' | 'finance' | 'marketing';
  icon: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  layout: 'single-column' | 'two-column' | 'modern' | 'classic' | 'creative';
  features: string[];
  bestFor: string[];
  isPremium: boolean;
}

export const RESUME_TEMPLATES_EXTENDED: ResumeTemplateExtended[] = [
  // DEVELOPER TEMPLATES
  {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    description: 'Clean, code-focused layout perfect for software developers',
    category: 'developer',
    icon: '💻',
    preview: '/templates/tech-minimal.png',
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#3B82F6',
      text: '#1F2937'
    },
    layout: 'single-column',
    features: ['Skills showcase', 'Project highlights', 'GitHub integration', 'Tech stack emphasis'],
    bestFor: ['Software Engineers', 'Full Stack Developers', 'Backend Developers'],
    isPremium: false
  },
  {
    id: 'fullstack-modern',
    name: 'Full Stack Modern',
    description: 'Bold design emphasizing technical expertise and projects',
    category: 'developer',
    icon: '⚡',
    preview: '/templates/fullstack-modern.png',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10B981',
      text: '#111827'
    },
    layout: 'two-column',
    features: ['Two-column layout', 'Project portfolio', 'Skill ratings', 'Code samples'],
    bestFor: ['Full Stack Developers', 'Frontend Developers', 'DevOps Engineers'],
    isPremium: false
  },
  {
    id: 'devops-pro',
    name: 'DevOps Professional',
    description: 'Infrastructure-focused template for DevOps engineers',
    category: 'developer',
    icon: '🔧',
    preview: '/templates/devops-pro.png',
    colors: {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      accent: '#8B5CF6',
      text: '#1F2937'
    },
    layout: 'modern',
    features: ['Tools & platforms', 'Cloud certifications', 'System architecture', 'Automation skills'],
    bestFor: ['DevOps Engineers', 'Site Reliability Engineers', 'Cloud Architects'],
    isPremium: true
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Developer',
    description: 'App-centric design for iOS and Android developers',
    category: 'developer',
    icon: '📱',
    preview: '/templates/mobile-dev.png',
    colors: {
      primary: '#EC4899',
      secondary: '#DB2777',
      accent: '#F472B6',
      text: '#1F2937'
    },
    layout: 'creative',
    features: ['App portfolio', 'Platform expertise', 'UI/UX focus', 'App Store links'],
    bestFor: ['iOS Developers', 'Android Developers', 'React Native Developers'],
    isPremium: true
  },

  // BUSINESS TEMPLATES
  {
    id: 'executive-suite',
    name: 'Executive Suite',
    description: 'Sophisticated design for C-level and senior executives',
    category: 'business',
    icon: '👔',
    preview: '/templates/executive-suite.png',
    colors: {
      primary: '#0F172A',
      secondary: '#1E293B',
      accent: '#D97706',
      text: '#111827'
    },
    layout: 'classic',
    features: ['Leadership focus', 'Executive summary', 'Board experience', 'Strategic achievements'],
    bestFor: ['CEOs', 'Directors', 'VPs', 'Senior Managers'],
    isPremium: true
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst Pro',
    description: 'Data-driven layout highlighting analytical skills',
    category: 'business',
    icon: '📊',
    preview: '/templates/business-analyst.png',
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      text: '#1F2937'
    },
    layout: 'modern',
    features: ['Metrics focus', 'Data visualization', 'Process improvement', 'ROI highlights'],
    bestFor: ['Business Analysts', 'Data Analysts', 'Strategy Consultants'],
    isPremium: false
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    description: 'Dynamic design for founders and startup leaders',
    category: 'business',
    icon: '🚀',
    preview: '/templates/entrepreneur.png',
    colors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FBBF24',
      text: '#1F2937'
    },
    layout: 'creative',
    features: ['Ventures showcase', 'Innovation focus', 'Funding highlights', 'Impact metrics'],
    bestFor: ['Founders', 'Entrepreneurs', 'Startup Leaders'],
    isPremium: true
  },
  {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    description: 'Traditional format for corporate environments',
    category: 'business',
    icon: '🏢',
    preview: '/templates/corporate.png',
    colors: {
      primary: '#475569',
      secondary: '#334155',
      accent: '#64748B',
      text: '#1E293B'
    },
    layout: 'classic',
    features: ['ATS-friendly', 'Clean format', 'Industry standard', 'Professional tone'],
    bestFor: ['Corporate Professionals', 'Consultants', 'Managers'],
    isPremium: false
  },

  // CREATIVE TEMPLATES
  {
    id: 'graphic-designer',
    name: 'Creative Portfolio',
    description: 'Visual-first design showcasing creative work',
    category: 'creative',
    icon: '🎨',
    preview: '/templates/graphic-designer.png',
    colors: {
      primary: '#EC4899',
      secondary: '#DB2777',
      accent: '#F472B6',
      text: '#1F2937'
    },
    layout: 'creative',
    features: ['Portfolio grid', 'Design tools', 'Creative projects', 'Visual emphasis'],
    bestFor: ['Graphic Designers', 'UI/UX Designers', 'Art Directors'],
    isPremium: false
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Engaging format for digital content professionals',
    category: 'creative',
    icon: '✍️',
    preview: '/templates/content-creator.png',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A78BFA',
      text: '#1F2937'
    },
    layout: 'modern',
    features: ['Content portfolio', 'Social metrics', 'Brand collaborations', 'Writing samples'],
    bestFor: ['Content Writers', 'Social Media Managers', 'Copywriters'],
    isPremium: false
  },
  {
    id: 'photographer',
    name: 'Visual Artist',
    description: 'Image-centric layout for visual professionals',
    category: 'creative',
    icon: '📸',
    preview: '/templates/photographer.png',
    colors: {
      primary: '#0EA5E9',
      secondary: '#0284C7',
      accent: '#38BDF8',
      text: '#1F2937'
    },
    layout: 'creative',
    features: ['Photo gallery', 'Client list', 'Exhibition history', 'Awards showcase'],
    bestFor: ['Photographers', 'Videographers', 'Visual Artists'],
    isPremium: true
  },
  {
    id: 'marketing-creative',
    name: 'Marketing Creative',
    description: 'Bold design for marketing and brand professionals',
    category: 'creative',
    icon: '🎯',
    preview: '/templates/marketing-creative.png',
    colors: {
      primary: '#EF4444',
      secondary: '#DC2626',
      accent: '#F87171',
      text: '#1F2937'
    },
    layout: 'modern',
    features: ['Campaign highlights', 'Metrics showcase', 'Brand projects', 'ROI focus'],
    bestFor: ['Marketing Managers', 'Brand Strategists', 'Creative Directors'],
    isPremium: false
  },

  // HR & RECRUITMENT TEMPLATES
  {
    id: 'hr-professional',
    name: 'HR Professional',
    description: 'People-focused design for human resources',
    category: 'hr',
    icon: '👥',
    preview: '/templates/hr-professional.png',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      text: '#1F2937'
    },
    layout: 'modern',
    features: ['HR metrics', 'Team building', 'Policy development', 'Employee relations'],
    bestFor: ['HR Managers', 'Recruiters', 'Talent Acquisition'],
    isPremium: false
  },
  {
    id: 'recruiter',
    name: 'Talent Recruiter',
    description: 'Results-driven format for recruitment specialists',
    category: 'hr',
    icon: '🔍',
    preview: '/templates/recruiter.png',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A78BFA',
      text: '#1F2937'
    },
    layout: 'two-column',
    features: ['Placement stats', 'Industry sectors', 'Hiring metrics', 'Network highlights'],
    bestFor: ['Recruiters', 'Headhunters', 'Talent Scouts'],
    isPremium: false
  },

  // SALES & MARKETING TEMPLATES
  {
    id: 'sales-executive',
    name: 'Sales Executive',
    description: 'Revenue-focused design for sales professionals',
    category: 'sales',
    icon: '💼',
    preview: '/templates/sales-executive.png',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10B981',
      text: '#1F2937'
    },
    layout: 'modern',
    features: ['Sales metrics', 'Revenue growth', 'Client portfolio', 'Quota achievements'],
    bestFor: ['Sales Executives', 'Account Managers', 'Business Development'],
    isPremium: false
  },
  {
    id: 'digital-marketer',
    name: 'Digital Marketer',
    description: 'Campaign-focused layout for digital marketing',
    category: 'marketing',
    icon: '📈',
    preview: '/templates/digital-marketer.png',
    colors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FBBF24',
      text: '#1F2937'
    },
    layout: 'modern',
    features: ['Campaign metrics', 'SEO/SEM', 'Analytics', 'Conversion rates'],
    bestFor: ['Digital Marketers', 'SEO Specialists', 'Growth Hackers'],
    isPremium: false
  },

  // FINANCE TEMPLATES
  {
    id: 'finance-analyst',
    name: 'Finance Analyst',
    description: 'Numbers-driven design for finance professionals',
    category: 'finance',
    icon: '💰',
    preview: '/templates/finance-analyst.png',
    colors: {
      primary: '#1E40AF',
      secondary: '#1E3A8A',
      accent: '#3B82F6',
      text: '#1F2937'
    },
    layout: 'classic',
    features: ['Financial metrics', 'Analysis skills', 'Certifications', 'Technical tools'],
    bestFor: ['Financial Analysts', 'Accountants', 'Investment Bankers'],
    isPremium: false
  },
  {
    id: 'accountant',
    name: 'Certified Accountant',
    description: 'Professional format for accounting professionals',
    category: 'finance',
    icon: '📊',
    preview: '/templates/accountant.png',
    colors: {
      primary: '#475569',
      secondary: '#334155',
      accent: '#64748B',
      text: '#1E293B'
    },
    layout: 'classic',
    features: ['CPA credentials', 'Tax expertise', 'Compliance', 'Audit experience'],
    bestFor: ['CPAs', 'Tax Advisors', 'Auditors'],
    isPremium: false
  },

  // ENGINEERING TEMPLATES
  {
    id: 'mechanical-engineer',
    name: 'Engineering Professional',
    description: 'Technical design for engineering fields',
    category: 'engineering',
    icon: '⚙️',
    preview: '/templates/engineer.png',
    colors: {
      primary: '#0EA5E9',
      secondary: '#0284C7',
      accent: '#38BDF8',
      text: '#1F2937'
    },
    layout: 'two-column',
    features: ['Technical projects', 'CAD software', 'Certifications', 'Design portfolio'],
    bestFor: ['Mechanical Engineers', 'Civil Engineers', 'Electrical Engineers'],
    isPremium: false
  },

  // EDUCATION TEMPLATES
  {
    id: 'teacher',
    name: 'Education Professional',
    description: 'Academic-focused design for educators',
    category: 'education',
    icon: '📚',
    preview: '/templates/teacher.png',
    colors: {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      accent: '#8B5CF6',
      text: '#1F2937'
    },
    layout: 'classic',
    features: ['Teaching philosophy', 'Curriculum development', 'Student outcomes', 'Certifications'],
    bestFor: ['Teachers', 'Professors', 'Academic Administrators'],
    isPremium: false
  },
  {
    id: 'academic-researcher',
    name: 'Academic Researcher',
    description: 'Research-focused CV for academics',
    category: 'education',
    icon: '🔬',
    preview: '/templates/researcher.png',
    colors: {
      primary: '#1E40AF',
      secondary: '#1E3A8A',
      accent: '#3B82F6',
      text: '#1F2937'
    },
    layout: 'classic',
    features: ['Publications', 'Research grants', 'Conference presentations', 'Citations'],
    bestFor: ['Researchers', 'PhDs', 'Postdocs'],
    isPremium: true
  },

  // HEALTHCARE TEMPLATES
  {
    id: 'healthcare-professional',
    name: 'Healthcare Professional',
    description: 'Clinical-focused design for medical professionals',
    category: 'healthcare',
    icon: '⚕️',
    preview: '/templates/healthcare.png',
    colors: {
      primary: '#EF4444',
      secondary: '#DC2626',
      accent: '#F87171',
      text: '#1F2937'
    },
    layout: 'classic',
    features: ['Licenses & certifications', 'Clinical experience', 'Specializations', 'Patient care'],
    bestFor: ['Nurses', 'Doctors', 'Healthcare Administrators'],
    isPremium: false
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: '📄', count: RESUME_TEMPLATES_EXTENDED.length },
  { id: 'developer', label: 'Tech & Developer', icon: '💻', count: RESUME_TEMPLATES_EXTENDED.filter(t => t.category === 'developer').length },
  { id: 'business', label: 'Business & Executive', icon: '💼', count: RESUME_TEMPLATES_EXTENDED.filter(t => t.category === 'business').length },
  { id: 'creative', label: 'Creative & Design', icon: '🎨', count: RESUME_TEMPLATES_EXTENDED.filter(t => t.category === 'creative').length },
  { id: 'finance', label: 'Finance & Accounting', icon: '💰', count: RESUME_TEMPLATES_EXTENDED.filter(t => t.category === 'finance').length },
  { id: 'sales', label: 'Sales & Marketing', icon: '📈', count: RESUME_TEMPLATES_EXTENDED.filter(t => t.category === 'sales').length },
  { id: 'hr', label: 'HR & Recruitment', icon: '👥', count: RESUME_TEMPLATES_EXTENDED.filter(t => t.category === 'hr').length },
  { id: 'engineering', label: 'Engineering', icon: '⚙️', count: RESUME_TEMPLATES_EXTENDED.filter(t => t.category === 'engineering').length },
  { id: 'education', label: 'Education & Research', icon: '📚', count: RESUME_TEMPLATES_EXTENDED.filter(t => t.category === 'education').length },
  { id: 'healthcare', label: 'Healthcare & Medical', icon: '⚕️', count: RESUME_TEMPLATES_EXTENDED.filter(t => t.category === 'healthcare').length },
];
