import { motion, useReducedMotion } from 'framer-motion'
import { DURATION, EASE_OUT_SOFT } from '../../lib/motion'
import { useShowcaseConfig } from '../../hooks/useShowcaseConfig'

const GRID_SIZE = 3
const CELLS = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
  row: Math.floor(i / GRID_SIZE),
  col: i % GRID_SIZE,
}))

/**
 * "See it on the wall" (spec §5.6, section 6): one configurable source
 * photo, sliced across a 3x3 grid — each cell is the same image sized to
 * 300% of the cell and shifted by -row/-col*100%, so object-fit: cover's
 * crop is computed once (consistently) and the 9 cells reconstruct the
 * whole photo with real gaps between them, matching an actual mosaic.
 */
export function WallShowcase() {
  const { wallSource, wallFocus } = useShowcaseConfig()
  const prefersReducedMotion = useReducedMotion()

  return (
    <section id="preview" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-3xl font-semibold tracking-tight text-text">See it on the wall</h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm text-text-muted">
        However you crop it, your mosaic ends up looking like this — a grid of prints reconstructing one photo.
      </p>
      <motion.div
        className="relative mx-auto mt-10 aspect-square w-full max-w-xl overflow-hidden rounded-2xl bg-surface p-2 shadow-lg sm:p-3"
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 1.02 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: DURATION.slow, ease: EASE_OUT_SOFT }}
      >
        <div
          role="img"
          aria-label="Example instant-film mosaic mounted on a wall, shown as a 3x3 grid"
          className="grid h-full w-full grid-cols-3 grid-rows-3 gap-2 sm:gap-3"
        >
          {CELLS.map(({ row, col }) => (
            <div key={`${row}-${col}`} className="relative overflow-hidden rounded-sm bg-white shadow-sm">
              <img
                src={wallSource}
                alt=""
                aria-hidden="true"
                className="absolute h-[300%] w-[300%] max-w-none object-cover"
                style={{ left: `-${col * 100}%`, top: `-${row * 100}%`, objectPosition: wallFocus }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
