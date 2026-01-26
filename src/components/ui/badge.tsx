import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'requesta'
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-requesta-primary text-white hover:bg-requesta-primary-light',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'bg-red-100 text-red-800 hover:bg-red-200',
    outline: 'border border-requesta-primary text-requesta-primary',
    requesta: 'bg-requesta-accent text-white hover:bg-requesta-accent-light',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}