import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 * Returns true for screens <= 1024px width (includes tablets for better mobile UX)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;

    // Function to check if screen is mobile size
    const checkMobile = () => {
      // Include tablets (up to 1024px) for better mobile-optimized view
      setIsMobile(window.innerWidth <= 1024);
    };

    // Check on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
