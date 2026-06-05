import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/store/store'
import { selectPhase, selectError } from '@/store/selectors'
import { useDownloadFlow } from '@/hooks/useDownloadFlow'

export default function ErrorCard() {
  const phase = useAppSelector(selectPhase)
  const error = useAppSelector(selectError)
  const { handleReset, handleRetry } = useDownloadFlow()

  const title = phase === 'expired' ? 'Link Expired' : 'Download Failed'

  return (
    <Card className="rounded-xl border border-zinc-200 p-6 shadow-none dark:border-zinc-800">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-red-500" strokeWidth={1.5} />
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="mt-0.5 text-sm text-zinc-500">{error?.message}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {error?.code === 'TOO_MANY_ACTIVE_JOBS' ? (
          <Button className="h-9" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
            Retry
          </Button>
        ) : (
          <Button variant="ghost" className="h-9" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            Try Again
          </Button>
        )}
      </div>
    </Card>
  )
}
