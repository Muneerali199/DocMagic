import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key with fallback for build time - support both env var names
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

// Initialize with lazy loading to avoid build-time errors
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!GOOGLE_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    try {
      genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    } catch (error) {
      console.error("Failed to initialize Google Generative AI:", error);
      throw new Error("Failed to initialize Google Generative AI.");
    }
  }
  return genAI;
}

function extractJsonFromMarkdown(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  return jsonMatch ? jsonMatch[1].trim() : text.trim();
}

// Helper function to retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a 503 (overloaded) or 429 (rate limit) error
      const isRetryable = error?.status === 503 || error?.status === 429;
      
      if (!isRetryable || i === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = initialDelay * Math.pow(2, i);
      console.log(`⏳ API overloaded, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

async function validateApiConnection() {
  try {
    // Skip API validation during build time
    if (process.env.NODE_ENV === 'production' && !process.env.RUNTIME_ENV) {
      return true;
    }
    
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Use retry logic for validation
    await retryWithBackoff(async () => {
      await model.generateContent("test");
    });
    
    return true;
  } catch (error: any) {
    console.error("API Connection Test Failed:", error);
    
    // Don't throw during build time
    if (process.env.NODE_ENV === 'production' && !process.env.RUNTIME_ENV) {
      return true;
    }
    
    // Provide more helpful error messages
    if (error?.status === 503) {
      throw new Error("Google AI service is temporarily overloaded. Please try again in a few moments.");
    } else if (error?.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
    } else if (error?.status === 401 || error?.status === 403) {
      throw new Error("Invalid API key. Please check your GEMINI_API_KEY environment variable.");
    }
    
    throw new Error("Unable to connect to Google Generative AI API.");
  }
}

// ENHANCED ATS-OPTIMIZED RESUME GENERATOR (FREE TEXT INPUT)
export async function generateResume({ 
  prompt, 
  name, 
  email 
}: { 
  prompt: string; 
  name: string; 
  email: string;
}) {
  try {
    console.log("🚀 Starting resume generation with Gemini 2.0 Flash...");
    console.log("Input:", { prompt: prompt.substring(0, 100), name, email });

    await validateApiConnection();
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // ENHANCED SYSTEM PROMPT FOR 85%+ ATS SCORES
    const systemPrompt = `You are an expert ATS-optimized resume writer. Create a professional, ATS-friendly resume based on this job description/requirement: "${prompt}".

    The candidate's name is: ${name}
    The candidate's email is: ${email}

    CRITICAL ATS OPTIMIZATION REQUIREMENTS:
    1. Use STRONG ACTION VERBS: Led, Developed, Implemented, Optimized, Increased, Reduced, Managed, Designed
    2. Include QUANTIFIABLE ACHIEVEMENTS: Use numbers, percentages, dollar amounts (e.g., "Increased revenue by 45%", "Managed $2M budget")
    3. Add TECHNICAL KEYWORDS relevant to the role mentioned in the prompt
    4. Use PROFESSIONAL FORMATTING with clear section headers
    5. Include SKILLS SECTION with 8-12 relevant technical and soft skills
    6. Write 3-5 bullet points per job with IMPACT-FOCUSED descriptions
    7. Create PROFESSIONAL SUMMARY with 3-4 sentences highlighting key expertise

    MANDATORY JSON STRUCTURE - ALL FIELDS REQUIRED:
    {
      "name": "${name}",
      "email": "${email}",
      "phone": "+1 (555) 123-4567",
      "location": "City, State/Country",
      "summary": "Dynamic [Job Title] with [X+] years of experience in [Key Skills]. Proven track record of [Major Achievement]. Expert in [Technical Skills] with strong [Soft Skills]. Seeking to leverage expertise in [Target Area].",
      "experience": [
        {
          "title": "Senior/Lead [Job Title]",
          "company": "[Company Name]",
          "location": "City, State",
          "date": "01/2020 - Present",
          "description": [
            "• Led cross-functional team of 10+ members to deliver $5M revenue-generating project, resulting in 40% efficiency improvement",
            "• Implemented automated testing framework reducing bug rate by 60% and deployment time by 3 hours",
            "• Developed scalable microservices architecture handling 1M+ daily transactions with 99.9% uptime",
            "• Mentored 5 junior developers improving team productivity by 25% through code reviews and pair programming",
            "• Optimized database queries reducing response time by 70% and improving user experience for 50K+ users"
          ]
        },
        {
          "title": "[Previous Job Title]",
          "company": "[Previous Company]",
          "location": "City, State",
          "date": "06/2017 - 12/2019",
          "description": [
            "• Achieved 95% customer satisfaction rate by implementing real-time feedback system",
            "• Reduced operational costs by $200K annually through process automation and optimization",
            "• Collaborated with stakeholders to define requirements for 15+ successful product launches"
          ]
        }
      ],
      "education": [
        {
          "degree": "Bachelor of Science in [Field] / Master of [Field]",
          "institution": "[University Name]",
          "location": "City, State",
          "date": "05/2017",
          "gpa": "3.8/4.0",
          "honors": "Cum Laude / Dean's List"
        }
      ],
      "skills": {
        "technical": ["Python", "JavaScript", "React", "Node.js", "SQL", "AWS", "Docker", "Git"],
        "programming": ["Java", "TypeScript", "C++", "Go", "Ruby"],
        "tools": ["VS Code", "Jira", "GitHub", "Jenkins", "Kubernetes", "Tableau"],
        "soft": ["Leadership", "Communication", "Problem Solving", "Team Collaboration", "Agile Methodologies", "Project Management"]
      },
      "projects": [
        {
          "name": "[Project Name] - [Brief Description]",
          "description": "Developed full-stack web application using React, Node.js, and MongoDB serving 10K+ users with 4.5-star rating",
          "technologies": ["React", "Node.js", "MongoDB", "AWS", "Docker"],
          "link": "https://github.com/username/project"
        }
      ],
      "certifications": [
        {
          "name": "AWS Certified Solutions Architect / PMP / Certified Scrum Master",
          "issuer": "Amazon Web Services / PMI / Scrum Alliance",
          "date": "03/2023",
          "credential": "ABC123XYZ"
        }
      ]
    }

    CONTENT GENERATION RULES:
    1. INFER realistic details from the prompt (job titles, companies, dates, achievements)
    2. CREATE 2-3 relevant work experiences with 3-5 bullet points each
    3. INCLUDE at least 3 quantified achievements with numbers/percentages
    4. ADD 1-2 education entries relevant to the field
    5. POPULATE skills section with 15-20 relevant technical and soft skills
    6. GENERATE 1-2 relevant projects with technologies
    7. ADD 1-2 relevant certifications if applicable to the role
    8. USE professional tone and industry-standard terminology
    9. ENSURE summary highlights 3-4 key strengths with measurable impact
    10. FORMAT all dates as MM/YYYY consistently

    ATS SCORING TARGETS (Generate content to achieve 85%+ score):
    - Contact Info Complete: 20/20 points
    - Professional Summary 100+ chars: 15/15 points  
    - 2+ Work Experiences with quantified achievements: 30/30 points
    - Education with GPA: 15/15 points
    - 15+ Skills listed: 10/10 points
    - Projects with technologies: 5/5 points
    - Certifications: 5/5 points
    TARGET TOTAL: 85%+ (Grade A)

    CRITICAL: Return ONLY valid JSON. No markdown, no explanations, ONLY the JSON object.`;

    console.log("📤 Sending request to Gemini API...");
    
    // Use retry logic for the main generation request
    const result = await retryWithBackoff(async () => {
      return await model.generateContent(systemPrompt);
    });
    
    if (!result || !result.response) {
      throw new Error("No response received from Gemini API");
    }

    const response = result.response;
    console.log("✅ Gemini API response received");
    
    const rawText = response.text();
    console.log("📝 Raw response length:", rawText.length);
    
    const jsonText = extractJsonFromMarkdown(rawText);
    console.log("🔍 Extracted JSON length:", jsonText.length);
    
    const parsedResume = JSON.parse(jsonText);
    console.log("✅ Resume JSON parsed successfully");
    
    // VALIDATE and ENHANCE the generated resume
    const validatedResume = {
      name: parsedResume.name || name,
      email: parsedResume.email || email,
      phone: parsedResume.phone || "+1 (555) 123-4567",
      location: parsedResume.location || "City, State",
      summary: parsedResume.summary || "Professional with expertise in the field.",
      experience: Array.isArray(parsedResume.experience) && parsedResume.experience.length > 0 
        ? parsedResume.experience 
        : [{
            title: "Professional",
            company: "Company Name",
            location: "City, State",
            date: "01/2020 - Present",
            description: [
              "• Delivered high-impact projects with measurable results",
              "• Collaborated with cross-functional teams to achieve organizational goals",
              "• Implemented best practices to improve efficiency and quality"
            ]
          }],
      education: Array.isArray(parsedResume.education) && parsedResume.education.length > 0
        ? parsedResume.education
        : [{
            degree: "Bachelor's Degree",
            institution: "University",
            location: "City, State",
            date: "05/2020",
            gpa: "",
            honors: ""
          }],
      skills: parsedResume.skills || {
        technical: ["Microsoft Office", "Data Analysis", "Project Management"],
        programming: [],
        tools: ["Excel", "PowerPoint", "Outlook"],
        soft: ["Communication", "Leadership", "Problem Solving", "Team Collaboration"]
      },
      projects: parsedResume.projects || [],
      certifications: parsedResume.certifications || []
    };

    console.log("🎉 Resume generation completed successfully");
    return validatedResume;
    
  } catch (error: any) {
    console.error("❌ Error generating resume:", error);
    
    // Provide detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3)
      });
    }
    
    // Return more specific error messages based on error type
    if (error?.status === 503) {
      throw new Error('Google AI service is temporarily overloaded. Please try again in a few moments.');
    } else if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
    } else if (error?.status === 401 || error?.status === 403) {
      throw new Error('Invalid API key. Please check your GEMINI_API_KEY environment variable.');
    } else if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('Gemini API key not configured. Please set GOOGLE_API_KEY in environment variables.');
    } else if (error instanceof Error && error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (error instanceof Error && error.message.includes('JSON')) {
      throw new Error('Failed to parse AI response. Please try again with different input.');
    } else if (error instanceof Error && error.message.includes('overloaded')) {
      throw error; // Re-throw the overloaded message as-is
    } else {
      throw new Error(`Failed to generate resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Enhanced presentation outline generator with GUARANTEED images and charts
export async function generatePresentationOutline({ 
  prompt, 
  pageCount = 8 
}: { 
  prompt: string; 
  pageCount?: number;
}) {
  try {
    await validateApiConnection();
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const systemPrompt = `Create a PROFESSIONAL presentation outline for: "${prompt}" with ${pageCount} slides.

    CRITICAL REQUIREMENTS - EVERY SLIDE MUST HAVE:
    1. A HIGH-QUALITY PROFESSIONAL IMAGE from Pexels
    2. At least 30% of slides MUST have meaningful charts/graphs
    3. Professional Canva-style design elements

    Return a JSON array with this EXACT format:

    [
      {
        "title": "Compelling Professional Title",
        "type": "cover|list|chart|split|process|text",
        "description": "Detailed description of slide content and visuals",
        "content": "Engaging 2-3 sentence content that tells a story",
        "bullets": ["specific actionable point 1", "measurable result 2", "strategic insight 3"] (for list/split types),
        "chartData": {
          "type": "bar|pie|line|area|scatter",
          "title": "Professional Chart Title",
          "data": [
            {"name": "Q1 2024", "value": 125, "category": "Revenue"},
            {"name": "Q2 2024", "value": 158, "category": "Revenue"},
            {"name": "Q3 2024", "value": 192, "category": "Revenue"},
            {"name": "Q4 2024", "value": 234, "category": "Revenue"},
            {"name": "Q1 2025", "value": 278, "category": "Revenue"}
          ],
          "xAxis": "Time Period",
          "yAxis": "Value ($M)",
          "colors": ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
          "showLegend": true,
          "showGrid": true
        } (REQUIRED for chart type, OPTIONAL for others),
        "imageQuery": "specific professional image search query",
        "imageUrl": "https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg?auto=compress&cs=tinysrgb&w=1200&h=800",
        "layout": "cover|split|chart-focus|list-visual|process-flow|text-image"
      }
    ]

    SLIDE DISTRIBUTION REQUIREMENTS:
    - Slide 1: ALWAYS "cover" type with hero image
    - 30-40% of slides: "chart" type with meaningful data
    - 30-40% of slides: "split" type with image + content
    - 20-30% of slides: "list" type with supporting images
    - 10% of slides: "process" type with workflow visuals

    IMAGE REQUIREMENTS FOR EVERY SLIDE:
    - Cover slides: Professional team meetings, office spaces, industry-specific imagery
    - Chart slides: Business analytics, data visualization, professional dashboards
    - Split slides: Relevant professional imagery supporting the content
    - List slides: Conceptual imagery that enhances understanding
    - Process slides: Workflow, teamwork, step-by-step visuals

    CHART DATA REQUIREMENTS (for chart slides):
    - Use realistic business metrics relevant to "${prompt}"
    - Include 4-6 data points minimum
    - Ensure data supports the narrative
    - Use professional color schemes
    - Include proper labels and categories

    PROFESSIONAL IMAGE SELECTION BY TOPIC:
    - Business/Startup: Team meetings, handshakes, office spaces, growth charts, professional presentations
    - Technology: Modern devices, coding environments, innovation labs, digital transformation, tech teams
    - Education: Learning environments, students, academic settings, knowledge sharing, training
    - Marketing: Creative teams, campaigns, customer engagement, brand development, analytics
    - Finance: Professional meetings, banking, investment, financial planning, market analysis

    ENSURE EVERY SLIDE HAS:
    1. A compelling, action-oriented title
    2. A high-quality professional image URL
    3. Relevant, engaging content
    4. Proper visual hierarchy
    5. Charts/graphs where appropriate (minimum 30% of slides)`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const jsonText = extractJsonFromMarkdown(response.text());
    const outlines = JSON.parse(jsonText);

    // GUARANTEE every slide has professional images and proper chart distribution
    const enhancedOutlines = outlines.map((outline: any, index: number) => {
      // Ensure EVERY slide has a professional image
      const professionalImageIds = [
        3184291, 3184292, 3184293, 3184294, 3184295, 3184296, 3184297, 3184298, 3184299, 3184300,
        3184311, 3184312, 3184313, 3184314, 3184315, 3184316, 3184317, 3184318, 3184319, 3184320,
        3184321, 3184322, 3184323, 3184324, 3184325, 3184326, 3184327, 3184328, 3184329, 3184330,
        3184331, 3184332, 3184333, 3184334, 3184335, 3184336, 3184337, 3184338, 3184339, 3184340,
        3184341, 3184342, 3184343, 3184344, 3184345, 3184346, 3184347, 3184348, 3184349, 3184350
      ];
      
      // FORCE image URL if missing
      if (!outline.imageUrl || !outline.imageUrl.includes('pexels.com')) {
        const randomId = professionalImageIds[index % professionalImageIds.length];
        outline.imageUrl = `https://images.pexels.com/photos/${randomId}/pexels-photo-${randomId}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800`;
      }

      // FORCE chart data for chart slides and ensure 30% have charts
      if (outline.type === 'chart' || (index % 3 === 1 && !outline.chartData)) {
        outline.type = 'chart';
        outline.chartData = outline.chartData || generateProfessionalChartData('bar', prompt);
        outline.chartData.colors = outline.chartData.colors || ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
        outline.chartData.showLegend = true;
        outline.chartData.showGrid = true;
        outline.chartData.title = outline.chartData.title || outline.title;
      }

      // FORCE professional image queries if missing
      if (!outline.imageQuery) {
        outline.imageQuery = generateProfessionalImageQuery(outline.type, outline.title, prompt);
      }

      return outline;
    });

    return enhancedOutlines.slice(0, pageCount);
  } catch (error) {
    console.error("Error generating presentation outline:", error);
    throw new Error(`Failed to generate presentation outline: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Enhanced full presentation generator with GUARANTEED visuals
export async function generatePresentation({ 
  outlines,
  template = "modern-business",
  prompt
}: { 
  outlines: any[];
  template?: string;
  prompt: string;
}) {
  try {
    await validateApiConnection();
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Import Unsplash and Mistral for image generation
    const { searchImages } = await import('./unsplash');
    const { generateImageDescriptions } = await import('./mistral');
    
    const systemPrompt = `Generate a PROFESSIONAL presentation with GUARANTEED IMAGES AND CHARTS for every slide.

    Original prompt: "${prompt}"
    Template: ${template}
    Outlines: ${JSON.stringify(outlines)}

    CRITICAL REQUIREMENTS - EVERY SLIDE MUST HAVE:
    1. A professional high-quality contextual image
    2. Meaningful charts for data slides (30% minimum)
    3. Canva-style professional design

    Create slides with this JSON structure:
    [
      {
        "id": 1,
        "title": "Compelling Professional Title",
        "content": "Engaging story-driven content (2-3 sentences)",
        "layout": "cover|list|chart|split|process|text",
        "bullets": ["specific actionable point 1", "measurable result 2", "strategic insight 3"] (if applicable),
        "charts": {
          "type": "bar|pie|line|area|scatter",
          "title": "Professional Chart Title",
          "data": [
            {"name": "Category", "value": number, "category": "optional"},
            {"name": "Category 2", "value": number, "category": "optional"}
          ],
          "xAxis": "Professional X-Axis Label",
          "yAxis": "Professional Y-Axis Label", 
          "colors": ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
          "showLegend": true,
          "showGrid": true
        } (REQUIRED for chart layout, OPTIONAL for others),
        "imageQuery": "professional search query for Unsplash",
        "imageAlt": "Professional descriptive alt text",
        "imagePosition": "center|top|left|right",
        "backgroundColor": "#ffffff",
        "textColor": "#1a1a1a",
        "accentColor": "#3B82F6",
        "template": "${template}",
        "slideNumber": number,
        "animations": {
          "entrance": "fadeIn|slideIn|zoomIn",
          "emphasis": "pulse|bounce|highlight",
          "exit": "fadeOut|slideOut|zoomOut"
        }
      }
    ]

    MANDATORY VISUAL REQUIREMENTS:
    1. EVERY slide MUST have a working Pexels image URL
    2. Chart slides MUST have realistic, meaningful data
    3. Images MUST be relevant to slide content
    4. Charts MUST support the narrative with proper styling
    5. Professional color schemes throughout

    CONTENT QUALITY REQUIREMENTS:
    - Compelling titles that grab attention
    - Story-driven content that flows logically
    - Specific, actionable bullet points
    - Professional language and tone
    - Consistent messaging throughout

    TEMPLATE STYLING FOR ${template}:
    Apply professional design principles with consistent branding, proper typography, and visual hierarchy.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const jsonText = extractJsonFromMarkdown(response.text());
    const slides = JSON.parse(jsonText);

    // Generate UNIQUE contextual image queries using Mistral for EACH slide
    const imageDescriptions = await generateImageDescriptions(
      slides.map((s: any) => ({
        title: s.title,
        content: s.content || '',
        context: prompt
      })),
      prompt
    );

    // Fetch UNIQUE images for each slide and convert to base64
    const enhancedSlides = await Promise.all(slides.map(async (slide: any, index: number) => {
      const templateStyles = getProfessionalTemplateStyles(template);
      
      // Get UNIQUE contextual image from Unsplash using topic-specific query
      let imageData = null;
      try {
        // Create HIGHLY SPECIFIC search query combining presentation topic + slide content
        const topicKeywords = prompt.split(' ').slice(0, 3).join(' '); // First 3 words of topic
        const slideKeywords = slide.title.split(' ').slice(0, 4).join(' '); // First 4 words of title
        const mistralQuery = imageDescriptions[index] || slide.imageQuery || '';
        
        // Combine for maximum relevance: Topic + Slide Title + AI suggestion
        const uniqueQuery = `${topicKeywords} ${slideKeywords} ${mistralQuery}`.trim();
        console.log(`Slide ${index + 1} - Topic: "${prompt}" | Searching: "${uniqueQuery}"`);
        
        // Fetch more images for better variety and relevance
        const unsplashImages = await searchImages(uniqueQuery, 10);
        
        if (unsplashImages && unsplashImages.length > 0) {
          // Pick different image from results to ensure variety
          const imageIndex = index % unsplashImages.length;
          const imageUrl = unsplashImages[imageIndex].urls.regular;
          
          console.log(`Selected image ${imageIndex + 1} of ${unsplashImages.length} for slide ${index + 1}`);
          
          // Convert to base64 for reliable export
          try {
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            imageData = `data:image/jpeg;base64,${base64}`;
          } catch (fetchError) {
            console.warn(`Failed to convert image to base64 for slide ${index}:`, fetchError);
            // Fallback to direct URL
            imageData = imageUrl;
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch image for slide ${index}:`, error);
      }

      // FORCE chart data for chart slides and ensure proper distribution
      if (slide.layout === 'chart' || (slide.charts && slide.charts.type)) {
        slide.layout = 'chart';
        slide.charts = slide.charts || {};
        slide.charts.colors = slide.charts.colors || templateStyles.chartColors;
        slide.charts.showLegend = true;
        slide.charts.showGrid = true;
        
        // GUARANTEE meaningful chart data
        if (!slide.charts.data || slide.charts.data.length === 0) {
          slide.charts.data = generateProfessionalChartData(slide.charts.type || 'bar', prompt);
          slide.charts.type = slide.charts.type || 'bar';
        }
        
        slide.charts.title = slide.charts.title || slide.title;
      }

      return {
        ...slide,
        id: index + 1,
        slideNumber: index + 1,
        template,
        ...templateStyles,
        image: imageData, // Base64 or URL
        imageAlt: slide.imageAlt || `Professional image for ${slide.title}`,
        imagePosition: slide.imagePosition || "center",
        animations: slide.animations || {
          entrance: "fadeIn",
          emphasis: "pulse",
          exit: "fadeOut"
        }
      };
    }));

    return enhancedSlides;
  } catch (error) {
    console.error("Error generating presentation:", error);
    throw new Error(`Failed to generate presentation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Professional template styles with enhanced chart colors
function getProfessionalTemplateStyles(template: string) {
  const styles = {
    'modern-business': {
      backgroundColor: '#ffffff',
      textColor: '#1e3a8a',
      accentColor: '#3b82f6',
      borderColor: '#dbeafe',
      chartColors: ['#3b82f6', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6']
    },
    'creative-gradient': {
      backgroundColor: '#ffffff',
      textColor: '#7c2d92',
      accentColor: '#a855f7',
      borderColor: '#e9d5ff',
      chartColors: ['#a855f7', '#9333ea', '#7c3aed', '#8b5cf6', '#a855f7']
    },
    'minimalist-pro': {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      accentColor: '#6b7280',
      borderColor: '#e5e7eb',
      chartColors: ['#6b7280', '#4b5563', '#374151', '#9ca3af', '#6b7280']
    },
    'tech-modern': {
      backgroundColor: '#0f172a',
      textColor: '#ffffff',
      accentColor: '#06b6d4',
      borderColor: '#164e63',
      chartColors: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#06b6d4']
    },
    'elegant-dark': {
      backgroundColor: '#111827',
      textColor: '#ffffff',
      accentColor: '#fbbf24',
      borderColor: '#374151',
      chartColors: ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#fbbf24']
    },
    'startup-pitch': {
      backgroundColor: '#ffffff',
      textColor: '#065f46',
      accentColor: '#10b981',
      borderColor: '#d1fae5',
      chartColors: ['#10b981', '#059669', '#047857', '#065f46', '#10b981']
    }
  };
  
  return styles[template as keyof typeof styles] || styles['modern-business'];
}

// Generate professional chart data with guaranteed meaningful content
function generateProfessionalChartData(chartType: string, topic: string) {
  const isBusinessTopic = topic.toLowerCase().includes('business') || topic.toLowerCase().includes('startup') || topic.toLowerCase().includes('revenue') || topic.toLowerCase().includes('growth');
  const isTechTopic = topic.toLowerCase().includes('tech') || topic.toLowerCase().includes('software') || topic.toLowerCase().includes('ai') || topic.toLowerCase().includes('digital');
  const isMarketingTopic = topic.toLowerCase().includes('marketing') || topic.toLowerCase().includes('brand') || topic.toLowerCase().includes('customer');
  
  if (chartType === 'bar') {
    if (isBusinessTopic) {
      return [
        { name: "Q1 2024", value: 125, category: "Revenue ($M)" },
        { name: "Q2 2024", value: 158, category: "Revenue ($M)" },
        { name: "Q3 2024", value: 192, category: "Revenue ($M)" },
        { name: "Q4 2024", value: 234, category: "Revenue ($M)" },
        { name: "Q1 2025", value: 278, category: "Revenue ($M)" }
      ];
    } else if (isTechTopic) {
      return [
        { name: "Frontend", value: 45, category: "Development %" },
        { name: "Backend", value: 38, category: "Development %" },
        { name: "Database", value: 28, category: "Development %" },
        { name: "DevOps", value: 22, category: "Development %" },
        { name: "Testing", value: 18, category: "Development %" }
      ];
    } else if (isMarketingTopic) {
      return [
        { name: "Social Media", value: 35, category: "Engagement %" },
        { name: "Email", value: 28, category: "Engagement %" },
        { name: "Content", value: 42, category: "Engagement %" },
        { name: "Paid Ads", value: 31, category: "Engagement %" },
        { name: "SEO", value: 38, category: "Engagement %" }
      ];
    }
  } else if (chartType === 'pie') {
    if (isBusinessTopic) {
      return [
        { name: "Product Sales", value: 45 },
        { name: "Services", value: 30 },
        { name: "Licensing", value: 15 },
        { name: "Partnerships", value: 10 }
      ];
    } else if (isTechTopic) {
      return [
        { name: "Web Development", value: 40 },
        { name: "Mobile Apps", value: 35 },
        { name: "APIs", value: 15 },
        { name: "Infrastructure", value: 10 }
      ];
    } else if (isMarketingTopic) {
      return [
        { name: "Digital Marketing", value: 50 },
        { name: "Traditional Media", value: 25 },
        { name: "Events", value: 15 },
        { name: "PR", value: 10 }
      ];
    }
  } else if (chartType === 'line') {
    if (isBusinessTopic) {
      return [
        { name: "Jan", value: 65 },
        { name: "Feb", value: 78 },
        { name: "Mar", value: 82 },
        { name: "Apr", value: 95 },
        { name: "May", value: 108 },
        { name: "Jun", value: 125 },
        { name: "Jul", value: 142 }
      ];
    } else if (isTechTopic) {
      return [
        { name: "Week 1", value: 85 },
        { name: "Week 2", value: 92 },
        { name: "Week 3", value: 88 },
        { name: "Week 4", value: 96 },
        { name: "Week 5", value: 103 },
        { name: "Week 6", value: 110 }
      ];
    }
  }

  // Enhanced default professional data
  return [
    { name: "Category A", value: 65 },
    { name: "Category B", value: 78 },
    { name: "Category C", value: 92 },
    { name: "Category D", value: 45 },
    { name: "Category E", value: 58 }
  ];
}

// Generate professional image queries with guaranteed relevance
function generateProfessionalImageQuery(slideType: string, title: string, topic: string) {
  const isBusinessTopic = topic.toLowerCase().includes('business') || topic.toLowerCase().includes('startup');
  const isTechTopic = topic.toLowerCase().includes('tech') || topic.toLowerCase().includes('software');
  const isMarketingTopic = topic.toLowerCase().includes('marketing') || topic.toLowerCase().includes('brand');
  
  if (slideType === 'cover') {
    if (isBusinessTopic) return "professional business team meeting modern office boardroom";
    if (isTechTopic) return "modern technology workspace coding development team";
    if (isMarketingTopic) return "creative marketing team brainstorming session";
    return "professional presentation business meeting conference";
  } else if (slideType === 'chart') {
    return "business analytics data visualization charts dashboard professional";
  } else if (slideType === 'split') {
    if (isBusinessTopic) return "professional business handshake partnership collaboration";
    if (isTechTopic) return "modern technology innovation digital transformation";
    if (isMarketingTopic) return "creative marketing campaign strategy planning";
    return "professional business collaboration teamwork";
  } else if (slideType === 'list') {
    if (isBusinessTopic) return "business strategy planning professional meeting";
    if (isTechTopic) return "technology innovation development process";
    if (isMarketingTopic) return "marketing strategy creative planning";
    return "professional business planning strategy";
  }
  
  return "professional business presentation modern office";
}

// ENHANCED ATS-OPTIMIZED RESUME GENERATOR WITH GUIDED INPUT
export async function generateGuidedResume({ 
  personalInfo,
  professionalSummary,
  workExperience,
  education,
  skills,
  projects,
  certifications,
  links,
  targetRole,
  jobDescription
}: { 
  personalInfo: any;
  professionalSummary: string;
  workExperience: any[];
  education: any[];
  skills: string[];
  projects: any[];
  certifications: any[];
  links: any;
  targetRole: string;
  jobDescription?: string;
}) {
  try {
    await validateApiConnection();
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const systemPrompt = `Create a 100% ATS-OPTIMIZED professional resume based on the provided information.

    CRITICAL ATS REQUIREMENTS:
    1. Use EXACT keywords from the target role: "${targetRole}"
    2. Include quantifiable achievements with numbers and percentages
    3. Use standard section headers that ATS systems recognize
    4. Optimize for keyword density without keyword stuffing
    5. Use action verbs and industry-specific terminology
    6. Include relevant technical skills and certifications
    7. Format for maximum ATS compatibility

    TARGET ROLE: ${targetRole}
    ${jobDescription ? `JOB DESCRIPTION KEYWORDS: ${jobDescription}` : ''}

    PROVIDED INFORMATION:
    Personal Info: ${JSON.stringify(personalInfo)}
    Professional Summary: ${professionalSummary}
    Work Experience: ${JSON.stringify(workExperience)}
    Education: ${JSON.stringify(education)}
    Skills: ${JSON.stringify(skills)}
    Projects: ${JSON.stringify(projects)}
    Certifications: ${JSON.stringify(certifications)}
    Professional Links: ${JSON.stringify(links)}

    Return as JSON with this EXACT ATS-optimized structure:
    {
      "name": "${personalInfo.name}",
      "email": "${personalInfo.email}",
      "phone": "${personalInfo.phone}",
      "location": "${personalInfo.location}",
      "linkedin": "${links.linkedin || ''}",
      "github": "${links.github || ''}",
      "website": "${links.website || ''}",
      "portfolio": "${links.portfolio || ''}",
      "summary": "ATS-optimized professional summary with target role keywords",
      "experience": [
        {
          "title": "Job title with relevant keywords",
          "company": "Company name",
          "location": "City, State",
          "date": "MM/YYYY - MM/YYYY",
          "description": [
            "• Quantified achievement with numbers/percentages using action verbs",
            "• Technical accomplishment with relevant keywords for ${targetRole}",
            "• Leadership/collaboration example with measurable impact"
          ]
        }
      ],
      "education": [
        {
          "degree": "Degree type and field",
          "institution": "University/College name",
          "location": "City, State",
          "date": "MM/YYYY",
          "gpa": "X.X/4.0 (if 3.5+)",
          "honors": "Relevant honors/achievements"
        }
      ],
      "skills": {
        "technical": ["keyword-optimized technical skills for ${targetRole}"],
        "programming": ["relevant programming languages/frameworks"],
        "tools": ["industry-standard tools and software"],
        "soft": ["leadership, communication, problem-solving skills"]
      },
      "projects": [
        {
          "name": "Project name with relevant keywords",
          "description": "Brief description with technologies and quantified results",
          "technologies": ["tech stack used"],
          "link": "project URL if available"
        }
      ],
      "certifications": [
        {
          "name": "Certification name",
          "issuer": "Issuing organization",
          "date": "MM/YYYY",
          "credential": "Credential ID if available"
        }
      ],
      "atsScore": 95,
      "keywordOptimization": {
        "targetKeywords": ["extracted keywords from target role"],
        "includedKeywords": ["keywords successfully included"],
        "density": "optimal keyword density achieved"
      }
    }

    ATS OPTIMIZATION RULES:
    1. Use standard section headers: "Professional Summary", "Work Experience", "Education", "Skills", "Projects", "Certifications"
    2. Include 15-20 relevant keywords from the target role naturally throughout
    3. Start bullet points with strong action verbs (Led, Developed, Implemented, Optimized, etc.)
    4. Include quantifiable metrics (increased by X%, reduced by Y hours, managed $Z budget)
    5. Use industry-standard terminology and acronyms
    6. Ensure 2-3 keyword mentions per job description
    7. Include both hard and soft skills relevant to the role
    8. Format dates consistently (MM/YYYY)
    9. Use professional language and avoid personal pronouns
    10. Include relevant certifications and technical proficiencies

    KEYWORD EXTRACTION FROM TARGET ROLE:
    - Extract 15-20 most important keywords from "${targetRole}"
    - Include technical skills, soft skills, and industry terms
    - Naturally integrate keywords into experience descriptions
    - Ensure keyword density of 2-3% throughout the resume

    MAKE THE RESUME 100% ATS-COMPATIBLE AND KEYWORD-OPTIMIZED FOR MAXIMUM SCORING.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const jsonText = extractJsonFromMarkdown(response.text());
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating guided resume:", error);
    throw new Error(`Failed to generate guided resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ENHANCED RESUME STEP GUIDANCE GENERATOR
export async function generateResumeStepGuidance(step: string, targetRole: string, existingData?: any) {
  try {
    await validateApiConnection();
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const systemPrompt = `Provide intelligent, personalized guidance for the "${step}" section of a resume targeting: "${targetRole}".

    CURRENT STEP: ${step}
    TARGET ROLE: ${targetRole}
    EXISTING DATA: ${existingData ? JSON.stringify(existingData) : 'None'}

    Provide guidance as JSON:
    {
      "stepTitle": "Section name",
      "description": "Why this section is important for ATS and recruiters",
      "tips": [
        "Specific, actionable tip 1 for ${targetRole}",
        "Keyword optimization tip 2",
        "ATS-friendly formatting tip 3"
      ],
      "examples": [
        "Example 1 relevant to ${targetRole}",
        "Example 2 with quantified results"
      ],
      "keywords": ["relevant keywords for this section targeting ${targetRole}"],
      "commonMistakes": [
        "Common mistake 1 to avoid",
        "ATS-unfriendly practice 2"
      ],
      "nextStep": "What to focus on next"
    }

    Make guidance specific to ${targetRole} and include ATS optimization tips.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const jsonText = extractJsonFromMarkdown(response.text());
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating step guidance:", error);
    throw new Error(`Failed to generate step guidance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Enhanced letter generator with improved structure
export async function generateLetter({ 
  prompt, 
  fromName, 
  fromAddress, 
  toName, 
  toAddress, 
  letterType 
}: { 
  prompt: string;
  fromName: string;
  fromAddress?: string;
  toName: string;
  toAddress?: string;
  letterType: string;
}) {
  try {
    await validateApiConnection();
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const systemPrompt = `Create a professional ${letterType} letter from ${fromName} to ${toName} about: ${prompt}.
    
    LETTER TYPE: ${letterType}
    FROM: ${fromName}${fromAddress ? `, ${fromAddress}` : ''}
    TO: ${toName}${toAddress ? `, ${toAddress}` : ''}
    
    Return as JSON with this EXACT structure:
    {
      "from": {
        "name": "${fromName}",
        "address": "${fromAddress || ''}"
      },
      "to": {
        "name": "${toName}",
        "address": "${toAddress || ''}"
      },
      "date": "Current date in Month Day, Year format",
      "subject": "Clear, concise subject line related to the letter purpose",
      "content": "Full letter content with proper formatting, paragraphs, and professional tone"
    }
    
    LETTER FORMATTING REQUIREMENTS:
    1. Use proper business letter format
    2. Include appropriate salutation and closing
    3. Maintain professional tone throughout
    4. Organize content in clear paragraphs
    5. Include specific details from the prompt
    6. Use appropriate language for the letter type
    
    LETTER TYPE GUIDELINES:
    - Cover Letter: Highlight relevant skills and experience for a job application
    - Business Letter: Formal communication between businesses or professionals
    - Thank You Letter: Express gratitude with specific details
    - Recommendation Letter: Highlight strengths and achievements of the person being recommended
    - Complaint Letter: Professional expression of dissatisfaction with proposed resolution
    
    ENSURE THE LETTER IS:
    - Professional
    - Well-structured
    - Grammatically correct
    - Appropriate for the specified letter type
    - Addresses the specific prompt details`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const jsonText = extractJsonFromMarkdown(response.text());
    
    try {
      const letterData = JSON.parse(jsonText);
      
      // Ensure the letter has the expected structure
      return {
        from: {
          name: letterData.from?.name || fromName,
          address: letterData.from?.address || fromAddress || ""
        },
        to: {
          name: letterData.to?.name || toName,
          address: letterData.to?.address || toAddress || ""
        },
        date: letterData.date || new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        subject: letterData.subject || "Re: " + prompt.substring(0, 30) + "...",
        content: letterData.content || "Letter content not available."
      };
    } catch (parseError) {
      console.error("Error parsing letter JSON:", parseError);
      
      // Fallback structure if JSON parsing fails
      return {
        from: {
          name: fromName,
          address: fromAddress || ""
        },
        to: {
          name: toName,
          address: toAddress || ""
        },
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        subject: "Re: " + prompt.substring(0, 30) + "...",
        content: jsonText // Use the raw text as content
      };
    }
  } catch (error) {
    console.error("Error generating letter:", error);
    throw new Error(`Failed to generate letter: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ENHANCED ATS ANALYSIS WITH DETAILED SCORING
export async function generateATSScore({ 
  resumeContent, 
  jobDescription 
}: { 
  resumeContent: string; 
  jobDescription: string;
}) {
  try {
    await validateApiConnection();
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const systemPrompt = `Perform a comprehensive ATS analysis of the resume against the job description.

    RESUME CONTENT: ${resumeContent}
    JOB DESCRIPTION: ${jobDescription}

    Provide detailed ATS scoring and analysis as JSON:
    {
      "overallScore": number (0-100),
      "analysis": {
        "keywordMatch": {
          "found": ["keyword1", "keyword2"],
          "missing": ["missing1", "missing2"],
          "score": number (0-100),
          "density": "keyword density percentage"
        },
        "sectionScores": {
          "summary": number (0-100),
          "experience": number (0-100),
          "education": number (0-100),
          "skills": number (0-100),
          "formatting": number (0-100)
        },
        "atsCompatibility": {
          "fileFormat": "ATS-friendly format check",
          "sectionHeaders": "Standard headers used",
          "dateFormat": "Consistent date formatting",
          "bulletPoints": "Proper bullet point usage",
          "score": number (0-100)
        }
      },
      "improvements": {
        "critical": [
          "Critical improvement 1 for ATS optimization",
          "Critical improvement 2 for keyword matching"
        ],
        "recommended": [
          "Recommended enhancement 1",
          "Recommended enhancement 2"
        ],
        "atsSpecific": [
          "ATS-specific optimization 1",
          "ATS-specific optimization 2"
        ]
      },
      "keywordOptimization": {
        "targetKeywords": ["extracted from job description"],
        "currentDensity": "X%",
        "recommendedDensity": "2-3%",
        "suggestions": ["specific keyword placement suggestions"]
      }
    }

    SCORING CRITERIA:
    - Keyword Match (40%): How well resume keywords match job description
    - Section Completeness (25%): All required sections present and well-written
    - ATS Formatting (20%): Proper formatting for ATS parsing
    - Quantified Achievements (15%): Use of numbers and metrics

    Provide actionable, specific recommendations for ATS optimization.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const jsonText = extractJsonFromMarkdown(response.text());
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ENHANCED DIAGRAM GENERATOR WITH MERMAID SYNTAX
export async function generateDiagram({ 
  prompt, 
  diagramType = 'flowchart' 
}: { 
  prompt: string; 
  diagramType?: string;
}) {
  try {
    await validateApiConnection();
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const systemPrompt = `Generate a professional ${diagramType} diagram using Mermaid syntax based on: "${prompt}".

    DIAGRAM TYPE: ${diagramType}
    USER REQUEST: ${prompt}

    Return as JSON with this structure:
    {
      "type": "${diagramType}",
      "title": "Descriptive title for the diagram",
      "description": "Brief explanation of what the diagram shows",
      "code": "Valid Mermaid syntax code",
      "suggestions": [
        "Improvement suggestion 1",
        "Enhancement suggestion 2"
      ]
    }

    MERMAID SYNTAX GUIDELINES:
    
    For FLOWCHART:
    - Use "flowchart TD" or "flowchart LR" for direction
    - Nodes: A[Rectangle], B{Diamond}, C((Circle)), D>Flag]
    - Connections: A --> B, A -.-> B, A ==> B
    - Labels: A -->|Yes| B
    
    For SEQUENCE DIAGRAM:
    - Use "sequenceDiagram"
    - Participants: participant A as Alice
    - Messages: A->>B: Message, A-->>B: Response
    - Activations: activate A, deactivate A
    
    For CLASS DIAGRAM:
    - Use "classDiagram"
    - Classes: class Animal { +String name +makeSound() }
    - Relationships: Animal <|-- Dog, Animal --> Duck
    
    For ER DIAGRAM:
    - Use "erDiagram"
    - Entities: CUSTOMER ||--o{ ORDER : places
    - Relationships: ||--||, }|..|{, ||--o{, }o--o{
    - Attributes: CUSTOMER { string name string email }
    
    For STATE DIAGRAM:
    - Use "stateDiagram-v2"
    - States: [*] --> State1, State1 --> State2
    - Composite: state State1 { [*] --> SubState }
    
    For GANTT CHART:
    - Use "gantt"
    - Sections: section Section Name
    - Tasks: Task Name :done, a1, 2024-01-01, 30d
    
    For PIE CHART:
    - Use "pie title Chart Title"
    - Data: "Label" : value
    
    For GIT GRAPH:
    - Use "gitGraph"
    - Commands: commit, branch, checkout, merge
    
    For MINDMAP:
    - Use "mindmap"
    - Root: root((Central Idea))
    - Branches: Child1, Child2
    
    For TIMELINE:
    - Use "timeline"
    - Title: title Timeline Title
    - Events: 2024 : Event Description
    
    REQUIREMENTS:
    1. Generate syntactically correct Mermaid code
    2. Make the diagram relevant to the user's request
    3. Use professional naming conventions
    4. Include appropriate detail level
    5. Ensure the diagram is visually clear and logical
    6. Add meaningful labels and descriptions
    
    EXAMPLE PATTERNS:
    - Business Process: Start → Input → Process → Decision → Output → End
    - System Architecture: Frontend → API → Services → Database
    - User Flow: Landing → Registration → Onboarding → Dashboard
    - Data Flow: Source → Transform → Validate → Store → Display
    
    Create a diagram that clearly communicates the concept described in the prompt.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const jsonText = extractJsonFromMarkdown(response.text());
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating diagram:", error);
    throw new Error(`Failed to generate diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate images using Gemini 2.0 Flash (text-to-image with Imagen 3)
 * Note: Gemini 2.0 Flash supports multimodal generation including images
 */
export async function generateImage({
  prompt,
  aspectRatio = '16:9'
}: {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
}): Promise<string> {
  try {
    // Note: As of now, Gemini API doesn't directly support image generation
    // This is a placeholder for future implementation when the feature becomes available
    // For now, we'll return a fallback URL or use Unsplash
    
    console.log(`Image generation requested for: ${prompt}`);
    console.log('Note: Using Unsplash as fallback for image generation');
    
    // Return a placeholder or use Unsplash API instead
    throw new Error('Gemini image generation not yet available. Please use Unsplash API.');
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Generate multiple image variations for a given prompt
 */
export async function generateImageVariations({
  prompt,
  count = 4,
  aspectRatio = '16:9'
}: {
  prompt: string;
  count?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
}): Promise<string[]> {
  try {
    console.log(`Generating ${count} image variations for: ${prompt}`);
    
    // This is a placeholder for future Gemini image generation
    // Currently returning empty array to indicate fallback to Unsplash
    return [];
  } catch (error) {
    console.error("Error generating image variations:", error);
    return [];
  }
}