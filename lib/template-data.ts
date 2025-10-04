// Enhanced Template Data with Categories and Previews

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface TemplateStyle {
  id: string;
  name: string;
  colorScheme: {
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
  mood: 'professional' | 'creative' | 'minimal' | 'bold' | 'elegant';
}

export const templateCategories: TemplateCategory[] = [
  {
    id: 'business',
    name: 'Business',
    description: 'Professional templates for business presentations',
    icon: '💼',
    color: 'blue',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Eye-catching designs for creative projects',
    icon: '🎨',
    color: 'purple',
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Clear and engaging templates for learning',
    icon: '📚',
    color: 'green',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Bold templates to promote your products',
    icon: '📈',
    color: 'pink',
  },
  {
    id: 'startup',
    name: 'Startup',
    description: 'Modern templates for pitch decks',
    icon: '🚀',
    color: 'orange',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple designs',
    icon: '✨',
    color: 'gray',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Formal templates for corporate use',
    icon: '🏢',
    color: 'indigo',
  },
  {
    id: 'tech',
    name: 'Technology',
    description: 'Modern templates for tech companies',
    icon: '💻',
    color: 'cyan',
  },
];

export const premiumTemplates = [
  {
    id: 'ultra-premium-modern',
    name: '✨ Ultra Premium Modern',
    category: 'business',
    type: 'presentation' as const,
    description: 'Next-generation premium template with stunning animations and beautiful gradients',
    preview: '/templates/ultra-premium-modern-preview.png',
    thumbnail: '/templates/ultra-premium-modern-thumb.png',
    style: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#ffffff',
      text: '#111827',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    features: ['4 Stunning Slides', 'Animated Charts', 'Gradient Backgrounds', 'Premium Icons', 'Professional Stats'],
    popular: true,
    new: true,
    pro: true,
    rating: 5.0,
    usageCount: 28947,
  },
  {
    id: 'modern-business-pro',
    name: 'Modern Business Pro',
    category: 'business',
    type: 'presentation' as const,
    description: 'Professional business template with clean design',
    preview: '/templates/modern-business-preview.png',
    thumbnail: '/templates/modern-business-thumb.png',
    style: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#ffffff',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    features: ['Charts', 'Icons', 'Images', 'Animations'],
    popular: true,
    new: false,
    pro: false,
    rating: 4.8,
    usageCount: 15234,
  },
  {
    id: 'creative-gradient',
    name: '🎨 Creative Gradient Pro',
    category: 'creative',
    type: 'presentation' as const,
    description: 'Stunning gradient design with vibrant colors and modern animations',
    preview: '/templates/creative-gradient-preview.png',
    thumbnail: '/templates/creative-gradient-thumb.png',
    style: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#f59e0b',
      background: '#0f172a',
      text: '#f8fafc',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Open Sans',
    },
    features: ['4 Beautiful Slides', 'Gradient Animations', 'Modern Icons', 'Dark Mode'],
    popular: true,
    new: true,
    pro: true,
    rating: 4.9,
    usageCount: 12847,
  },
  {
    id: 'startup-unicorn',
    name: '🚀 Startup Unicorn',
    category: 'startup',
    type: 'presentation' as const,
    description: 'Perfect for investor pitches with stunning metrics and growth charts',
    preview: '/templates/startup-unicorn-preview.png',
    thumbnail: '/templates/startup-unicorn-thumb.png',
    style: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#fbbf24',
      background: '#ffffff',
      text: '#111827',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Roboto',
    },
    features: ['4 Pitch Slides', 'Interactive Charts', 'Metrics Dashboard', 'Team Showcase'],
    popular: true,
    new: true,
    pro: true,
    rating: 5.0,
    usageCount: 31482,
  },
  {
    id: 'minimal-elegance',
    name: 'Minimal Elegance',
    category: 'minimal',
    type: 'resume' as const,
    description: 'Clean and elegant minimalist design',
    preview: '/templates/minimal-elegance-preview.png',
    thumbnail: '/templates/minimal-elegance-thumb.png',
    style: {
      primary: '#000000',
      secondary: '#404040',
      accent: '#d1d5db',
      background: '#ffffff',
      text: '#111827',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    features: ['Clean Layout', 'Typography Focus'],
    popular: false,
    new: true,
    pro: false,
    rating: 4.7,
    usageCount: 18543,
  },
  {
    id: 'startup-pitch',
    name: 'Startup Pitch Deck',
    category: 'startup',
    type: 'presentation' as const,
    description: 'Perfect for investor pitches and demos',
    preview: '/templates/startup-pitch-preview.png',
    thumbnail: '/templates/startup-pitch-thumb.png',
    style: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#fbbf24',
      background: '#ffffff',
      text: '#111827',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Roboto',
    },
    features: ['Charts', 'Metrics', 'Team Slides'],
    popular: true,
    new: false,
    pro: false,
    rating: 4.9,
    usageCount: 22187,
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    category: 'tech',
    type: 'cv' as const,
    description: 'Futuristic design for tech presentations',
    preview: '/templates/tech-modern-preview.png',
    thumbnail: '/templates/tech-modern-thumb.png',
    style: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#7c3aed',
      background: '#0c0e1a',
      text: '#f1f5f9',
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter',
    },
    features: ['Dark Mode', 'Code Blocks', 'Animations'],
    popular: false,
    new: true,
    pro: true,
    rating: 4.6,
    usageCount: 9327,
  },
  {
    id: 'corporate-formal',
    name: 'Corporate Formal',
    category: 'corporate',
    type: 'letter' as const,
    description: 'Traditional corporate presentation design',
    preview: '/templates/corporate-formal-preview.png',
    thumbnail: '/templates/corporate-formal-thumb.png',
    style: {
      primary: '#1e3a8a',
      secondary: '#1e40af',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Georgia',
      body: 'Arial',
    },
    features: ['Professional', 'Charts', 'Tables'],
    popular: false,
    new: false,
    pro: false,
    rating: 4.8,
    usageCount: 16789,
  },
  {
    id: 'marketing-bold',
    name: 'Marketing Bold',
    category: 'marketing',
    type: 'presentation' as const,
    description: 'Eye-catching design for marketing campaigns',
    preview: '/templates/marketing-bold-preview.png',
    thumbnail: '/templates/marketing-bold-thumb.png',
    style: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#111827',
    },
    fonts: {
      heading: 'Bebas Neue',
      body: 'Open Sans',
    },
    features: ['Bold Typography', 'Vibrant Colors', 'CTA Slides'],
    popular: true,
    new: false,
    pro: false,
    rating: 4.9,
    usageCount: 19238,
  },
  {
    id: 'education-friendly',
    name: 'Education Friendly',
    category: 'education',
    type: 'presentation' as const,
    description: 'Clear and engaging for educational content',
    preview: '/templates/education-friendly-preview.png',
    thumbnail: '/templates/education-friendly-thumb.png',
    style: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      accent: '#10b981',
      background: '#f9fafb',
      text: '#374151',
    },
    fonts: {
      heading: 'Nunito',
      body: 'Open Sans',
    },
    features: ['Clear Layout', 'Diagrams', 'Icons'],
    popular: false,
    new: false,
    pro: false,
    rating: 4.7,
    usageCount: 11456,
  },
];

export const textPresets = {
  headings: [
    {
      name: 'Bold Display',
      font: 'Inter',
      size: 72,
      weight: 'bold',
      color: '#000000',
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
    },
    {
      name: 'Elegant Serif',
      font: 'Playfair Display',
      size: 64,
      weight: 'normal',
      color: '#1f2937',
      letterSpacing: '0',
      lineHeight: 1.2,
    },
    {
      name: 'Modern Sans',
      font: 'Montserrat',
      size: 56,
      weight: '600',
      color: '#111827',
      letterSpacing: '-0.01em',
      lineHeight: 1.15,
    },
    {
      name: 'Tech Heading',
      font: 'Space Grotesk',
      size: 60,
      weight: 'bold',
      color: '#06b6d4',
      letterSpacing: '0',
      lineHeight: 1.1,
    },
  ],
  body: [
    {
      name: 'Clean Sans',
      font: 'Inter',
      size: 18,
      weight: 'normal',
      color: '#4b5563',
      letterSpacing: '0',
      lineHeight: 1.6,
    },
    {
      name: 'Readable Serif',
      font: 'Georgia',
      size: 18,
      weight: 'normal',
      color: '#374151',
      letterSpacing: '0',
      lineHeight: 1.7,
    },
    {
      name: 'Modern Body',
      font: 'Open Sans',
      size: 16,
      weight: 'normal',
      color: '#6b7280',
      letterSpacing: '0',
      lineHeight: 1.6,
    },
  ],
  emphasis: [
    {
      name: 'Bold Call-out',
      font: 'Montserrat',
      size: 24,
      weight: 'bold',
      color: '#ef4444',
      letterSpacing: '0',
      lineHeight: 1.4,
    },
    {
      name: 'Subtle Highlight',
      font: 'Inter',
      size: 20,
      weight: '600',
      color: '#3b82f6',
      letterSpacing: '0',
      lineHeight: 1.5,
    },
  ],
};

