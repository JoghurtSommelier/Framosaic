import type { CSSProperties } from 'react'
import { BANNER_TILE_URLS } from '../../data/bannerTiles'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface RowConfig {
  offset: number
  durationSeconds: number
  reverse: boolean
}

const ROWS: RowConfig[] = [
  { offset: 0, durationSeconds: 42, reverse: false },
  { offset: 4, durationSeconds: 34, reverse: true },
  { offset: 7, durationSeconds: 50, reverse: false },
]

// Small fixed per-tile rotations so the mosaic reads as "loosely stacked
// prints" without re-randomizing (and shifting layout) on every render.
const ROTATIONS = [-3, 2, -1.5, 3, -2.5, 1, -1, 2.5, -3.5, 1.5]

function Tile({ src, index }: { src: string; index: number }) {
  const rotation = ROTATIONS[index % ROTATIONS.length]
  return (
    <div
      className="flex h-24 w-20 shrink-0 flex-col rounded-md bg-white p-1.5 pb-3 shadow-md shadow-black/20 sm:h-32 sm:w-28"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <img src={src} alt="" aria-hidden="true" className="h-full w-full rounded-sm object-cover" loading="lazy" />
    </div>
  )
}

function MarqueeRow({ row, rowIndex }: { row: RowConfig; rowIndex: number }) {
  const tiles = Array.from({ length: BANNER_TILE_URLS.length }, (_, i) => BANNER_TILE_URLS[(i + row.offset) % BANNER_TILE_URLS.length])
  // Duplicate the track so translateX(-50%) loops seamlessly.
  const doubled = [...tiles, ...tiles]

  return (
    <div className="flex overflow-hidden">
      <div
        className="marquee-track flex gap-4 py-2"
        style={
          {
            '--marquee-duration': `${row.durationSeconds}s`,
            animationDirection: row.reverse ? 'reverse' : 'normal',
          } as CSSProperties
        }
      >
        {doubled.map((src, i) => (
          <Tile key={`${rowIndex}-${i}`} src={src} index={i} />
        ))}
      </div>
    </div>
  )
}

function StaticMosaicGrid() {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-4">
      {BANNER_TILE_URLS.map((src, i) => (
        <Tile key={src} src={src} index={i} />
      ))}
    </div>
  )
}

export function MosaicBanner() {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div aria-hidden="true">
        <StaticMosaicGrid />
      </div>
    )
  }

  return (
    <div className="mosaic-banner mosaic-banner-fade" aria-hidden="true">
      {ROWS.map((row, i) => (
        <MarqueeRow key={i} row={row} rowIndex={i} />
      ))}
    </div>
  )
}
