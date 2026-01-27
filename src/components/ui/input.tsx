// components/ui/input.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  onIconClick?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, iconPosition = 'left', onIconClick, ...props }, ref) => {
    const hasIcon = !!Icon
    
    return (
      <div className="relative w-full">
        {hasIcon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {onIconClick ? (
              <button
                type="button"
                onClick={onIconClick}
                className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                <Icon className="h-4 w-4" />
              </button>
            ) : (
              <Icon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            hasIcon && iconPosition === 'left' && 'pl-10',
            hasIcon && iconPosition === 'right' && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {hasIcon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {onIconClick ? (
              <button
                type="button"
                onClick={onIconClick}
                className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                <Icon className="h-4 w-4" />
              </button>
            ) : (
              <Icon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }