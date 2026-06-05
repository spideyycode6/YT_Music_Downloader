import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import authReducer from './authSlice'
import downloadReducer from './downloadSlice'
import uiReducer from './uiSlice'
import { authApi } from '@/services/authApi'
import { musicApi } from '@/services/musicApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    download: downloadReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [musicApi.reducerPath]: musicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(musicApi.middleware),
})

export const useAppSelector = useSelector
export const useAppDispatch = () => useDispatch()
