/**
 * Bandhan AI Theme System
 * Premium Dark Mode UI Design Tokens
 */

// ──────────────────────────────────────────────────────────────────────
// Color Palette
// ──────────────────────────────────────────────────────────────────────
export const colors = {
  // Brand Primary
  primary: {
    50: '#e8eaf0',
    100: '#c5c9d8',
    200: '#9ea5be',
    300: '#7780a4',
    400: '#575f8f',
    500: '#373f7a',
    600: '#2b3166',
    700: '#1e2252',
    800: '#13163d',
    900: '#0a0e17',
    950: '#050710',
  },

  // Saffron (Secondary/Accent)
  saffron: {
    50: '#fff5e6',
    100: '#ffe5bf',
    200: '#ffd699',
    300: '#ffc266',
    400: '#ffad33',
    500: '#FF9933',
    600: '#e67a00',
    700: '#b35e00',
    800: '#804400',
    900: '#4d2900',
  },

  // Violet (Secondary/Accent)
  violet: {
    50: '#f3f2ff',
    100: '#e5e3ff',
    200: '#cdc9ff',
    300: '#b5b0ff',
    400: '#a29bfe',
    500: '#8f87fd',
    600: '#7b72fc',
    700: '#5e55e0',
    800: '#4239b3',
    900: '#281e86',
  },

  // Rose (Accent)
  rose: {
    400: '#fe9dc4',
    500: '#fd79a8',
    600: '#e05585',
  },

  // Gold (Premium Accent)
  gold: {
    400: '#fbd44f',
    500: '#f9ca24',
    600: '#d4a800',
  },

  // Semantic Colors
  success: {
    light: '#4ade80',
    DEFAULT: '#22c55e',
    dark: '#16a34a',
  },

  error: {
    light: '#f87171',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },

  warning: {
    light: '#fbbf24',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },

  info: {
    light: '#60a5fa',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },

  // Neutral Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Alpha/Transparent variants for glassmorphism
  alpha: {
    white: {
      4: 'rgba(255, 255, 255, 0.04)',
      6: 'rgba(255, 255, 255, 0.06)',
      8: 'rgba(255, 255, 255, 0.08)',
      10: 'rgba(255, 255, 255, 0.10)',
      15: 'rgba(255, 255, 255, 0.15)',
      20: 'rgba(255, 255, 255, 0.20)',
      30: 'rgba(255, 255, 255, 0.30)',
      50: 'rgba(255, 255, 255, 0.50)',
    },
    black: {
      20: 'rgba(0, 0, 0, 0.20)',
      40: 'rgba(0, 0, 0, 0.40)',
      60: 'rgba(0, 0, 0, 0.60)',
      80: 'rgba(0, 0, 0, 0.80)',
    },
  },
} as const;

// ──────────────────────────────────────────────────────────────────────
// Typography Scale
// ──────────────────────────────────────────────────────────────────────
export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    display: ['Clash Display', 'Playfair Display', 'Georgia', 'serif'],
    hindi: ['Noto Sans Devanagari', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
  },

  // Font Sizes (with line heights)
  fontSize: {
    '2xs': { size: '0.625rem', lineHeight: '0.875rem' }, // 10px
    xs: { size: '0.75rem', lineHeight: '1rem' }, // 12px
    sm: { size: '0.875rem', lineHeight: '1.25rem' }, // 14px
    base: { size: '1rem', lineHeight: '1.5rem' }, // 16px
    lg: { size: '1.125rem', lineHeight: '1.75rem' }, // 18px
    xl: { size: '1.25rem', lineHeight: '1.75rem' }, // 20px
    '2xl': { size: '1.5rem', lineHeight: '2rem' }, // 24px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' }, // 36px
    '5xl': { size: '3rem', lineHeight: '1.2' }, // 48px
    '6xl': { size: '3.75rem', lineHeight: '1.2' }, // 60px
    '7xl': { size: '4.5rem', lineHeight: '1.1' }, // 72px
    '8xl': { size: '6rem', lineHeight: '1' }, // 96px
    '9xl': { size: '8rem', lineHeight: '1' }, // 128px
  },

  // Font Weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    hindi: '0.02em',
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
    hindi: 1.8,
  },
} as const;

// ──────────────────────────────────────────────────────────────────────
// Spacing Scale (4px baseline)
// ──────────────────────────────────────────────────────────────────────
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
  112: '28rem', // 448px
  128: '32rem', // 512px
} as const;

