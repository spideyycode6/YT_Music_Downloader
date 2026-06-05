import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAppSelector } from '@/store/store'
import { selectPhase, selectProgress } from '@/store/selectors'

function getStatusLabel(phase, progress) {
  if (phase === 'queued') return 'Waiting in queue'
  if (phase === 'processing') {
    if (progress < 30) return 'Fetching audio'
    if (progress <= 60) return 'Transcoding to MP3'
    return 'Uploading file'
  }
  return 'Processing'
}

export default function ProgressCard() {
  const phase = useAppSelector(selectPhase)
  const progress = useAppSelector(selectProgress)

  const dotColor = phase === 'queued' ? 'bg-amber-400' : 'bg-blue-500'
  const displayProgress = progress || (phase === 'queued' ? 5 : 15)

  return (
    <Card className="rounded-xl border border-zinc-200 p-6 shadow-none dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 animate-pulse rounded-full ${dotColor}`} />
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {getStatusLabel(phase, displayProgress)}
        </span>
      </div>

      <Progress
        value={displayProgress}
        className="mb-2 mt-4 [&>div]:bg-zinc-900 dark:[&>div]:bg-white"
      />

      <div className="flex justify-between text-xs text-zinc-400">
        <span>Processing your track</span>
        <span>{displayProgress}%</span>
      </div>

      <p className="mt-3 text-xs text-zinc-400">Usually takes 10–30 seconds</p>
    </Card>
  )
}
