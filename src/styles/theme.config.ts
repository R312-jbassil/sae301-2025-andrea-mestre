/**
 * Configuration du thème - Variables synchronisées avec global.css
 * Utilisé pour l'accès programmatique aux valeurs du thème
 */

export const theme = {
  colors: {
    primary: {
      DEFAULT: '#2563eb',
      dark: '#1e40af',
      light: '#60a5fa',
    },
    secondary: {
      DEFAULT: '#7c3aed',
      dark: '#5b21b6',
      light: '#a78bfa',
    },
    accent: {
      DEFAULT: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24',
    },
    frame: {
      black: '#1f2937',
      tortoise: '#92400e',
      blue: '#1e40af',
      red: '#dc2626',
      gold: '#ca8a04',
      silver: '#71717a',
      transparent: '#f3f4f6',
    },
    lens: {
      clear: 'rgba(255, 255, 255, 0.1)',
      sunglasses: 'rgba(0, 0, 0, 0.6)',
      blueLight: 'rgba(255, 200, 87, 0.15)',
      transition: 'rgba(128, 128, 128, 0.3)',
    },
  },
  
  // Typographie - basée sur votre Figma
  typography: {
    fonts: {
      title: "'Courier Prime', monospace",
      subtitle: "'Courier Prime', monospace",
      body: "'Inter', ui-sans-serif, system-ui, sans-serif",
      btn: "'Inter', ui-sans-serif, system-ui, sans-serif",
    },
    title1: {
      fontSize: '3rem', // 48px
      fontWeight: 400,
      letterSpacing: '-0.05em', // -5%
      lineHeight: 1.2, // 36px
      fontFamily: "'Courier Prime', monospace",
    },
    subtitle: {
      fontSize: '1.0625rem', // 17px
      fontWeight: 400,
      letterSpacing: '0.15em', // 15%
      lineHeight: 1.41, // 24px
      fontFamily: "'Courier Prime', monospace",
      textTransform: 'uppercase' as const,
    },
    btn: {
      fontSize: '0.8125rem', // 13px
      fontWeight: 400,
      letterSpacing: '-0.5px',
      lineHeight: 1.85, // 24px
      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    },
  },
  
  spacing: {
    header: '4rem',
    section: '6rem',
    card: '1.5rem',
  },
  
  radius: {
    small: '0.375rem',
    medium: '0.5rem',
    large: '0.75rem',
    xl: '1rem',
  },
  
  transition: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Types pour TypeScript
export type ThemeColors = typeof theme.colors;
export type FrameColor = keyof typeof theme.colors.frame;
export type LensType = keyof typeof theme.colors.lens;
export type TypographyStyle = keyof typeof theme.typography;

// Helpers pour accéder aux couleurs
export const getFrameColor = (colorName: FrameColor): string => {
  return theme.colors.frame[colorName];
};

export const getLensColor = (lensType: LensType): string => {
  return theme.colors.lens[lensType];
};

// Helper pour appliquer les styles typographiques
export const getTypographyStyle = (styleName: 'title1' | 'subtitle' | 'btn') => {
  return theme.typography[styleName];
};

export default theme;
