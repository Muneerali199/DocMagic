/**
 * Professional Presentation Styles
 * Inspired by modern presentation platforms
 */

export interface PresentationStyle {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    heading: string;
    body: string;
    sizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      small: string;
    };
  };
  layout: {
    padding: string;
    maxWidth: string;
    spacing: string;
  };
  imageStyle: string; // FLUX prompt enhancement
}

export const presentationStyles: Record<string, PresentationStyle> = {
  modern: {
    id: "modern",
    name: "Modern Professional (Gamma Style)",
    description: "Bold typography with stunning gradients - Gamma inspired",
    colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#ec4899",
      background: "#ffffff",
      text: "#0f172a",
      textSecondary: "#64748b",
    },
    fonts: {
      heading: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      body: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      sizes: {
        h1: "clamp(3.5rem, 10vw, 7rem)", // Bigger, bolder like Gamma
        h2: "clamp(2.5rem, 6vw, 5rem)",
        h3: "clamp(1.75rem, 4vw, 3rem)",
        body: "clamp(1.25rem, 2.5vw, 1.75rem)", // Larger body text
        small: "clamp(1rem, 1.75vw, 1.25rem)",
      },
    },
    layout: {
      padding: "clamp(3rem, 6vw, 5rem)", // More breathing room
      maxWidth: "1600px",
      spacing: "clamp(1.5rem, 4vw, 3rem)",
    },
    imageStyle: "stunning professional photography, vibrant gradient overlays, modern abstract backgrounds, high-end commercial quality, dramatic lighting, bold colors, cinematic composition, 8k ultra HD, visually striking, premium design aesthetic",
  },

  minimal: {
    id: "minimal",
    name: "Minimal Elegance",
    description: "Sophisticated simplicity with ample whitespace",
    colors: {
      primary: "#000000",
      secondary: "#374151",
      accent: "#3b82f6",
      background: "#ffffff",
      text: "#111827",
      textSecondary: "#6b7280",
    },
    fonts: {
      heading: "Helvetica Neue, Arial, sans-serif",
      body: "Helvetica Neue, Arial, sans-serif",
      sizes: {
        h1: "clamp(3.5rem, 9vw, 7rem)",
        h2: "clamp(2.5rem, 6vw, 5rem)",
        h3: "clamp(1.75rem, 4vw, 3rem)",
        body: "clamp(1.25rem, 2.5vw, 1.75rem)",
        small: "clamp(1rem, 1.75vw, 1.25rem)",
      },
    },
    layout: {
      padding: "clamp(3rem, 6vw, 5rem)",
      maxWidth: "1200px",
      spacing: "clamp(1.5rem, 4vw, 3rem)",
    },
    imageStyle: "minimalist composition, clean lines, monochromatic palette, professional, high-end photography, lots of negative space",
  },

  bold: {
    id: "bold",
    name: "Bold & Dynamic",
    description: "Eye-catching designs with strong visual hierarchy",
    colors: {
      primary: "#ef4444",
      secondary: "#f59e0b",
      accent: "#10b981",
      background: "#0f172a",
      text: "#ffffff",
      textSecondary: "#cbd5e1",
    },
    fonts: {
      heading: "Montserrat, sans-serif",
      body: "Open Sans, sans-serif",
      sizes: {
        h1: "clamp(4rem, 10vw, 8rem)",
        h2: "clamp(2.5rem, 6vw, 5rem)",
        h3: "clamp(1.75rem, 4vw, 3rem)",
        body: "clamp(1.125rem, 2.5vw, 1.625rem)",
        small: "clamp(0.875rem, 1.75vw, 1.125rem)",
      },
    },
    layout: {
      padding: "clamp(2rem, 5vw, 4rem)",
      maxWidth: "1600px",
      spacing: "clamp(1rem, 3vw, 2.5rem)",
    },
    imageStyle: "bold colors, dynamic composition, high energy, dramatic lighting, vibrant gradients, modern abstract",
  },

  corporate: {
    id: "corporate",
    name: "Corporate Professional",
    description: "Trust-building design for business presentations",
    colors: {
      primary: "#1e40af",
      secondary: "#0891b2",
      accent: "#059669",
      background: "#f8fafc",
      text: "#0f172a",
      textSecondary: "#475569",
    },
    fonts: {
      heading: "Roboto, sans-serif",
      body: "Roboto, sans-serif",
      sizes: {
        h1: "clamp(3rem, 7vw, 5.5rem)",
        h2: "clamp(2rem, 5vw, 4rem)",
        h3: "clamp(1.5rem, 3.5vw, 2.5rem)",
        body: "clamp(1.125rem, 2.25vw, 1.5rem)",
        small: "clamp(0.875rem, 1.5vw, 1.125rem)",
      },
    },
    layout: {
      padding: "clamp(2.5rem, 5vw, 4rem)",
      maxWidth: "1300px",
      spacing: "clamp(1.25rem, 3vw, 2rem)",
    },
    imageStyle: "corporate professional, business setting, clean office environment, professional team, modern workplace, trustworthy",
  },

  creative: {
    id: "creative",
    name: "Creative Studio",
    description: "Artistic and expressive for creative industries",
    colors: {
      primary: "#8b5cf6",
      secondary: "#ec4899",
      accent: "#f59e0b",
      background: "#faf5ff",
      text: "#581c87",
      textSecondary: "#7c3aed",
    },
    fonts: {
      heading: "Poppins, sans-serif",
      body: "Nunito, sans-serif",
      sizes: {
        h1: "clamp(3.5rem, 9vw, 7rem)",
        h2: "clamp(2.25rem, 5.5vw, 4.5rem)",
        h3: "clamp(1.625rem, 3.75vw, 2.75rem)",
        body: "clamp(1.125rem, 2.25vw, 1.5rem)",
        small: "clamp(0.875rem, 1.5vw, 1.125rem)",
      },
    },
    layout: {
      padding: "clamp(2rem, 5vw, 4rem)",
      maxWidth: "1500px",
      spacing: "clamp(1rem, 3vw, 2.5rem)",
    },
    imageStyle: "creative artistic, colorful abstract, playful composition, unique perspective, artistic photography, vibrant palette",
  },

  tech: {
    id: "tech",
    name: "Tech Innovation",
    description: "Futuristic design for technology presentations",
    colors: {
      primary: "#06b6d4",
      secondary: "#8b5cf6",
      accent: "#10b981",
      background: "#0a0a0a",
      text: "#f0f9ff",
      textSecondary: "#94a3b8",
    },
    fonts: {
      heading: "Space Grotesk, monospace",
      body: "Inter, sans-serif",
      sizes: {
        h1: "clamp(3.5rem, 8vw, 6.5rem)",
        h2: "clamp(2.25rem, 5.5vw, 4.5rem)",
        h3: "clamp(1.5rem, 3.5vw, 2.75rem)",
        body: "clamp(1.125rem, 2.25vw, 1.5rem)",
        small: "clamp(0.875rem, 1.5vw, 1.125rem)",
      },
    },
    layout: {
      padding: "clamp(2rem, 5vw, 4rem)",
      maxWidth: "1600px",
      spacing: "clamp(1rem, 3vw, 2.5rem)",
    },
    imageStyle: "futuristic technology, neon lights, digital interface, cyberpunk aesthetic, holographic effects, modern tech",
  },
};

