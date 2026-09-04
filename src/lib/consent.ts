const STORAGE_KEY = 'framosaic-analytics-consent'

export type ConsentValue = 'granted' | 'denied'

export function getStoredConsent(): ConsentValue | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

export function setStoredConsent(value: ConsentValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Private browsing / storage disabled — consent just won't persist across visits.
  }
}
