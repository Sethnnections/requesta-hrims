import * as React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Clock, XCircle, AlertCircle, PauseCircle } from 'lucide-react'

export type StatusType = 
  | 'approved' 
  | 'pending' 
  | 'rejected' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled'
  | 'draft'
  | 'submitted'

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200',
    iconClassName: 'text-green-600',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconClassName: 'text-yellow-600',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200',
    iconClassName: 'text-red-600',
  },
  in_progress: {
    label: 'In Progress',
    icon: AlertCircle,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    iconClassName: 'text-blue-600',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-requesta-background text-requesta-primary border-requesta-primary/30',
    iconClassName: 'text-requesta-primary',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    iconClassName: 'text-gray-600',
  },
  draft: {
    label: 'Draft',
    icon: PauseCircle,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    iconClassName: 'text-gray-600',
  },
  submitted: {
    label: 'Submitted',
    icon: Clock,
    className: 'bg-requesta-accent/10 text-requesta-accent border-requesta-accent/20',
    iconClassName: 'text-requesta-accent',
  },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

export function StatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md', 
  className,
  ...props 
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showIcon && <Icon className={cn('mr-1.5 h-3.5 w-3.5', config.iconClassName)} />}
      {config.label}
    </div>
  )
}

