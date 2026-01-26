import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning'
}

// alert.tsx - Update variant styles
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4',
        variant === 'destructive'
          ? 'border-red-200 bg-red-50 text-red-800'
          : variant === 'warning'
          ? 'border-requesta-accent-light bg-yellow-50 text-yellow-800'
          : 'border-requesta-primary/20 bg-requesta-background text-requesta-primary',
        className
      )}
      {...props}
    />
  )
)
Alert.displayName = 'Alert'

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription }