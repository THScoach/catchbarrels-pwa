/**
 * BARRELS Brand Theme Configuration
 * 
 * Official colors sampled from brand assets:
 * - banner.png
 * - barrels-icon.png (e2010299-f42e-4ff1-a5d7-dc396249f057.png)
 * 
 * DO NOT modify these colors without updating the brand assets.
 */

export const barrelsTheme = {
  colors: {
    // Primary: Electric Gold (from bat and logo wordmark)
    gold: {
      DEFAULT: '#F5B942',
      light: '#FFD96F',
      dark: '#D89B2A',
      gradient: 'from-[#F5B942] to-[#FFD96F]',
    },
    
    // Secondary: Midnight Black (background)
    black: {
      DEFAULT: '#0D0D0D',
      light: '#1A1A1A',
      lighter: '#2A2A2A',
      gradient: 'from-[#1A1A1A] to-[#0D0D0D]',
    },
    
    // Accent: Electric Blue (swoosh)
    blue: {
      DEFAULT: '#3B9FE8',
      light: '#5AB3F0',
      dark: '#2680C7',
      gradient: 'from-[#3B9FE8] to-[#5AB3F0]',
    },
    
    // Neutral: White/Silver for text
    neutral: {
      white: '#FFFFFF',
      silver: '#E5E5E5',
      gray: '#A0A0A0',
      darkGray: '#6B6B6B',
    },
  },
  
  // Semantic color mappings
  semantic: {
    primary: '#F5B942', // Gold
    primaryHover: '#FFD96F',
    primaryActive: '#D89B2A',
    
    background: '#0D0D0D', // Black
    backgroundLight: '#1A1A1A',
    backgroundLighter: '#2A2A2A',
    
    accent: '#3B9FE8', // Blue
    accentHover: '#5AB3F0',
    
    text: '#FFFFFF',
    textSecondary: '#E5E5E5',
    textMuted: '#A0A0A0',
    
    border: '#2A2A2A',
    borderLight: '#3A3A3A',
  },
  
  // Gradient combinations
  gradients: {
    primary: 'bg-gradient-to-r from-[#F5B942] to-[#FFD96F]',
    primaryVertical: 'bg-gradient-to-b from-[#F5B942] to-[#D89B2A]',
    background: 'bg-gradient-to-r from-[#1A1A1A] to-[#0D0D0D]',
    accent: 'bg-gradient-to-r from-[#3B9FE8] to-[#5AB3F0]',
    hero: 'bg-gradient-to-br from-[#F5B942] via-[#3B9FE8] to-[#FFD96F]',
  },
} as const;

// Export individual color values for use in Tailwind config
export const barrelsColors = {
  'barrels-gold': barrelsTheme.colors.gold.DEFAULT,
  'barrels-gold-light': barrelsTheme.colors.gold.light,
  'barrels-gold-dark': barrelsTheme.colors.gold.dark,
  
  'barrels-black': barrelsTheme.colors.black.DEFAULT,
  'barrels-black-light': barrelsTheme.colors.black.light,
  'barrels-black-lighter': barrelsTheme.colors.black.lighter,
  
  'barrels-blue': barrelsTheme.colors.blue.DEFAULT,
  'barrels-blue-light': barrelsTheme.colors.blue.light,
  'barrels-blue-dark': barrelsTheme.colors.blue.dark,
  
  'barrels-neutral': barrelsTheme.colors.neutral.silver,
  'barrels-neutral-white': barrelsTheme.colors.neutral.white,
  'barrels-neutral-gray': barrelsTheme.colors.neutral.gray,
};
