'use client';

import React from 'react';

// ============================================
// 🎯 PROFESSIONAL SVG ICON LIBRARY
// ============================================

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  gradientId?: string;
}

// Animated Zap/Lightning Icon
export const ZapIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${className} animate-pulse`}>
    <defs>
      <linearGradient id="zapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF6B00" />
      </linearGradient>
      <filter id="zapGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#zapGradient)" filter="url(#zapGlow)" />
  </svg>
);

// Target/Precision Icon with rings
export const TargetIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#targetGradient)" strokeWidth="2" fill="none" opacity="0.3" />
    <circle cx="12" cy="12" r="6" stroke="url(#targetGradient)" strokeWidth="2" fill="none" opacity="0.6" />
    <circle cx="12" cy="12" r="2" fill="url(#targetGradient)" />
  </svg>
);

// Rocket Icon with flame
export const RocketIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="rocketFlame" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EF4444" />
      </linearGradient>
    </defs>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="url(#rocketFlame)" className="animate-pulse" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="url(#rocketBody)" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="url(#rocketBody)" strokeWidth="1.5" fill="none" />
  </svg>
);

// Shield Security Icon
export const ShieldIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#shieldGradient)" opacity="0.2" />
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#shieldGradient)" strokeWidth="2" fill="none" />
    <path d="M9 12l2 2 4-4" stroke="url(#shieldGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Users/Team Icon
export const UsersIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="usersGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <circle cx="9" cy="7" r="4" fill="url(#usersGradient)" opacity="0.8" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" fill="url(#usersGradient)" opacity="0.6" />
    <circle cx="16" cy="11" r="3" fill="url(#usersGradient)" opacity="0.6" />
    <path d="M21 21v-2a3 3 0 0 0-3-3h-1" stroke="url(#usersGradient)" strokeWidth="2" fill="none" opacity="0.6" />
  </svg>
);

// Globe Icon
export const GlobeIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0891B2" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#globeGradient)" strokeWidth="2" fill="none" />
    <ellipse cx="12" cy="12" rx="4" ry="10" stroke="url(#globeGradient)" strokeWidth="1.5" fill="none" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="url(#globeGradient)" strokeWidth="1" fill="none" opacity="0.5" />
  </svg>
);

// Chart/Analytics Icon
export const ChartIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="chartGradient" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
    </defs>
    <rect x="3" y="12" width="4" height="9" rx="1" fill="url(#chartGradient)" opacity="0.6" />
    <rect x="10" y="8" width="4" height="13" rx="1" fill="url(#chartGradient)" opacity="0.8" />
    <rect x="17" y="3" width="4" height="18" rx="1" fill="url(#chartGradient)" />
    <path d="M3 3v18h18" stroke="url(#chartGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
  </svg>
);

// Heart Icon
export const HeartIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
    </defs>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
      fill="url(#heartGradient)" />
  </svg>
);

// Star Icon
export const StarIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <filter id="starGlow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
      fill="url(#starGradient)" filter="url(#starGlow)" />
  </svg>
);

// Check/Success Icon
export const CheckIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#16A34A" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#checkGradient)" opacity="0.2" />
    <circle cx="12" cy="12" r="10" stroke="url(#checkGradient)" strokeWidth="2" fill="none" />
    <path d="M8 12l2.5 2.5L16 9" stroke="url(#checkGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// TrendUp Icon
export const TrendUpIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="trendGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
    </defs>
    <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="url(#trendGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 6h6v6" stroke="url(#trendGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Clock Icon
export const ClockIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#clockGradient)" strokeWidth="2" fill="none" />
    <path d="M12 6v6l4 2" stroke="url(#clockGradient)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Lock Icon
export const LockIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <rect x="3" y="11" width="18" height="11" rx="2" fill="url(#lockGradient)" opacity="0.8" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="url(#lockGradient)" strokeWidth="2" fill="none" />
    <circle cx="12" cy="16" r="1.5" fill="white" />
  </svg>
);

// Award Icon
export const AwardIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="awardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="8" r="6" fill="url(#awardGradient)" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="url(#awardGradient)" strokeWidth="2" fill="none" />
    <path d="M12 5l1 2h2l-1.5 1.5.5 2-2-1-2 1 .5-2L9 7h2l1-2z" fill="white" opacity="0.9" />
  </svg>
);

// Lightbulb Icon
export const LightbulbIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="bulbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="100%" stopColor="#FBBF24" />
      </linearGradient>
      <filter id="bulbGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M12 2a7 7 0 0 0-4 12.65V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.35A7 7 0 0 0 12 2z" 
      fill="url(#bulbGradient)" filter="url(#bulbGlow)" />
    <path d="M9 21h6M10 17v-2.65M14 17v-2.65" stroke="url(#bulbGradient)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Dollar/Money Icon
export const DollarIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="dollarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#15803D" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#dollarGradient)" opacity="0.15" />
    <circle cx="12" cy="12" r="10" stroke="url(#dollarGradient)" strokeWidth="2" fill="none" />
    <path d="M12 6v12M8 9.5c0-1.38 1.79-2.5 4-2.5s4 1.12 4 2.5c0 2.5-4 2-4 4.5 0 1.38 1.79 2.5 4 2.5" 
      stroke="url(#dollarGradient)" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

// Phone/Mobile Icon
export const PhoneIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <rect x="5" y="2" width="14" height="20" rx="3" stroke="url(#phoneGradient)" strokeWidth="2" fill="none" />
    <rect x="7" y="4" width="10" height="14" rx="1" fill="url(#phoneGradient)" opacity="0.2" />
    <circle cx="12" cy="20" r="1" fill="url(#phoneGradient)" />
  </svg>
);

// Cloud Icon
export const CloudIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="url(#cloudGradient)" opacity="0.8" />
  </svg>
);

// Code Icon
export const CodeIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="codeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0891B2" />
      </linearGradient>
    </defs>
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="url(#codeGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Palette/Design Icon
export const PaletteIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="paletteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#paletteGradient)" strokeWidth="2" fill="none" />
    <circle cx="8" cy="9" r="2" fill="#EF4444" />
    <circle cx="16" cy="9" r="2" fill="#22C55E" />
    <circle cx="8" cy="15" r="2" fill="#3B82F6" />
    <circle cx="16" cy="15" r="2" fill="#FBBF24" />
  </svg>
);

// AI/Brain Icon
export const AIIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="50%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <filter id="aiGlow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="url(#aiGradient)" strokeWidth="2" fill="none" filter="url(#aiGlow)" />
    <path d="M12 6c-2.21 0-4 1.79-4 4 0 1.1.45 2.1 1.17 2.83L8 16h8l-1.17-3.17A3.98 3.98 0 0 0 16 10c0-2.21-1.79-4-4-4z" fill="url(#aiGradient)" opacity="0.8" />
    <circle cx="10" cy="10" r="1" fill="white" />
    <circle cx="14" cy="10" r="1" fill="white" />
    <path d="M9 18h6v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2z" fill="url(#aiGradient)" opacity="0.6" />
  </svg>
);

// ============================================
// 🎨 GLASSMORPHISM CARD COMPONENT
// ============================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  borderOpacity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  blur = 20,
  opacity = 0.1,
  borderOpacity = 0.2
}) => (
  <div 
    className={`relative overflow-hidden rounded-2xl ${className}`}
    style={{
      background: `rgba(255, 255, 255, ${opacity})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
    }}
  >
    {/* Inner glow effect */}
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
      }}
    />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

