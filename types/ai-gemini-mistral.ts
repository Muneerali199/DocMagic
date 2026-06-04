/*
  Shared AI response types for Draftdeckai Gemini/Mistral services.

  Notes:
  - These shapes mirror the JSON structures requested in:
    - lib/gemini.ts (resume/presentation outline/presentation/letter/ATS/diagram/diagram)
    - lib/mistral.ts (slide image descriptions/chart data/presentation text/letter)
  - The AI output is untrusted at runtime (LLM). Types provide compile-time safety.
*/

export type ISODateString = string;

// -------------------------
// Resume (Gemini)
// -------------------------

export interface ResumeExperienceItem {
  title: string;
  company: string;
  location: string;
  date: string;
  description: string[];
}

export interface ResumeEducationItem {
  degree: string;
  institution: string;
  location: string;
  date: string;
  gpa: string;
  honors: string;
}

export interface ResumeSkillsBlock {
  technical: string[];
  programming: string[];
  tools: string[];
  soft: string[];
}

export interface ResumeProjectItem {
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface ResumeCertificationItem {
  name: string;
  issuer: string;
  date: string;
  credential: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  skills: ResumeSkillsBlock;
  projects: ResumeProjectItem[];
  certifications: ResumeCertificationItem[];
}

// Used by generateGuidedResume prompt input
export interface GuidedResumePersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface GuidedResumeExperienceInput {
  [k: string]: unknown;
}

export interface GuidedResumeEducationInput {
  [k: string]: unknown;
}

export interface GuidedResumeLinkInput {
  linkedin?: string;
  github?: string;
  website?: string;
  portfolio?: string;
}

export interface GuidedResumeKeywordOptimization {
  targetKeywords: string[];
  includedKeywords: string[];
  density: string;
}

export interface GuidedResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  portfolio: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    date: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    date: string;
    gpa: string;
    honors: string;
  }>;
  skills: {
    technical: string[];
    programming: string[];
    tools: string[];
    soft: string[];
  };
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credential: string;
  }>;
  atsScore: number;
  keywordOptimization: GuidedResumeKeywordOptimization;
}

// -------------------------
// Resume step guidance (Gemini)
// -------------------------

export interface ResumeStepGuidanceResponse {
  stepTitle: string;
  description: string;
  tips: string[];
  examples: string[];
  keywords: string[];
  commonMistakes: string[];
  nextStep: string;
}

// -------------------------
// Letter (Gemini + Mistral)
// -------------------------

export interface LetterParty {
  name: string;
  address: string;
}

export interface LetterData {
  from: LetterParty;
  to: LetterParty;
  date: string;
  subject: string;
  content: string;
}

// -------------------------
// ATS score (Gemini)
// -------------------------

export interface ATSKeywordMatchBlock {
  found: string[];
  missing: string[];
  score: number;
  density: string;
}

export interface ATSSectionScores {
  summary: number;
  experience: number;
  education: number;
  skills: number;
  formatting: number;
}

export interface ATSCompatibility {
  fileFormat: string;
  sectionHeaders: string;
  dateFormat: string;
  bulletPoints: string;
  score: number;
}

export interface ATSAnalysis {
  keywordMatch: ATSKeywordMatchBlock;
  sectionScores: ATSSectionScores;
  atsCompatibility: ATSCompatibility;
}

export interface ATSImprovements {
  critical: string[];
  recommended: string[];
  atsSpecific: string[];
}

export interface ATSKeywordOptimization {
  targetKeywords: string[];
  currentDensity: string;
  recommendedDensity: string;
  suggestions: string[];
}

export interface ATSScoreData {
  overallScore: number;
  analysis: ATSAnalysis;
  improvements: ATSImprovements;
  keywordOptimization: ATSKeywordOptimization;
}

// -------------------------
// Diagram (Gemini)
// -------------------------

export type DiagramType = string;

export interface DiagramData {
  type: DiagramType;
  title: string;
  description: string;
  code: string;
  suggestions: string[];
}

// -------------------------
// Presentation outline + charts (Gemini)
// -------------------------

export type PresentationOutlineLayout =
  | "cover"
  | "split"
  | "chart-focus"
  | "list-visual"
  | "process-flow"
  | "text-image";

export type PresentationOutlineType =
  | "cover"
  | "list"
  | "chart"
  | "split"
  | "process"
  | "text"
  | "mindbender"
  | "emotional"
  | "data-reveal";

