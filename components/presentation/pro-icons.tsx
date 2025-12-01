'use client';

import React from 'react';

// Professional SVG Icons for Presentations
// These are clean, modern icons that look great at any size

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// Technology & AI Icons
export const AIBrainIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M20 32c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="24" cy="28" r="3" fill={color}/>
    <circle cx="40" cy="28" r="3" fill={color}/>
    <circle cx="32" cy="40" r="4" fill={color}/>
    <path d="M24 28L32 40M40 28L32 40" stroke={color} strokeWidth="1.5"/>
    <path d="M16 24l-4-4M48 24l4-4M16 40l-4 4M48 40l4 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const NeuralNetworkIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="20" r="6" stroke={color} strokeWidth="2"/>
    <circle cx="12" cy="44" r="6" stroke={color} strokeWidth="2"/>
    <circle cx="32" cy="12" r="6" stroke={color} strokeWidth="2"/>
    <circle cx="32" cy="32" r="6" stroke={color} strokeWidth="2"/>
    <circle cx="32" cy="52" r="6" stroke={color} strokeWidth="2"/>
    <circle cx="52" cy="20" r="6" stroke={color} strokeWidth="2"/>
    <circle cx="52" cy="44" r="6" stroke={color} strokeWidth="2"/>
    <path d="M18 20L26 14M18 20L26 30M18 20L26 50M18 44L26 14M18 44L26 30M18 44L26 50" stroke={color} strokeWidth="1.5" opacity="0.6"/>
    <path d="M38 14L46 20M38 14L46 44M38 32L46 20M38 32L46 44M38 52L46 20M38 52L46 44" stroke={color} strokeWidth="1.5" opacity="0.6"/>
  </svg>
);

export const CloudIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 42H16a10 10 0 01-2-19.8 14 14 0 0127.3-3.7A12 12 0 0148 30v2a8 8 0 010 10z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M24 50v6M32 48v8M40 50v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const SecurityShieldIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 6L8 16v16c0 14.4 10.8 27.6 24 32 13.2-4.4 24-17.6 24-32V16L32 6z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M24 32l6 6 12-12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const RocketIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8c-8 8-12 20-12 28 0 4 2 8 4 10l8-6 8 6c2-2 4-6 4-10 0-8-4-20-12-28z" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="32" cy="28" r="4" fill={color}/>
    <path d="M20 36c-6 2-10 8-10 12h10M44 36c6 2 10 8 10 12H44" stroke={color} strokeWidth="2"/>
    <path d="M28 50l4 8 4-8" stroke={color} strokeWidth="2" fill={color} opacity="0.6"/>
  </svg>
);

export const ChartGrowthIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="48" height="48" rx="4" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M16 44l12-16 8 8 12-20" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="48" cy="16" r="4" fill={color}/>
    <path d="M44 20l4-4" stroke={color} strokeWidth="2"/>
  </svg>
);

export const TargetIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="32" cy="32" r="16" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="32" cy="32" r="8" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="32" cy="32" r="3" fill={color}/>
    <path d="M32 4v8M32 52v8M4 32h8M52 32h8" stroke={color} strokeWidth="2"/>
  </svg>
);

export const LightbulbIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8a16 16 0 00-10 28.5V44a4 4 0 004 4h12a4 4 0 004-4v-7.5A16 16 0 0032 8z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M26 52h12M28 56h8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 16v8M24 20l4 4M40 20l-4 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const HeartPulseIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 56s-20-14-20-28a12 12 0 0120-9 12 12 0 0120 9c0 14-20 28-20 28z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M16 32h8l4-8 8 16 4-8h8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const GlobeIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" stroke={color} strokeWidth="2" fill="none"/>
    <ellipse cx="32" cy="32" rx="10" ry="24" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M8 32h48M12 20h40M12 44h40" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const UsersIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="20" r="8" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="44" cy="20" r="6" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M8 52c0-10 7-16 16-16s16 6 16 16" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M40 52c0-6 4-10 10-10s10 4 10 10" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

export const DatabaseIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="14" rx="20" ry="8" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 14v36c0 4.4 8.9 8 20 8s20-3.6 20-8V14" stroke={color} strokeWidth="2"/>
    <path d="M12 28c0 4.4 8.9 8 20 8s20-3.6 20-8" stroke={color} strokeWidth="2"/>
    <path d="M12 42c0 4.4 8.9 8 20 8s20-3.6 20-8" stroke={color} strokeWidth="2"/>
  </svg>
);

