import { useEffect, useState } from 'react'
import { appConfig } from '../config/appConfig'
import { type ConsentValue, getStoredConsent, setStoredConsent } from '../lib/consent'
import { disableGoogleAnalytics, loadGoogleAnalytics } from '../lib/googleAnalytics'

/**
 * Google Analytics stays off until the user explicitly opts in — it's
 * cookie-based, unlike this app's other (unwired, cookie-free) analyticsId
 * slot, so it needs real consent rather than just an operator config flag.
 */
export function useAnalyticsConsent() {
  const [consent, setConsent] = useState<ConsentValue | null>(() => getStoredConsent())
  const measurementId = appConfig.gaMeasurementId

  useEffect(() => {
    if (!measurementId) return
    if (consent === 'granted') {
      loadGoogleAnalytics(measurementId)
    } else {
      disableGoogleAnalytics(measurementId)
    }
  }, [consent, measurementId])

  const grant = () => {
    setStoredConsent('granted')
    setConsent('granted')
  }

  const deny = () => {
    setStoredConsent('denied')
    setConsent('denied')
  }

  return { consent, grant, deny, gaAvailable: Boolean(measurementId) }
}
