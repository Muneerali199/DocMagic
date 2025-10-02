// Mobile-responsive improvements for presentation generator
// This file contains responsive utility classes and mobile optimizations

export const mobileResponsiveClasses = {
  // Container classes
  mainContainer: "min-h-screen w-full overflow-x-hidden",
  contentContainer: "container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12",
  
  // Grid layouts
  twoColumnGrid: "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8",
  threeColumnGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
  
  // Typography
  heading1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold",
  heading2: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold",
  heading3: "text-lg sm:text-xl md:text-2xl font-semibold",
  body: "text-sm sm:text-base md:text-lg",
  small: "text-xs sm:text-sm",
  
  // Buttons
  primaryButton: "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base",
  iconButton: "p-2 sm:p-3 rounded-full",
  
  // Cards
  card: "rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8",
  glassCard: "glass-effect border border-yellow-400/20 rounded-xl sm:rounded-2xl p-4 sm:p-6",
  
  // Spacing
  spacingY: "space-y-4 sm:space-y-6 lg:space-y-8",
  spacingX: "space-x-2 sm:space-x-3 lg:space-x-4",
  
  // Presentation preview
  previewContainer: "w-full aspect-video rounded-lg sm:rounded-xl overflow-hidden",
  slideContent: "p-4 sm:p-6 md:p-8 lg:p-12",
  
  // Navigation
  stepIndicator: "flex items-center justify-start sm:justify-center gap-2 sm:gap-4 overflow-x-auto pb-2 px-2",
  stepBadge: "flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap text-xs sm:text-sm",
  
  // Export buttons
  exportButtons: "flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto",
  exportButton: "w-full sm:w-auto justify-center",
};

export const mobileBreakpoints = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
};

// Helper function to detect mobile device
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Helper function to get optimal image size based on screen size
export const getOptimalImageSize = (): { width: number; height: number } => {
  if (typeof window === 'undefined') return { width: 1200, height: 800 };
  
  const screenWidth = window.innerWidth;
  if (screenWidth < 640) return { width: 640, height: 480 };
  if (screenWidth < 1024) return { width: 1024, height: 768 };
  return { width: 1920, height: 1080 };
};

// Helper function for touch-friendly spacing
export const getTouchFriendlySpacing = (baseSpacing: number): string => {
  if (typeof window === 'undefined') return `${baseSpacing}px`;
  return isMobileDevice() ? `${baseSpacing * 1.5}px` : `${baseSpacing}px`;
};
