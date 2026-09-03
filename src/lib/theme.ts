export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'framosaic:theme'

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

export function hasExplicitTheme(): boolean {
  return readStoredTheme() !== null
}

export function getInitialTheme(): Theme {
  const stored = readStoredTheme()
  if (stored) return stored
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/** Applies the theme class to <html> without persisting — used for system-driven (non-explicit) changes. */
export function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/** Applies and remembers an explicit user choice (e.g. the theme toggle). */
export function setTheme(theme: Theme): void {
  applyThemeClass(theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // localStorage unavailable (e.g. private browsing) — theme still applies for this session
  }
}
