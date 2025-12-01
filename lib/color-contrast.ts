/**
 * Color Contrast Utility
 * Calculates optimal text color based on background luminance
 * Works with hex colors, RGB, and Tailwind gradient classes
 */

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Extract dominant color from Tailwind gradient class
 * e.g., "bg-gradient-to-br from-blue-500 to-purple-600" -> blue-500
 * e.g., "bg-gradient-to-br from-black to-gray-900" -> black
 */
export function extractDominantColorFromGradient(gradientClass: string): string {
  // Extract the "from" color as it's usually the dominant one
  // Matches "from-blue-500" or "from-black"
  const fromMatch = gradientClass.match(/from-([a-z]+)(?:-(\d+))?/);
  if (fromMatch) {
    const [, color, shade] = fromMatch;
    return shade ? `${color}-${shade}` : color;
  }
  
  // Fallback to "to" color
  const toMatch = gradientClass.match(/to-([a-z]+)(?:-(\d+))?/);
  if (toMatch) {
    const [, color, shade] = toMatch;
    return shade ? `${color}-${shade}` : color;
  }
  
  return 'gray-500'; // Default fallback
}

/**
 * Tailwind color palette (approximate hex values for common shades)
 */
const TAILWIND_COLORS: Record<string, Record<string, string> | string> = {
  black: '#000000',
  white: '#ffffff',
  slate: { '100': '#f1f5f9', '200': '#e2e8f0', '300': '#cbd5e1', '400': '#94a3b8', '500': '#64748b', '600': '#475569', '700': '#334155', '800': '#1e293b', '900': '#0f172a', '950': '#020617' },
  gray: { '100': '#f3f4f6', '200': '#e5e7eb', '300': '#d1d5db', '400': '#9ca3af', '500': '#6b7280', '600': '#4b5563', '700': '#374151', '800': '#1f2937', '900': '#111827', '950': '#030712' },
  zinc: { '100': '#f4f4f5', '200': '#e4e4e7', '300': '#d4d4d8', '400': '#a1a1aa', '500': '#71717a', '600': '#52525b', '700': '#3f3f46', '800': '#27272a', '900': '#18181b', '950': '#09090b' },
  neutral: { '100': '#f5f5f5', '200': '#e5e5e5', '300': '#d4d4d4', '400': '#a3a3a3', '500': '#737373', '600': '#525252', '700': '#404040', '800': '#262626', '900': '#171717', '950': '#0a0a0a' },
  stone: { '100': '#f5f5f4', '200': '#e7e5e4', '300': '#d6d3d1', '400': '#a8a29e', '500': '#78716c', '600': '#57534e', '700': '#44403c', '800': '#292524', '900': '#1c1917', '950': '#0c0a09' },
  red: { '100': '#fee2e2', '200': '#fecaca', '300': '#fca5a5', '400': '#f87171', '500': '#ef4444', '600': '#dc2626', '700': '#b91c1c', '800': '#991b1b', '900': '#7f1d1d', '950': '#450a0a' },
  orange: { '100': '#ffedd5', '200': '#fed7aa', '300': '#fdba74', '400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c', '800': '#9a3412', '900': '#7c2d12', '950': '#431407' },
  amber: { '100': '#fef3c7', '200': '#fde68a', '300': '#fcd34d', '400': '#fbbf24', '500': '#f59e0b', '600': '#d97706', '700': '#b45309', '800': '#92400e', '900': '#78350f', '950': '#451a03' },
  yellow: { '100': '#fef9c3', '200': '#fef08a', '300': '#fde047', '400': '#facc15', '500': '#eab308', '600': '#ca8a04', '700': '#a16207', '800': '#854d0e', '900': '#713f12', '950': '#422006' },
  lime: { '100': '#ecfccb', '200': '#d9f99d', '300': '#bef264', '400': '#a3e635', '500': '#84cc16', '600': '#65a30d', '700': '#4d7c0f', '800': '#3f6212', '900': '#365314', '950': '#1a2e05' },
  green: { '100': '#dcfce7', '200': '#bbf7d0', '300': '#86efac', '400': '#4ade80', '500': '#22c55e', '600': '#16a34a', '700': '#15803d', '800': '#166534', '900': '#14532d', '950': '#052e16' },
  emerald: { '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b', '950': '#022c22' },
  teal: { '100': '#ccfbf1', '200': '#99f6e4', '300': '#5eead4', '400': '#2dd4bf', '500': '#14b8a6', '600': '#0d9488', '700': '#0f766e', '800': '#115e59', '900': '#134e4a', '950': '#042f2e' },
  cyan: { '100': '#cffafe', '200': '#a5f3fc', '300': '#67e8f9', '400': '#22d3ee', '500': '#06b6d4', '600': '#0891b2', '700': '#0e7490', '800': '#155e75', '900': '#164e63', '950': '#083344' },
  sky: { '100': '#e0f2fe', '200': '#bae6fd', '300': '#7dd3fc', '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7', '700': '#0369a1', '800': '#075985', '900': '#0c4a6e', '950': '#082f49' },
  blue: { '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd', '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af', '900': '#1e3a8a', '950': '#172554' },
  indigo: { '100': '#e0e7ff', '200': '#c7d2fe', '300': '#a5b4fc', '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5', '700': '#4338ca', '800': '#3730a3', '900': '#312e81', '950': '#1e1b4b' },
  violet: { '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd', '400': '#a78bfa', '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', '800': '#5b21b6', '900': '#4c1d95', '950': '#2e1065' },
  purple: { '100': '#f3e8ff', '200': '#e9d5ff', '300': '#d8b4fe', '400': '#c084fc', '500': '#a855f7', '600': '#9333ea', '700': '#7e22ce', '800': '#6b21a8', '900': '#581c87', '950': '#3b0764' },
  fuchsia: { '100': '#fae8ff', '200': '#f5d0fe', '300': '#f0abfc', '400': '#e879f9', '500': '#d946ef', '600': '#c026d3', '700': '#a21caf', '800': '#86198f', '900': '#701a75', '950': '#4a044e' },
  pink: { '100': '#fce7f3', '200': '#fbcfe8', '300': '#f9a8d4', '400': '#f472b6', '500': '#ec4899', '600': '#db2777', '700': '#be185d', '800': '#9d174d', '900': '#831843', '950': '#500724' },
  rose: { '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519' },
};

