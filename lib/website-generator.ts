import { GoogleGenerativeAI } from "@google/generative-ai";
import { websiteTemplates } from "./website-templates";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

function getGenAI(): GoogleGenerativeAI {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable is not set.");
  }
  return new GoogleGenerativeAI(GOOGLE_API_KEY);
}

// Mistral AI integration
async function generateWithMistral(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!MISTRAL_API_KEY) {
    console.warn('⚠️ MISTRAL_API_KEY not set, falling back to Gemini');
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);
    return result.response.text();
  }

  console.log('🤖 Using Mistral Large (mistral-large-latest)...');
  
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Mistral API error:', error);
    throw new Error(`Mistral API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

interface WebsiteGenerationParams {
  prompt: string;
  style: string;
  pages: string[];
  includeAnimations: boolean;
  templateId?: string;
}

interface WebsiteCode {
  html: string;
  css: string;
  javascript: string;
  pages: {
    [key: string]: {
      html: string;
      title: string;
      description: string;
    };
  };
  assets: {
    colors: string[];
    fonts: string[];
    images?: string[];
  };
}

// Generate AI images using multiple sources for best quality
async function generateImages(prompt: string, count: number = 5): Promise<string[]> {
  try {
    console.log('🎨 Generating AI images for:', prompt);
    
    // Extract main topic from prompt
    const topic = prompt
      .toLowerCase()
      .replace(/create|build|design|website|landing page|page|site|for|a|an|the/gi, '')
      .trim();
    
    const images: string[] = [];
    
    // Generate specific image prompts for each use case
    const imagePrompts = [
      `${topic} hero background, professional, high quality, modern design`,
      `${topic} feature illustration, clean, minimalist, professional`,
      `${topic} icon or symbol, simple, modern, vector style`,
      `${topic} abstract background, gradient, colorful, modern`,
      `${topic} product or service showcase, professional photography`
    ];
    
    // Use multiple image sources for variety and quality
    for (let i = 0; i < count; i++) {
      const imagePrompt = imagePrompts[i] || `${topic} professional image`;
      
      // Try different image generation services
      if (i === 0) {
        // Hero image - use Picsum for high quality
        images.push(`https://picsum.photos/seed/${encodeURIComponent(topic)}-hero/1200/600`);
      } else if (i === 1 || i === 2) {
        // Feature images - use Unsplash with specific queries
        const query = topic.split(' ').slice(0, 2).join(',');
        images.push(`https://source.unsplash.com/800x600/?${query},professional,${i}`);
      } else {
        // Additional images - use Lorem Picsum with variety
        images.push(`https://picsum.photos/seed/${encodeURIComponent(topic)}-${i}/800/600`);
      }
    }
    
    console.log('✅ Generated', images.length, 'images');
    return images;
    
  } catch (error) {
    console.error('❌ Error generating images:', error);
    
    // High-quality fallback images
    return [
      'https://picsum.photos/seed/hero/1200/600',
      'https://source.unsplash.com/800x600/?business,modern',
      'https://source.unsplash.com/800x600/?technology,professional',
      'https://picsum.photos/seed/feature1/800/600',
      'https://picsum.photos/seed/feature2/800/600'
    ];
  }
}

// Generate custom AI images using Gemini Imagen (if available)
async function generateAIImages(prompt: string, count: number = 5): Promise<string[]> {
  try {
    console.log('🤖 Attempting AI image generation with Gemini...');
    
    // Note: Gemini Imagen API is not yet publicly available
    // This is a placeholder for when it becomes available
    // For now, we'll use high-quality image services
    
    const topic = prompt
      .toLowerCase()
      .replace(/create|build|design|website|landing page|for/gi, '')
      .trim();
    
    // Use Pollinations.ai for AI-generated images (free alternative)
    const images: string[] = [];
    
    const imagePrompts = [
      `professional ${topic} hero image, modern, high quality, 4k`,
      `${topic} feature illustration, clean design, professional`,
      `${topic} icon, minimalist, modern design`,
      `${topic} abstract background, gradient, professional`,
      `${topic} showcase image, professional photography style`
    ];
    
    for (let i = 0; i < count; i++) {
      const encodedPrompt = encodeURIComponent(imagePrompts[i]);
      // Pollinations.ai - Free AI image generation
      images.push(`https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&seed=${i}&nologo=true`);
    }
    
    console.log('✅ AI images generated via Pollinations.ai');
    return images;
    
  } catch (error) {
    console.error('❌ AI image generation failed, using fallback:', error);
    return generateImages(prompt, count);
  }
}

