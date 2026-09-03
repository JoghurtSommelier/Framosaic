import { Printer } from 'lucide-react'
import { useState } from 'react'
import { createExportEngine, type ExportEngine } from '../../export/exportApi'
import { buildHomePrintPdf, type HomePrintTile } from '../../export/homePrintPdf'
import type { PaperSize } from '../../export/pdfUnits'
import { renderAllTiles, type ExportProgress } from '../../export/renderAllTiles'
import { downloadBlob } from '../../lib/download'
import { useProjectStore } from '../../store/projectStore'
import { validateFormat } from '../../types/format'

export function HomePrintPanel() {
  const format = useProjectStore((s) => s.format)
  const grid = useProjectStore((s) => s.grid)
  const gaps = useProjectStore((s) => s.gaps)
  const mapping = useProjectStore((s) => s.mapping)
  const crop = useProjectStore((s) => s.crop)
  const sourceImage = useProjectStore((s) => s.sourceImage)
  const adjustments = useProjectStore((s) => s.adjustments)

  const [paperSize, setPaperSize] = useState<PaperSize>('a4')
  const [isRendering, setIsRendering] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canRun = Boolean(sourceImage && crop) && validateFormat(format).length === 0

  const handleGenerate = async () => {
    if (!sourceImage || !crop) return
    setIsRendering(true)
    setError(null)
    setProgress({ completed: 0, total: grid.rows * grid.cols })

    let engine: ExportEngine | null = null
    try {
      engine = await createExportEngine(sourceImage.fullCanvas)
      const cropPxFullRes = { x: crop.x, y: crop.y, width: crop.width, height: crop.height }
      // Home print always uses fullFrame + PNG regardless of the main export
      // settings, so the cut-out paper looks like a real instant print.
      const params = {
        format,
        grid,
        gaps,
        mapping,
        cropPx: cropPxFullRes,
        adjustments,
        exportSettings: { dpi: 300, mode: 'fullFrame' as const, format: 'png' as const, bleedMm: 0 },
      }

      const rendered = await renderAllTiles(engine, params, grid, setProgress)
      const tiles: HomePrintTile[] = await Promise.all(
        rendered.map(async (tile) => ({
          row: tile.row,
          col: tile.col,
          pngBytes: new Uint8Array(await tile.blob.arrayBuffer()),
        })),
      )

      const pdfBytes = await buildHomePrintPdf({ format, grid, tiles, paperSize })
      downloadBlob(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }), 'framosaic-home-print.pdf')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the home-print PDF.')
    } finally {
      engine?.dispose()
      setIsRendering(false)
      setProgress(null)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">
        No instant-film printer? Print each tile at its true physical size on regular paper (with crop marks) and
        cut them out instead.
      </p>

      {!canRun && <p className="text-sm text-text-muted">Upload and crop a photo to enable this.</p>}

      <label className="flex items-center gap-2 text-sm text-text">
        Paper size
        <select
          value={paperSize}
          onChange={(e) => setPaperSize(e.target.value as PaperSize)}
          className="field"
        >
          <option value="a4">A4</option>
          <option value="letter">Letter</option>
        </select>
      </label>

      <button
        type="button"
        disabled={!canRun || isRendering}
        onClick={handleGenerate}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-border/60 px-4 py-2 text-sm font-medium text-text transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        {isRendering
          ? progress
            ? `Rendering tile ${progress.completed}/${progress.total}…`
            : 'Preparing…'
          : 'Download home-print PDF'}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
