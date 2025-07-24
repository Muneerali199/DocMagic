import { CheckCircle, FileText, PresentationIcon as LayoutPresentationIcon, BookOpen, Users, PenTool, Download, Sparkles, Zap, Star, Wand2 } from "lucide-react";

export function FeaturesSection() {
  return (
    <div className="py-16 sm:py-20 lg:py-32 relative overflow-hidden section-header" id="how-it-works">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      {/* Floating orbs */}
      <div className="floating-orb w-40 h-40 sm:w-64 sm:h-64 bolt-gradient opacity-15 top-20 -left-20 sm:-left-32"></div>
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-20 -top-10 right-10 sm:right-20"></div>
      <div className="floating-orb w-48 h-48 sm:w-72 sm:h-72 bolt-gradient opacity-10 bottom-10 left-1/3"></div>
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />
      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full gradient-border mb-4 sm:mb-6 relative">
            <div className="relative z-10 flex items-center gap-2">
              <Wand2 className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" style={{animation: 'sparkle 2s ease-in-out infinite'}} />
              <span className="text-xs sm:text-sm font-medium bolt-gradient-text">How It Works</span>
            </div>
          </div>
          
          <h2 className="modern-title text-2xl sm:text-3xl lg:text-5xl mb-4 sm:mb-6">
            Transform text into{" "}
            <span className="bolt-gradient-text">professional documents</span>
          </h2>
          
          <p className="modern-body text-base sm:text-lg text-muted-foreground px-4 sm:px-0">
            Simply describe what you need, and our AI will generate a polished document tailored to your specifications in seconds. It's like having a professional writer and designer at your fingertips.
          </p>
        </div>
        
        <div className="mx-auto mt-12 sm:mt-16 lg:mt-24 max-w-2xl sm:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-8 sm:gap-x-8 sm:gap-y-16 lg:max-w-none lg:grid-cols-3 mx-auto">
            {features.map((feature, index) => {
              // Assign different color themes to features
              const themes = [
                { cardClass: 'card-coral hover-coral', gradientClass: 'sunset-gradient', glowClass: 'sunset-glow' },
                { cardClass: 'card-sky hover-sky', gradientClass: 'ocean-gradient', glowClass: 'ocean-glow' },
                { cardClass: 'card-mint hover-mint', gradientClass: 'forest-gradient', glowClass: 'bolt-glow' },
                { cardClass: 'card-lavender hover-lavender', gradientClass: 'cosmic-gradient', glowClass: 'sunset-glow' },
                { cardClass: 'card-coral hover-coral', gradientClass: 'bolt-gradient', glowClass: 'ocean-glow' },
                { cardClass: 'card-sky hover-sky', gradientClass: 'sunset-gradient', glowClass: 'bolt-glow' }
              ];
              const theme = themes[index % themes.length];
              const animationDelay = `delay-${(index + 1) * 100}`;
              
              return (
                <div key={feature.name} className={`flex flex-col group px-4 sm:px-6 p-8 rounded-2xl transition-all duration-500 hover:scale-105 ${theme.cardClass} hover:${theme.glowClass} animate-slide-in-left ${animationDelay} will-change-transform !dark:text-white`}>
                  <dt className="flex items-center gap-x-3   text-base font-semibold leading-7">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 flex-none rounded-xl ${theme.gradientClass} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 relative !dark:text-white`}>
                      {feature.icon}
                      <div className={`absolute inset-0 ${theme.gradientClass} rounded-xl opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300`}></div>
                    </div>
                    <span className="group-hover:bolt-gradient-text transition-all duration-300 text-sm sm:text-base dark:text-white">
                      {feature.name}
                    </span>
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-sm sm:text-base leading-6 sm:leading-7 text-muted-foreground dark:text-white">
                    <p className="flex-auto group-hover:text-foreground/80 transition-colors dark:text-white">
                      {feature.description}
                    </p>
                    <div className="mt-4">
                      <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium bolt-gradient-text dark:text-white">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 dark:text-white" style={{animation: 'sparkle 2s ease-in-out infinite'}} />
                        <span>Professional Quality</span>
                      </div>
                    </div>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'AI Text to Document',
    description:
      'Describe what you need in plain language, and our advanced AI will generate a complete, professional document based on your input with intelligent formatting and content.',
    icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6 stroke-white" />,
  },
  {
    name: 'Beautiful Templates',
    description:
      'Choose from a variety of professionally designed templates for resumes, presentations, CVs, and letters. Each template is optimized for modern standards.',
    icon: <LayoutPresentationIcon className="h-5 w-5 sm:h-6 sm:w-6 stroke-white" />,
  },
  {
    name: 'Smart Content Generation',
    description:
      'Our AI helps you generate compelling content tailored to your specific needs, industry standards, and target audience with contextual intelligence.',
    icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6 stroke-white" />,
  },
  {
    name: 'Intuitive Editing',
    description:
      'Edit, customize, and fine-tune your generated documents with our intuitive editor interface. Real-time preview and instant formatting.',
    icon: <PenTool className="h-5 w-5 sm:h-6 sm:w-6 stroke-white" />,
  },
  {
    name: 'Team Collaboration',
    description:
      'Share your documents with teammates or collaborators to get feedback and make improvements together. Built-in commenting and version control.',
    icon: <Users className="h-5 w-5 sm:h-6 sm:w-6 stroke-white" />,
  },
  {
    name: 'Multi-Format Export',
    description:
      'Download your finished documents in multiple formats (PDF, PPTX, DOCX) for easy sharing, printing, and professional presentation.',
    icon: <Download className="h-5 w-5 sm:h-6 sm:w-6 stroke-white" />,
  },
];