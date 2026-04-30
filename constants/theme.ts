import { MD3LightTheme } from 'react-native-paper';

export const COLORS = {
  // Brand Colors
  primary: '#FF6B00',
  primaryLight: '#FFF7ED',
  primaryDark: '#CC5500',
  
  // Secondary / Dark
  secondary: '#111827',
  secondaryLight: '#1F2937',
  
  // Semantic Colors
  success: '#10B981',
  successLight: '#ECFDF5',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  
  // Neutral Colors
  background: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  text: '#111827',
  icon: '#6B7280',
  white: '#FFFFFF',
};

export const Colors = {
  light: {
    ...COLORS,
    tint: COLORS.primary,
    tabIconDefault: '#ccc',
    tabIconSelected: COLORS.primary,
  },
  dark: {
    ...COLORS,
    background: '#000',
    surface: '#111',
    textPrimary: '#fff',
    tint: COLORS.primary,
    tabIconDefault: '#ccc',
    tabIconSelected: COLORS.primary,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    error: COLORS.error,
    surface: COLORS.background,
    background: COLORS.surface,
  },
};
