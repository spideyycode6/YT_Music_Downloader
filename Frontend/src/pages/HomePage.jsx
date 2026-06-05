import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import UrlInputCard from '@/components/UrlInputCard'
import ProgressCard from '@/components/ProgressCard'
import ResultCard from '@/components/ResultCard'
import ErrorCard from '@/components/ErrorCard'
import { useAppSelector } from '@/store/store'
import { selectPhase } from '@/store/selectors'
import { useDownloadFlow } from '@/hooks/useDownloadFlow'

export default function HomePage() {
  const phase = useAppSelector(selectPhase)
  const { handleReset } = useDownloadFlow()

  const showUrlInputTop = ['idle', 'checking', 'queued', 'processing'].includes(phase)
  const showProgress = ['queued', 'processing'].includes(phase)
  const showResult = phase === 'completed'
  const showError = ['failed', 'expired'].includes(phase)
  const showBack = phase !== 'idle'

  const backLabel = ['checking', 'queued', 'processing'].includes(phase) ? 'Cancel' : 'Back'

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-start px-4 pt-24">
        <div className="w-full max-w-xl space-y-4">
          {showBack && (
            <BackButton onClick={handleReset} label={backLabel} className="-ml-2" />
          )}
          {showUrlInputTop && <UrlInputCard />}
          {showProgress && <ProgressCard />}
          {showResult && <ResultCard />}
          {showError && <ErrorCard />}
          {phase === 'failed' && <UrlInputCard />}
        </div>
      </main>
    </div>
  )
}
