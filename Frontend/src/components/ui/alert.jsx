import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-zinc-900 dark:[&>svg]:text-zinc-100',
  {
    variants: {
      variant: {
        default: 'bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100',
        destructive: 'border-zinc-200 text-red-500 dark:border-zinc-800 [&>svg]:text-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn('mb-1 text-sm font-semibold leading-none tracking-tight', className)} {...props} />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm text-zinc-500 [&_p]:leading-relaxed', className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
