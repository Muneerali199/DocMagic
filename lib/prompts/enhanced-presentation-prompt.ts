// Enhanced Presentation Prompt - 10x Better Than Gamma
// Creates professional presentations with mockups, diagrams, icons, and rich layouts

export interface SlideLayout {
  type: 'hero' | 'content' | 'bullets' | 'comparison' | 'timeline' | 'stats' | 'process' | 'mockup' | 'quote' | 'team' | 'pricing' | 'feature-grid' | 'data-viz' | 'before-after' | 'roadmap' | 'testimonial' | 'logo-cloud';
  columns?: 1 | 2 | 3 | 4;
  hasImage?: boolean;
  hasChart?: boolean;
  hasMockup?: boolean;
  hasIcons?: boolean;
}

export function createEnhancedPresentationPrompt(
  topic: string,
  audience: string,
  outline?: any[],
  settings?: any
) {
  const outlineInstruction = outline
    ? `\n**STRICT OUTLINE TO FOLLOW:**\nYou MUST create exactly ${outline.length} slides matching this structure:\n${JSON.stringify(outline, null, 2)}\n`
    : '';

  const styleInstruction = settings?.theme
    ? `\n**STYLE SETTINGS:**\n- Theme: ${settings.theme}\n- Text Density: ${settings.textDensity}\n- Art Style: ${settings.artStyle}\n- Audience: ${settings.audience}\n- Tone: ${settings.tone}\n`
    : '';

  return `You are a world-class presentation designer who creates presentations that are 10X BETTER than Gamma, Pitch, or Canva.
Your presentations are visually stunning, data-rich, and use professional mockups, diagrams, icons, and infographics.

**OUTPUT FORMAT: ENHANCED TOON (Token-Oriented Object Notation)**
Use "---SLIDE---" as the separator between slides.

**ENHANCED FORMAT STRUCTURE:**
---SLIDE---
slideNumber: <number>
type: <hero|content|bullets|comparison|timeline|stats|process|mockup|quote|team|pricing|feature-grid|data-viz|before-after|roadmap|testimonial|logo-cloud>
layout: <full|split|grid-2|grid-3|grid-4|asymmetric|centered>
title: <compelling, action-oriented title>
subtitle: <optional subtitle>
content: <main content text>
bullets:
* <Icon:Zap> <bullet point with emoji icon>
* <Icon:Target> <bullet point>
* <Icon:Rocket> <bullet point>
stats:
stat1: 95%|Customer Satisfaction|year-over-year
stat2: 2.5M|Active Users|and growing
stat3: 50+|Countries|worldwide
mockup:
type: <phone|laptop|dashboard|website|app|browser|tablet>
title: <mockup title>
elements:
- header|Navigation Bar
- hero|Welcome to Our Platform
- chart|Growth Analytics
- button|Get Started
comparison:
left: Old Way|Manual processes|Slow|Error-prone|Costly
right: New Way|Automated|Fast|Accurate|Cost-effective
timeline:
step1: 2020|Company Founded|Started with a vision
step2: 2021|Series A|$10M funding
step3: 2022|Global Expansion|Reached 50 countries
step4: 2023|Market Leader|#1 in category
icons:
icon1: Zap|Fast Performance
icon2: Shield|Secure Platform
icon3: Users|Team Collaboration
icon4: Globe|Global Reach
chartType: <bar|line|pie|area|radar|funnel>
chartData:
Q1 2024: 125
Q2 2024: 158
Q3 2024: 192
Q4 2024: 234
logos:
- Google
- Microsoft
- Amazon
- Meta
- Apple
testimonial:
quote: This platform transformed our business completely
author: John Smith
role: CEO, TechCorp
avatar: business-man
cta: <optional call to action>
background: <gradient-blue-purple|gradient-teal-emerald|gradient-coral-orange>
---SLIDE---

**SLIDE TYPE GUIDELINES (USE ALL TYPES):**

1. **hero** (SLIDE 1 ONLY): Epic opening with bold title, subtitle, and impactful visual
   - Use powerful, action-oriented language
   - Include a compelling CTA
   - Set the tone for the entire presentation

2. **stats** (USE FOR KEY METRICS - 20% of slides):
   - Display 3-4 big numbers with context
   - Use animated counters effect
   - Add trend indicators (↑ ↓)
   - Format: "stat1: 95%|Customer Satisfaction|year-over-year"

3. **comparison** (USE FOR BEFORE/AFTER or VS - 15% of slides):
   - Side-by-side comparison layout
   - Clear visual distinction
   - Use icons for each point
   - Format: "left: Old Way|point1|point2 / right: New Way|point1|point2"

4. **timeline/roadmap** (USE FOR HISTORY or FUTURE PLANS - 10% of slides):
   - Horizontal or vertical timeline
   - Key milestones with dates
   - Progress indicators
   - Format: "step1: 2020|Title|Description"

5. **mockup** (USE TO SHOW PRODUCTS - 15% of slides):
   - Phone, laptop, dashboard mockups
   - Show actual interface elements
   - Professional device frames
   - Format: "mockup: type|title|elements"

6. **feature-grid** (USE FOR FEATURES/BENEFITS - 15% of slides):
   - 2x2 or 3x3 grid of features
   - Each with icon, title, description
   - Format: "icons: icon1: Zap|Fast Performance"

7. **data-viz** (USE FOR DATA/ANALYTICS - 15% of slides):
   - Bar, line, pie, area, radar, funnel charts
   - Realistic, topic-relevant data
   - Clear labels and legends
   - Format: "chartType: bar / chartData: Q1: 100"

8. **testimonial** (USE FOR SOCIAL PROOF - 5% of slides):
   - Quote with attribution
   - Avatar placeholder
   - Company logo reference
   - Format: "testimonial: quote|author|role|avatar"

9. **logo-cloud** (USE FOR PARTNERS/CLIENTS - 5% of slides):
   - Grid of partner/client logos
   - Shows credibility and trust
   - Format: "logos: - Company1 / - Company2"

10. **process** (USE FOR WORKFLOWS - 10% of slides):
    - Step-by-step visual flow
    - Connected with arrows
    - Numbered steps with icons

**ICON LIBRARY (USE THESE IN BULLETS):**
<Icon:Zap> Lightning - Speed/Performance
<Icon:Shield> Shield - Security
<Icon:Users> Users - Team/Community
<Icon:Globe> Globe - Global/International
<Icon:Target> Target - Goals/Precision
<Icon:Rocket> Rocket - Growth/Launch
<Icon:Heart> Heart - Love/Care
<Icon:Star> Star - Quality/Premium
<Icon:Check> Check - Success/Completion
<Icon:TrendUp> TrendUp - Growth/Improvement
<Icon:Clock> Clock - Time/Efficiency
<Icon:Lock> Lock - Privacy/Security
<Icon:Award> Award - Achievement
<Icon:Lightbulb> Lightbulb - Ideas/Innovation
<Icon:BarChart> BarChart - Analytics/Data
<Icon:DollarSign> DollarSign - Revenue/Cost
<Icon:Smartphone> Smartphone - Mobile
<Icon:Cloud> Cloud - Cloud/Online
<Icon:Code> Code - Development/Tech
<Icon:Palette> Palette - Design/Creative

**MOCKUP ELEMENTS (FOR MOCKUP SLIDES):**
- header: Navigation bars, logos
- hero: Hero sections, headlines
- sidebar: Navigation menus
- card: Feature cards, content blocks
- chart: Dashboard charts
- table: Data tables
- button: CTA buttons
- form: Input fields
- image: Placeholder images
- list: Bullet lists
- stats: Metric displays
- avatar: User profiles

**CONTENT GUIDELINES:**
- **Topic**: ${topic}
- **Audience**: ${audience}
- **Tone**: Professional, inspiring, and data-driven
- **Slide Count**: ${outline ? outline.length : '10-14'} slides
- **Text**: Punchy, impactful, no fluff
${outlineInstruction}
${styleInstruction}

**REQUIRED SLIDE DISTRIBUTION FOR ${outline ? outline.length : '12'} SLIDES:**
1. 1x hero slide (opening)
2. 2-3x stats slides (key metrics with big numbers)
3. 2x comparison slides (before/after, vs competitor)
4. 1-2x mockup slides (product/interface showcase)
5. 2x feature-grid slides (benefits with icons)
6. 1-2x data-viz slides (charts and graphs)
7. 1x timeline/roadmap slide (history or future)
8. 1x testimonial or logo-cloud slide (social proof)
9. 1x process slide (how it works)
10. 1x closing slide with CTA

**DATA REALISM:**
- Generate realistic, topic-relevant numbers
- Use proper formatting (95%, $2.5M, 10,000+)
- Include context (year-over-year, per month)
- Make charts tell a story (growth trends, distributions)

**MOCKUP REALISM:**
- Include 4-6 realistic UI elements per mockup
- Match the topic (e.g., analytics dashboard for data topic)
- Use proper UI hierarchy (header → content → footer)

**IMPORTANT:**
- Start immediately with "---SLIDE---"
- NO conversational text or explanations
- EVERY slide MUST have a unique 'type'
- Use icons in bullets: "* <Icon:Zap> Fast performance"
- Include realistic data in chartData sections
- Create mockups that look like real products
- Make stats impactful with context
- Use comparison for persuasion
- Tell a story from slide to slide
`;
}

