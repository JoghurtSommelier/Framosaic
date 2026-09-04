import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { DURATION, EASE_OUT_SOFT } from '../../lib/motion'
import { useAnalyticsConsent } from '../../hooks/useAnalyticsConsent'

/** Shown once, only when the operator has configured Google Analytics — off by default until accepted. */
export function ConsentBanner() {
  const { consent, grant, deny, gaAvailable } = useAnalyticsConsent()
  const prefersReducedMotion = useReducedMotion()
  const visible = gaAvailable && consent === null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Analytics consent"
          aria-describedby="consent-banner-copy"
          className="glass fixed inset-x-0 bottom-0 z-50 border-t border-border px-4 py-4 sm:px-6"
          initial={prefersReducedMotion ? undefined : { y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { y: 32, opacity: 0 }}
          transition={{ duration: DURATION.base, ease: EASE_OUT_SOFT }}
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p id="consent-banner-copy" className="text-sm text-text-muted">
              This deployment can use Google Analytics to understand traffic. It sets cookies and stays off
              unless you accept — your photo never leaves your device either way.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={deny}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-border/40"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={grant}
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-colors hover:opacity-90"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
