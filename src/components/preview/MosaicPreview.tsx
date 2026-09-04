import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPlasterPattern, WALL_BACKGROUNDS } from '../../data/wallBackgrounds'
import { computeMosaicDimensionsMm } from '../../engine/layout'
import { computeTileFilmRectMm } from '../../engine/slicing'
import { cropToPreviewPxRect } from '../../lib/cropMapping'
import { drawMosaicTiles } from '../../lib/mosaicCanvas'
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

    drawMosaicTiles({
      ctx,
      format,
      grid,
      gaps,
      mapping,
      source: sourceImage.previewCanvas,
      cropPx: previewCropPx,
      adjustments,
      toPx,
      framesEnabled,
      showNumbers,
      showGridLines,
    })
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
