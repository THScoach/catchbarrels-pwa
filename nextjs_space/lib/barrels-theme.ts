/**
 * BARRELS Brand Theme Configuration
 * 
 * Official colors sampled from brand assets:
 * - final.png (primary banner)
 * - barrels-icon.png (e2010299-f42e-4ff1-a5d7-dc396249f057.png)
 * 
 * DO NOT modify these colors without updating the brand assets.
 */

export const barrelsTheme = {
  colors: {
    // Primary: Electric Gold (from BARRELS wordmark and bat in final.png)
    gold: {
      DEFAULT: '#E8B14E',  // Sampled from "BARRELS" text in final.png
      light: '#F5C56B',    // Lighter shade for highlights
      dark: '#C89A3A',     // Darker shade for active states
      gradient: 'from-[#E8B14E] to-[#F5C56B]',
    },
    
    // Secondary: Pure Black (background from final.png)
    black: {
      DEFAULT: '#000000',  // Pure black from final.png background
      light: '#1A1A1A',    // Slightly lighter for cards
      lighter: '#2A2A2A',  // Even lighter for borders
      gradient: 'from-[#1A1A1A] to-[#000000]',
    },
    
    // Accent: Electric Blue (swoosh from final.png)
    blue: {
      DEFAULT: '#3B9FE8',  // Sampled from blue swoosh in icon
      light: '#5AB3F0',    // Lighter for hover states
      dark: '#2680C7',     // Darker for active states
      gradient: 'from-[#3B9FE8] to-[#5AB3F0]',
    },
    
    // Neutral: White/Silver for text
    neutral: {
      white: '#FFFFFF',    // Pure white for primary text
      silver: '#E5E5E5',   // Silver for secondary text
      gray: '#A0A0A0',     // Gray for muted text
      darkGray: '#6B6B6B', // Dark gray for subtle text
    },
  },
  
  // Semantic color mappings
  semantic: {
    primary: '#E8B14E', // Gold
    primaryHover: '#F5C56B',
    primaryActive: '#C89A3A',
    
    background: '#000000', // Pure Black
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
    primary: 'bg-gradient-to-r from-[#E8B14E] to-[#F5C56B]',
    primaryVertical: 'bg-gradient-to-b from-[#E8B14E] to-[#C89A3A]',
    background: 'bg-gradient-to-r from-[#1A1A1A] to-[#000000]',
    accent: 'bg-gradient-to-r from-[#3B9FE8] to-[#5AB3F0]',
    hero: 'bg-gradient-to-br from-[#E8B14E] via-[#3B9FE8] to-[#F5C56B]',
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
