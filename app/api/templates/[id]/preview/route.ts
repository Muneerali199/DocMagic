import { NextRequest, NextResponse } from 'next/server';

// Simple SVG preview generator for templates
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Color schemes for different template types
  const colorSchemes = {
    '1': { bg: '#f0f9ff', accent: '#3b82f6', text: '#1e40af' }, // Professional - Blue
    '2': { bg: '#faf5ff', accent: '#a855f7', text: '#7c3aed' }, // Creative - Purple
    '3': { bg: '#f0f9ff', accent: '#3b82f6', text: '#1e40af' }, // Business - Blue
    '4': { bg: '#f0fdf4', accent: '#22c55e', text: '#15803d' }, // Letter - Green
    '5': { bg: '#fefce8', accent: '#eab308', text: '#a16207' }, // Academic - Yellow
    '6': { bg: '#1e293b', accent: '#64748b', text: '#f1f5f9' }, // Executive - Dark
    '7': { bg: '#ecfdf5', accent: '#10b981', text: '#047857' }, // Entry Level - Emerald
    '8': { bg: '#fef2f2', accent: '#ef4444', text: '#dc2626' }, // Healthcare - Red
    '9': { bg: '#f3e8ff', accent: '#8b5cf6', text: '#6d28d9' }, // Startup - Violet
    '10': { bg: '#fff7ed', accent: '#f97316', text: '#ea580c' }, // Educational - Orange
    '11': { bg: '#f0f9ff', accent: '#0ea5e9', text: '#0284c7' }, // Sales - Sky
    '12': { bg: '#f8fafc', accent: '#64748b', text: '#334155' }, // Business Letter - Slate
    '13': { bg: '#fef3c7', accent: '#f59e0b', text: '#d97706' }, // Resignation - Amber
    '14': { bg: '#ecfdf5', accent: '#10b981', text: '#059669' }, // Thank You - Emerald
    '15': { bg: '#f0f9ff', accent: '#3b82f6', text: '#1d4ed8' }, // Research - Blue
    '16': { bg: '#fef2f2', accent: '#ef4444', text: '#dc2626' }, // Medical - Red
    '17': { bg: '#f0fdf4', accent: '#22c55e', text: '#16a34a' }, // International - Green
  };
  
  const colors = colorSchemes[id as keyof typeof colorSchemes] || colorSchemes['1'];
  
  // Template type indicators
  const typeIcons = {
    '1': '📄', '2': '🎨', '6': '💼', '7': '🎓', '8': '🏥',
    '3': '📊', '9': '🚀', '10': '📚', '11': '💰',
    '4': '✉️', '12': '📋', '13': '👋', '14': '🙏',
    '5': '🎓', '15': '🔬', '16': '⚕️', '17': '🌍'
  };
  
  const icon = typeIcons[id as keyof typeof typeIcons] || '📄';
  
  // Generate SVG preview
  const svg = `
    <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="300" height="400" fill="url(#bg-gradient)" rx="8"/>
      
      <!-- Header -->
      <rect x="20" y="20" width="260" height="60" fill="${colors.accent}" rx="4" opacity="0.1"/>
      <text x="50" y="45" font-family="Arial, sans-serif" font-size="24" fill="${colors.text}">${icon}</text>
      <text x="50" y="65" font-family="Arial, sans-serif" font-size="12" fill="${colors.text}" opacity="0.8">Template ${id}</text>
      
      <!-- Content lines -->
      <rect x="20" y="100" width="200" height="8" fill="${colors.accent}" rx="4" opacity="0.3"/>
      <rect x="20" y="120" width="160" height="6" fill="${colors.accent}" rx="3" opacity="0.2"/>
      <rect x="20" y="135" width="180" height="6" fill="${colors.accent}" rx="3" opacity="0.2"/>
      
      <rect x="20" y="160" width="120" height="8" fill="${colors.accent}" rx="4" opacity="0.3"/>
      <rect x="20" y="180" width="140" height="6" fill="${colors.accent}" rx="3" opacity="0.2"/>
      <rect x="20" y="195" width="100" height="6" fill="${colors.accent}" rx="3" opacity="0.2"/>
      
      <rect x="20" y="220" width="160" height="8" fill="${colors.accent}" rx="4" opacity="0.3"/>
      <rect x="20" y="240" width="120" height="6" fill="${colors.accent}" rx="3" opacity="0.2"/>
      <rect x="20" y="255" width="140" height="6" fill="${colors.accent}" rx="3" opacity="0.2"/>
      
      <!-- Footer -->
      <rect x="20" y="320" width="260" height="40" fill="${colors.accent}" rx="4" opacity="0.05"/>
      <circle cx="50" cy="340" r="8" fill="${colors.accent}" opacity="0.3"/>
      <rect x="70" y="335" width="80" height="4" fill="${colors.accent}" rx="2" opacity="0.2"/>
      <rect x="70" y="345" width="60" height="4" fill="${colors.accent}" rx="2" opacity="0.2"/>
      
      <!-- Decorative elements -->
      <circle cx="250" cy="50" r="20" fill="${colors.accent}" opacity="0.1"/>
      <circle cx="270" cy="350" r="15" fill="${colors.accent}" opacity="0.1"/>
    </svg>
  `;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}
