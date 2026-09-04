import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../config/appConfig', () => ({
  appConfig: { gaMeasurementId: 'G-TEST123' },
}))

import { useAnalyticsConsent } from '../useAnalyticsConsent'

describe('useAnalyticsConsent', () => {
  beforeEach(() => {
    localStorage.clear()
    document.querySelectorAll('script[data-ga-loader]').forEach((el) => el.remove())
  })

  afterEach(() => {
    document.querySelectorAll('script[data-ga-loader]').forEach((el) => el.remove())
  })

  it('starts with no consent decision and reports GA as available', () => {
    const { result } = renderHook(() => useAnalyticsConsent())
    expect(result.current.consent).toBeNull()
    expect(result.current.gaAvailable).toBe(true)
  })

  it('grant() persists consent and injects the gtag.js loader script', () => {
    const { result } = renderHook(() => useAnalyticsConsent())
    act(() => result.current.grant())
    expect(result.current.consent).toBe('granted')
    expect(localStorage.getItem('framosaic-analytics-consent')).toBe('granted')
    expect(document.querySelector('script[data-ga-loader]')).not.toBeNull()
  })

  it('deny() persists the decision and does not inject the loader script', () => {
    const { result } = renderHook(() => useAnalyticsConsent())
    act(() => result.current.deny())
    expect(result.current.consent).toBe('denied')
    expect(localStorage.getItem('framosaic-analytics-consent')).toBe('denied')
    expect(document.querySelector('script[data-ga-loader]')).toBeNull()
  })

  it('picks up a previously stored consent decision on mount', () => {
    localStorage.setItem('framosaic-analytics-consent', 'granted')
    const { result } = renderHook(() => useAnalyticsConsent())
    expect(result.current.consent).toBe('granted')
  })
})
