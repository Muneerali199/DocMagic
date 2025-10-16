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
  };
}

export async function generateWebsite({
  prompt,
  style = 'modern',
  pages = ['home'],
  includeAnimations = true
}: WebsiteGenerationParams): Promise<WebsiteCode> {
  try {
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const systemPrompt = `You are an expert web designer and developer. Generate a complete, modern, responsive website based on the user's requirements.

IMPORTANT RULES:
1. Generate COMPLETE, PRODUCTION-READY code
2. Use modern CSS (Flexbox, Grid, CSS Variables)
3. Make it fully responsive (mobile-first)
4. Include smooth animations and transitions
5. Use semantic HTML5
6. Follow accessibility best practices
7. Include beautiful color schemes and typography
8. Add interactive elements with vanilla JavaScript
9. NO external dependencies or frameworks
10. Return ONLY valid JSON

Style Guidelines for "${style}":
${getStyleGuidelines(style)}

Generate code for these pages: ${pages.join(', ')}

Return a JSON object with this EXACT structure:
{
  "html": "complete HTML for main page",
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

    const userPrompt = `Create a ${style} style website for: ${prompt}

Requirements:
- Pages to create: ${pages.join(', ')}
- Include animations: ${includeAnimations}
- Make it visually stunning and professional
- Add hover effects and micro-interactions
- Use modern design trends
- Include a navigation menu
- Add call-to-action buttons
- Make it SEO-friendly

Generate the complete code now.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = result.response;
    const text = response.text();

    // Extract JSON from markdown code blocks if present
    let jsonText = text;
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    // Parse the JSON response
    const websiteCode: WebsiteCode = JSON.parse(jsonText);

    // Validate the response
    if (!websiteCode.html || !websiteCode.css) {
      throw new Error('Invalid response from AI: missing required fields');
    }

    // Ensure pages object exists
    if (!websiteCode.pages) {
      websiteCode.pages = {
        home: {
          html: websiteCode.html,
          title: 'Home',
          description: 'Home page'
        }
      };
    }

    // Ensure assets object exists
    if (!websiteCode.assets) {
      websiteCode.assets = {
        colors: ['#3B82F6', '#10B981', '#F59E0B'],
        fonts: ['Inter', 'Roboto']
      };
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

function getFallbackTemplate(prompt: string, style: string): WebsiteCode {
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

    <header class="hero">
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
                    <h3>Feature 1</h3>
                    <p>Amazing feature description</p>
                </div>
                <div class="feature-card">
                    <h3>Feature 2</h3>
                    <p>Another great feature</p>
                </div>
                <div class="feature-card">
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
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
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

@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
    }
    
    .nav-menu {
        flex-direction: column;
        gap: 1rem;
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
      fonts: ['Inter', 'Roboto']
    }
  };
}
