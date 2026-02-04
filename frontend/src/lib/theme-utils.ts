export const theme = {
  colors: {
    primary: {
      DEFAULT: '#0B4F3F',
      light: '#145E4D',
      dark: '#08382B',
    },
    secondary: '#2E7D6B',
    background: '#E6F2EF',
    accent: {
      DEFAULT: '#F2A01F',
      light: '#F6B74A',
      dark: '#D68A0A',
    },
    text: {
      primary: '#1F2933',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    status: {
      success: {
        DEFAULT: '#10B981',
        light: '#D1FAE5',
        dark: '#059669',
      },
      warning: {
        DEFAULT: '#F59E0B',
        light: '#FEF3C7',
        dark: '#D97706',
      },
      error: {
        DEFAULT: '#EF4444',
        light: '#FEE2E2',
        dark: '#DC2626',
      },
      info: {
        DEFAULT: '#3B82F6',
        light: '#DBEAFE',
        dark: '#1D4ED8',
      },
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(11, 79, 63, 0.05)',
    md: '0 4px 6px -1px rgba(11, 79, 63, 0.1), 0 2px 4px -1px rgba(11, 79, 63, 0.06)',
    lg: '0 10px 15px -3px rgba(11, 79, 63, 0.1), 0 4px 6px -2px rgba(11, 79, 63, 0.05)',
    xl: '0 20px 25px -5px rgba(11, 79, 63, 0.1), 0 10px 10px -5px rgba(11, 79, 63, 0.04)',
    'requesta-lg': '0 10px 40px rgba(11, 79, 63, 0.15)',
  },
  
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
} as const

export type ThemeColors = typeof theme.colors
export type ThemeSpacing = typeof theme.spacing
export type ThemeShadows = typeof theme.shadows

// Helper functions
export function getColor(colorPath: string): string {
  const path = colorPath.split('.')
  let current: any = theme.colors
  
  for (const key of path) {
    if (current[key] === undefined) {
      console.warn(`Color ${colorPath} not found in theme`)
      return '#000000'
    }
    current = current[key]
  }
  
  return typeof current === 'string' ? current : current.DEFAULT || '#000000'
}

export function getStatusColor(status: string, type: 'bg' | 'text' | 'border' = 'bg') {
  const statusMap: Record<string, Record<string, string>> = {
    approved: {
      bg: theme.colors.status.success.light,
      text: theme.colors.status.success.dark,
      border: theme.colors.status.success.DEFAULT,
    },
    pending: {
      bg: theme.colors.status.warning.light,
      text: theme.colors.status.warning.dark,
      border: theme.colors.status.warning.DEFAULT,
    },
    rejected: {
      bg: theme.colors.status.error.light,
      text: theme.colors.status.error.dark,
      border: theme.colors.status.error.DEFAULT,
    },
    draft: {
      bg: theme.colors.neutral[100],
      text: theme.colors.neutral[600],
      border: theme.colors.neutral[300],
    },
    active: {
      bg: theme.colors.status.success.light,
      text: theme.colors.status.success.dark,
      border: theme.colors.status.success.DEFAULT,
    },
    inactive: {
      bg: theme.colors.neutral[100],
      text: theme.colors.neutral[600],
      border: theme.colors.neutral[300],
    },
  }
  
  return statusMap[status]?.[type] || theme.colors.neutral[300]
}