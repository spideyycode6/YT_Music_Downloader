import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import {
  setUrlInput,
  setPhase,
  setJobId,
  setResult,
  setProgress,
  setError,
  setPollingActive,
  setIsCacheHit,
  resetDownload,
  mapErrorCode,
} from '@/store/downloadSlice'
import { logout } from '@/store/authSlice'
import {
  selectUrlInput,
  selectPhase,
  selectJobId,
  selectResult,
  selectError,
  selectPollingActive,
  selectIsCacheHit,
} from '@/store/selectors'
import { useStartDownloadMutation, musicApi } from '@/services/musicApi'
import { isValidYouTubeUrl } from '@/utils/validation'
import { safeDownloadUrl } from '@/utils/security'
import { toast } from '@/hooks/use-toast'

let pollingRef = null

export function useDownloadFlow() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const urlInput = useAppSelector(selectUrlInput)
  const phase = useAppSelector(selectPhase)
  const jobId = useAppSelector(selectJobId)
  const result = useAppSelector(selectResult)
  const error = useAppSelector(selectError)
  const pollingActive = useAppSelector(selectPollingActive)
  const isCacheHit = useAppSelector(selectIsCacheHit)

  const [startDownload] = useStartDownloadMutation()

  const stopPolling = useCallback(() => {
    if (pollingRef) {
      clearInterval(pollingRef)
      pollingRef = null
    }
    dispatch(setPollingActive(false))
  }, [dispatch])

  const startPolling = useCallback((id) => {
    stopPolling()
    dispatch(setPollingActive(true))

    const poll = async () => {
      try {
        const response = await dispatch(
          musicApi.endpoints.pollJobStatus.initiate(id, {
            forceRefetch: true,
            subscribe: false,
          })
        ).unwrap()

        const { status, progress, result: jobResult, errorCode } = response.data

        if (typeof progress === 'number') {
          dispatch(setProgress(progress))
        }

        if (status === 'queued') {
          dispatch(setPhase('queued'))
        } else if (status === 'processing') {
          dispatch(setPhase('processing'))
        } else if (status === 'completed' && jobResult) {
          stopPolling()
          dispatch(setResult(jobResult))
          dispatch(setPhase('completed'))
        } else if (status === 'failed') {
          stopPolling()
          dispatch(setPhase('failed'))
          dispatch(setError({
            message: mapErrorCode(errorCode),
            code: errorCode || '',
          }))
        } else if (status === 'expired') {
          stopPolling()
          dispatch(setPhase('expired'))
          dispatch(setError({
            message: mapErrorCode('FILE_EXPIRED'),
            code: 'FILE_EXPIRED',
          }))
        }
      } catch {
        // ignore transient poll errors
      }
    }

    poll()
    pollingRef = setInterval(poll, 2000)
  }, [dispatch, stopPolling])

  const submitUrl = async (url) => {
    const trimmedUrl = url.trim()

    if (!isValidYouTubeUrl(trimmedUrl)) {
      dispatch(setError({ message: 'Please enter a valid YouTube URL.', code: 'INVALID_URL' }))
      dispatch(setPhase('failed'))
      return
    }

    dispatch(setPhase('checking'))
    dispatch(setError(null))
    dispatch(setIsCacheHit(false))
    dispatch(setProgress(0))

    try {
      const response = await startDownload({ url: trimmedUrl }).unwrap()

      if (response.data?.cached) {
        dispatch(setIsCacheHit(true))
        dispatch(setResult(response.data))
        dispatch(setPhase('completed'))
        return
      }

      if (response.jobId) {
        dispatch(setJobId(response.jobId))
        dispatch(setPhase('queued'))
        startPolling(response.jobId)
      }
    } catch (err) {
      if (err?.status === 401) {
        dispatch(logout())
        navigate('/login')
        return
      }

      const code = err?.data?.code || ''
      dispatch(setPhase('failed'))
      dispatch(setError({
        message: err?.data?.message || mapErrorCode(code),
        code,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await submitUrl(urlInput)
  }

  const handleDownloadClick = async () => {
    if (isCacheHit && result) {
      const url = safeDownloadUrl(result.downloadUrl || result.url)
      if (!url) {
        toast({
          variant: 'destructive',
          title: 'Download blocked',
          description: 'This link is not from an allowed source.',
        })
        dispatch(setError({
          message: mapErrorCode('FILE_EXPIRED'),
          code: 'FILE_EXPIRED',
        }))
        return
      }
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    if (!jobId) return

    try {
      const response = await dispatch(
        musicApi.endpoints.getDownloadLink.initiate(jobId, {
          forceRefetch: true,
          subscribe: false,
        })
      ).unwrap()

      const url = safeDownloadUrl(response.data?.downloadUrl)
      if (!url) {
        toast({
          variant: 'destructive',
          title: 'Download blocked',
          description: 'This link is not from an allowed source.',
        })
        dispatch(setError({
          message: mapErrorCode('FILE_EXPIRED'),
          code: 'FILE_EXPIRED',
        }))
        return
      }

      window.open(url, '_blank', 'noopener,noreferrer')

      if (result) {
        dispatch(setResult({
          ...result,
          downloadUrl: response.data.downloadUrl,
          expiresAt: response.data.expiresAt,
          secondsRemaining: response.data.secondsRemaining,
          lifecycleStatus: response.data.lifecycleStatus,
        }))
      }
    } catch {
      dispatch(setError({
        message: mapErrorCode('FILE_EXPIRED'),
        code: 'FILE_EXPIRED',
      }))
    }
  }

  const handleReset = () => {
    stopPolling()
    dispatch(resetDownload())
  }

  const handleRetry = () => {
    if (urlInput) {
      submitUrl(urlInput)
    }
  }

  return {
    urlInput,
    phase,
    result,
    error,
    pollingActive,
    isCacheHit,
    handleSubmit,
    handleReset,
    handleRetry,
    handleDownloadClick,
    setUrlInput: (value) => dispatch(setUrlInput(value)),
  }
}