// ============================================
// 📊 CINEMATIC DATA VISUALIZATION
// ============================================

interface LiquidProgressProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  size?: number;
}

export const LiquidProgress: React.FC<LiquidProgressProps> = ({ 
  value, 
  max = 100, 
  color = '#8B5CF6',
  label,
  size = 120
}) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
        <defs>
          <linearGradient id={`liquidGrad-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="liquidGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Background circle */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" opacity="0.1" />
        {/* Progress circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke={`url(#liquidGrad-${value})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 2.83} 283`}
          filter="url(#liquidGlow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{value}</span>
        {label && <span className="text-xs opacity-70 mt-1">{label}</span>}
      </div>
    </div>
  );
};

// ============================================
// 🏗️ ISOMETRIC DIAGRAM COMPONENTS
// ============================================

interface IsometricBoxProps {
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  label?: string;
  className?: string;
}

export const IsometricBox: React.FC<IsometricBoxProps> = ({
  width = 60,
  height = 40,
  depth = 30,
  color = '#6366F1',
  label,
  className = ''
}) => (
  <div className={`relative inline-block ${className}`}>
    <svg width={width + depth} height={height + depth} viewBox={`0 0 ${width + depth} ${height + depth}`}>
      <defs>
        <linearGradient id={`isoTop-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`isoLeft-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={`isoRight-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* Top face */}
      <polygon 
        points={`${depth},0 ${width + depth},0 ${width},${depth} 0,${depth}`}
        fill={`url(#isoTop-${color})`}
      />
      {/* Left face */}
      <polygon 
        points={`0,${depth} ${depth},0 ${depth},${height} 0,${height + depth}`}
        fill={`url(#isoLeft-${color})`}
      />
      {/* Right face */}
      <polygon 
        points={`${depth},${height} ${width + depth},${height} ${width},${height + depth} 0,${height + depth}`}
        fill={`url(#isoRight-${color})`}
      />
    </svg>
    {label && (
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
        {label}
      </div>
    )}
  </div>
);

// ============================================
// 📱 DEVICE MOCKUP COMPONENTS
// ============================================

interface PhoneMockupProps {
  children?: React.ReactNode;
  className?: string;
  screenContent?: React.ReactNode;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ children, className = '', screenContent }) => (
  <div className={`relative ${className}`}>
    <div className="w-[200px] h-[400px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl border-4 border-gray-800">
      {/* Notch */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-20" />
      {/* Screen */}
      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] overflow-hidden">
        {screenContent || children}
      </div>
    </div>
    {/* Reflection effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] pointer-events-none" />
  </div>
);

interface LaptopMockupProps {
  children?: React.ReactNode;
  className?: string;
  screenContent?: React.ReactNode;
}

export const LaptopMockup: React.FC<LaptopMockupProps> = ({ children, className = '', screenContent }) => (
  <div className={`relative ${className}`}>
    {/* Screen */}
    <div className="w-[400px] h-[250px] bg-gray-900 rounded-t-xl p-2 shadow-2xl border-4 border-gray-800">
      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden">
        {screenContent || children}
      </div>
      {/* Webcam */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full" />
    </div>
    {/* Base */}
    <div className="w-[440px] h-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-lg mx-auto" />
    <div className="w-[200px] h-1 bg-gray-600 rounded-full mx-auto" />
    {/* Reflection */}
    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/5 to-transparent rounded-t-xl pointer-events-none" />
  </div>
);

// ============================================
// 🎯 ANIMATED NUMBER COUNTER
// ============================================

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  duration = 2000,
  className = ''
}) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = duration / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return (
    <span className={className}>
      {prefix}{count}{suffix}
    </span>
  );
};

