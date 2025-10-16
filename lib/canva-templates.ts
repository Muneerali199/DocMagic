// Professional Canva-like templates with beautiful previews

export interface CanvaTemplate {
  id: string;
  title: string;
  description: string;
  type: 'resume' | 'presentation' | 'letter' | 'cv' | 'diagram';
  preview_image: string;
  color_scheme: string[];
  tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  usage_count: number;
  rating: number;
  isPro: boolean;
  isFeatured: boolean;
  category: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  createdAt: string;
  content: any;
}

export const CANVA_TEMPLATES: CanvaTemplate[] = [
  // RESUME TEMPLATES
  {
    id: 'resume-modern-minimalist',
    title: 'Modern Minimalist Resume',
    description: 'Clean and professional design perfect for tech professionals and creative roles. Features elegant typography and strategic use of white space.',
    type: 'resume',
    preview_image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=1200&fit=crop',
    color_scheme: ['#2C3E50', '#3498DB', '#ECF0F1', '#95A5A6'],
    tags: ['Modern', 'Professional', 'Clean', 'Tech', 'Minimalist'],
    difficulty_level: 'beginner',
    usage_count: 15420,
    rating: 4.8,
    isPro: false,
    isFeatured: true,
    category: 'Corporate',
    author: {
      name: 'Design Studio',
      verified: true,
    },
    createdAt: '2024-01-15',
    content: {},
  },
  {
    id: 'resume-creative-bold',
    title: 'Creative Bold Resume',
    description: 'Stand out with vibrant colors and modern layout. Ideal for designers, marketers, and creative professionals.',
    type: 'resume',
    preview_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=1200&fit=crop',
    color_scheme: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
    tags: ['Creative', 'Colorful', 'Bold', 'Designer', 'Marketing'],
    difficulty_level: 'intermediate',
    usage_count: 8930,
    rating: 4.6,
    isPro: true,
    isFeatured: false,
    category: 'Creative',
    author: {
      name: 'Creative Hub',
      verified: true,
    },
    createdAt: '2024-02-10',
    content: {},
  },
  {
    id: 'resume-executive-professional',
    title: 'Executive Professional Resume',
    description: 'Sophisticated design for senior professionals and executives. Classic layout with modern touches.',
    type: 'resume',
    preview_image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=1200&fit=crop',
    color_scheme: ['#1A1A2E', '#16213E', '#0F3460', '#E94560'],
    tags: ['Executive', 'Professional', 'Senior', 'Management', 'Corporate'],
    difficulty_level: 'professional',
    usage_count: 12340,
    rating: 4.9,
    isPro: true,
    isFeatured: true,
    category: 'Executive',
    author: {
      name: 'Pro Templates',
      verified: true,
    },
    createdAt: '2024-01-20',
    content: {},
  },
  {
    id: 'resume-tech-innovator',
    title: 'Tech Innovator Resume',
    description: 'Perfect for software engineers and tech professionals. Modern design with clean code aesthetics.',
    type: 'resume',
    preview_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=1200&fit=crop',
    color_scheme: ['#667EEA', '#764BA2', '#F093FB', '#4FACFE'],
    tags: ['Tech', 'Software', 'Developer', 'Engineer', 'IT'],
    difficulty_level: 'intermediate',
    usage_count: 19870,
    rating: 4.7,
    isPro: false,
    isFeatured: true,
    category: 'Technology',
    author: {
      name: 'Tech Design Co',
      verified: true,
    },
    createdAt: '2024-02-05',
    content: {},
  },

  // PRESENTATION TEMPLATES
  {
    id: 'presentation-pitch-deck',
    title: 'Startup Pitch Deck',
    description: 'Impress investors with this professional pitch deck template. Includes slides for problem, solution, market, and financials.',
    type: 'presentation',
    preview_image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&h=1200&fit=crop',
    color_scheme: ['#6C63FF', '#3F3D56', '#F2F2F2', '#FF6584'],
    tags: ['Startup', 'Pitch', 'Business', 'Investor', 'Funding'],
    difficulty_level: 'advanced',
    usage_count: 25600,
    rating: 4.9,
    isPro: true,
    isFeatured: true,
    category: 'Business',
    author: {
      name: 'Startup Studio',
      verified: true,
    },
    createdAt: '2024-01-10',
    content: {},
  },
  {
    id: 'presentation-corporate-minimal',
    title: 'Corporate Minimal Presentation',
    description: 'Clean and professional presentation perfect for business meetings and reports. Elegant minimalist design.',
    type: 'presentation',
    preview_image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=1200&fit=crop',
    color_scheme: ['#2D3748', '#4299E1', '#EDF2F7', '#A0AEC0'],
    tags: ['Corporate', 'Business', 'Professional', 'Minimal', 'Clean'],
    difficulty_level: 'beginner',
    usage_count: 18900,
    rating: 4.7,
    isPro: false,
    isFeatured: false,
    category: 'Corporate',
    author: {
      name: 'Business Templates',
      verified: true,
    },
    createdAt: '2024-02-01',
    content: {},
  },
  {
    id: 'presentation-creative-agency',
    title: 'Creative Agency Showcase',
    description: 'Bold and colorful presentation for agencies and creative teams. Perfect for showcasing portfolio work.',
    type: 'presentation',
    preview_image: 'https://images.unsplash.com/photo-1523287562758-66c7fc58967f?w=800&h=1200&fit=crop',
    color_scheme: ['#FF0080', '#7928CA', '#FF4D4D', '#FFE600'],
    tags: ['Creative', 'Agency', 'Portfolio', 'Colorful', 'Modern'],
    difficulty_level: 'intermediate',
    usage_count: 14200,
    rating: 4.8,
    isPro: true,
    isFeatured: true,
    category: 'Creative',
    author: {
      name: 'Agency Pro',
      verified: true,
    },
    createdAt: '2024-01-25',
    content: {},
  },
  {
    id: 'presentation-education-modern',
    title: 'Modern Education Presentation',
    description: 'Engaging presentation template for educators and students. Interactive layout with visual elements.',
    type: 'presentation',
    preview_image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=1200&fit=crop',
    color_scheme: ['#5C6BC0', '#42A5F5', '#66BB6A', '#FFA726'],
    tags: ['Education', 'Learning', 'Teaching', 'Students', 'Academic'],
    difficulty_level: 'beginner',
    usage_count: 11500,
    rating: 4.6,
    isPro: false,
    isFeatured: false,
    category: 'Education',
    author: {
      name: 'Edu Design',
      verified: true,
    },
    createdAt: '2024-02-15',
    content: {},
  },

  // LETTER TEMPLATES
  {
    id: 'letter-professional-cover',
    title: 'Professional Cover Letter',
    description: 'Elegant cover letter template that complements any resume. Professional formatting with modern touches.',
    type: 'letter',
    preview_image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=1200&fit=crop',
    color_scheme: ['#1E40AF', '#3B82F6', '#DBEAFE', '#60A5FA'],
    tags: ['Cover Letter', 'Job Application', 'Professional', 'Career'],
    difficulty_level: 'beginner',
    usage_count: 22400,
    rating: 4.8,
    isPro: false,
    isFeatured: true,
    category: 'Career',
    author: {
      name: 'Career Experts',
      verified: true,
    },
    createdAt: '2024-01-12',
    content: {},
  },
  {
    id: 'letter-business-formal',
    title: 'Formal Business Letter',
    description: 'Classic formal business letter template. Perfect for official correspondence and professional communication.',
    type: 'letter',
    preview_image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=1200&fit=crop',
    color_scheme: ['#111827', '#374151', '#E5E7EB', '#6B7280'],
    tags: ['Business', 'Formal', 'Official', 'Corporate', 'Professional'],
    difficulty_level: 'beginner',
    usage_count: 16700,
    rating: 4.7,
    isPro: false,
    isFeatured: false,
    category: 'Business',
    author: {
      name: 'Business Suite',
      verified: true,
    },
    createdAt: '2024-02-08',
    content: {},
  },

  // CV TEMPLATES
  {
    id: 'cv-academic-detailed',
    title: 'Academic CV',
    description: 'Comprehensive CV template for academics and researchers. Includes sections for publications, research, and teaching.',
    type: 'cv',
    preview_image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=1200&fit=crop',
    color_scheme: ['#1F2937', '#4B5563', '#9CA3AF', '#D1D5DB'],
    tags: ['Academic', 'Research', 'PhD', 'University', 'Scholar'],
    difficulty_level: 'advanced',
    usage_count: 9800,
    rating: 4.9,
    isPro: true,
    isFeatured: true,
    category: 'Academic',
    author: {
      name: 'Academic Pro',
      verified: true,
    },
    createdAt: '2024-01-18',
    content: {},
  },
  {
    id: 'cv-medical-professional',
    title: 'Medical Professional CV',
    description: 'Specialized CV for healthcare professionals. Includes medical credentials, certifications, and clinical experience.',
    type: 'cv',
    preview_image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=1200&fit=crop',
    color_scheme: ['#0EA5E9', '#06B6D4', '#22D3EE', '#E0F2FE'],
    tags: ['Medical', 'Healthcare', 'Doctor', 'Nurse', 'Clinical'],
    difficulty_level: 'professional',
    usage_count: 13200,
    rating: 4.8,
    isPro: true,
    isFeatured: false,
    category: 'Healthcare',
    author: {
      name: 'Med Templates',
      verified: true,
    },
    createdAt: '2024-02-03',
    content: {},
  },

  // DIAGRAM TEMPLATES
  {
    id: 'diagram-flowchart-modern',
    title: 'Modern Flowchart Diagram',
    description: 'Clean flowchart template for process documentation. Perfect for workflows and business processes.',
    type: 'diagram',
    preview_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=1200&fit=crop',
    color_scheme: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
    tags: ['Flowchart', 'Process', 'Workflow', 'Business', 'Diagram'],
    difficulty_level: 'intermediate',
    usage_count: 17600,
    rating: 4.7,
    isPro: false,
    isFeatured: true,
    category: 'Business',
    author: {
      name: 'Diagram Pro',
      verified: true,
    },
    createdAt: '2024-01-30',
    content: {},
  },
  {
    id: 'diagram-infographic-stats',
    title: 'Statistical Infographic',
    description: 'Data visualization template for reports and presentations. Beautiful charts and graphs included.',
    type: 'diagram',
    preview_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=1200&fit=crop',
    color_scheme: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
    tags: ['Infographic', 'Data', 'Statistics', 'Charts', 'Visual'],
    difficulty_level: 'advanced',
    usage_count: 21300,
    rating: 4.9,
    isPro: true,
    isFeatured: true,
    category: 'Data',
    author: {
      name: 'Data Visual',
      verified: true,
    },
    createdAt: '2024-02-12',
    content: {},
  },
];

// Category configurations
export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: '🎨', gradient: 'from-purple-500 to-pink-500' },
  { id: 'resume', label: 'Resumes', icon: '📄', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'presentation', label: 'Presentations', icon: '📊', gradient: 'from-purple-500 to-pink-500' },
  { id: 'letter', label: 'Letters', icon: '✉️', gradient: 'from-green-500 to-teal-500' },
  { id: 'cv', label: 'CVs', icon: '📋', gradient: 'from-orange-500 to-red-500' },
  { id: 'diagram', label: 'Diagrams', icon: '🎨', gradient: 'from-indigo-500 to-purple-500' },
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'A-Z' },
];

// Filter options
export const DIFFICULTY_FILTERS = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'professional', label: 'Professional' },
];

export const PRO_FILTERS = [
  { value: 'all', label: 'All Templates' },
  { value: 'free', label: 'Free Only' },
  { value: 'pro', label: 'Pro Only' },
];
