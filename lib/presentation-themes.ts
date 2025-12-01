export interface PresentationTheme {
  id: string;
  name: string;
  type: 'dark' | 'light' | 'colorful' | 'professional';
  colors: {
    background: string;
    foreground: string;
    accent: string;
    muted: string;
    border: string;
    card: string;
    gradient: string;
  };
  font: string;
  previewImage?: string;
}

export const PRESENTATION_THEMES: PresentationTheme[] = [
  // Popular / Featured
  {
    id: 'peach',
    name: 'Peach',
    type: 'colorful',
    colors: {
      background: '#FFF5F0',
      foreground: '#4A2B20',
      accent: '#FF8FAB',
      muted: '#E8D4CD',
      border: '#FFD1C1',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-orange-200 to-pink-300'
    },
    font: 'Inter'
  },
  {
    id: 'spectrum',
    name: 'Spectrum',
    type: 'dark',
    colors: {
      background: '#0F172A',
      foreground: '#F8FAFC',
      accent: '#818CF8',
      muted: '#334155',
      border: '#1E293B',
      card: '#1E293B',
      gradient: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
    },
    font: 'Outfit'
  },
  {
    id: 'fluo',
    name: 'Fluo',
    type: 'dark',
    colors: {
      background: '#111111',
      foreground: '#FFFFFF',
      accent: '#39FF14',
      muted: '#333333',
      border: '#444444',
      card: '#222222',
      gradient: 'bg-gradient-to-br from-green-400 to-blue-500'
    },
    font: 'Space Grotesk'
  },
  {
    id: 'howlite',
    name: 'Howlite',
    type: 'light',
    colors: {
      background: '#F9FAFB',
      foreground: '#111827',
      accent: '#0EA5E9',
      muted: '#E5E7EB',
      border: '#D1D5DB',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-gray-100 to-gray-200'
    },
    font: 'Inter'
  },
  {
    id: 'alien',
    name: 'Alien',
    type: 'dark',
    colors: {
      background: '#050505',
      foreground: '#D4D4D4',
      accent: '#10B981',
      muted: '#262626',
      border: '#404040',
      card: '#171717',
      gradient: 'bg-gradient-to-br from-green-900 to-black'
    },
    font: 'Space Mono'
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    type: 'colorful',
    colors: {
      background: '#7C2D12',
      foreground: '#FEF3C7',
      accent: '#F59E0B',
      muted: '#9A3412',
      border: '#B45309',
      card: '#431407',
      gradient: 'bg-gradient-to-br from-orange-700 to-red-800'
    },
    font: 'Playfair Display'
  },
  // Sanguine
  {
    id: 'sanguine',
    name: 'Sanguine',
    type: 'dark',
    colors: {
      background: '#2A0A0A',
      foreground: '#FFE4E1',
      accent: '#FF4500',
      muted: '#5C2828',
      border: '#8B0000',
      card: '#3E1212',
      gradient: 'bg-gradient-to-br from-red-900 to-orange-900'
    },
    font: 'Merriweather'
  },
  // Pearl
  {
    id: 'pearl',
    name: 'Pearl',
    type: 'light',
    colors: {
      background: '#FDFCF8',
      foreground: '#44403C',
      accent: '#D6D3D1',
      muted: '#F5F5F4',
      border: '#E7E5E4',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-stone-100 to-stone-200'
    },
    font: 'Lora'
  },
  // Vortex
  {
    id: 'vortex',
    name: 'Vortex',
    type: 'dark',
    colors: {
      background: '#020617',
      foreground: '#E2E8F0',
      accent: '#6366F1',
      muted: '#1E293B',
      border: '#334155',
      card: '#0F172A',
      gradient: 'bg-gradient-to-br from-slate-900 to-indigo-950'
    },
    font: 'Inter'
  },
  // Nova
  {
    id: 'nova',
    name: 'Nova',
    type: 'dark',
    colors: {
      background: '#2E1065',
      foreground: '#E9D5FF',
      accent: '#F472B6',
      muted: '#4C1D95',
      border: '#5B21B6',
      card: '#3B0764',
      gradient: 'bg-gradient-to-br from-purple-900 to-pink-900'
    },
    font: 'Outfit'
  },
  // Marine
  {
    id: 'marine',
    name: 'Marine',
    type: 'professional',
    colors: {
      background: '#0C4A6E',
      foreground: '#F0F9FF',
      accent: '#38BDF8',
      muted: '#075985',
      border: '#0369A1',
      card: '#082F49',
      gradient: 'bg-gradient-to-br from-sky-900 to-blue-900'
    },
    font: 'Roboto'
  },
  // Canary / Bee Happy
  {
    id: 'bee-happy',
    name: 'Bee Happy',
    type: 'light',
    colors: {
      background: '#FEFCE8',
      foreground: '#422006',
      accent: '#EAB308',
      muted: '#FEF08A',
      border: '#FDE047',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-yellow-100 to-yellow-200'
    },
    font: 'Inter'
  },
  // Aquamarine / Serene
  {
    id: 'serene',
    name: 'Serene',
    type: 'light',
    colors: {
      background: '#ECFEFF',
      foreground: '#164E63',
      accent: '#06B6D4',
      muted: '#CFFAFE',
      border: '#A5F3FC',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-cyan-100 to-teal-100'
    },
    font: 'Poppins'
  },
  // Night Sky / Onyx
  {
    id: 'onyx',
    name: 'Onyx',
    type: 'dark',
    colors: {
      background: '#0A0A0A',
      foreground: '#FAFAFA',
      accent: '#A855F7',
      muted: '#262626',
      border: '#404040',
      card: '#171717',
      gradient: 'bg-gradient-to-br from-neutral-900 to-black'
    },
    font: 'Inter'
  },
  // Coral Glow
  {
    id: 'coral-glow',
    name: 'Coral Glow',
    type: 'colorful',
    colors: {
      background: '#FFF1F2',
      foreground: '#4C0519',
      accent: '#FB7185',
      muted: '#FFE4E6',
      border: '#FECDD3',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-rose-100 to-pink-200'
    },
    font: 'Inter'
  },
  // Mercury
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'light',
    colors: {
      background: '#F4F4F5',
      foreground: '#18181B',
      accent: '#71717A',
      muted: '#E4E4E7',
      border: '#D4D4D8',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-zinc-100 to-zinc-200'
    },
    font: 'Inter'
  },
  // Twilight
  {
    id: 'twilight',
    name: 'Twilight',
    type: 'dark',
    colors: {
      background: '#1E1B4B',
      foreground: '#E0E7FF',
      accent: '#A5B4FC',
      muted: '#312E81',
      border: '#3730A3',
      card: '#1E1B4B',
      gradient: 'bg-gradient-to-br from-indigo-950 to-purple-950'
    },
    font: 'Inter'
  },
  // Stardust
  {
    id: 'stardust',
    name: 'Stardust',
    type: 'dark',
    colors: {
      background: '#18181B',
      foreground: '#FAFAFA',
      accent: '#F472B6',
      muted: '#3F3F46',
      border: '#52525B',
      card: '#27272A',
      gradient: 'bg-gradient-to-br from-zinc-900 via-pink-950 to-zinc-900'
    },
    font: 'Inter'
  },
  // Seafoam
  {
    id: 'seafoam',
    name: 'Seafoam',
    type: 'light',
    colors: {
      background: '#F0FDF4',
      foreground: '#14532D',
      accent: '#22C55E',
      muted: '#DCFCE7',
      border: '#BBF7D0',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-green-100 to-emerald-100'
    },
    font: 'Inter'
  },
  // Nebulae
  {
    id: 'nebulae',
    name: 'Nebulae',
    type: 'dark',
    colors: {
      background: '#0C0A1D',
      foreground: '#E9D5FF',
      accent: '#C084FC',
      muted: '#2E1065',
      border: '#581C87',
      card: '#1A0933',
      gradient: 'bg-gradient-to-br from-purple-950 to-fuchsia-950'
    },
    font: 'Inter'
  },
  // Creme
  {
    id: 'creme',
    name: 'Creme',
    type: 'light',
    colors: {
      background: '#FFFBEB',
      foreground: '#451A03',
      accent: '#D97706',
      muted: '#FEF3C7',
      border: '#FDE68A',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-amber-50 to-yellow-100'
    },
    font: 'Georgia'
  },
  // Lavender
  {
    id: 'lavender',
    name: 'Lavender',
    type: 'light',
    colors: {
      background: '#FAF5FF',
      foreground: '#3B0764',
      accent: '#A855F7',
      muted: '#F3E8FF',
      border: '#E9D5FF',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-purple-100 to-violet-100'
    },
    font: 'Inter'
  },
  // Indigo
  {
    id: 'indigo',
    name: 'Indigo',
    type: 'professional',
    colors: {
      background: '#EEF2FF',
      foreground: '#1E1B4B',
      accent: '#4F46E5',
      muted: '#E0E7FF',
      border: '#C7D2FE',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-indigo-100 to-blue-100'
    },
    font: 'Inter'
  },
  // Blueberry
  {
    id: 'blueberry',
    name: 'Blueberry',
    type: 'dark',
    colors: {
      background: '#1E3A8A',
      foreground: '#DBEAFE',
      accent: '#60A5FA',
      muted: '#1E40AF',
      border: '#2563EB',
      card: '#172554',
      gradient: 'bg-gradient-to-br from-blue-900 to-blue-800'
    },
    font: 'Inter'
  },
  // Atmosphere
  {
    id: 'atmosphere',
    name: 'Atmosphere',
    type: 'light',
    colors: {
      background: '#F0F9FF',
      foreground: '#0C4A6E',
      accent: '#0EA5E9',
      muted: '#E0F2FE',
      border: '#BAE6FD',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-sky-100 to-blue-100'
    },
    font: 'Inter'
  },
  // Malibu
  {
    id: 'malibu',
    name: 'Malibu',
    type: 'colorful',
    colors: {
      background: '#E0F2FE',
      foreground: '#0C4A6E',
      accent: '#38BDF8',
      muted: '#BAE6FD',
      border: '#7DD3FC',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-sky-200 to-cyan-200'
    },
    font: 'Inter'
  },
  // Chimney Smoke
  {
    id: 'chimney',
    name: 'Chimney',
    type: 'professional',
    colors: {
      background: '#F5F5F4',
      foreground: '#292524',
      accent: '#78716C',
      muted: '#E7E5E4',
      border: '#D6D3D1',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-stone-200 to-stone-300'
    },
    font: 'Inter'
  },
  // Coal
  {
    id: 'coal',
    name: 'Coal',
    type: 'dark',
    colors: {
      background: '#171717',
      foreground: '#F5F5F5',
      accent: '#737373',
      muted: '#262626',
      border: '#404040',
      card: '#1F1F1F',
      gradient: 'bg-gradient-to-br from-neutral-800 to-neutral-900'
    },
    font: 'Inter'
  },
  // Sage
  {
    id: 'sage',
    name: 'Sage',
    type: 'light',
    colors: {
      background: '#F1F5F3',
      foreground: '#1F3D2E',
      accent: '#4D7C5F',
      muted: '#D8E4DD',
      border: '#B8CFBF',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-green-100 to-emerald-50'
    },
    font: 'Inter'
  },
  // Oasis
  {
    id: 'oasis',
    name: 'Oasis',
    type: 'colorful',
    colors: {
      background: '#CFFAFE',
      foreground: '#083344',
      accent: '#14B8A6',
      muted: '#99F6E4',
      border: '#5EEAD4',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-cyan-200 to-teal-200'
    },
    font: 'Inter'
  },
  // Flamingo
  {
    id: 'flamingo',
    name: 'Flamingo',
    type: 'colorful',
    colors: {
      background: '#FDF2F8',
      foreground: '#831843',
      accent: '#EC4899',
      muted: '#FCE7F3',
      border: '#FBCFE8',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-pink-100 to-rose-100'
    },
    font: 'Inter'
  },
  // Electric
  {
    id: 'electric',
    name: 'Electric',
    type: 'dark',
    colors: {
      background: '#0F172A',
      foreground: '#F8FAFC',
      accent: '#22D3EE',
      muted: '#1E293B',
      border: '#334155',
      card: '#1E293B',
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600'
    },
    font: 'Inter'
  },
  // Aurora
  {
    id: 'aurora',
    name: 'Aurora',
    type: 'dark',
    colors: {
      background: '#0F172A',
      foreground: '#F8FAFC',
      accent: '#10B981',
      muted: '#1E293B',
      border: '#334155',
      card: '#1E293B',
      gradient: 'bg-gradient-to-br from-emerald-400 via-cyan-500 to-purple-600'
    },
    font: 'Inter'
  },
  // Bubble Gum
  {
    id: 'bubble-gum',
    name: 'Bubble Gum',
    type: 'colorful',
    colors: {
      background: '#FDF4FF',
      foreground: '#701A75',
      accent: '#E879F9',
      muted: '#FAE8FF',
      border: '#F5D0FE',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-fuchsia-100 to-pink-100'
    },
    font: 'Inter'
  },
  // Pistachio
  {
    id: 'pistachio',
    name: 'Pistachio',
    type: 'light',
    colors: {
      background: '#ECFCCB',
      foreground: '#1A2E05',
      accent: '#84CC16',
      muted: '#D9F99D',
      border: '#BEF264',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-lime-100 to-green-100'
    },
    font: 'Inter'
  },
  // Piano / Basic Dark
  {
    id: 'piano',
    name: 'Piano',
    type: 'dark',
    colors: {
      background: '#000000',
      foreground: '#FFFFFF',
      accent: '#FFFFFF',
      muted: '#1A1A1A',
      border: '#333333',
      card: '#0D0D0D',
      gradient: 'bg-gradient-to-br from-black to-zinc-900'
    },
    font: 'Inter'
  },
  // Chocolate
  {
    id: 'chocolate',
    name: 'Chocolate',
    type: 'dark',
    colors: {
      background: '#1C1917',
      foreground: '#FAFAF9',
      accent: '#A16207',
      muted: '#292524',
      border: '#44403C',
      card: '#292524',
      gradient: 'bg-gradient-to-br from-stone-900 to-amber-950'
    },
    font: 'Inter'
  },
  // Wine
  {
    id: 'wine',
    name: 'Wine',
    type: 'dark',
    colors: {
      background: '#2D0A1B',
      foreground: '#FFF1F2',
      accent: '#BE123C',
      muted: '#4C0519',
      border: '#881337',
      card: '#3D0D24',
      gradient: 'bg-gradient-to-br from-rose-950 to-pink-950'
    },
    font: 'Inter'
  },
  // Mocha
  {
    id: 'mocha',
    name: 'Mocha',
    type: 'dark',
    colors: {
      background: '#1C1917',
      foreground: '#F5F5F4',
      accent: '#D4A574',
      muted: '#292524',
      border: '#44403C',
      card: '#292524',
      gradient: 'bg-gradient-to-br from-stone-800 to-orange-950'
    },
    font: 'Inter'
  },
  // Vanilla
  {
    id: 'vanilla',
    name: 'Vanilla',
    type: 'light',
    colors: {
      background: '#FFFBEB',
      foreground: '#78350F',
      accent: '#FBBF24',
      muted: '#FEF3C7',
      border: '#FDE68A',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-amber-50 to-orange-50'
    },
    font: 'Inter'
  },
  // Cornflower
  {
    id: 'cornflower',
    name: 'Cornflower',
    type: 'light',
    colors: {
      background: '#EFF6FF',
      foreground: '#1E3A8A',
      accent: '#3B82F6',
      muted: '#DBEAFE',
      border: '#BFDBFE',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-blue-100 to-indigo-100'
    },
    font: 'Inter'
  },
  // Breeze
  {
    id: 'breeze',
    name: 'Breeze',
    type: 'light',
    colors: {
      background: '#F0FDFA',
      foreground: '#134E4A',
      accent: '#14B8A6',
      muted: '#CCFBF1',
      border: '#99F6E4',
      card: '#FFFFFF',
      gradient: 'bg-gradient-to-br from-teal-50 to-cyan-50'
    },
    font: 'Inter'
  },
  // Velvet Tides
  {
    id: 'velvet-tides',
    name: 'Velvet Tides',
    type: 'dark',
    colors: {
      background: '#0F172A',
      foreground: '#F1F5F9',
      accent: '#7C3AED',
      muted: '#1E293B',
      border: '#334155',
      card: '#1E293B',
      gradient: 'bg-gradient-to-br from-violet-900 to-purple-950'
    },
    font: 'Inter'
  },
  // Borealis
  {
    id: 'borealis',
    name: 'Borealis',
    type: 'dark',
    colors: {
      background: '#020617',
      foreground: '#F8FAFC',
      accent: '#34D399',
      muted: '#0F172A',
      border: '#1E293B',
      card: '#0F172A',
      gradient: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
    },
    font: 'Inter'
  },
  // Basic Light
  {
    id: 'basic-light',
    name: 'Basic Light',
    type: 'light',
    colors: {
      background: '#FFFFFF',
      foreground: '#000000',
      accent: '#3B82F6',
      muted: '#F3F4F6',
      border: '#E5E7EB',
      card: '#FFFFFF',
      gradient: 'bg-white'
    },
    font: 'Inter'
  },
  // Basic Dark
  {
    id: 'basic-dark',
    name: 'Basic Dark',
    type: 'dark',
    colors: {
      background: '#000000',
      foreground: '#FFFFFF',
      accent: '#3B82F6',
      muted: '#1F1F1F',
      border: '#333333',
      card: '#111111',
      gradient: 'bg-black'
    },
    font: 'Inter'
  }
];

export const getThemeById = (id: string) => PRESENTATION_THEMES.find(t => t.id === id) || PRESENTATION_THEMES[0];
