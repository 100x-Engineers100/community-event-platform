import { Badge } from '@/components/ui/badge'
import { EventStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: EventStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    submitted: {
      label: 'Pending',
      className: 'bg-100x-accent-light text-100x-accent-primary border border-100x-accent-primary'
    },
    published: {
      label: 'Approved',
      className: 'bg-100x-accent-primary text-white border-0'
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-900 text-white border-0'
    },
    expired: {
      label: 'Expired',
      className: 'bg-100x-bg-tertiary text-100x-text-secondary border border-100x-border-default'
    },
    completed: {
      label: 'Completed',
      className: 'bg-blue-900 text-white border-0'
    }
  }

  const { label, className: statusClassName } = config[status]

  return (
    <Badge className={cn(statusClassName, 'font-medium', className)}>
      {label}
    </Badge>
  )
}
