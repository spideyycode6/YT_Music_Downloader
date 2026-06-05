import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { toggleTheme } from '@/store/uiSlice'
import { selectTheme } from '@/store/selectors'

export function useTheme() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return {
    theme,
    toggleTheme: () => dispatch(toggleTheme()),
  }
}