/**
 * Get enhanced FLUX prompt for slide images
 */
export function getEnhancedImagePrompt(
  slideContent: string,
  styleId: string = "modern"
): string {
  const style = presentationStyles[styleId] || presentationStyles.modern;
  
  return `${slideContent}, ${style.imageStyle}, professional presentation quality, 16:9 aspect ratio, high resolution, 4k quality`;
}

/**
 * Generate CSS for presentation style (Gamma-inspired)
 */
export function generatePresentationCSS(styleId: string = "modern"): string {
  const style = presentationStyles[styleId] || presentationStyles.modern;
  
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    :root {
      --color-primary: ${style.colors.primary};
      --color-secondary: ${style.colors.secondary};
      --color-accent: ${style.colors.accent};
      --color-background: ${style.colors.background};
      --color-text: ${style.colors.text};
      --color-text-secondary: ${style.colors.textSecondary};
      
      --font-heading: ${style.fonts.heading};
      --font-body: ${style.fonts.body};
      
      --size-h1: ${style.fonts.sizes.h1};
      --size-h2: ${style.fonts.sizes.h2};
      --size-h3: ${style.fonts.sizes.h3};
      --size-body: ${style.fonts.sizes.body};
      --size-small: ${style.fonts.sizes.small};
      
      --layout-padding: ${style.layout.padding};
      --layout-max-width: ${style.layout.maxWidth};
      --layout-spacing: ${style.layout.spacing};
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--font-body);
      color: var(--color-text);
      background: var(--color-background);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .slide {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: var(--layout-padding);
      max-width: var(--layout-max-width);
      margin: 0 auto;
      position: relative;
    }
    
    /* Gamma-style gradient backgrounds */
    .slide-title {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .slide-content {
      background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
    }
    
    /* Bold, beautiful typography like Gamma */
    h1, h2, h3 {
      font-family: var(--font-heading);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: var(--layout-spacing);
      letter-spacing: -0.02em;
    }
    
    h1 { 
      font-size: var(--size-h1);
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    h2 { 
      font-size: var(--size-h2);
      font-weight: 700;
    }
    
    h3 { 
      font-size: var(--size-h3);
      font-weight: 600;
      color: var(--color-primary);
    }
    
    p, li {
      font-size: var(--size-body);
      line-height: 1.7;
      margin-bottom: calc(var(--layout-spacing) * 0.6);
      font-weight: 400;
    }
    
    /* Stunning image presentation */
    .slide-image {
      width: 100%;
      height: auto;
      max-height: 70vh;
      border-radius: 1.5rem;
      object-fit: cover;
      margin: var(--layout-spacing) 0;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease;
    }
    
    .slide-image:hover {
      transform: scale(1.02);
    }
    
    /* Beautiful bullet points */
    ul {
      list-style: none;
      padding-left: 0;
      margin-top: calc(var(--layout-spacing) * 0.5);
    }
    
    li {
      padding-left: 2.5rem;
      position: relative;
      margin-bottom: 1.25rem;
      font-size: var(--size-body);
    }
    
    li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: var(--color-primary);
      font-weight: 900;
      font-size: 2em;
      line-height: 0.8;
    }
    
    /* Stats/Numbers styling (like Gamma) */
    .stat-number {
      font-size: clamp(3rem, 8vw, 6rem);
      font-weight: 900;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    
    .stat-label {
      font-size: var(--size-body);
      color: var(--color-text-secondary);
      font-weight: 600;
    }
    
    /* Card-style content blocks */
    .content-card {
      background: white;
      border-radius: 1.5rem;
      padding: 2.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      margin-bottom: 2rem;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    /* Gradient text accents */
    .gradient-text {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .slide {
        padding: 2rem 1.5rem;
      }
      
      h1 {
        font-size: clamp(2.5rem, 8vw, 4rem);
      }
      
      .slide-image {
        max-height: 50vh;
      }
    }
    
    /* Smooth animations */
    .slide > * {
      animation: fadeInUp 0.6s ease-out;
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
  `;
}
