import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  urlInput: '',
  phase: 'idle',
  jobId: null,
  result: null,
  progress: 0,
  error: null,
  pollingActive: false,
  isCacheHit: false,
}

export function mapErrorCode(code) {
  const map = {
    MAX_DURATION_EXCEEDED: 'Video is too long (max 15 minutes).',
    STORAGE_FULL: 'Server storage full. Try again later.',
    TOO_MANY_ACTIVE_JOBS: 'Queue is full. Please retry shortly.',
    FILE_EXPIRED: 'File expired. Start a new download.',
  }
  return map[code] || 'Something went wrong. Try again.'
}

const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    setUrlInput(state, action) {
      state.urlInput = action.payload
    },
    setPhase(state, action) {
      state.phase = action.payload
    },
    setJobId(state, action) {
      state.jobId = action.payload
    },
    setResult(state, action) {
      state.result = action.payload
    },
    setProgress(state, action) {
      state.progress = action.payload
    },
    setError(state, action) {
      state.error = action.payload
    },
    setPollingActive(state, action) {
      state.pollingActive = action.payload
    },
    setIsCacheHit(state, action) {
      state.isCacheHit = action.payload
    },
    resetDownload() {
      return initialState
    },
  },
})

export const {
  setUrlInput,
  setPhase,
  setJobId,
  setResult,
  setProgress,
  setError,
  setPollingActive,
  setIsCacheHit,
  resetDownload,
} = downloadSlice.actions

export default downloadSlice.reducer