// Build analysis for web applications (functional apps, not marketing websites)
function buildWebAppAnalysis(appType: string, prompt: string) {
  const appConfigs: Record<string, any> = {
    'Todo / Task Manager App': {
      features: ['Add new tasks', 'Mark tasks as complete', 'Delete tasks', 'Edit tasks', 'Filter (all/active/completed)', 'Clear completed', 'Task counter', 'Local storage persistence'],
      sections: ['App Header with Title', 'Task Input Form', 'Task List Display', 'Filter Controls', 'Task Statistics'],
      audience: 'Productivity-focused users',
      goal: 'Manage daily tasks efficiently',
      coreElements: 'Interactive task list with add/complete/delete functionality'
    },
    'Calculator App': {
      features: ['Number input buttons (0-9)', 'Operator buttons (+, -, *, /)', 'Clear/Reset button', 'Decimal point', 'Equals button', 'Display screen', 'Keyboard support', 'Operation history'],
      sections: ['Calculator Display Screen', 'Number Pad (0-9)', 'Operator Buttons', 'Function Buttons (Clear, Delete)'],
      audience: 'Anyone needing quick calculations',
      goal: 'Perform mathematical calculations',
      coreElements: 'Functional calculator with all basic operations'
    },
    'Weather App': {
      features: ['City search', 'Current temperature display', '5-day forecast', 'Weather icons', 'Wind speed/humidity', 'Temperature unit toggle (C/F)', 'Location detection', 'Real-time updates'],
      sections: ['Search Bar', 'Current Weather Display', 'Detailed Info Cards', 'Forecast Section'],
      audience: 'Users checking weather conditions',
      goal: 'Display accurate weather information',
      coreElements: 'Weather data display with search functionality'
    },
    'Notes / Memo App': {
      features: ['Create new notes', 'Edit notes', 'Delete notes', 'Search notes', 'Rich text formatting', 'Auto-save', 'Note categories/tags', 'Local storage'],
      sections: ['Notes Sidebar/List', 'Note Editor Area', 'Toolbar with Actions'],
      audience: 'Users needing quick note-taking',
      goal: 'Create and organize notes',
      coreElements: 'Note-taking interface with CRUD operations'
    },
    'Timer / Stopwatch App': {
      features: ['Start/Stop/Reset timer', 'Lap times', 'Countdown timer', 'Sound notification', 'Time display', 'Preset timers', 'Pause functionality'],
      sections: ['Time Display', 'Control Buttons', 'Lap Times List', 'Presets Section'],
      audience: 'Users tracking time',
      goal: 'Measure and track time accurately',
      coreElements: 'Functional timer with controls'
    },
    'Quiz / Trivia App': {
      features: ['Multiple choice questions', 'Score tracking', 'Timer per question', 'Progress indicator', 'Results summary', 'Restart quiz', 'Answer feedback'],
      sections: ['Question Display', 'Answer Options', 'Progress Bar', 'Score Display', 'Results Page'],
      audience: 'Users testing knowledge',
      goal: 'Engage in interactive quizzes',
      coreElements: 'Interactive quiz with questions and scoring'
    },
    'Unit Converter App': {
      features: ['Multiple unit categories', 'Input fields', 'Real-time conversion', 'Swap units button', 'Decimal precision', 'Common units', 'Unit search'],
      sections: ['Category Selector', 'Input Area', 'Conversion Display', 'Unit Dropdowns'],
      audience: 'Users converting measurements',
      goal: 'Convert between units accurately',
      coreElements: 'Conversion calculator with multiple units'
    },
    'Expense Tracker': {
      features: ['Add expense', 'Expense categories', 'Amount input', 'Date picker', 'Expense list', 'Total calculation', 'Filter by category', 'Delete expense', 'Edit expense'],
      sections: ['Expense Input Form', 'Expense List', 'Total/Summary Display', 'Category Filter'],
      audience: 'Users tracking spending',
      goal: 'Monitor expenses and budget',
      coreElements: 'Expense management with categories and totals'
    },
  };

  const config = appConfigs[appType] || {
    features: ['Interactive functionality', 'User input handling', 'Data display', 'Responsive design'],
    sections: ['App Interface', 'Control Panel', 'Display Area'],
    audience: 'App users',
    goal: 'Provide interactive functionality',
    coreElements: 'Functional web application'
  };

  return {
    type: appType,
    features: config.features,
    sections: config.sections,
    audience: config.audience,
    goal: config.goal,
    isWebApp: true,
    coreElements: config.coreElements
  };
}

