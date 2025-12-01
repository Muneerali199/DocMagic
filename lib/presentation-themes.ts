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
    type: 'colorful',
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
    type: 'colorful',
    colors: {
      background: '#111',
      foreground: '#FFF',
      accent: '#39FF14',
      muted: '#333',
      border: '#444',
      card: '#222',
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

  // Sanguine (Requested)
  {
    id: 'sanguine',
    name: 'Sanguine',
    type: 'colorful',
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

  // Others from list
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
  {
    id: 'nova',
    name: 'Nova',
    type: 'colorful',
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
  {
    id: 'canary',
    name: 'Canary',
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
  {
    id: 'aquamarine',
    name: 'Aquamarine',
    type: 'colorful',
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
  }
];

export const getThemeById = (id: string) => PRESENTATION_THEMES.find(t => t.id === id) || PRESENTATION_THEMES[0];
