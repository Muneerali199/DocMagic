import React from 'react';

// Performance detection utilities
export const isLowEndDevice = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return true;
  
  // Check for low-end device indicators
  const isMobile = window.innerWidth < 768;
  const isSmallScreen = window.innerWidth < 480;
  
  // Check for hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4;
  const isLowCPU = cores <= 2;
  
  // Check for memory (if available)
  const memory = (navigator as any).deviceMemory || 4;
  const isLowMemory = memory <= 2;
  
  // Check for connection speed
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' || 
    connection.effectiveType === '3g'
  );
  
  return isSmallScreen || (isMobile && (isLowCPU || isLowMemory)) || isSlowConnection;
};

export const shouldReduceAnimations = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return true;
  
  // Check for low-end device
  return isLowEndDevice();
};

export const getPerformanceMode = () => {
  if (shouldReduceAnimations()) return 'reduced';
  if (isLowEndDevice()) return 'low';
  return 'normal';
};

// Performance optimization hooks
export const usePerformanceMode = () => {
  if (typeof window === 'undefined') return 'normal';
  
  const [mode, setMode] = React.useState<'reduced' | 'low' | 'normal'>('normal');
  
  React.useEffect(() => {
    const updateMode = () => {
      setMode(getPerformanceMode());
    };
    
    updateMode();
    
    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', updateMode);
    
    return () => {
      mediaQuery.removeEventListener('change', updateMode);
    };
  }, []);
  
  return mode;
}; 