export const CogIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M32 8v6M32 50v6M8 32h6M50 32h6M14.1 14.1l4.2 4.2M45.7 45.7l4.2 4.2M14.1 49.9l4.2-4.2M45.7 18.3l4.2-4.2" stroke={color} strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export const MoneyIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M32 16v32M24 24c0-4.4 3.6-4 8-4s8-.4 8 4-4 6-8 6-8 1.6-8 6 3.6 4 8 4 8 .4 8-4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const CheckCircleIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M20 32l8 8 16-16" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ClockIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M32 16v18l12 6" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const StarIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8l7.4 15 16.6 2.4-12 11.7 2.8 16.5L32 46l-14.8 7.6 2.8-16.5-12-11.7L24.6 23z" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

export const AwardIcon = ({ className, size = 48, color = 'currentColor' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="24" r="16" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M20 36l-4 20 16-8 16 8-4-20" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M32 16l2 4 4.5.7-3.2 3.2.8 4.5L32 26l-4.1 2.4.8-4.5-3.2-3.2L30 20z" fill={color}/>
  </svg>
);

// Diagram Components
export const FlowchartArrow = ({ className, color = 'currentColor' }: IconProps) => (
  <svg className={className} width="60" height="24" viewBox="0 0 60 24" fill="none">
    <path d="M0 12h50M50 12l-8-8M50 12l-8 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ConnectorLine = ({ className, color = 'currentColor', direction = 'horizontal' }: IconProps & { direction?: 'horizontal' | 'vertical' }) => (
  <svg className={className} width={direction === 'horizontal' ? 40 : 20} height={direction === 'horizontal' ? 20 : 40} viewBox={direction === 'horizontal' ? '0 0 40 20' : '0 0 20 40'} fill="none">
    {direction === 'horizontal' ? (
      <path d="M0 10h40" stroke={color} strokeWidth="2" strokeDasharray="4 4"/>
    ) : (
      <path d="M10 0v40" stroke={color} strokeWidth="2" strokeDasharray="4 4"/>
    )}
  </svg>
);

// Company Logos (Placeholder style)
export const CompanyLogo = ({ name, className, size = 80 }: { name: string; className?: string; size?: number }) => {
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const colors = [
    { bg: '#4285F4', text: '#fff' }, // Google blue
    { bg: '#FF6B00', text: '#fff' }, // Orange
    { bg: '#00A67E', text: '#fff' }, // Green
    { bg: '#7C3AED', text: '#fff' }, // Purple
    { bg: '#EC4899', text: '#fff' }, // Pink
    { bg: '#0EA5E9', text: '#fff' }, // Sky
  ];
  const colorIndex = name.length % colors.length;
  const { bg, text } = colors[colorIndex];
  
  return (
    <div 
      className={`flex items-center justify-center rounded-xl font-bold ${className}`}
      style={{ 
        width: size, 
        height: size * 0.6, 
        backgroundColor: bg,
        color: text,
        fontSize: size * 0.25
      }}
    >
      {initials}
    </div>
  );
};

// Icon mapping for dynamic rendering
export const iconMap: Record<string, React.FC<IconProps>> = {
  'brain': AIBrainIcon,
  'ai': AIBrainIcon,
  'neural': NeuralNetworkIcon,
  'network': NeuralNetworkIcon,
  'cloud': CloudIcon,
  'security': SecurityShieldIcon,
  'shield': SecurityShieldIcon,
  'rocket': RocketIcon,
  'growth': ChartGrowthIcon,
  'chart': ChartGrowthIcon,
  'target': TargetIcon,
  'lightbulb': LightbulbIcon,
  'idea': LightbulbIcon,
  'health': HeartPulseIcon,
  'heart': HeartPulseIcon,
  'globe': GlobeIcon,
  'world': GlobeIcon,
  'users': UsersIcon,
  'team': UsersIcon,
  'database': DatabaseIcon,
  'data': DatabaseIcon,
  'settings': CogIcon,
  'cog': CogIcon,
  'money': MoneyIcon,
  'dollar': MoneyIcon,
  'check': CheckCircleIcon,
  'success': CheckCircleIcon,
  'clock': ClockIcon,
  'time': ClockIcon,
  'star': StarIcon,
  'award': AwardIcon,
  'trophy': AwardIcon,
};

export const getIconByName = (name: string): React.FC<IconProps> | null => {
  const key = name.toLowerCase().replace(/[^a-z]/g, '');
  return iconMap[key] || null;
};

// Export getProIcon as an alias for compatibility
export const getProIcon = (name: string): React.FC<IconProps> | null => {
  if (!name) return null;
  const key = name.toLowerCase().replace(/[^a-z]/g, '');
  // Extended mapping for common icon names
  const extendedMap: Record<string, React.FC<IconProps>> = {
    ...iconMap,
    'zap': RocketIcon,
    'lightning': RocketIcon,
    'trendup': ChartGrowthIcon,
    'trendingup': ChartGrowthIcon,
    'dollarsign': MoneyIcon,
    'lock': SecurityShieldIcon,
    'smartphone': DatabaseIcon,
    'phone': DatabaseIcon,
    'code': CogIcon,
    'palette': LightbulbIcon,
    'barChart': ChartGrowthIcon,
  };
  return extendedMap[key] || iconMap[key] || null;
};

// Professional Diagrams
export const ProcessDiagram = ({ 
  steps, 
  accentColor = '#3B82F6',
  textColor = '#1F2937'
}: { 
  steps: string[]; 
  accentColor?: string;
  textColor?: string;
}) => (
  <div className="flex items-center justify-center gap-2 flex-wrap">
    {steps.map((step, idx) => (
      <React.Fragment key={idx}>
        <div 
          className="px-6 py-4 rounded-xl border-2 text-center font-medium shadow-lg backdrop-blur-sm"
          style={{ 
            borderColor: accentColor,
            backgroundColor: `${accentColor}15`,
            color: textColor,
            minWidth: '120px'
          }}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2"
            style={{ backgroundColor: accentColor, color: '#fff' }}
          >
            {idx + 1}
          </div>
          {step}
        </div>
        {idx < steps.length - 1 && (
          <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="shrink-0">
            <path d="M0 12h32M32 12l-6-6M32 12l-6 6" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </React.Fragment>
    ))}
  </div>
);

export const HierarchyDiagram = ({ 
  title, 
  children,
  accentColor = '#3B82F6',
  textColor = '#1F2937'
}: { 
  title: string;
  children: string[];
  accentColor?: string;
  textColor?: string;
}) => (
  <div className="flex flex-col items-center gap-4">
    <div 
      className="px-8 py-4 rounded-2xl font-bold text-lg shadow-xl"
      style={{ backgroundColor: accentColor, color: '#fff' }}
    >
      {title}
    </div>
    <svg width="2" height="30" className="shrink-0">
      <line x1="1" y1="0" x2="1" y2="30" stroke={accentColor} strokeWidth="2"/>
    </svg>
    <div className="flex gap-4">
      {children.map((child, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <svg width="2" height="20" className="shrink-0">
            <line x1="1" y1="0" x2="1" y2="20" stroke={accentColor} strokeWidth="2"/>
          </svg>
          <div 
            className="px-4 py-3 rounded-xl border-2 text-center text-sm font-medium"
            style={{ borderColor: accentColor, color: textColor }}
          >
            {child}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const MetricCard = ({ 
  value, 
  label, 
  trend,
  accentColor = '#3B82F6',
  textColor = '#1F2937'
}: { 
  value: string; 
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  accentColor?: string;
  textColor?: string;
}) => (
  <div 
    className="p-6 rounded-2xl border backdrop-blur-md text-center"
    style={{ borderColor: `${textColor}20`, backgroundColor: `${accentColor}10` }}
  >
    <div className="flex items-center justify-center gap-2 mb-2">
      <span className="text-4xl font-black" style={{ color: accentColor }}>{value}</span>
      {trend && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {trend === 'up' && <path d="M12 4l8 8H4l8-8z" fill="#22C55E"/>}
          {trend === 'down' && <path d="M12 20l8-8H4l8 8z" fill="#EF4444"/>}
        </svg>
      )}
    </div>
    <div className="text-sm font-medium opacity-80" style={{ color: textColor }}>{label}</div>
  </div>
);
