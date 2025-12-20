/**
 * Theme Configuration Types and Utilities
 */

export interface ThemeColors {
  primary: string;        // Main brand color (default: #52EDC7)
  primaryDark: string;    // Hover/emphasis color (default: #1BA098)
  accent: string;         // Secondary accent
  background: string;     // Page background
  surface: string;        // Card/component background
  border: string;         // Border color
  text: string;           // Primary text
  textMuted: string;      // Secondary text
  success: string;        // Green
  warning: string;        // Yellow/amber
  error: string;          // Red
}

export interface ThemeSettings {
  colors: ThemeColors;
  fonts: {
    heading: string;      // e.g., "Inter"
    body: string;         // e.g., "Inter"
  };
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  mode: 'light' | 'dark' | 'system';
}

export const defaultTheme: ThemeSettings = {
  colors: {
    primary: '#52EDC7',
    primaryDark: '#1BA098',
    accent: '#3B82F6',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    text: '#111827',
    textMuted: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  borderRadius: 'lg',
  mode: 'light',
};

export const borderRadiusValues: Record<ThemeSettings['borderRadius'], string> = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
};

/**
 * Merge user theme with defaults
 */
export function mergeTheme(userTheme: Partial<ThemeSettings> | null): ThemeSettings {
  if (!userTheme) return defaultTheme;

  return {
    colors: {
      ...defaultTheme.colors,
      ...userTheme.colors,
    },
    fonts: {
      ...defaultTheme.fonts,
      ...userTheme.fonts,
    },
    borderRadius: userTheme.borderRadius || defaultTheme.borderRadius,
    mode: userTheme.mode || defaultTheme.mode,
  };
}

/**
 * Generate CSS variables from theme
 */
export function generateCSSVariables(theme: ThemeSettings): Record<string, string> {
  return {
    '--color-primary': theme.colors.primary,
    '--color-primary-dark': theme.colors.primaryDark,
    '--color-accent': theme.colors.accent,
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-border': theme.colors.border,
    '--color-text': theme.colors.text,
    '--color-text-muted': theme.colors.textMuted,
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--font-heading': theme.fonts.heading,
    '--font-body': theme.fonts.body,
    '--border-radius': borderRadiusValues[theme.borderRadius],
  };
}

/**
 * Available font options
 */
export const availableFonts = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Nunito', label: 'Nunito' },
];

/**
 * Border radius options
 */
export const borderRadiusOptions = [
  { value: 'none', label: 'None (Sharp)' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];
