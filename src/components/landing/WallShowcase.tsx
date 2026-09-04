import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { FORMAT_PRESETS } from '../../data/formats'
import { createPlasterPattern, WALL_BACKGROUNDS } from '../../data/wallBackgrounds'
import { computeCropAspect, computeMosaicDimensionsMm } from '../../engine/layout'
import type { PxRect } from '../../engine/slicing'
import { useShowcaseConfig } from '../../hooks/useShowcaseConfig'
import { drawMosaicTiles } from '../../lib/mosaicCanvas'
import { DURATION, EASE_OUT_SOFT } from '../../lib/motion'
import { DEFAULT_ADJUSTMENTS, DEFAULT_GAPS } from '../../types/project'

const SHOWCASE_FORMAT = FORMAT_PRESETS.find((f) => f.id === 'instax-square')!
const SHOWCASE_GRID = { rows: 3, cols: 3 }
const SHOWCASE_MAPPING = 'spatial' as const
const WALL_BACKGROUND = WALL_BACKGROUNDS.find((b) => b.id === 'plaster')!

const FOCUS_KEYWORDS_X: Record<string, number> = { left: 0, center: 0.5, right: 1 }
const FOCUS_KEYWORDS_Y: Record<string, number> = { top: 0, center: 0.5, bottom: 1 }

function parseFocusPart(part: string | undefined, keywords: Record<string, number>): number {
  if (!part) return 0.5
  if (part in keywords) return keywords[part]
  const pct = Number.parseFloat(part)
  return Number.isFinite(pct) ? pct / 100 : 0.5
}

/** A centered "cover" crop of the source image matching the mosaic's aspect, shifted by an object-position-like focus. */
function computeCoverCropPx(naturalWidth: number, naturalHeight: number, aspect: number, focus: string): PxRect {
  const [fxPart, fyPart] = focus.trim().split(/\s+/)
  const fx = parseFocusPart(fxPart, FOCUS_KEYWORDS_X)
  const fy = parseFocusPart(fyPart, FOCUS_KEYWORDS_Y)

  const naturalAspect = naturalWidth / naturalHeight
  if (naturalAspect > aspect) {
    const width = naturalHeight * aspect
    return { x: (naturalWidth - width) * fx, y: 0, width, height: naturalHeight }
  }
  const height = naturalWidth / aspect
  return { x: 0, y: (naturalHeight - height) * fy, width: naturalWidth, height }
}

/**
 * "See it on the wall" (spec §5.6, section 6): a static 3x3 mosaic built
 * from one configurable source photo, rendered through the exact same
 * per-tile canvas pipeline (drawMosaicTiles) as the live editor preview —
 * so alignment and the Instax Square film borders are guaranteed correct
 * rather than approximated by a separate CSS implementation.
 */
export function WallShowcase() {
  const { wallSource, wallFocus } = useShowcaseConfig()
  const prefersReducedMotion = useReducedMotion()

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [containerWidth, setContainerWidth] = useState(500)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setContainerWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) setImage(img)
    }
    img.src = wallSource
    return () => {
      cancelled = true
    }
  }, [wallSource])

  const mosaicDims = computeMosaicDimensionsMm(SHOWCASE_FORMAT, SHOWCASE_GRID, DEFAULT_GAPS)
  const scalePxPerMm = mosaicDims.width > 0 ? containerWidth / mosaicDims.width : 1

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const dpr = Math.min(2, typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)
    const widthPx = Math.max(1, Math.round(mosaicDims.width * scalePxPerMm))
    const heightPx = Math.max(1, Math.round(mosaicDims.height * scalePxPerMm))
    canvas.width = widthPx * dpr
    canvas.height = heightPx * dpr
    canvas.style.width = `${widthPx}px`
    canvas.style.height = `${heightPx}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, widthPx, heightPx)
    ctx.fillStyle = createPlasterPattern(ctx, WALL_BACKGROUND.color) ?? WALL_BACKGROUND.color
    ctx.fillRect(0, 0, widthPx, heightPx)

    const aspect = computeCropAspect(SHOWCASE_FORMAT, SHOWCASE_GRID, DEFAULT_GAPS, SHOWCASE_MAPPING)
    const cropPx = computeCoverCropPx(image.naturalWidth, image.naturalHeight, aspect, wallFocus)

    drawMosaicTiles({
      ctx,
      format: SHOWCASE_FORMAT,
      grid: SHOWCASE_GRID,
      gaps: DEFAULT_GAPS,
      mapping: SHOWCASE_MAPPING,
      source: image,
      cropPx,
      adjustments: DEFAULT_ADJUSTMENTS,
      toPx: (mm) => mm * scalePxPerMm,
      framesEnabled: true,
      showNumbers: false,
      showGridLines: false,
    })
  }, [image, wallFocus, mosaicDims.width, mosaicDims.height, scalePxPerMm])

  return (
    <section id="preview" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-3xl font-semibold tracking-tight text-text">See it on the wall</h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm text-text-muted">
        However you crop it, your mosaic ends up looking like this — real Instax Square prints and borders,
        reconstructing one photo.
      </p>
      <motion.div
        ref={containerRef}
        className="mx-auto mt-10 w-full max-w-xl overflow-hidden rounded-2xl shadow-lg"
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 1.02 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: DURATION.slow, ease: EASE_OUT_SOFT }}
      >
        <canvas ref={canvasRef} role="img" aria-label="Example 3x3 instant-film mosaic mounted on a wall" />
      </motion.div>
    </section>
  )
}