// Intelligent prompt analysis to detect project type and requirements
function analyzePrompt(prompt: string): {
  type: string;
  features: string[];
  sections: string[];
  audience: string;
  goal: string;
  isWebApp: boolean;
} {
  const lowerPrompt = prompt.toLowerCase();
  
  // PRIORITY: Detect if this is a WEB APPLICATION (not a marketing website)
  const webAppKeywords = ['app', 'calculator', 'converter', 'tool', 'game', 'quiz', 'timer', 'counter', 'generator', 'editor', 'player', 'tracker'];
  const isWebApp = webAppKeywords.some(keyword => lowerPrompt.includes(keyword)) && 
                   !lowerPrompt.includes('website') && 
                   !lowerPrompt.includes('landing page');
  
  // Specific web app detection
  const webAppTypes = {
    'Todo / Task Manager App': ['todo', 'task', 'checklist', 'to-do', 'to do'],
    'Calculator App': ['calculator', 'calc', 'calculate'],
    'Weather App': ['weather', 'forecast', 'temperature'],
    'Notes / Memo App': ['note', 'memo', 'notepad'],
    'Timer / Stopwatch App': ['timer', 'stopwatch', 'countdown', 'alarm'],
    'Quiz / Trivia App': ['quiz', 'trivia', 'test', 'questionnaire'],
    'Unit Converter App': ['convert', 'converter', 'conversion'],
    'Color Picker / Generator': ['color picker', 'color generator', 'palette'],
    'Password Generator': ['password generator', 'password', 'generate password'],
    'Expense Tracker': ['expense', 'budget', 'spending', 'money tracker'],
    'Drawing / Canvas App': ['draw', 'paint', 'canvas', 'sketch'],
    'Music Player': ['music player', 'audio player', 'mp3'],
    'Video Player': ['video player', 'media player'],
    'Text Editor': ['text editor', 'code editor', 'markdown editor'],
    'Chat Application': ['chat', 'messaging', 'messenger'],
    'Game': ['game', 'tic tac toe', 'snake', 'tetris', 'puzzle'],
  };
  
  // Check for web app first
  if (isWebApp) {
    for (const [type, keywords] of Object.entries(webAppTypes)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return buildWebAppAnalysis(type, lowerPrompt);
      }
    }
  }
  
  // Project type detection with keywords (for marketing websites)
  const projectTypes = {
    'E-commerce / Online Store': ['shop', 'store', 'ecommerce', 'e-commerce', 'product', 'cart', 'checkout', 'buy', 'sell', 'marketplace'],
    'SaaS / Software Platform': ['saas', 'software', 'platform', 'service', 'subscription', 'dashboard', 'analytics', 'crm'],
    'Portfolio / Personal Website': ['portfolio', 'personal', 'resume', 'cv', 'work', 'project showcase', 'designer', 'developer', 'artist'],
    'Business / Corporate': ['business', 'company', 'corporate', 'enterprise', 'professional', 'consulting', 'agency', 'firm'],
    'Blog / Content Platform': ['blog', 'article', 'content', 'news', 'magazine', 'publication', 'writer', 'journal'],
    'Restaurant / Food Service': ['restaurant', 'cafe', 'food', 'menu', 'dining', 'chef', 'cuisine', 'delivery'],
    'Healthcare / Medical': ['health', 'medical', 'doctor', 'clinic', 'hospital', 'wellness', 'therapy', 'dental'],
    'Education / Learning': ['education', 'school', 'course', 'learning', 'training', 'university', 'academy', 'tutorial'],
    'Real Estate / Property': ['real estate', 'property', 'house', 'apartment', 'rental', 'listing', 'broker'],
    'Fitness / Gym': ['fitness', 'gym', 'workout', 'exercise', 'training', 'yoga', 'sports', 'health club'],
    'Event / Conference': ['event', 'conference', 'summit', 'meetup', 'seminar', 'workshop', 'gathering'],
    'Non-Profit / Charity': ['nonprofit', 'non-profit', 'charity', 'foundation', 'donation', 'cause', 'volunteer'],
    'Travel / Tourism': ['travel', 'tour', 'vacation', 'tourism', 'trip', 'destination', 'hotel', 'booking'],
    'Technology / Startup': ['tech', 'startup', 'innovation', 'ai', 'app', 'digital', 'mobile', 'automation'],
    'Creative / Design Agency': ['creative', 'design', 'agency', 'studio', 'branding', 'marketing', 'advertising'],
    'Landing Page / Lead Generation': ['landing page', 'lead', 'signup', 'conversion', 'download', 'free trial', 'demo']
  };
  
  let detectedType = 'General Business Website';
  let maxMatches = 0;
  
  for (const [type, keywords] of Object.entries(projectTypes)) {
    const matches = keywords.filter(keyword => lowerPrompt.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedType = type;
    }
  }
  
  // Feature detection based on project type and prompt
  const features: string[] = [];
  const sections: string[] = [];
  
  // Common features detection
  if (lowerPrompt.match(/form|contact|email|message|inquiry/)) features.push('Contact Form');
  if (lowerPrompt.match(/pricing|plan|package|tier/)) features.push('Pricing Tables');
  if (lowerPrompt.match(/testimonial|review|feedback|customer/)) features.push('Testimonials');
  if (lowerPrompt.match(/gallery|portfolio|showcase|work/)) features.push('Image Gallery');
  if (lowerPrompt.match(/blog|article|news|post/)) features.push('Blog Section');
  if (lowerPrompt.match(/team|about|staff|member/)) features.push('Team Section');
  if (lowerPrompt.match(/faq|question|help/)) features.push('FAQ Section');
  if (lowerPrompt.match(/cart|shop|product|checkout/)) features.push('Shopping Cart');
  if (lowerPrompt.match(/search|filter|find/)) features.push('Search Functionality');
  if (lowerPrompt.match(/login|signup|register|account/)) features.push('User Authentication');
  if (lowerPrompt.match(/video|youtube|embed/)) features.push('Video Integration');
  if (lowerPrompt.match(/map|location|address|direction/)) features.push('Interactive Map');
  if (lowerPrompt.match(/social|facebook|twitter|instagram/)) features.push('Social Media Integration');
  if (lowerPrompt.match(/newsletter|subscribe|email list/)) features.push('Newsletter Signup');
  if (lowerPrompt.match(/chat|support|help desk/)) features.push('Live Chat Support');
  
  // Type-specific sections
  switch (detectedType) {
    case 'E-commerce / Online Store':
      sections.push('Hero with Featured Products', 'Product Categories', 'Best Sellers', 'Special Offers', 'Customer Reviews', 'Newsletter Signup', 'Footer with Policies');
      if (!features.includes('Shopping Cart')) features.push('Shopping Cart');
      if (!features.includes('Search Functionality')) features.push('Product Search & Filter');
      break;
      
    case 'SaaS / Software Platform':
      sections.push('Hero with Value Proposition', 'Key Features Grid', 'How It Works', 'Pricing Plans', 'Customer Testimonials', 'CTA Section', 'Footer');
      if (!features.includes('Pricing Tables')) features.push('Pricing Tables');
      features.push('Feature Comparison Table');
      break;
      
    case 'Portfolio / Personal Website':
      sections.push('Hero with Introduction', 'About Me', 'Skills & Expertise', 'Project Showcase', 'Work Experience', 'Contact Section', 'Footer');
      if (!features.includes('Image Gallery')) features.push('Project Gallery');
      features.push('Downloadable Resume');
      break;
      
    case 'Restaurant / Food Service':
      sections.push('Hero with Ambiance Image', 'Menu Section', 'Chef/About', 'Photo Gallery', 'Reservations', 'Location & Hours', 'Footer');
      features.push('Menu Display');
      if (!features.includes('Interactive Map')) features.push('Location Map');
      break;
      
    case 'Healthcare / Medical':
      sections.push('Hero with Trust Signals', 'Services Offered', 'About Practice', 'Team of Doctors', 'Patient Testimonials', 'Appointment Booking', 'Footer');
      features.push('Appointment Scheduling');
      features.push('Insurance Information');
      break;
      
    case 'Education / Learning':
      sections.push('Hero with Course Overview', 'Curriculum/Courses', 'Instructor Profiles', 'Student Success Stories', 'Enrollment CTA', 'FAQ', 'Footer');
      features.push('Course Catalog');
      features.push('Enrollment Form');
      break;
      
    case 'Real Estate / Property':
      sections.push('Hero with Search', 'Featured Properties', 'Property Listings', 'About Agency', 'Agent Profiles', 'Contact & Inquiry', 'Footer');
      features.push('Property Search & Filters');
      features.push('Virtual Tour Integration');
      break;
      
    case 'Fitness / Gym':
      sections.push('Hero with Motivation', 'Classes & Programs', 'Trainers', 'Membership Plans', 'Transformation Gallery', 'Trial Signup', 'Footer');
      features.push('Class Schedule');
      features.push('Membership Comparison');
      break;
      
    case 'Landing Page / Lead Generation':
      sections.push('Hero with Strong Headline', 'Benefits/Features', 'Social Proof', 'Lead Capture Form', 'Final CTA', 'Footer');
      features.push('Lead Capture Form');
      features.push('A/B Testing Ready');
      break;
      
    default:
      sections.push('Hero Section', 'Features/Services', 'About/Value Proposition', 'Testimonials', 'Call-to-Action', 'Footer');
      if (!features.includes('Contact Form')) features.push('Contact Form');
  }
  
  // Determine audience and goal
  const audience = lowerPrompt.match(/for ([\w\s]+)/)?.[1]?.trim() || 'General Audience';
  
  const goalKeywords = {
    'Generate Leads': ['lead', 'signup', 'register', 'trial', 'demo'],
    'Sell Products': ['buy', 'shop', 'purchase', 'cart', 'checkout'],
    'Build Trust': ['professional', 'corporate', 'business', 'credibility'],
    'Share Information': ['blog', 'news', 'content', 'article', 'information'],
    'Book Appointments': ['appointment', 'booking', 'schedule', 'reservation'],
    'Drive Engagement': ['community', 'social', 'engage', 'interact'],
  };
  
  let primaryGoal = 'Inform and Engage Visitors';
  for (const [goal, keywords] of Object.entries(goalKeywords)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      primaryGoal = goal;
      break;
    }
  }
  
  // Ensure minimum features
  if (features.length === 0) {
    features.push('Responsive Navigation', 'Hero Section', 'Contact Information');
  }
  
  return {
    type: detectedType,
    features: [...new Set(features)], // Remove duplicates
    sections: [...new Set(sections)], // Remove duplicates
    audience,
    goal: primaryGoal,
    isWebApp: false
  };
}

