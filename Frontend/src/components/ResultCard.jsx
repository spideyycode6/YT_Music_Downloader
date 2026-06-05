import { useState } from 'react'
import { Download, Clock, RotateCcw, Music2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useDownloadFlow } from '@/hooks/useDownloadFlow'
import { useCountdown } from '@/hooks/useCountdown'
import { safeImageUrl } from '@/utils/security'
import { formatDuration } from '@/utils/formatters'

export default function ResultCard() {
  const { result, handleDownloadClick, handleReset } = useDownloadFlow()
  const [imgFailed, setImgFailed] = useState(false)

  const initialSeconds = result?.secondsRemaining ?? 0
  const { formatted: countdown, seconds: countdownSeconds } = useCountdown(initialSeconds, true)
  const isExpired = countdown === '00:00'

  const thumbnailUrl = safeImageUrl(result?.thumbnail)
  const showFallback = !thumbnailUrl || imgFailed

  const countdownColor = (() => {
    if (isExpired || countdownSeconds <= 0) return 'text-red-500'
    if (countdownSeconds < 60) return 'text-red-500'
    if (countdownSeconds <= 300) return 'text-amber-500'
    return 'text-zinc-900 dark:text-zinc-100'
  })()

  return (
    <Card className="rounded-xl border border-zinc-200 p-6 shadow-none dark:border-zinc-800">
      <div className="flex gap-4">
        {showFallback ? (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Music2 className="h-6 w-6 text-zinc-400" strokeWidth={1.5} />
          </div>
        ) : (
          <img
            src={thumbnailUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
            onError={() => setImgFailed(true)}
          />
        )}

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
            {result?.title || 'Downloaded track'}
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            {formatDuration(result?.duration)}
          </p>
          <span className="mt-1 inline-block text-xs text-zinc-400">
            MP3 · audio/mpeg
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>Link expires in</span>
        </div>
        <span className={`font-mono text-xs font-medium ${countdownColor}`}>
          {isExpired ? 'Link expired' : countdown}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <Button
          className="h-9 w-full"
          onClick={handleDownloadClick}
          disabled={isExpired}
        >
          <Download className="h-4 w-4" strokeWidth={1.5} />
          Download MP3
        </Button>

        <Button variant="ghost" className="h-9 w-full" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
          Download another
        </Button>
      </div>
    </Card>
  )
}
