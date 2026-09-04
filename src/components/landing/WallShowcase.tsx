import { motion, useReducedMotion } from 'framer-motion'
import { DURATION, EASE_OUT_SOFT } from '../../lib/motion'
import { useShowcaseConfig } from '../../hooks/useShowcaseConfig'

/**
 * "See it on the wall" (spec §5.6, section 6): a single configurable source
 * image, auto-cropped to the section via CSS object-fit: cover + an optional
 * focus point — no manual pre-cropping needed for it to look clean at any
 * screen size.
 */
export function WallShowcase() {
  const { wallSource, wallFocus } = useShowcaseConfig()
  const prefersReducedMotion = useReducedMotion()

  return (
    <section id="preview" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-3xl font-semibold tracking-tight text-text">See it on the wall</h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm text-text-muted">
        However you crop it, your mosaic ends up looking like this — a wall full of prints.
      </p>
      <motion.div
        className="relative mt-10 aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-lg"
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 1.02 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: DURATION.slow, ease: EASE_OUT_SOFT }}
      >
        <img
          src={wallSource}
          alt="Example instant-film mosaic mounted on a wall"
          className="h-full w-full object-cover"
          style={{ objectPosition: wallFocus }}
          loading="lazy"
        />
      </motion.div>
    </section>
  )
}
