import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function BackButton({ to, onClick, label = 'Back', className }) {
  const navigate = useNavigate()

  const content = (
    <>
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      <span>{label}</span>
    </>
  )

  if (to) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-9 gap-1.5 px-2 text-sm font-medium text-zinc-500 transition-colors duration-150 hover:text-zinc-900 dark:hover:text-zinc-100',
          className
        )}
        asChild
      >
        <Link to={to}>{content}</Link>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'h-9 gap-1.5 px-2 text-sm font-medium text-zinc-500 transition-colors duration-150 hover:text-zinc-900 dark:hover:text-zinc-100',
        className
      )}
      onClick={onClick || (() => navigate(-1))}
    >
      {content}
    </Button>
  )
}
