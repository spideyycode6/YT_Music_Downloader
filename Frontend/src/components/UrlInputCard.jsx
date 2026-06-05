import { useState } from 'react'
import { Download, Clipboard, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDownloadFlow } from '@/hooks/useDownloadFlow'
import { isValidYouTubeUrl } from '@/utils/validation'

export default function UrlInputCard() {
  const {
    urlInput,
    phase,
    error,
    handleSubmit,
    setUrlInput,
  } = useDownloadFlow()

  const [touched, setTouched] = useState(false)
  const isBusy = ['checking', 'queued', 'processing'].includes(phase)
  const isInvalid = touched && urlInput.trim() && !isValidYouTubeUrl(urlInput)
  const isDisabled = phase !== 'idle' && phase !== 'failed' || !urlInput.trim() || !isValidYouTubeUrl(urlInput.trim())

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrlInput(text.trim())
    } catch {
      // clipboard access denied
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
        YouTube URL
      </label>

      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onBlur={() => setTouched(true)}
          disabled={isBusy}
          className={isInvalid ? 'ring-1 ring-red-500 focus-visible:ring-red-500' : ''}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 shrink-0 px-3"
          onClick={handlePaste}
          disabled={isBusy}
          aria-label="Paste from clipboard"
        >
          <Clipboard className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      <Button type="submit" className="h-9 w-full" disabled={isDisabled || isBusy}>
        {phase === 'checking' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            Processing...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Download MP3
          </>
        )}
      </Button>

      {error && phase === 'failed' && error.code !== 'INVALID_URL' && (
        <p className="flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {error.message}
        </p>
      )}

      {isInvalid && (
        <p className="flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          Please enter a valid YouTube URL.
        </p>
      )}
    </form>
  )
}