export async function generateWebsite({
  prompt,
  style = 'modern',
  pages = ['home'],
  includeAnimations = true,
  templateId
}: WebsiteGenerationParams): Promise<WebsiteCode> {
  try {
    console.log('🚀 Starting website generation...');
    console.log('📝 Prompt:', prompt);
    console.log('🎨 Style:', style);
    console.log('📋 Template ID:', templateId);
    
    // Analyze the prompt to detect project type and requirements
    const projectAnalysis = analyzePrompt(prompt);
    console.log('🔍 Project Analysis:', projectAnalysis);
    
    // Find the template if templateId is provided
    const selectedTemplate = templateId 
      ? websiteTemplates.find(t => t.id === templateId)
      : null;
    
    // Extract styling information from template
    let templateStylingGuide = '';
    if (selectedTemplate) {
      console.log(`✨ Using ${selectedTemplate.name} as styling reference`);
      templateStylingGuide = `
🎨 TEMPLATE STYLING REFERENCE (${selectedTemplate.name}):
Use this template as your PRIMARY styling inspiration. Extract and adapt:
- Color schemes and gradients
- Typography (fonts, sizes, weights)
- Spacing and layout patterns
- Shadow and border radius styles
- Animation and transition effects
- Component styling (cards, buttons, inputs)
- Background patterns and effects
- Overall visual aesthetic

Template Category: ${selectedTemplate.category}
Template HTML (for styling reference only):
${selectedTemplate.htmlCode.substring(0, 3000)}... [truncated for brevity]

IMPORTANT: 
- ADAPT this styling to the user's request
- Don't copy the content, only the VISUAL STYLE
- Create NEW content based on the user's prompt
- Maintain the template's design language and aesthetics
`;
    }
    
    // Generate AI images first (parallel with code generation)
    // Try AI generation first, fallback to curated images
    const imagesPromise = generateAIImages(prompt, 5).catch(() => generateImages(prompt, 5));
    
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Different prompts for web apps vs marketing websites
    const isWebApp = projectAnalysis.isWebApp;
    
    const systemPrompt = isWebApp ? 
    `You are an EXPERT web application developer specializing in building FUNCTIONAL, INTERACTIVE web apps with vanilla JavaScript.

🚨🚨🚨 CRITICAL WARNING: DO NOT CREATE A MARKETING WEBSITE! 🚨🚨🚨

This is a WEB APPLICATION - the user wants the ACTUAL WORKING APP, NOT a landing page about an app!

FORBIDDEN ELEMENTS (DO NOT INCLUDE):
❌ NO <nav> navigation menus
❌ NO hero sections with "Welcome to..." or "Get Started" buttons
❌ NO "Features" sections that explain what the app does
❌ NO marketing copy or sales language
❌ NO "About Us" or "Contact" sections
❌ NO footer with copyright notices
❌ NO generic placeholder text
❌ NO image galleries showing app screenshots

REQUIRED ELEMENTS (MUST INCLUDE):
✅ The actual working application interface
✅ Input fields, buttons, and controls that WORK
✅ Real JavaScript functionality with event listeners
✅ Data persistence with localStorage
✅ Interactive elements that respond to user actions

APPLICATION TYPE: ${projectAnalysis.type}
CORE FUNCTIONALITY: ${(projectAnalysis as any).coreElements || 'Fully functional interactive application'}
FEATURES TO IMPLEMENT: ${projectAnalysis.features.join(', ')}
TARGET AUDIENCE: ${projectAnalysis.audience}
PRIMARY GOAL: ${projectAnalysis.goal}

⚡ YOUR MISSION:
Build a COMPLETE, WORKING ${projectAnalysis.type}:
1. ✅ Create the ACTUAL APP INTERFACE (not a website describing it)
2. ✅ Implement ALL features with REAL JavaScript code
3. ✅ Start directly with the app functionality (no navigation, no hero)
4. ✅ Add event listeners for ALL user interactions
5. ✅ Use localStorage for data persistence
6. ✅ Make it fully functional and interactive
7. ✅ Ensure all buttons, inputs, and controls WORK
8. ✅ Make it mobile-responsive
9. ✅ Include proper error handling
10. ✅ Return ONLY valid JSON (no markdown)

📋 APPLICATION COMPONENTS REQUIRED:
${projectAnalysis.sections.map((section, i) => `${i + 1}. ${section} - MUST BE FULLY FUNCTIONAL`).join('\n')}

💻 WEB APP REQUIREMENTS:
1. HTML STRUCTURE:
   - Clean, semantic HTML focused on app functionality
   - Form elements with proper attributes (type, name, id)
   - Data attributes for JavaScript targeting (data-*)
   - ARIA labels for accessibility
   - NO hero sections, NO marketing copy - ONLY the app interface

2. CSS STYLING:
   - Modern, clean UI with good spacing
   - Mobile-responsive (mobile-first)
   - Clear visual feedback for interactions (hover, active, focus states)
   - Loading states, success/error states
   - Smooth transitions for better UX
   - Professional color scheme and typography

3. JAVASCRIPT FUNCTIONALITY (CRITICAL):
   - Implement COMPLETE working logic for the application
   - Event listeners for ALL buttons, inputs, forms
   - Data management (add, edit, delete, filter, sort)
   - localStorage/sessionStorage for data persistence
   - Form validation where needed
   - Dynamic DOM updates (add/remove elements)
   - State management for the application
   - Error handling and user feedback
   - Keyboard shortcuts for power users
   - Smooth animations for state changes
   
4. EXAMPLE HTML STRUCTURE FOR ${projectAnalysis.type}:
   ${projectAnalysis.type === 'Todo / Task Manager App' ? `
   CORRECT HTML STRUCTURE:
   <!DOCTYPE html>
   <html>
   <head>
       <title>Todo App</title>
       <style>/* App styling */</style>
   </head>
   <body>
       <div class="todo-app">
           <h1>My Tasks</h1>
           <form id="todoForm">
               <input type="text" id="todoInput" placeholder="What needs to be done?" />
               <button type="submit">Add</button>
           </form>
           <div class="filters">
               <button data-filter="all" class="active">All</button>
               <button data-filter="active">Active</button>
               <button data-filter="completed">Completed</button>
           </div>
           <ul id="todoList"></ul>
           <div class="stats">
               <span id="taskCount">0 items left</span>
               <button id="clearCompleted">Clear completed</button>
           </div>
       </div>
       <script>
           // FULL WORKING JAVASCRIPT HERE
           let todos = JSON.parse(localStorage.getItem('todos')) || [];
           // ... complete implementation
       </script>
   </body>
   </html>
   
   WRONG (DO NOT DO THIS):
   <!DOCTYPE html>
   <html>
   <body>
       <nav><!-- navigation menu --></nav>
       <header class="hero">
           <h1>Welcome to Our Todo App!</h1>
           <button>Get Started</button>
       </header>
       <section class="features">
           <h2>Features</h2>
           <p>Our app helps you...</p>
       </section>
   </body>
   </html>
   ` : 'See specific examples below for your app type'}

5. SPECIFIC FUNCTIONALITY REQUIREMENTS:
   - Todo App: Add task (Enter/Button), mark complete (checkbox), delete (button), filter (all/active/completed), localStorage persistence
   - Calculator: Number buttons (0-9), operators (+,-,*,/), equals, clear, keyboard support, display updates
   - Weather App: Search input, API call (or mock data), display current weather, 5-day forecast, toggle C/F
   - Notes App: Create/edit/delete notes, search functionality, auto-save to localStorage, rich text formatting
   - Timer: Start/stop/reset buttons, countdown timer, lap times, sound notifications, time display updates

6. ABSOLUTELY NO MARKETING CONTENT:
   - NO navigation menus with Home/About/Contact
   - NO hero sections with welcome messages
   - NO "Features" sections explaining the app
   - NO "Get Started" or "Download" CTAs
   - NO pricing plans or testimonials
   - START DIRECTLY with the app interface

📱 RESPONSIVE (Mobile-First):
- Mobile: Single column, large touch targets (min 44px), bottom navigation if needed
- Tablet: Optimized layout, sidebar if appropriate
- Desktop: Full layout with keyboard shortcuts

${templateStylingGuide}`
    :
    `You are an EXPERT web designer and full-stack developer with 10+ years of experience creating production-ready websites.

🎯 PROJECT UNDERSTANDING:
You MUST deeply understand what the user wants to build and create a COMPLETE, FUNCTIONAL website tailored to their specific needs.

PROJECT TYPE DETECTED: ${projectAnalysis.type}
KEY FEATURES REQUIRED: ${projectAnalysis.features.join(', ')}
SUGGESTED SECTIONS: ${projectAnalysis.sections.join(', ')}
TARGET AUDIENCE: ${projectAnalysis.audience}
PRIMARY GOAL: ${projectAnalysis.goal}

${templateStylingGuide}

🚀 YOUR MISSION:
Create a COMPLETE, PRODUCTION-READY, FULLY FUNCTIONAL website that:
1. ✅ Perfectly matches the user's requirements and project type
2. ✅ Includes ALL necessary sections for this specific type of website
3. ✅ Has intelligent, relevant content (not generic placeholders)
4. ✅ Works flawlessly on mobile, tablet, and desktop
5. ✅ Includes ALL interactive features needed for this project type
6. ✅ Uses professional design patterns for this industry/category
7. ✅ Has semantic, accessible, SEO-optimized HTML
8. ✅ Uses modern CSS with animations and transitions
9. ✅ Includes working JavaScript for all interactive elements
10. ✅ Returns ONLY valid JSON (no markdown, no explanations)

📐 INTELLIGENT SECTION GENERATION:
Based on the project type "${projectAnalysis.type}", you MUST include these sections:
${projectAnalysis.sections.map((section, i) => `${i + 1}. ${section}`).join('\n')}

Plus any additional sections that make sense for this specific project.

🎨 DESIGN EXCELLENCE:
- Use colors, typography, and layout appropriate for "${projectAnalysis.type}"
- Match industry standards and user expectations
- Create visual hierarchy that guides users to the primary goal
- Use micro-interactions and animations that enhance UX
- Ensure accessibility (WCAG 2.1 AA compliant)

💻 TECHNICAL REQUIREMENTS:
1. RESPONSIVE DESIGN (Mobile-First):
   - Mobile (320px-767px): Single column, hamburger menu, stack all content
   - Tablet (768px-1023px): 2-column grids, horizontal nav
   - Desktop (1024px+): Multi-column layouts, full navigation, hover effects

2. HTML STRUCTURE:
   - Semantic HTML5 tags (<header>, <nav>, <main>, <section>, <article>, <footer>)
   - Proper heading hierarchy (h1 → h2 → h3)
   - ARIA labels for accessibility
   - Meta tags for SEO (title, description, viewport, og tags)
   - Alt text for all images

3. CSS ARCHITECTURE:
   - CSS Variables for theming (:root { --primary-color: ...; })
   - Mobile-first media queries (@media (min-width: 768px))
   - Flexbox and CSS Grid for layouts
   - Smooth transitions (transition: all 0.3s ease)
   - Hover effects on interactive elements
   - Loading and scroll animations
   - No external dependencies (pure CSS)

4. JAVASCRIPT FUNCTIONALITY:
   - Hamburger menu toggle (mobile navigation)
   - Smooth scroll to sections
   - Form validation (if forms are present)
   - Interactive elements (tabs, accordions, modals if needed)
   - Scroll animations (fade-in, slide-in)
   - Image lazy loading
   - Vanilla JavaScript only (ES6+)

5. IMAGE PLACEHOLDERS:
   - Use IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_4, IMAGE_5 as placeholders
   - Place them logically based on the content
   - IMAGE_1: Hero/banner background
   - IMAGE_2-4: Features, services, or product images
   - IMAGE_5: About, team, or testimonial images

📱 RESPONSIVE BREAKPOINTS (CRITICAL):
/* Mobile First (320px - 767px) */
- Single column layout
- Stack all elements vertically
- Full-width buttons and cards (min 44px height for touch)
- Hamburger menu (☰) for navigation
- Font sizes: h1: 2rem, h2: 1.5rem, body: 1rem
- Padding: 1rem
- Hide complex animations
- Optimize for touch interactions

/* Tablet (768px - 1023px) */
@media (min-width: 768px) {
  - 2-column grid for features/cards
  - Horizontal navigation (no hamburger)
  - Font sizes: h1: 2.5rem, h2: 2rem, body: 1.1rem
  - Padding: 2rem
  - Max-width: 720px container
  - Moderate animations
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  - 3-4 column grid for features/cards
  - Full navigation with dropdowns
  - Font sizes: h1: 3rem, h2: 2.5rem, body: 1.1rem
  - Padding: 3rem
  - Max-width: 1200px container
  - All hover effects active
  - Full animations
}

🎨 STYLE GUIDELINES FOR "${style}":
${getStyleGuidelines(style)}

� PAGES TO GENERATE:
${pages.join(', ')}

⚠️ CRITICAL JSON STRUCTURE:
Return ONLY this exact JSON structure (no markdown, no code blocks, no explanations):
{
  "html": "<!DOCTYPE html><html>...</html>",
  "css": "/* Complete CSS with all styles */",
  "javascript": "// Complete JavaScript with all functionality",
  "pages": {
    "home": {
      "html": "<!-- Complete page HTML -->",
      "title": "Relevant Page Title",
      "description": "SEO-optimized description"
    }
  },
  "assets": {
    "colors": ["#primary", "#secondary", "#accent"],
    "fonts": ["Primary Font", "Secondary Font"]
  }
}

🎯 REMEMBER:
- Understand the PROJECT TYPE and build accordingly
- Include ALL sections needed for this specific website type
- Make content RELEVANT (not generic)
- Ensure PERFECT responsiveness on all devices
- Add ALL necessary interactive features
- Test mentally at 320px, 768px, and 1024px
- Return ONLY valid JSON`;

    const userPrompt = isWebApp ? 
    `🚨 BUILD A WORKING ${projectAnalysis.type.toUpperCase()} 🚨

📋 USER'S REQUEST:
"${prompt}"

⚠️ CRITICAL REMINDERS:
1. DO NOT create a marketing website
2. DO NOT include navigation menus, hero sections, or "features" sections
3. DO NOT add "Welcome to..." or "Get Started" buttons
4. CREATE THE ACTUAL WORKING APPLICATION IMMEDIATELY
5. The HTML should start directly with the app interface

🎯 WHAT TO BUILD:
A fully functional ${projectAnalysis.type} with these working features:
${projectAnalysis.features.map((f, i) => `${i + 1}. ${f} - MUST BE FUNCTIONAL`).join('\n')}

🔧 APP COMPONENTS TO IMPLEMENT:
${projectAnalysis.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

💻 JAVASCRIPT REQUIREMENTS:
${projectAnalysis.type === 'Todo / Task Manager App' ? `
- todoForm.addEventListener('submit', ...) to add tasks
- Checkbox onChange to mark complete
- Delete button click listeners
- Filter button click listeners  
- localStorage.setItem('todos', ...) for persistence
- localStorage.getItem('todos') on page load
- updateUI() function to render tasks dynamically
` : projectAnalysis.type === 'Calculator App' ? `
- Click listeners on all number buttons (0-9)
- Click listeners on operator buttons (+, -, *, /)
- Equals button calculates the result
- Clear button resets everything
- Display updates on every click
- Keyboard support with keydown event listener
` : `
- Event listeners for ALL interactive elements
- Data management with add/edit/delete functions
- localStorage for data persistence
- Dynamic DOM updates
- Error handling and validation
`}

📱 STYLING:
- Modern, clean UI (use ${style} style)
- Mobile-responsive with good spacing
- Clear button styles with hover effects
- Input fields with proper focus states
- Loading/success/error visual feedback

🎯 EXAMPLE FOR ${projectAnalysis.type}:
Your HTML should look like this (NOT like a marketing website):

GOOD ✅:
<div class="app-container">
  <h1>Todo List</h1>
  <input type="text" id="todoInput" />
  <button id="addBtn">Add Task</button>
  <ul id="todoList"></ul>
</div>
<script>
  // Working JavaScript here
  const addBtn = document.getElementById('addBtn');
  addBtn.addEventListener('click', () => {
    // Add task logic
  });
</script>

BAD ❌:
<nav><a href="#home">Home</a></nav>
<header class="hero">
  <h1>Welcome to Todo Pro!</h1>
  <button>Get Started</button>
</header>

NOW BUILD THE ACTUAL WORKING ${projectAnalysis.type}!`
    :
    `🎯 CREATE A ${projectAnalysis.type.toUpperCase()} WEBSITE

📋 USER'S REQUEST:
"${prompt}"

🎨 SPECIFICATIONS:
- Style: ${style} (${getStyleGuidelines(style).split('\n')[0]})
- Pages: ${pages.join(', ')}
- Animations: ${includeAnimations ? 'YES - Include smooth, professional animations' : 'NO - Keep it simple'}
${selectedTemplate ? `- Template Reference: ${selectedTemplate.name} (${selectedTemplate.category}) - Adapt this styling` : ''}
- Quality Level: Production-ready, professional, pixel-perfect

🚀 PROJECT REQUIREMENTS:
Type: ${projectAnalysis.type}
Target Audience: ${projectAnalysis.audience}
Primary Goal: ${projectAnalysis.goal}

MUST-HAVE Features:
${projectAnalysis.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

REQUIRED Sections (in order):
${projectAnalysis.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

🎨 DESIGN DIRECTION:
- Color scheme should match the "${projectAnalysis.type}" industry standards
- Typography should be ${style === 'professional' ? 'corporate and trustworthy' : style === 'creative' ? 'bold and expressive' : style === 'minimal' ? 'clean and simple' : style === 'tech' ? 'futuristic and modern' : 'clean and modern'}
- Layout should prioritize: ${projectAnalysis.goal}
- Interactive elements should focus on user engagement and conversion

� CONTENT INTELLIGENCE:
- Write compelling, relevant copy for each section
- Use industry-appropriate terminology
- Create realistic examples and use cases
- Make CTAs action-oriented and clear
- Ensure content flows naturally from section to section

📱 RESPONSIVE CHECKLIST:
✅ Mobile (320px): All content readable, buttons tap-friendly, single column
✅ Tablet (768px): 2-column layouts where appropriate, horizontal nav
✅ Desktop (1024px+): Full multi-column layouts, hover effects, animations

🔧 FUNCTIONAL REQUIREMENTS:
✅ Navigation menu (hamburger on mobile, full on desktop)
✅ Smooth scroll to sections when clicking nav links
✅ Form validation if forms are present
✅ Interactive elements (tabs, accordions, etc.) if needed for this project type
✅ Hover effects on buttons, cards, links (desktop only)
✅ Loading animations on page load
✅ Scroll-triggered fade-in animations
✅ Mobile-optimized touch interactions

⚡ PERFORMANCE:
- Optimize CSS (combine similar styles, use variables)
- Minimize JavaScript (only what's needed)
- Use efficient selectors
- Lazy load images conceptually
- Mobile-first CSS (smaller bundle for mobile)

🎯 FINAL CHECK:
Before generating, ensure you understand:
1. What type of website this is: ${projectAnalysis.type}
2. Who it's for: ${projectAnalysis.audience}
3. What it should achieve: ${projectAnalysis.goal}
4. What sections it needs: ${projectAnalysis.sections.length} main sections
5. What features it must have: ${projectAnalysis.features.length} key features

Now generate the COMPLETE, PRODUCTION-READY, FULLY RESPONSIVE website!
Make it STUNNING, FUNCTIONAL, and PERFECTLY TAILORED to the user's needs!`;

    console.log('💻 Generating code with Mistral Large...');
    const text = await generateWithMistral(systemPrompt, userPrompt);
    console.log('✅ Code generation complete');

    // Extract JSON from markdown code blocks if present
    let jsonText = text;
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
      console.log('📦 Extracted JSON from markdown');
    }

    // Parse the JSON response
    console.log('🔍 Parsing generated code...');
    const websiteCode: WebsiteCode = JSON.parse(jsonText);

    // Validate the response
    if (!websiteCode.html || !websiteCode.css) {
      throw new Error('Invalid response from AI: missing required fields');
    }
    console.log('✅ Code validation passed');

    // Wait for images to be generated
    console.log('⏳ Waiting for AI images...');
    const images = await imagesPromise;
    console.log('✅ Received', images.length, 'images');
    
    // Replace image placeholders with real images
    let htmlWithImages = websiteCode.html;
    images.forEach((imageUrl, index) => {
      const placeholder = `IMAGE_${index + 1}`;
      htmlWithImages = htmlWithImages.replace(new RegExp(placeholder, 'g'), imageUrl);
    });
    
    websiteCode.html = htmlWithImages;

    // Ensure pages object exists
    if (!websiteCode.pages) {
      websiteCode.pages = {
        home: {
          html: htmlWithImages,
          title: 'Home',
          description: 'Home page'
        }
      };
    }

    // Ensure assets object exists and add images
    if (!websiteCode.assets) {
      websiteCode.assets = {
        colors: ['#3B82F6', '#10B981', '#F59E0B'],
        fonts: ['Inter', 'Roboto'],
        images: images
      };
    } else {
      websiteCode.assets.images = images;
    }

    return websiteCode;
  } catch (error) {
    console.error('Error generating website:', error);
    
    // Return a fallback template
    return getFallbackTemplate(prompt, style);
  }
}

