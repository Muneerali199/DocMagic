import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

function getGenAI(): GoogleGenerativeAI {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable is not set.");
  }
  return new GoogleGenerativeAI(GOOGLE_API_KEY);
}

interface WebsiteGenerationParams {
  prompt: string;
  style: string;
  pages: string[];
  includeAnimations: boolean;
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

export async function generateWebsite({
  prompt,
  style = 'modern',
  pages = ['home'],
  includeAnimations = true
}: WebsiteGenerationParams): Promise<WebsiteCode> {
  try {
    console.log('🚀 Starting website generation...');
    console.log('📝 Prompt:', prompt);
    console.log('🎨 Style:', style);
    
    // Generate AI images first (parallel with code generation)
    // Try AI generation first, fallback to curated images
    const imagesPromise = generateAIImages(prompt, 5).catch(() => generateImages(prompt, 5));
    
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const systemPrompt = `You are an EXPERT web designer and full-stack developer with 10+ years of experience. Generate a STUNNING, COMPLETE, PRODUCTION-READY website.

🎯 CRITICAL REQUIREMENTS:
1. Generate COMPLETE, PRODUCTION-READY code (not snippets!)
2. Use MODERN CSS3 (Flexbox, Grid, CSS Variables, Animations)
3. Make it PERFECTLY RESPONSIVE for ALL devices (mobile-first approach)
4. Include SMOOTH animations, transitions, and micro-interactions
5. Use SEMANTIC HTML5 with proper structure
6. Follow WCAG 2.1 AA accessibility standards
7. Include BEAUTIFUL color schemes and professional typography
8. Add INTERACTIVE elements with vanilla JavaScript (ES6+)
9. NO external dependencies or frameworks (pure HTML/CSS/JS)
10. Use IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_4, IMAGE_5 as placeholders
11. Return ONLY valid JSON (no markdown, no explanations)

📱 RESPONSIVE DESIGN (CRITICAL):
MUST include these breakpoints and test on all devices:

/* Mobile First (320px - 767px) */
- Single column layout
- Stack all elements vertically
- Full-width buttons and cards
- Larger touch targets (min 44px)
- Hamburger menu for navigation
- Font sizes: h1: 2rem, h2: 1.5rem, body: 1rem
- Padding: 1rem
- Images: 100% width

/* Tablet (768px - 1023px) */
@media (min-width: 768px) {
  - 2-column grid for features
  - Horizontal navigation (no hamburger)
  - Font sizes: h1: 2.5rem, h2: 2rem, body: 1.1rem
  - Padding: 2rem
  - Max-width: 720px container
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  - 3-4 column grid for features
  - Full navigation with dropdowns
  - Font sizes: h1: 3rem, h2: 2.5rem, body: 1.1rem
  - Padding: 3rem
  - Max-width: 1200px container
  - Hover effects active
}

🎨 DESIGN REQUIREMENTS:
- Hero section with full-width background image (IMAGE_1)
- Responsive navigation (hamburger on mobile, full on desktop)
- Feature/Services section with responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop)
- Call-to-action sections (full-width on mobile, centered on desktop)
- Testimonials or gallery (use IMAGE_5)
- Footer with responsive columns
- Smooth scroll behavior
- Touch-friendly on mobile (larger buttons, spacing)
- Hover effects on desktop only
- Loading animations
- Professional spacing and typography hierarchy

💻 CODE QUALITY:
- Clean, well-organized code
- CSS variables for colors, spacing, and breakpoints
- Reusable CSS classes
- Mobile-first media queries
- Optimized for performance
- Cross-browser compatible
- Touch-friendly interactions
- SEO-friendly meta tags and structure
- Viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">

Style Guidelines for "${style}":
${getStyleGuidelines(style)}

Generate code for these pages: ${pages.join(', ')}

IMPORTANT: Use IMAGE_1, IMAGE_2, IMAGE_3, etc. as placeholders for images. These will be replaced with real images.

Return a JSON object with this EXACT structure:
{
  "html": "complete HTML for main page with IMAGE_1, IMAGE_2 placeholders",
  "css": "complete CSS with all styles",
  "javascript": "complete JavaScript for interactivity",
  "pages": {
    "home": {
      "html": "HTML content for home page",
      "title": "Page title",
      "description": "Page description"
    }
  },
  "assets": {
    "colors": ["#color1", "#color2", ...],
    "fonts": ["Font Name 1", "Font Name 2"]
  }
}`;

    const userPrompt = `🎯 PROJECT: Create a ${style.toUpperCase()} style website for: "${prompt}"

📋 SPECIFICATIONS:
- Pages: ${pages.join(', ')}
- Animations: ${includeAnimations ? 'YES - Include smooth animations and transitions' : 'NO'}
- Style: ${style} (follow the style guidelines strictly)
- Quality: Production-ready, professional, stunning

🎨 REQUIRED SECTIONS:
1. HERO SECTION:
   - Full-width background image (IMAGE_1)
   - Compelling headline and subheadline
   - Primary CTA button
   - Smooth entrance animation

2. FEATURES/SERVICES SECTION:
   - 3-4 feature cards with images (IMAGE_2, IMAGE_3, IMAGE_4)
   - Icons or illustrations
   - Hover effects
   - Grid layout (responsive)

3. ABOUT/VALUE PROPOSITION:
   - Compelling copy
   - Supporting image (IMAGE_5)
   - Trust indicators

4. CALL-TO-ACTION:
   - Secondary CTA section
   - Contact form or signup
   - Social proof elements

5. FOOTER:
   - Links and navigation
   - Social media icons
   - Copyright info

💡 DESIGN DETAILS:
- Use modern color palette (${style} style)
- Professional typography (2-3 fonts max)
- Consistent spacing (use CSS variables)
- Smooth transitions (0.3s ease)
- Hover states on desktop only (not mobile)
- Mobile-first responsive design
- Loading/entrance animations
- Scroll-triggered animations

📱 RESPONSIVE REQUIREMENTS (CRITICAL):
MOBILE (320px - 767px):
- Single column layout for ALL sections
- Hamburger menu (☰) for navigation
- Full-width buttons (min 44px height)
- Stack feature cards vertically
- Larger font sizes for readability
- Touch-friendly spacing (min 16px)
- Hide complex animations
- Optimize images for mobile

TABLET (768px - 1023px):
- 2-column grid for features
- Horizontal navigation bar
- Medium-sized buttons
- 2-column footer
- Moderate animations
- Balanced spacing

DESKTOP (1024px+):
- 3-4 column grid for features
- Full navigation with hover effects
- Multi-column footer
- All animations active
- Generous spacing
- Hover effects on cards/buttons

🚀 TECHNICAL REQUIREMENTS:
- Semantic HTML5 tags
- CSS Grid and Flexbox (responsive)
- CSS Variables for theming and breakpoints
- Mobile-first media queries (@media min-width)
- Vanilla JavaScript for interactivity
- Hamburger menu JavaScript for mobile
- Smooth scroll behavior
- Form validation (if applicable)
- Accessible (ARIA labels, alt text, keyboard navigation)
- SEO meta tags
- Viewport meta tag REQUIRED

⚠️ CRITICAL: Test responsiveness at these exact widths:
- 320px (small mobile)
- 375px (iPhone)
- 768px (tablet)
- 1024px (desktop)
- 1440px (large desktop)

Generate the COMPLETE, PRODUCTION-READY, PERFECTLY RESPONSIVE code now. Make it STUNNING on ALL devices!`;

    console.log('💻 Generating code with Gemini 2.0 Flash...');
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = result.response;
    const text = response.text();
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
