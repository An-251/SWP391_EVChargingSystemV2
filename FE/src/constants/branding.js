/**
 * Brand Identity Constants
 * Centralized branding configuration for consistency across the application
 */

import { Zap } from 'lucide-react';

// Application Names
export const APP_NAME = 'EV Charging System';
export const APP_SHORT_NAME = 'EV Charge';
export const APP_TAGLINE = 'Powering Your Journey';

// Brand Colors (Tailwind CSS classes)
export const BRAND_COLORS = {
  // Primary brand colors
  primary: {
    main: 'green-500',
    light: 'green-400',
    dark: 'green-600',
    gradient: 'from-green-500 to-emerald-600',
  },
  
  // Secondary colors
  secondary: {
    main: 'blue-600',
    light: 'blue-500',
    dark: 'blue-700',
    gradient: 'from-blue-600 to-blue-800',
  },
  
  // Accent colors
  accent: {
    yellow: 'yellow-400',
    orange: 'orange-500',
    purple: 'purple-500',
  },
  
  // Role-specific colors
  roles: {
    driver: 'green-500',
    employee: 'blue-600',
    admin: 'green-500',
  },
};

// Logo Component Reference
export const BRAND_ICON = Zap;

// Icon sizes
export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Logo configurations for different layouts
export const LOGO_CONFIG = {
  driver: {
    bgGradient: 'from-green-500 to-emerald-600',
    iconColor: 'text-white',
    iconSize: ICON_SIZES.lg,
    textColor: 'text-gray-900',
  },
  employee: {
    bgGradient: 'from-green-500 to-emerald-600',
    iconColor: 'text-white',
    iconSize: ICON_SIZES.lg,
    textColor: 'text-white',
    sidebarBg: 'from-slate-800 to-slate-900',
  },
  admin: {
    bgColor: 'bg-green-500',
    iconColor: 'text-white',
    iconSize: ICON_SIZES.sm,
    textColor: 'text-white',
  },
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'system-ui, -apple-system, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
  },
  sizes: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  },
};

// Role-specific portal titles
export const PORTAL_TITLES = {
  driver: 'Driver Portal',
  employee: 'Employee Portal',
  admin: 'Admin Dashboard',
};

export default {
  APP_NAME,
  APP_SHORT_NAME,
  APP_TAGLINE,
  BRAND_COLORS,
  BRAND_ICON,
  ICON_SIZES,
  LOGO_CONFIG,
  TYPOGRAPHY,
  PORTAL_TITLES,
};