function getStyleGuidelines(style: string): string {
  const guidelines: { [key: string]: string } = {
    modern: `
- Clean, minimalist design
- Bold typography
- Ample white space
- Subtle shadows and depth
- Blue/purple color schemes
- Sans-serif fonts`,
    
    creative: `
- Bold, vibrant colors
- Unique layouts
- Artistic elements
- Gradient backgrounds
- Playful animations
- Mixed typography`,
    
    professional: `
- Corporate color palette
- Structured layouts
- Conservative design
- Trust-building elements
- Professional imagery
- Classic fonts`,
    
    minimal: `
- Maximum white space
- Monochromatic colors
- Simple typography
- Clean lines
- Subtle interactions
- Focus on content`,
    
    tech: `
- Dark mode friendly
- Neon accents
- Futuristic elements
- Code-like aesthetics
- Geometric shapes
- Modern sans-serif fonts`,
    
    ecommerce: `
- Product-focused layout
- Clear CTAs
- Shopping cart integration
- Product grids
- Trust badges
- Conversion-optimized`
  };

  return guidelines[style] || guidelines.modern;
}

async function getFallbackTemplate(prompt: string, style: string): Promise<WebsiteCode> {
  // Generate images for fallback template
  const images = await generateImages(prompt, 5);
  
  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="logo">Logo</div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <header class="hero" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${images[0]}'); background-size: cover; background-position: center;">
        <div class="container">
            <h1 class="hero-title">${prompt}</h1>
            <p class="hero-subtitle">Create something amazing</p>
            <button class="cta-button">Get Started</button>
        </div>
    </header>

    <section class="features">
        <div class="container">
            <h2>Features</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <img src="${images[1]}" alt="Feature 1" class="feature-image">
                    <h3>Feature 1</h3>
                    <p>Amazing feature description</p>
                </div>
                <div class="feature-card">
                    <img src="${images[2]}" alt="Feature 2" class="feature-image">
                    <h3>Feature 2</h3>
                    <p>Another great feature</p>
                </div>
                <div class="feature-card">
                    <img src="${images[3]}" alt="Feature 3" class="feature-image">
                    <h3>Feature 3</h3>
                    <p>One more awesome feature</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 All rights reserved</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`,
    css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary-color: #3B82F6;
    --secondary-color: #10B981;
    --text-color: #1F2937;
    --bg-color: #FFFFFF;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: var(--text-color);
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.navbar {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.navbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: var(--text-color);
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: var(--primary-color);
}

.hero {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 8rem 0;
    text-align: center;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    animation: fadeInUp 0.8s ease-out 0.2s both;
}

.cta-button {
    background: white;
    color: var(--primary-color);
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    animation: fadeInUp 0.8s ease-out 0.4s both;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.features {
    padding: 6rem 0;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    overflow: hidden;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

.feature-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.feature-card h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.footer {
    background: #1F2937;
    color: white;
    padding: 2rem 0;
    text-align: center;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive Design - Mobile First */
@media (max-width: 767px) {
    .container {
        padding: 0 1rem;
    }
    
    .navbar .container {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .nav-menu {
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        margin-top: 1rem;
    }
    
    .hero {
        padding: 4rem 0;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .hero-subtitle {
        font-size: 1.2rem;
    }
    
    .feature-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .cta-button {
        width: 100%;
        padding: 1rem;
    }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
    .container {
        max-width: 720px;
    }
    
    .feature-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
    }
    
    .feature-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .hero-title {
        font-size: 3rem;
    }
}`,
    javascript: `// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll animation to elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});

// CTA button interaction
document.querySelector('.cta-button')?.addEventListener('click', () => {
    alert('Get started with your amazing website!');
});`,
    pages: {
      home: {
        html: 'Home page content',
        title: prompt,
        description: `Website for ${prompt}`
      }
    },
    assets: {
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      fonts: ['Inter', 'Roboto'],
      images: images
    }
  };
}

