import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { classifyResolution, computeEffectiveDpi } from '../../engine/resolution'
import { computeTileSourcePxRect } from '../../engine/slicing'
import { cropToPreviewPxRect, scaleToFullFactor } from '../../lib/cropMapping'
import { tileNumber } from '../../lib/tileNumbering'
import { useProjectStore } from '../../store/projectStore'

const RESOLUTION_LABEL: Record<string, string> = {
  green: 'Sharp print (≥300 dpi)',
  yellow: 'Usable, a bit soft (200–299 dpi)',
  red: 'Low resolution — may look blurry when printed',
}

const RESOLUTION_COLOR: Record<string, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
}

export function TileInspector({
  row,
  col,
  onClose,
}: {
  row: number
  col: number
  onClose: () => void
}) {
  const format = useProjectStore((s) => s.format)
  const grid = useProjectStore((s) => s.grid)
  const gaps = useProjectStore((s) => s.gaps)
  const mapping = useProjectStore((s) => s.mapping)
  const crop = useProjectStore((s) => s.crop)
  const sourceImage = useProjectStore((s) => s.sourceImage)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!sourceImage || !crop) return
    const previewCropPx = cropToPreviewPxRect(crop, sourceImage)
    const sourceRect = computeTileSourcePxRect(previewCropPx, format, grid, gaps, row, col, mapping)
    const canvas = canvasRef.current
    if (!canvas) return
    const displayWidth = 420
    const displayHeight = Math.max(1, Math.round((sourceRect.height / sourceRect.width) * displayWidth))
    canvas.width = displayWidth
    canvas.height = displayHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, displayWidth, displayHeight)
    ctx.drawImage(
      sourceImage.previewCanvas,
      sourceRect.x,
      sourceRect.y,
      sourceRect.width,
      sourceRect.height,
      0,
      0,
      displayWidth,
      displayHeight,
    )
  }, [format, grid, gaps, mapping, row, col, crop, sourceImage])

  if (!sourceImage || !crop) return null

  const previewCropPx = cropToPreviewPxRect(crop, sourceImage)
  const sourceRect = computeTileSourcePxRect(previewCropPx, format, grid, gaps, row, col, mapping)
  const fullResWidthPx = sourceRect.width * scaleToFullFactor(sourceImage)
  const effectiveDpi = computeEffectiveDpi(fullResWidthPx, format.imageWidth)
  const level = classifyResolution(effectiveDpi)

  return (
    <div
      role="dialog"
      aria-label={`Tile ${tileNumber(row, col, grid.cols)} inspector`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div className="max-w-md rounded-2xl bg-surface p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">
            Tile #{tileNumber(row, col, grid.cols)} — row {row + 1}, col {col + 1}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-muted transition-colors hover:bg-border/50 hover:text-text"
            aria-label="Close tile inspector"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <canvas ref={canvasRef} className="w-full rounded border border-border" />
        <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
          <span className={`h-2.5 w-2.5 rounded-full ${RESOLUTION_COLOR[level]}`} aria-hidden="true" />
          <span>
            {Math.round(effectiveDpi)} dpi effective — {RESOLUTION_LABEL[level]}
          </span>
        </div>
      </div>
    </div>
  )
}