export const colorPalettes = {
  professional: [
    {
      name: 'Classic Blue',
      colors: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
    },
    {
      name: 'Corporate Gray',
      colors: ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#e5e7eb'],
    },
    {
      name: 'Forest Green',
      colors: ['#065f46', '#059669', '#10b981', '#34d399', '#d1fae5'],
    },
    {
      name: 'Royal Purple',
      colors: ['#581c87', '#7c3aed', '#a78bfa', '#c4b5fd', '#ede9fe'],
    },
  ],
  vibrant: [
    {
      name: 'Sunset',
      colors: ['#dc2626', '#f97316', '#fbbf24', '#fcd34d', '#fef3c7'],
    },
    {
      name: 'Ocean Wave',
      colors: ['#0284c7', '#06b6d4', '#22d3ee', '#67e8f9', '#cffafe'],
    },
    {
      name: 'Berry Mix',
      colors: ['#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fecdd3'],
    },
    {
      name: 'Neon Lights',
      colors: ['#6d28d9', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e9d5ff'],
    },
  ],
  pastel: [
    {
      name: 'Soft Dreams',
      colors: ['#fae8ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc'],
    },
    {
      name: 'Mint Fresh',
      colors: ['#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981'],
    },
    {
      name: 'Peachy Keen',
      colors: ['#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e'],
    },
  ],
  monochrome: [
    {
      name: 'Pure Black',
      colors: ['#000000', '#262626', '#404040', '#737373', '#a3a3a3'],
    },
    {
      name: 'Stone Gray',
      colors: ['#1c1917', '#292524', '#44403c', '#78716c', '#a8a29e'],
    },
  ],
};

export const fontPairings = [
  {
    name: 'Modern Professional',
    heading: 'Inter',
    body: 'Inter',
    mood: 'professional',
  },
  {
    name: 'Classic Elegance',
    heading: 'Playfair Display',
    body: 'Lato',
    mood: 'elegant',
  },
  {
    name: 'Bold Impact',
    heading: 'Montserrat',
    body: 'Open Sans',
    mood: 'bold',
  },
  {
    name: 'Tech Modern',
    heading: 'Space Grotesk',
    body: 'Inter',
    mood: 'minimal',
  },
  {
    name: 'Creative Fun',
    heading: 'Poppins',
    body: 'Roboto',
    mood: 'creative',
  },
];
