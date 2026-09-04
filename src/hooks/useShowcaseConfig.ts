import { useEffect, useState } from 'react'
import { DEFAULT_SHOWCASE, getEnvShowcaseConfig, manifestToConfig, type ShowcaseConfig } from '../config/showcase'

/**
 * Renders with the bundled default immediately (no network wait, so the
 * hero's LCP isn't blocked), then swaps in an operator override if one
 * exists — either from VITE_SHOWCASE_BANNER (already known synchronously)
 * or a fetched /showcase/showcase.json manifest.
 */
export function useShowcaseConfig(): ShowcaseConfig {
  const [config, setConfig] = useState<ShowcaseConfig>(() => getEnvShowcaseConfig() ?? DEFAULT_SHOWCASE)

  useEffect(() => {
    if (getEnvShowcaseConfig()) return // env var already applied synchronously; no manifest lookup needed

    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}showcase/showcase.json`)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((manifest) => {
        if (cancelled || !manifest) return
        const next = manifestToConfig(manifest)
        if (next) setConfig(next)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return config
}
