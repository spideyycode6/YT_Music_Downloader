import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
      state.isAuthenticated = true
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload
      state.isAuthenticated = !!action.payload
    },
    logout(state) {
      state.accessToken = null
      state.user = null
      state.isAuthenticated = false
    },
    setInitialized(state, action) {
      state.isInitialized = action.payload
    },
  },
})

export const { setCredentials, setAccessToken, logout, setInitialized } = authSlice.actions
export default authSlice.reducer
