import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPlasterPattern, WALL_BACKGROUNDS } from '../../data/wallBackgrounds'
import { computeMosaicDimensionsMm } from '../../engine/layout'
import { computeTileFilmRectMm, computeTileImageRectMm, computeTileSourcePxRect } from '../../engine/slicing'
import { adjustmentsToCssFilter } from '../../lib/adjustments'
import { cropToPreviewPxRect } from '../../lib/cropMapping'
import { tileNumber } from '../../lib/tileNumbering'
import { useProjectStore } from '../../store/projectStore'
import { TileInspector } from './TileInspector'

export function MosaicPreview() {
  const format = useProjectStore((s) => s.format)
  const grid = useProjectStore((s) => s.grid)
  const gaps = useProjectStore((s) => s.gaps)
  const mapping = useProjectStore((s) => s.mapping)
  const crop = useProjectStore((s) => s.crop)
  const sourceImage = useProjectStore((s) => s.sourceImage)
  const adjustments = useProjectStore((s) => s.adjustments)

  const [framesEnabled, setFramesEnabled] = useState(true)
  const [showNumbers, setShowNumbers] = useState(true)
  const [showGridLines, setShowGridLines] = useState(false)
  const [backgroundId, setBackgroundId] = useState(WALL_BACKGROUNDS[0].id)
  const [zoom, setZoom] = useState(1)
  const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [containerWidth, setContainerWidth] = useState(600)

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

  const mosaicDims = computeMosaicDimensionsMm(format, grid, gaps)
  const fitScale = mosaicDims.width > 0 ? Math.max(containerWidth - 32, 100) / mosaicDims.width : 1
  const scalePxPerMm = Math.max(0.1, fitScale * zoom)
  const previewCropPx = crop && sourceImage ? cropToPreviewPxRect(crop, sourceImage) : null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

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

    const background = WALL_BACKGROUNDS.find((b) => b.id === backgroundId) ?? WALL_BACKGROUNDS[0]
    ctx.fillStyle =
      background.kind === 'texture' ? (createPlasterPattern(ctx, background.color) ?? background.color) : background.color
    ctx.fillRect(0, 0, widthPx, heightPx)

    if (!sourceImage || !previewCropPx) return

    const toPx = (mm: number) => mm * scalePxPerMm

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const filmRect = computeTileFilmRectMm(format, grid, gaps, row, col)
        const imageRect = computeTileImageRectMm(format, grid, gaps, row, col, 'spatial')
        const sourceRect = computeTileSourcePxRect(previewCropPx, format, grid, gaps, row, col, mapping)

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
          sourceImage.previewCanvas,
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
  }, [
    format,
    grid,
    gaps,
    mapping,
    adjustments,
    sourceImage,
    previewCropPx,
    framesEnabled,
    showNumbers,
    showGridLines,
    backgroundId,
    scalePxPerMm,
    mosaicDims.width,
    mosaicDims.height,
  ])

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const xMm = (event.clientX - rect.left) / scalePxPerMm
    const yMm = (event.clientY - rect.top) / scalePxPerMm
    const col = Math.floor((xMm - gaps.marginX) / (format.filmWidth + gaps.x))
    const row = Math.floor((yMm - gaps.marginY) / (format.filmHeight + gaps.y))
    if (row < 0 || row >= grid.rows || col < 0 || col >= grid.cols) return

    const filmRect = computeTileFilmRectMm(format, grid, gaps, row, col)
    const insideFilm =
      xMm >= filmRect.x && xMm <= filmRect.x + filmRect.width && yMm >= filmRect.y && yMm <= filmRect.y + filmRect.height
    if (!insideFilm) return
    setSelectedTile({ row, col })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <ToggleButton pressed={framesEnabled} onClick={() => setFramesEnabled((v) => !v)} label="Frames" />
        <ToggleButton pressed={showNumbers} onClick={() => setShowNumbers((v) => !v)} label="Numbers" />
        <ToggleButton pressed={showGridLines} onClick={() => setShowGridLines((v) => !v)} label="Grid lines" />
        <select
          value={backgroundId}
          onChange={(e) => setBackgroundId(e.target.value)}
          className="field text-xs"
          aria-label="Wall background"
        >
          {WALL_BACKGROUNDS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
        <label className="ml-auto flex items-center gap-2 text-xs text-text-muted">
          Zoom
          <input
            type="range"
            min={0.3}
            max={2.5}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Preview zoom"
          />
        </label>
      </div>

      <div
        ref={containerRef}
        role="region"
        aria-label="Mosaic preview, scrollable"
        tabIndex={0}
        className="max-h-[70vh] overflow-auto rounded-2xl bg-black/[0.04] p-4 dark:bg-white/[0.06]"
      >
        {sourceImage && crop ? (
          <canvas ref={canvasRef} onClick={handleCanvasClick} className="cursor-pointer" />
        ) : (
          <p className="text-sm text-text-muted">Upload and crop a photo to see the mosaic preview.</p>
        )}
      </div>

      {selectedTile && sourceImage && crop && (
        <TileInspector row={selectedTile.row} col={selectedTile.col} onClose={() => setSelectedTile(null)} />
      )}
    </div>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function ToggleButton({ pressed, onClick, label }: { pressed: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        pressed ? 'bg-accent text-accent-contrast' : 'bg-border/40 text-text-muted hover:bg-border/60'
      }`}
    >
      {label}
    </button>
  )
}
