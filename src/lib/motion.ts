/** Shared motion tokens (spec §5.5) — a single source of truth for durations/easing used across framer-motion transitions. */
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const

export const DURATION = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
} as const

export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}