// ============================================
// 🌟 FLOATING PARTICLES BACKGROUND
// ============================================

export const FloatingParticles: React.FC<{ count?: number; color?: string }> = ({ 
  count = 20, 
  color = '#8B5CF6' 
}) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full animate-float"
        style={{
          width: Math.random() * 10 + 5,
          height: Math.random() * 10 + 5,
          backgroundColor: color,
          opacity: Math.random() * 0.3 + 0.1,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${Math.random() * 10 + 10}s`,
        }}
      />
    ))}
  </div>
);

// ============================================
// 🔄 MORPHING SHAPE COMPONENT
// ============================================

export const MorphingShape: React.FC<{ className?: string; color?: string }> = ({ 
  className = '', 
  color = '#8B5CF6' 
}) => (
  <svg viewBox="0 0 200 200" className={`${className} animate-morph`}>
    <defs>
      <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="0.8" />
        <stop offset="100%" stopColor={color} stopOpacity="0.4" />
      </linearGradient>
    </defs>
    <path
      fill="url(#morphGradient)"
      d="M47.3,-57.2C59.9,-46.7,67.6,-30.5,70.8,-13.4C74,3.7,72.6,21.8,64.2,36.1C55.7,50.5,40.1,61.2,23.1,67.2C6.1,73.2,-12.4,74.6,-28.9,68.8C-45.4,63,-59.9,50.1,-67.5,34.1C-75.1,18.1,-75.8,-1,-70.3,-17.7C-64.8,-34.5,-53.1,-48.8,-39.1,-59C-25.1,-69.2,-8.8,-75.3,4.9,-81.1C18.6,-86.9,34.7,-67.7,47.3,-57.2Z"
      transform="translate(100 100)"
    />
  </svg>
);

// ============================================
// 📊 ICON MAPPING FUNCTION
// ============================================

export const getIconComponent = (iconName: string, size: number = 24): React.ReactNode => {
  const iconMap: Record<string, React.FC<IconProps>> = {
    'Zap': ZapIcon,
    'Target': TargetIcon,
    'Rocket': RocketIcon,
    'Shield': ShieldIcon,
    'Users': UsersIcon,
    'Globe': GlobeIcon,
    'Chart': ChartIcon,
    'BarChart': ChartIcon,
    'Heart': HeartIcon,
    'Star': StarIcon,
    'Check': CheckIcon,
    'TrendUp': TrendUpIcon,
    'Clock': ClockIcon,
    'Lock': LockIcon,
    'Award': AwardIcon,
    'Lightbulb': LightbulbIcon,
    'DollarSign': DollarIcon,
    'Dollar': DollarIcon,
    'Phone': PhoneIcon,
    'Smartphone': PhoneIcon,
    'Cloud': CloudIcon,
    'Code': CodeIcon,
    'Palette': PaletteIcon,
    'AI': AIIcon,
    'Brain': AIIcon,
  };

  const IconComponent = iconMap[iconName];
  if (IconComponent) {
    return <IconComponent size={size} />;
  }
  
  // Fallback to emoji
  const emojiMap: Record<string, string> = {
    'Zap': '⚡', 'Shield': '🛡️', 'Users': '👥', 'Globe': '🌍', 'Target': '🎯',
    'Rocket': '🚀', 'Heart': '❤️', 'Star': '⭐', 'Check': '✓', 'TrendUp': '📈',
    'Clock': '⏰', 'Lock': '🔒', 'Award': '🏆', 'Lightbulb': '💡', 'BarChart': '📊',
    'DollarSign': '💰', 'Smartphone': '📱', 'Cloud': '☁️', 'Code': '💻', 'Palette': '🎨'
  };
  
  return <span className="text-2xl">{emojiMap[iconName] || '•'}</span>;
};

// Export all icons for direct use
export const PremiumIcons = {
  Zap: ZapIcon,
  Target: TargetIcon,
  Rocket: RocketIcon,
  Shield: ShieldIcon,
  Users: UsersIcon,
  Globe: GlobeIcon,
  Chart: ChartIcon,
  Heart: HeartIcon,
  Star: StarIcon,
  Check: CheckIcon,
  TrendUp: TrendUpIcon,
  Clock: ClockIcon,
  Lock: LockIcon,
  Award: AwardIcon,
  Lightbulb: LightbulbIcon,
  Dollar: DollarIcon,
  Phone: PhoneIcon,
  Cloud: CloudIcon,
  Code: CodeIcon,
  Palette: PaletteIcon,
  AI: AIIcon,
};