export type PresentationChartType = "bar" | "pie" | "line" | "area" | "scatter";

export interface PresentationOutlineChartDatum {
  name: string;
  value: number;
  category?: string;
}

export interface PresentationOutlineChartData {
  type: PresentationChartType;
  title: string;
  data: PresentationOutlineChartDatum[];
  xAxis: string;
  yAxis: string;
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
}

export interface PresentationOutlineSlide {
  title: string;
  type: PresentationOutlineType;
  description: string;
  content: string;
  bullets: string[];
  chartData?: PresentationOutlineChartData;
  imageQuery: string;
  imageUrl: string;
  layout: PresentationOutlineLayout;
}

// -------------------------
// Presentation slides (Gemini generatePresentation output)
// -------------------------

export type PresentationSlideLayout =
  | "cover"
  | "list"
  | "chart"
  | "split"
  | "process"
  | "text"
  | "mindbender"
  | "emotional"
  | "data-reveal";

export type PresentationSlideAnimations = {
  entrance?: string;
  emphasis?: string;
  exit?: string;
};

export interface PresentationSlideChart {
  type: string;
  title: string;
  data: Array<{ name: string; value: number; category?: string }>;
  xAxis: string;
  yAxis: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export interface PresentationSlide {
  id?: number;
  slideNumber: number;
  template?: string;
  title: string;
  content: string;
  layout?: PresentationSlideLayout | string;
  bullets?: string[];
  charts?: PresentationSlideChart;
  imageQuery?: string;
  image?: string; // base64 or URL
  imageAlt?: string;
  imagePosition?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  animations?: PresentationSlideAnimations;
}

// -------------------------
// Mistral slide outlines for image/chart generation
// -------------------------

export interface MistralSlideOutlineLike {
  title: string;
  content?: string;
  bulletPoints?: string[];
  bullets?: string[];
  context?: string;
}

// -------------------------
// Mistral presentation text slides
// -------------------------

export type MistralPresentationSlideType =
  | "hero"
  | "stats"
  | "comparison"
  | "feature-grid"
  | "data-viz"
  | "process"
  | "timeline"
  | "testimonial"
  | "bullets"
  | "closing";

export interface MistralPresentationStat {
  value: string;
  label: string;
  context: string;
  trend: "up" | "down" | "neutral" | string;
}

export interface MistralPresentationIcon {
  icon: string;
  label: string;
  description: string;
}

export interface MistralPresentationTimelineItem {
  date: string;
  title: string;
  description: string;
}

export interface MistralPresentationTestimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface MistralPresentationComparison {
  leftTitle: string;
  left: string[];
  rightTitle: string;
  right: string[];
  highlight: string;
}

export interface MistralPresentationChartData {
  type: string;
  data: Array<{ name: string; value: number | string }>;
}

export type MistralPresentationTextSlide =
  | {
      slideNumber: number;
      type: "hero";
      title: string;
      subtitle?: string;
      cta?: string;
    }
  | {
      slideNumber: number;
      type: "stats";
      title: string;
      stats: MistralPresentationStat[];
    }
  | {
      slideNumber: number;
      type: "comparison";
      title: string;
      comparison: MistralPresentationComparison;
    }
  | {
      slideNumber: number;
      type: "feature-grid";
      title: string;
      icons: MistralPresentationIcon[];
    }
  | {
      slideNumber: number;
      type: "data-viz";
      title: string;
      chartData: MistralPresentationChartData;
    }
  | {
      slideNumber: number;
      type: "process";
      title: string;
      bullets: string[];
    }
  | {
      slideNumber: number;
      type: "timeline";
      title: string;
      timeline: MistralPresentationTimelineItem[];
    }
  | {
      slideNumber: number;
      type: "testimonial";
      title: string;
      testimonial: MistralPresentationTestimonial;
    }
  | {
      slideNumber: number;
      type: "bullets";
      title: string;
      bulletPoints: string[];
    }
  | {
      slideNumber: number;
      type: "closing";
      title: string;
      subtitle?: string;
      cta?: string;
      stats?: Array<{ value: string; label: string; context: string }>;
    }
  | (MistralPresentationTextSlideBaseFallback & { [k: string]: unknown });

type MistralPresentationTextSlideBaseFallback = {
  slideNumber: number;
  type: string;
  title: string;
  // optional fields vary by slide type
  [k: string]: unknown;
};


