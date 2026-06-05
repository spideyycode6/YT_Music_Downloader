import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-900',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
        secondary: 'border-transparent bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
        outline: 'border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
