import { appConfig } from '../config/appConfig'

const STORAGE_KEY = 'framosaic:donation-last-shown'
const THROTTLE_MS = 1000 * 60 * 60 * 24 // at most once per day, never on every download

export function shouldShowDonationPrompt(): boolean {
  if (!appConfig.donationEnabled || !appConfig.donationUrl) return false
  try {
    const last = localStorage.getItem(STORAGE_KEY)
    if (!last) return true
    return Date.now() - Number(last) > THROTTLE_MS
  } catch {
    return true
  }
}

export function markDonationPromptShown(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    // localStorage unavailable (e.g. private browsing) — non-critical, just skip throttling
  }
}
