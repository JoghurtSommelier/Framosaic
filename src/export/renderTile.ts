import { computeTileExportSizePx, computeTileSourcePxRect, type PxRect } from '../engine/slicing'
import { adjustmentsToCssFilter } from '../lib/adjustments'
import type { Format } from '../types/format'
import type { Adjustments, ExportSettings, Gaps, Grid, Mapping } from '../types/project'

export interface TileRenderParams {
  format: Format
  grid: Grid
  gaps: Gaps
  mapping: Mapping
  /** Crop rect in the same pixel space as the `source` bitmap passed to renderTileBlob. */
  cropPx: PxRect
  adjustments: Adjustments
  exportSettings: ExportSettings
}

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement
type AnyContext2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D

function makeCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function canvasToBlob(canvas: AnyCanvas, type: string, quality?: number): Promise<Blob> {
  if ('convertToBlob' in canvas) return canvas.convertToBlob({ type, quality })
  return new Promise((resolve, reject) => {
    ;(canvas as HTMLCanvasElement).toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('canvas.toBlob failed'))
    }, type, quality)
  })
}

/** Renders one tile's export image from the full-resolution source bitmap. Runs on the main thread or inside the export worker — identical either way. */
export async function renderTileBlob(
  source: ImageBitmap,
  params: TileRenderParams,
  row: number,
  col: number,
): Promise<Blob> {
  const { format, grid, gaps, mapping, cropPx, adjustments, exportSettings } = params
  const size = computeTileExportSizePx(format, exportSettings.dpi, exportSettings.mode, exportSettings.bleedMm)
  const sourceRect = computeTileSourcePxRect(cropPx, format, grid, gaps, row, col, mapping, exportSettings.bleedMm)

  const canvas = makeCanvas(size.width, size.height)
  const ctx = canvas.getContext('2d') as AnyContext2D | null
  if (!ctx) throw new Error('2D canvas context unavailable')

  if (exportSettings.mode === 'fullFrame') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size.width, size.height)
  }

  const dest = exportSettings.mode === 'fullFrame' ? size.imageOffsetPx : { x: 0, y: 0 }
  const destSize = exportSettings.mode === 'fullFrame' ? size.imageSizePx : { width: size.width, height: size.height }

  ctx.save()
  ctx.filter = adjustmentsToCssFilter(adjustments)
  ctx.drawImage(
    source,
    sourceRect.x,
    sourceRect.y,
    sourceRect.width,
    sourceRect.height,
    dest.x,
    dest.y,
    destSize.width,
    destSize.height,
  )
  ctx.restore()

  const mime = exportSettings.format === 'jpeg' ? 'image/jpeg' : 'image/png'
  return canvasToBlob(canvas, mime, exportSettings.format === 'jpeg' ? 0.92 : undefined)
}
