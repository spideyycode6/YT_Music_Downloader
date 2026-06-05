import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-900 shadow-none transition-all duration-150 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:ring-white',
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