// Helper function to parse enhanced slide format
export function parseEnhancedSlide(block: string, index: number) {
  const lines = block.trim().split('\n');
  const slide: any = {
    slideNumber: index + 1,
    type: 'content',
    layout: 'full',
    title: '',
    content: '',
    design: { background: 'gradient-blue-purple' }
  };

  let currentKey = '';
  let currentList: any[] = [];
  let currentObject: any = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const lowerLine = trimmedLine.toLowerCase();

    // Basic properties
    if (lowerLine.startsWith('slidenumber:')) {
      slide.slideNumber = parseInt(trimmedLine.substring(12).trim()) || index + 1;
    } else if (lowerLine.startsWith('type:')) {
      slide.type = trimmedLine.substring(5).trim().toLowerCase();
    } else if (lowerLine.startsWith('layout:')) {
      slide.layout = trimmedLine.substring(7).trim().toLowerCase();
    } else if (lowerLine.startsWith('title:')) {
      slide.title = trimmedLine.substring(6).trim();
    } else if (lowerLine.startsWith('subtitle:')) {
      slide.subtitle = trimmedLine.substring(9).trim();
    } else if (lowerLine.startsWith('content:')) {
      slide.content = trimmedLine.substring(8).trim();
      currentKey = 'content';
    } else if (lowerLine.startsWith('cta:')) {
      slide.cta = trimmedLine.substring(4).trim();
    } else if (lowerLine.startsWith('background:')) {
      slide.design.background = trimmedLine.substring(11).trim();
    }
    // Stats
    else if (lowerLine.startsWith('stats:')) {
      slide.stats = [];
      currentKey = 'stats';
    } else if (lowerLine.startsWith('stat') && lowerLine.includes(':')) {
      const parts = trimmedLine.split(':').slice(1).join(':').split('|');
      if (parts.length >= 2) {
        slide.stats = slide.stats || [];
        slide.stats.push({
          value: parts[0]?.trim() || '',
          label: parts[1]?.trim() || '',
          context: parts[2]?.trim() || ''
        });
      }
    }
    // Comparison
    else if (lowerLine.startsWith('comparison:')) {
      slide.comparison = { left: [], right: [] };
      currentKey = 'comparison';
    } else if (lowerLine.startsWith('left:')) {
      const parts = trimmedLine.substring(5).split('|').map(p => p.trim());
      slide.comparison = slide.comparison || { left: [], right: [] };
      slide.comparison.leftTitle = parts[0];
      slide.comparison.left = parts.slice(1);
    } else if (lowerLine.startsWith('right:')) {
      const parts = trimmedLine.substring(6).split('|').map(p => p.trim());
      slide.comparison = slide.comparison || { left: [], right: [] };
      slide.comparison.rightTitle = parts[0];
      slide.comparison.right = parts.slice(1);
    }
    // Timeline
    else if (lowerLine.startsWith('timeline:')) {
      slide.timeline = [];
      currentKey = 'timeline';
    } else if (lowerLine.startsWith('step') && lowerLine.includes(':')) {
      const parts = trimmedLine.split(':').slice(1).join(':').split('|');
      if (parts.length >= 2) {
        slide.timeline = slide.timeline || [];
        slide.timeline.push({
          date: parts[0]?.trim() || '',
          title: parts[1]?.trim() || '',
          description: parts[2]?.trim() || ''
        });
      }
    }
    // Mockup
    else if (lowerLine.startsWith('mockup:')) {
      slide.mockup = { type: 'laptop', elements: [] };
      currentKey = 'mockup';
    } else if (currentKey === 'mockup' && lowerLine.startsWith('type:')) {
      slide.mockup.type = trimmedLine.substring(5).trim();
    } else if (currentKey === 'mockup' && lowerLine.startsWith('elements:')) {
      // Elements follow
    } else if (currentKey === 'mockup' && trimmedLine.startsWith('-')) {
      const element = trimmedLine.substring(1).trim();
      const parts = element.split('|');
      slide.mockup.elements.push({
        type: parts[0]?.trim() || 'content',
        content: parts[1]?.trim() || element
      });
    }
    // Icons/Features
    else if (lowerLine.startsWith('icons:')) {
      slide.icons = [];
      currentKey = 'icons';
    } else if (lowerLine.startsWith('icon') && lowerLine.includes(':')) {
      const parts = trimmedLine.split(':').slice(1).join(':').split('|');
      if (parts.length >= 2) {
        slide.icons = slide.icons || [];
        slide.icons.push({
          icon: parts[0]?.trim() || 'Star',
          label: parts[1]?.trim() || ''
        });
      }
    }
    // Logos
    else if (lowerLine.startsWith('logos:')) {
      slide.logos = [];
      currentKey = 'logos';
    } else if (currentKey === 'logos' && trimmedLine.startsWith('-')) {
      slide.logos.push(trimmedLine.substring(1).trim());
    }
    // Testimonial
    else if (lowerLine.startsWith('testimonial:')) {
      slide.testimonial = {};
      currentKey = 'testimonial';
    } else if (lowerLine.startsWith('quote:')) {
      slide.testimonial = slide.testimonial || {};
      slide.testimonial.quote = trimmedLine.substring(6).trim();
    } else if (lowerLine.startsWith('author:')) {
      slide.testimonial = slide.testimonial || {};
      slide.testimonial.author = trimmedLine.substring(7).trim();
    } else if (lowerLine.startsWith('role:')) {
      slide.testimonial = slide.testimonial || {};
      slide.testimonial.role = trimmedLine.substring(5).trim();
    }
    // Chart
    else if (lowerLine.startsWith('charttype:')) {
      slide.chartData = { type: trimmedLine.substring(10).trim().toLowerCase(), data: [] };
      currentKey = 'chart';
    } else if (lowerLine.startsWith('chartdata:')) {
      currentKey = 'chartdata';
    } else if (currentKey === 'chartdata' && trimmedLine.includes(':')) {
      const [name, valueStr] = trimmedLine.split(':').map(s => s.trim());
      const value = parseFloat(valueStr);
      if (!isNaN(value) && name) {
        slide.chartData = slide.chartData || { type: 'bar', data: [] };
        slide.chartData.data.push({ name, value });
      }
    }
    // Bullets
    else if (lowerLine.startsWith('bullets:')) {
      slide.bullets = [];
      currentKey = 'bullets';
    } else if (trimmedLine.startsWith('*') && currentKey === 'bullets') {
      slide.bullets.push(trimmedLine.substring(1).trim());
    }
  }

  // Fallback title
  if (!slide.title) {
    slide.title = `Slide ${index + 1}`;
  }

  return slide;
}