// ──────────────────────────────────────────────────────────────────────
// Breakpoints (Mobile-First)
// ──────────────────────────────────────────────────────────────────────
export const breakpoints = {
  sm: { value: 640, unit: 'px' }, // Small devices (landscape phones)
  md: { value: 768, unit: 'px' }, // Medium devices (tablets)
  lg: { value: 1024, unit: 'px' }, // Large devices (desktops)
  xl: { value: 1280, unit: 'px' }, // Extra large devices (large desktops)
  '2xl': { value: 1536, unit: 'px' }, // 2X large devices (extra large desktops)
} as const;

// Media query strings for programmatic use
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm.value}${breakpoints.sm.unit})`,
  md: `@media (min-width: ${breakpoints.md.value}${breakpoints.md.unit})`,
  lg: `@media (min-width: ${breakpoints.lg.value}${breakpoints.lg.unit})`,
  xl: `@media (min-width: ${breakpoints.xl.value}${breakpoints.xl.unit})`,
  '2xl': `@media (min-width: ${breakpoints['2xl'].value}${breakpoints['2xl'].unit})`,

  // Max width queries
  maxSm: `@media (max-width: ${breakpoints.sm.value - 1}${breakpoints.sm.unit})`,
  maxMd: `@media (max-width: ${breakpoints.md.value - 1}${breakpoints.md.unit})`,
  maxLg: `@media (max-width: ${breakpoints.lg.value - 1}${breakpoints.lg.unit})`,
  maxXl: `@media (max-width: ${breakpoints.xl.value - 1}${breakpoints.xl.unit})`,

  // Between breakpoints
  smToMd: `@media (min-width: ${breakpoints.sm.value}${breakpoints.sm.unit}) and (max-width: ${breakpoints.md.value - 1}${breakpoints.md.unit})`,
  mdToLg: `@media (min-width: ${breakpoints.md.value}${breakpoints.md.unit}) and (max-width: ${breakpoints.lg.value - 1}${breakpoints.lg.unit})`,
  lgToXl: `@media (min-width: ${breakpoints.lg.value}${breakpoints.lg.unit}) and (max-width: ${breakpoints.xl.value - 1}${breakpoints.xl.unit})`,
} as const;

// ──────────────────────────────────────────────────────────────────────
// Border Radius
// ──────────────────────────────────────────────────────────────────────
export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  '4xl': '2rem',
  '5xl': '2.5rem',
  full: '9999px',
} as const;

// ──────────────────────────────────────────────────────────────────────
// Shadows
// ──────────────────────────────────────────────────────────────────────
export const shadows = {
  glass: '0 8px 32px 0 rgba(10, 14, 23, 0.37)',
  glassSm: '0 4px 16px 0 rgba(10, 14, 23, 0.25)',
  glassLg: '0 16px 48px 0 rgba(10, 14, 23, 0.50)',
  saffronGlow: '0 0 24px 4px rgba(255, 153, 51, 0.35)',
  violetGlow: '0 0 24px 4px rgba(162, 155, 254, 0.35)',
  roseGlow: '0 0 24px 4px rgba(253, 121, 168, 0.35)',
  card: '0 2px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
  cardHover: '0 8px 32px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.12)',

  // Standard Tailwind-style shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  none: 'none',
} as const;

// ──────────────────────────────────────────────────────────────────────
// Z-Index Scale
// ──────────────────────────────────────────────────────────────────────
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  60: '60',
  70: '70',
  80: '80',
  90: '90',
  100: '100',
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// ──────────────────────────────────────────────────────────────────────
// Transitions
// ──────────────────────────────────────────────────────────────────────
export const transitions = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounceIn: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smoothOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
} as const;

// ──────────────────────────────────────────────────────────────────────
// Animation Keyframes (for reference, actual keyframes in CSS)
// ──────────────────────────────────────────────────────────────────────
export const animations = {
  durations: {
    swipe: '400ms',
    float: '3000ms',
    pulseGlow: '2000ms',
    shimmer: '2500ms',
    slideUp: '400ms',
    slideDown: '400ms',
    fadeIn: '300ms',
    scaleIn: '300ms',
    heartbeat: '1200ms',
    typingDot: '1200ms',
  },
  timings: {
    swipe: 'ease-out',
    float: 'ease-in-out',
    pulseGlow: 'ease-in-out',
    shimmer: 'linear',
    slideUp: 'ease-out',
    slideDown: 'ease-out',
    fadeIn: 'ease-out',
    scaleIn: 'ease-out',
    heartbeat: 'ease-in-out',
    typingDot: 'ease-in-out',
  },
} as const;

// ──────────────────────────────────────────────────────────────────────
// Export Complete Theme Object
// ──────────────────────────────────────────────────────────────────────
export const theme = {
  colors,
  typography,
  spacing,
  breakpoints,
  mediaQueries,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  animations,
} as const;

// Type exports for TypeScript
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Breakpoints = typeof breakpoints;
