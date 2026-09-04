import { computeTileFilmRectMm, computeTileImageRectMm, computeTileSourcePxRect, type PxRect } from '../engine/slicing'
import type { Format } from '../types/format'
import type { Adjustments, Gaps, Grid, Mapping } from '../types/project'
import { adjustmentsToCssFilter } from './adjustments'
import { tileNumber } from './tileNumbering'

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

export interface DrawMosaicTilesOptions {
  ctx: CanvasRenderingContext2D
  format: Format
  grid: Grid
  gaps: Gaps
  mapping: Mapping
  /** The source image to sample tiles from — an already-loaded <img> or <canvas>. */
  source: CanvasImageSource
  /** The crop rect, in `source`'s own pixel space, that maps onto the full mosaic (spec §2.3). */
  cropPx: PxRect
  adjustments: Adjustments
  /** Converts a mosaic-space mm value to on-canvas px (i.e. mm * scalePxPerMm). */
  toPx: (mm: number) => number
  framesEnabled: boolean
  showNumbers: boolean
  showGridLines: boolean
}

/**
 * Draws every tile of a mosaic (film frame, sampled image content, optional
 * grid lines/numbers) onto a canvas — the single source of truth for what a
 * mosaic actually looks like, shared by the live editor preview and the
 * landing page's static showcase so both stay pixel-identical.
 */
export function drawMosaicTiles({
  ctx,
  format,
  grid,
  gaps,
  mapping,
  source,
  cropPx,
  adjustments,
  toPx,
  framesEnabled,
  showNumbers,
  showGridLines,
}: DrawMosaicTilesOptions) {
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const filmRect = computeTileFilmRectMm(format, grid, gaps, row, col)
      const imageRect = computeTileImageRectMm(format, grid, gaps, row, col, 'spatial')
      const sourceRect = computeTileSourcePxRect(cropPx, format, grid, gaps, row, col, mapping)

      if (framesEnabled) {
        ctx.save()
        ctx.shadowColor = 'rgba(0,0,0,0.35)'
        ctx.shadowBlur = toPx(1.5)
        ctx.shadowOffsetY = toPx(0.8)
        ctx.fillStyle = '#fafaf7'
        roundRect(ctx, toPx(filmRect.x), toPx(filmRect.y), toPx(filmRect.width), toPx(filmRect.height), toPx(1))
        ctx.fill()
        ctx.restore()
      }

      ctx.save()
      ctx.filter = adjustmentsToCssFilter(adjustments)
      ctx.drawImage(
        source,
        sourceRect.x,
        sourceRect.y,
        sourceRect.width,
        sourceRect.height,
        toPx(imageRect.x),
        toPx(imageRect.y),
        toPx(imageRect.width),
        toPx(imageRect.height),
      )
      ctx.restore()

      if (showGridLines) {
        ctx.strokeStyle = 'rgba(56,189,248,0.9)'
        ctx.lineWidth = 1
        ctx.strokeRect(toPx(imageRect.x), toPx(imageRect.y), toPx(imageRect.width), toPx(imageRect.height))
      }

      if (showNumbers) {
        const label = String(tileNumber(row, col, grid.cols))
        ctx.font = `${Math.max(10, toPx(4))}px sans-serif`
        ctx.fillStyle = framesEnabled ? '#57534e' : '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, toPx(imageRect.x + imageRect.width / 2), toPx(imageRect.y + imageRect.height / 2))
      }
    }
  }
}
