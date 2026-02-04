'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'requesta' | 'requesta-outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
    default: 'bg-requesta-primary text-white hover:bg-requesta-primary-light',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-requesta-primary text-requesta-primary hover:bg-requesta-background',
    secondary: 'bg-requesta-secondary text-white hover:bg-requesta-secondary/80',
    ghost: 'hover:bg-requesta-background hover:text-requesta-primary',
    link: 'text-requesta-primary underline-offset-4 hover:underline',
    requesta: 'bg-requesta-primary text-white hover:bg-requesta-primary-light',
    'requesta-outline': 'border border-requesta-primary text-requesta-primary hover:bg-requesta-background',
    'requesta-accent': 'bg-requesta-accent text-white hover:bg-requesta-accent-light',
    }

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }