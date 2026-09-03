import { useCallback, useEffect, useState } from 'react'
import { applyThemeClass, getInitialTheme, hasExplicitTheme, setTheme, type Theme } from '../lib/theme'

export function useTheme(): [Theme, () => void] {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  // Follow the OS theme live, but only until the user makes an explicit choice.
  useEffect(() => {
    if (hasExplicitTheme() || typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      const next: Theme = event.matches ? 'dark' : 'light'
      applyThemeClass(next)
      setThemeState(next)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      setTheme(next)
      return next
    })
  }, [])

  return [theme, toggleTheme]
}
