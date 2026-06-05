import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { setCredentials, logout as logoutAction, setAccessToken, setInitialized } from '@/store/authSlice'
import { selectUser, selectIsAuthenticated, selectIsInitialized } from '@/store/selectors'
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
  authApi,
} from '@/services/authApi'

let initAttempted = false

export function useAuth() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isInitialized = useAppSelector(selectIsInitialized)

  const [loginMutation] = useLoginMutation()
  const [registerMutation] = useRegisterMutation()
  const [logoutMutation] = useLogoutMutation()
  const [refreshMutation] = useRefreshMutation()

  useEffect(() => {
    if (initAttempted) return
    initAttempted = true

    const initAuth = async () => {
      try {
        const refreshResult = await refreshMutation().unwrap()
        dispatch(setAccessToken(refreshResult.accessToken))

        const meResult = await dispatch(
          authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })
        ).unwrap()

        dispatch(setCredentials({
          user: meResult.user,
          accessToken: refreshResult.accessToken,
        }))
      } catch {
        // stay logged out
      } finally {
        dispatch(setInitialized(true))
      }
    }

    initAuth()
  }, [dispatch, refreshMutation])

  const login = async ({ email, password }) => {
    const result = await loginMutation({ email, password }).unwrap()
    dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }))
    navigate('/')
  }

  const register = async ({ name, email, password }) => {
    const result = await registerMutation({ name, email, password }).unwrap()
    dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }))
    navigate('/')
  }

  const logout = async () => {
    try {
      await logoutMutation().unwrap()
    } catch {
      // clear local state regardless
    }
    dispatch(logoutAction())
    navigate('/login')
  }

  return {
    user,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
  }
}
