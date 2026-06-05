import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  theme: 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setTheme(state, action) {
      state.theme = action.payload
    },
  },
})

export const { toggleTheme, setTheme } = uiSlice.actions
export default uiSlice.reducer
