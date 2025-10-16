// Complete templates with real content for presentations, resumes, and more

export interface PresentationSlide {
  id: string;
  type: 'title' | 'content' | 'two-column' | 'image' | 'quote' | 'conclusion';
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  leftColumn?: string[];
  rightColumn?: string[];
  quote?: string;
  author?: string;
  image?: string;
  background?: string;
}

export interface PresentationTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  slides: PresentationSlide[];
  colorScheme: string[];
}

export interface ResumeSection {
  id: string;
  title: string;
  items: {
    title?: string;
    subtitle?: string;
    date?: string;
    location?: string;
    description?: string;
    bullets?: string[];
    skills?: string[];
  }[];
}

export interface ResumeTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  colorScheme: string[];
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
    summary: string;
  };
  sections: ResumeSection[];
}

// COMPLETE PRESENTATION TEMPLATES WITH 10 SLIDES EACH

export const COMPLETE_PRESENTATION_TEMPLATES: PresentationTemplate[] = [
  {
    id: 'startup-pitch-deck-complete',
    title: 'Startup Pitch Deck - Complete 10 Slides',
    description: 'Professional investor pitch deck with all essential slides',
    category: 'Business',
    colorScheme: ['#6C63FF', '#3F3D56', '#F2F2F2', '#FF6584'],
    slides: [
      {
        id: 'slide-1',
        type: 'title',
        title: 'TechVision AI',
        subtitle: 'Revolutionizing Business Intelligence with AI',
        background: '#6C63FF',
      },
      {
        id: 'slide-2',
        type: 'content',
        title: 'The Problem',
        bullets: [
          'Companies lose $1.2M annually on inefficient data analysis',
          '70% of business decisions are made without proper data insights',
          'Current BI tools require extensive technical expertise',
          'SMBs cannot afford dedicated data science teams',
        ],
      },
      {
        id: 'slide-3',
        type: 'content',
        title: 'Our Solution',
        bullets: [
          'AI-powered business intelligence platform',
          'Natural language queries - no coding required',
          'Real-time automated insights and predictions',
          'Affordable for businesses of all sizes',
          'Integration with 100+ data sources',
        ],
      },
      {
        id: 'slide-4',
        type: 'two-column',
        title: 'Market Opportunity',
        leftColumn: [
          'Total Addressable Market',
          '$24B by 2025',
          'Growing at 15% CAGR',
        ],
        rightColumn: [
          'Target Customers',
          '50K SMBs in North America',
          '$500-5000 MRR per customer',
        ],
      },
      {
        id: 'slide-5',
        type: 'content',
        title: 'Business Model',
        bullets: [
          'Starter Plan: $49/month - Up to 5 users',
          'Professional: $199/month - Up to 25 users',
          'Enterprise: Custom pricing - Unlimited users',
          'Additional revenue from data connectors',
          'Professional services and training',
        ],
      },
      {
        id: 'slide-6',
        type: 'content',
        title: 'Traction & Metrics',
        bullets: [
          '500+ active customers in 6 months',
          '$50K MRR with 25% month-over-month growth',
          '40% conversion rate from free trial',
          'Net Revenue Retention: 120%',
          'Customer satisfaction: 4.8/5 stars',
        ],
      },
      {
        id: 'slide-7',
        type: 'content',
        title: 'Competitive Advantage',
        bullets: [
          'Proprietary AI algorithms (3 patents pending)',
          'First-mover advantage in SMB segment',
          '10x faster implementation than competitors',
          'Strongest data security certifications',
          'Strategic partnerships with Salesforce, HubSpot',
        ],
      },
      {
        id: 'slide-8',
        type: 'content',
        title: 'Go-To-Market Strategy',
        bullets: [
          'Phase 1: Direct sales to SMBs (Current)',
          'Phase 2: Partner channel development (Q2 2024)',
          'Phase 3: Enterprise expansion (Q4 2024)',
          'Marketing: Content, SEO, paid acquisition',
          'Target: 2,000 customers by end of 2024',
        ],
      },
      {
        id: 'slide-9',
        type: 'two-column',
        title: 'Financial Projections',
        leftColumn: [
          '2024: $2M ARR',
          '2025: $8M ARR',
          '2026: $25M ARR',
        ],
        rightColumn: [
          'Gross Margin: 85%',
          'CAC Payback: 6 months',
          'LTV/CAC Ratio: 5:1',
        ],
      },
      {
        id: 'slide-10',
        type: 'conclusion',
        title: 'The Ask',
        content: 'Raising $3M Series A',
        bullets: [
          'Scale sales and marketing team',
          'Expand product features',
          'International expansion',
        ],
        subtitle: 'Join us in democratizing business intelligence',
      },
    ],
  },
  {
    id: 'corporate-presentation-complete',
    title: 'Corporate Q4 Results - Complete 10 Slides',
    description: 'Professional quarterly business review presentation',
    category: 'Corporate',
    colorScheme: ['#2D3748', '#4299E1', '#EDF2F7', '#A0AEC0'],
    slides: [
      {
        id: 'slide-1',
        type: 'title',
        title: 'Q4 2024 Business Review',
        subtitle: 'Exceeding Expectations, Building for Tomorrow',
        background: '#2D3748',
      },
      {
        id: 'slide-2',
        type: 'content',
        title: 'Executive Summary',
        bullets: [
          'Revenue: $48.2M (↑32% YoY)',
          'Net Profit: $12.1M (↑45% YoY)',
          'Customer Acquisition: 2,450 new clients',
          'Employee Growth: 125 new team members',
          'Market Share: Increased to 18.5%',
        ],
      },
      {
        id: 'slide-3',
        type: 'content',
        title: 'Q4 Revenue Breakdown',
        bullets: [
          'Product Sales: $28.5M (59%)',
          'Service Revenue: $14.8M (31%)',
          'Licensing: $3.2M (7%)',
          'Other Revenue: $1.7M (3%)',
          'Recurring Revenue: 68% of total',
        ],
      },
      {
        id: 'slide-4',
        type: 'two-column',
        title: 'Geographic Performance',
        leftColumn: [
          'North America: $29M',
          'Europe: $12M',
          'Asia-Pacific: $7.2M',
        ],
        rightColumn: [
          'Growth: 28%',
          'Growth: 45%',
          'Growth: 52%',
        ],
      },
      {
        id: 'slide-5',
        type: 'content',
        title: 'Key Achievements',
        bullets: [
          'Launched 3 major product features',
          'Expanded to 15 new markets',
          'Achieved SOC 2 Type II certification',
          'Won "Best Enterprise Solution" award',
          'Signed 5 Fortune 500 clients',
        ],
      },
      {
        id: 'slide-6',
        type: 'content',
        title: 'Customer Metrics',
        bullets: [
          'Total Customers: 8,750 (↑39% YoY)',
          'Customer Retention: 94%',
          'NPS Score: 68 (Industry avg: 45)',
          'Average Contract Value: $5,500',
          'Upsell Rate: 35%',
        ],
      },
      {
        id: 'slide-7',
        type: 'content',
        title: 'Operational Highlights',
        bullets: [
          'Product uptime: 99.97%',
          'Support response time: Under 2 hours',
          'Employee satisfaction: 4.6/5',
          'Cost optimization: Saved $2.3M',
          'R&D investment: $8.5M (18% of revenue)',
        ],
      },
      {
        id: 'slide-8',
        type: 'content',
        title: 'Challenges & Lessons',
        bullets: [
          'Supply chain delays in Q3 resolved',
          'Improved sales cycle from 90 to 60 days',
          'Enhanced onboarding reduced churn by 22%',
          'Streamlined operations for better margins',
        ],
      },
      {
        id: 'slide-9',
        type: 'content',
        title: '2025 Strategic Priorities',
        bullets: [
          'Launch AI-powered features (Q1)',
          'Expand enterprise sales team by 40%',
          'Enter 10 new international markets',
          'Achieve $200M ARR by year-end',
          'Complete Series C funding round',
        ],
      },
      {
        id: 'slide-10',
        type: 'conclusion',
        title: 'Thank You',
        content: 'Strong finish to 2024, positioned for exceptional 2025 growth',
        subtitle: 'Questions & Discussion',
      },
    ],
  },
  // Add more presentation templates...
];

// COMPLETE RESUME TEMPLATES WITH REAL CONTENT

export const COMPLETE_RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'software-engineer-resume',
    title: 'Software Engineer Resume - Complete',
    description: 'Full-stack developer resume with 5 years experience',
    category: 'Technology',
    colorScheme: ['#667EEA', '#764BA2', '#F093FB', '#4FACFE'],
    personalInfo: {
      name: 'Sarah Johnson',
      title: 'Senior Full-Stack Software Engineer',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/sarahjohnson',
      website: 'sarahjohnson.dev',
      summary: 'Results-driven Full-Stack Software Engineer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud architecture. Led teams of 5+ developers and delivered 15+ production applications serving 2M+ users. Passionate about clean code, performance optimization, and mentoring junior developers.',
    },
    sections: [
      {
        id: 'experience',
        title: 'Professional Experience',
        items: [
          {
            title: 'Senior Software Engineer',
            subtitle: 'TechCorp Solutions',
            date: 'January 2022 - Present',
            location: 'San Francisco, CA',
            bullets: [
              'Led development of microservices architecture serving 1M+ daily active users',
              'Reduced application load time by 60% through code optimization and caching strategies',
              'Mentored team of 5 junior developers, improving code quality and team velocity by 40%',
              'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes',
              'Technologies: React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Kubernetes',
            ],
          },
          {
            title: 'Software Engineer',
            subtitle: 'StartupXYZ Inc.',
            date: 'June 2020 - December 2021',
            location: 'San Francisco, CA',
            bullets: [
              'Built RESTful APIs handling 50K+ requests per minute with 99.9% uptime',
              'Developed real-time dashboard using React and WebSockets for 10K+ concurrent users',
              'Implemented automated testing suite increasing code coverage from 45% to 85%',
              'Collaborated with product team to deliver 12 major features on time',
            ],
          },
          {
            title: 'Junior Software Developer',
            subtitle: 'Digital Agency Co.',
            date: 'July 2019 - May 2020',
            location: 'Austin, TX',
            bullets: [
              'Developed responsive web applications for 15+ clients using React and Vue.js',
              'Integrated third-party APIs (Stripe, SendGrid, Twilio) into client applications',
              'Participated in agile development process with daily standups and sprint planning',
            ],
          },
        ],
      },
      {
        id: 'education',
        title: 'Education',
        items: [
          {
            title: 'Bachelor of Science in Computer Science',
            subtitle: 'University of California, Berkeley',
            date: 'September 2015 - May 2019',
            location: 'Berkeley, CA',
            description: 'GPA: 3.8/4.0 • Dean\'s List (6 semesters) • CS Honor Society',
            bullets: [
              'Relevant Coursework: Data Structures, Algorithms, Database Systems, Web Development',
              'Senior Project: Built machine learning model for student performance prediction (92% accuracy)',
            ],
          },
        ],
      },
      {
        id: 'skills',
        title: 'Technical Skills',
        items: [
          {
            title: 'Languages',
            skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'HTML/CSS'],
          },
          {
            title: 'Frontend',
            skills: ['React', 'Next.js', 'Vue.js', 'Redux', 'Tailwind CSS', 'Material-UI'],
          },
          {
            title: 'Backend',
            skills: ['Node.js', 'Express', 'Django', 'Flask', 'GraphQL', 'REST APIs'],
          },
          {
            title: 'Database',
            skills: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Elasticsearch'],
          },
          {
            title: 'DevOps & Cloud',
            skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Terraform'],
          },
          {
            title: 'Tools',
            skills: ['Git', 'Jira', 'Postman', 'Figma', 'VS Code', 'Linux'],
          },
        ],
      },
      {
        id: 'projects',
        title: 'Notable Projects',
        items: [
          {
            title: 'E-Commerce Platform',
            bullets: [
              'Built full-stack e-commerce solution with shopping cart, payments, and admin dashboard',
              'Handled 100K+ transactions worth $2M+ in first 6 months',
              'Tech Stack: Next.js, Node.js, PostgreSQL, Stripe, AWS',
            ],
          },
          {
            title: 'Real-Time Collaboration Tool',
            bullets: [
              'Developed real-time document collaboration tool with 5K+ active users',
              'Implemented operational transformation for conflict resolution',
              'Tech Stack: React, WebSocket, Redis, MongoDB',
            ],
          },
        ],
      },
      {
        id: 'certifications',
        title: 'Certifications',
        items: [
          {
            title: 'AWS Certified Solutions Architect - Associate',
            date: '2023',
          },
          {
            title: 'MongoDB Certified Developer',
            date: '2022',
          },
        ],
      },
    ],
  },
  {
    id: 'product-manager-resume',
    title: 'Product Manager Resume - Complete',
    description: 'Senior PM resume with proven track record',
    category: 'Business',
    colorScheme: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
    personalInfo: {
      name: 'Michael Chen',
      title: 'Senior Product Manager',
      email: 'michael.chen@email.com',
      phone: '(555) 987-6543',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/michaelchen',
      website: 'michaelchen.com',
      summary: 'Strategic Product Manager with 7+ years of experience leading cross-functional teams to deliver innovative products. Launched 10+ successful products generating $50M+ in revenue. Expert in agile methodologies, user research, and data-driven decision making. MBA from Stanford with strong technical background.',
    },
    sections: [
      {
        id: 'experience',
        title: 'Professional Experience',
        items: [
          {
            title: 'Senior Product Manager',
            subtitle: 'GlobalTech Corporation',
            date: 'March 2021 - Present',
            location: 'New York, NY',
            bullets: [
              'Lead product strategy for SaaS platform serving 50K+ enterprise customers',
              'Launched 3 major features increasing user engagement by 75% and revenue by $12M annually',
              'Manage cross-functional team of 15 including engineers, designers, and marketers',
              'Conducted 100+ user interviews and A/B tests to validate product decisions',
              'Reduced customer churn from 8% to 3% through strategic product improvements',
              'Defined and tracked KPIs including DAU, MAU, conversion rates, and NPS',
            ],
          },
          {
            title: 'Product Manager',
            subtitle: 'InnovateSoft Inc.',
            date: 'January 2019 - February 2021',
            location: 'Boston, MA',
            bullets: [
              'Managed mobile app product line with 2M+ downloads and 4.7 star rating',
              'Prioritized product roadmap based on customer feedback, market research, and business goals',
              'Increased in-app purchases by 120% through optimized user journey',
              'Led migration from monolith to microservices architecture (6-month project)',
              'Collaborated with sales team to close $5M+ in enterprise deals',
            ],
          },
          {
            title: 'Associate Product Manager',
            subtitle: 'StartupHub',
            date: 'June 2017 - December 2018',
            location: 'San Francisco, CA',
            bullets: [
              'Launched MVP in 4 months that acquired 10K users in first 2 months',
              'Conducted market analysis and competitive research for product positioning',
              'Created detailed product requirements documents (PRDs) and user stories',
              'Worked closely with UX designers to create intuitive user interfaces',
            ],
          },
        ],
      },
      {
        id: 'education',
        title: 'Education',
        items: [
          {
            title: 'Master of Business Administration (MBA)',
            subtitle: 'Stanford Graduate School of Business',
            date: '2015 - 2017',
            location: 'Stanford, CA',
            description: 'Concentration: Product Management & Entrepreneurship',
          },
          {
            title: 'Bachelor of Science in Engineering',
            subtitle: 'Massachusetts Institute of Technology (MIT)',
            date: '2011 - 2015',
            location: 'Cambridge, MA',
            description: 'Major: Computer Science • Minor: Business Management • GPA: 3.9/4.0',
          },
        ],
      },
      {
        id: 'skills',
        title: 'Skills & Expertise',
        items: [
          {
            title: 'Product Management',
            skills: ['Product Strategy', 'Roadmap Planning', 'Agile/Scrum', 'User Research', 'A/B Testing'],
          },
          {
            title: 'Analytics & Tools',
            skills: ['SQL', 'Google Analytics', 'Mixpanel', 'Tableau', 'Jira', 'Figma', 'Productboard'],
          },
          {
            title: 'Business',
            skills: ['Go-to-Market Strategy', 'Pricing', 'Competitive Analysis', 'P&L Management'],
          },
          {
            title: 'Technical',
            skills: ['APIs', 'Cloud Architecture', 'Mobile Development', 'System Design'],
          },
        ],
      },
      {
        id: 'achievements',
        title: 'Key Achievements',
        items: [
          {
            bullets: [
              'Increased product revenue from $8M to $20M in 18 months',
              'Achieved 120% of OKRs for 6 consecutive quarters',
              'Reduced time-to-market for new features by 40%',
              'Built product management framework adopted across company',
              'Mentored 3 junior PMs who were promoted to mid-level roles',
            ],
          },
        ],
      },
      {
        id: 'certifications',
        title: 'Certifications',
        items: [
          { title: 'Certified Scrum Product Owner (CSPO)', date: '2023' },
          { title: 'Product Management Certificate - General Assembly', date: '2019' },
          { title: 'Google Analytics Individual Qualification', date: '2022' },
        ],
      },
    ],
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', count: 0 },
  { id: 'business', label: 'Business', count: 0 },
  { id: 'creative', label: 'Creative', count: 0 },
  { id: 'technology', label: 'Technology', count: 0 },
  { id: 'academic', label: 'Academic', count: 0 },
  { id: 'professional', label: 'Professional', count: 0 },
  { id: 'modern', label: 'Modern', count: 0 },
  { id: 'minimalist', label: 'Minimalist', count: 0 },
];