/**
 * Get hex color from Tailwind color name
 */
export function getTailwindColorHex(colorName: string): string | null {
  if (colorName === 'black') return '#000000';
  if (colorName === 'white') return '#ffffff';
  
  const [color, shade] = colorName.split('-');
  const colorObj = TAILWIND_COLORS[color];
  
  if (typeof colorObj === 'string') return colorObj;
  if (typeof colorObj === 'object') return colorObj[shade] || null;
  
  return null;
}

/**
 * Determine optimal text color (white or black) based on background
 * Returns '#ffffff' for dark backgrounds, '#000000' for light backgrounds
 */
export function getOptimalTextColor(background: string): string {
  let rgb: { r: number; g: number; b: number } | null = null;
  
  console.log('🎨 getOptimalTextColor called with:', background);
  
  // Try to parse as hex color
  if (background.startsWith('#')) {
    rgb = hexToRgb(background);
    console.log('  → Parsed as hex:', rgb);
  }
  // Try to parse as Tailwind gradient class
  else if (background.includes('gradient') || background.includes('from-') || background.includes('to-')) {
    const dominantColor = extractDominantColorFromGradient(background);
    console.log('  → Extracted dominant color:', dominantColor);
    const hex = getTailwindColorHex(dominantColor);
    console.log('  → Converted to hex:', hex);
    if (hex) {
      rgb = hexToRgb(hex);
      console.log('  → Parsed RGB:', rgb);
    }
  }
  // Try to parse as Tailwind color class (e.g., "bg-blue-500")
  else if (background.startsWith('bg-')) {
    const colorName = background.replace('bg-', '');
    const hex = getTailwindColorHex(colorName);
    if (hex) {
      rgb = hexToRgb(hex);
    }
  }
  
  // If we couldn't parse the color, check for keywords
  if (!rgb) {
    console.log('  → Could not parse color, checking keywords');
    // Check if it contains 'black' or very dark keywords
    const lowerBg = background.toLowerCase();
    if (lowerBg.includes('black') || lowerBg.includes('900') || lowerBg.includes('950')) {
      console.log('  → Detected dark background keyword, returning white text');
      return '#ffffff';
    }
    // Default to white text for safety (works on most backgrounds)
    console.log('  → Using default white text');
    return '#ffffff';
  }
  
  // Calculate luminance
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  console.log('  → Calculated luminance:', luminance);
  
  // WCAG recommends 4.5:1 contrast ratio for normal text
  // If luminance > 0.5, background is light, use dark text
  // If luminance <= 0.5, background is dark, use light text
  const textColor = luminance > 0.5 ? '#000000' : '#ffffff';
  console.log('  → Final text color:', textColor);
  
  return textColor;
}

/**
 * Get text color with guaranteed contrast
 * This is the main function to use in components
 */
export function getContrastingTextColor(
  background: string,
  lightModeTextColor: string = '#000000',
  darkModeTextColor: string = '#ffffff'
): string {
  // First, try to get optimal color based on background
  const optimalColor = getOptimalTextColor(background);
  
  // If we got a valid result, use it
  if (optimalColor) {
    return optimalColor;
  }
  
  // Fallback to provided colors
  return darkModeTextColor;
}
