import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setAccessToken, logout } from '@/store/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/api/auth/refresh', method: 'POST' },
      api,
      extraOptions
    )

    if (refreshResult.data?.accessToken) {
      api.dispatch(setAccessToken(refreshResult.data.accessToken))
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

export const musicApi = createApi({
  reducerPath: 'musicApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    startDownload: builder.mutation({
      query: (body) => ({
        url: '/api/music/download',
        method: 'POST',
        body,
      }),
    }),
    pollJobStatus: builder.query({
      query: (jobId) => `/api/music/download/status/${jobId}`,
      keepUnusedDataFor: 0,
    }),
    getDownloadLink: builder.query({
      query: (jobId) => `/api/music/download/link/${jobId}`,
      keepUnusedDataFor: 0,
    }),
  }),
})

export const {
  useStartDownloadMutation,
  usePollJobStatusQuery,
  useLazyGetDownloadLinkQuery,
} = musicApi
