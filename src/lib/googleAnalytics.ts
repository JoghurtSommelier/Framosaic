declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Loads GA4 (gtag.js) — only called after explicit user consent (see
 * useAnalyticsConsent). The queueing snippet (dataLayer push + gtag('js'/
 * 'config')) runs from our own bundled 'self' script rather than an inline
 * <script> tag, so it needs no CSP 'unsafe-inline' exception; only the
 * externally-loaded gtag.js needs script-src to allow googletagmanager.com.
 */
export function loadGoogleAnalytics(measurementId: string): void {
  if (document.querySelector('script[data-ga-loader]')) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { anonymize_ip: true })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  script.setAttribute('data-ga-loader', 'true')
  document.head.appendChild(script)
}

/** Google's documented client-side opt-out flag — stops gtag.js from sending hits. */
export function disableGoogleAnalytics(measurementId: string): void {
  ;(window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = true
}