// Improve existing website based on user feedback
export async function improveWebsite({
  currentCode,
  improvementRequest,
  style = 'modern'
}: {
  currentCode: WebsiteCode;
  improvementRequest: string;
  style?: string;
}): Promise<WebsiteCode> {
  try {
    console.log('🔧 Improving website based on user feedback...');
    console.log('📝 Improvement Request:', improvementRequest);

    const improvementPrompt = `You are an expert web developer improving an existing website based on user feedback.

CURRENT WEBSITE CODE:
HTML:
${currentCode.html.substring(0, 2000)}...

CSS:
${currentCode.css.substring(0, 1500)}...

JAVASCRIPT:
${currentCode.javascript.substring(0, 1000)}...

USER'S IMPROVEMENT REQUEST:
"${improvementRequest}"

🎯 YOUR TASK:
Analyze the user's request and make the EXACT improvements they asked for. This could be:
- Change colors, fonts, or styling
- Add, remove, or modify sections
- Change layout or spacing
- Add new features or functionality
- Fix issues or bugs
- Improve responsiveness
- Add animations or effects
- Update content or copy
- Any other specific change requested

⚠️ CRITICAL RULES:
1. Make ONLY the changes the user requested
2. Keep everything else EXACTLY the same
3. Maintain the overall structure and design
4. Ensure all code is valid and functional
5. Keep it fully responsive (mobile/tablet/desktop)
6. Return complete, working code (not snippets)
7. Return ONLY valid JSON (no markdown, no explanations)

📱 MAINTAIN RESPONSIVE DESIGN:
- Keep mobile-first approach
- Preserve all media queries
- Ensure touch-friendly on mobile
- Test changes work on all screen sizes

Return a JSON object with this EXACT structure:
{
  "html": "complete improved HTML",
  "css": "complete improved CSS",
  "javascript": "complete improved JavaScript",
  "pages": {
    "home": {
      "html": "improved page HTML",
      "title": "Page title",
      "description": "Page description"
    }
  },
  "assets": {
    "colors": ["#color1", "#color2"],
    "fonts": ["Font1", "Font2"]
  }
}

Now improve the website based on the user's request: "${improvementRequest}"`;

    console.log('💻 Using Mistral Large for improvements...');
    const response = await generateWithMistral(
      'You are an expert web developer. Return ONLY valid JSON with no markdown formatting.',
      improvementPrompt
    );

    // Clean response
    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
        maxOutputTokens: 8000,
      },
    });

    const response = result.response.text();
    
    // Clean response
    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse JSON
    const improvedCode = JSON.parse(cleanedResponse);

    // Validate response
    if (!improvedCode.html || !improvedCode.css) {
      throw new Error('Invalid improved code structure');
    }

    console.log('✅ Website improved successfully');

    return {
      html: improvedCode.html,
      css: improvedCode.css,
      javascript: improvedCode.javascript || currentCode.javascript,
      pages: improvedCode.pages || currentCode.pages,
      assets: improvedCode.assets || currentCode.assets
    };

  } catch (error) {
    console.error('❌ Website improvement failed:', error);
    // Return original code if improvement fails
    return currentCode;
  }
}
