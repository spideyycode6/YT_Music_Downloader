import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
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
  }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: '/api/auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: '/api/auth/login',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
    }),
    refresh: builder.mutation({
      query: () => ({
        url: '/api/auth/refresh',
        method: 'POST',
      }),
    }),
    getMe: builder.query({
      query: () => '/api/auth/me',
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi
