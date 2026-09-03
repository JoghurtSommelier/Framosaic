import { useState } from 'react'
import { classifyResolution, computeEffectiveDpi } from '../../engine/resolution'
import { computeTileSourcePxRect } from '../../engine/slicing'
import { createExportEngine, type ExportEngine } from '../../export/exportApi'
import { buildGluingTemplatePdf, type PaperSize } from '../../export/pdfTemplate'
import { renderOverviewImagePng } from '../../export/renderOverviewImage'
import { buildExportZip, type ExportProgress } from '../../export/zipExport'
import { cropToPreviewPxRect, scaleToFullFactor } from '../../lib/cropMapping'
import { downloadBlob } from '../../lib/download'
import { markDonationPromptShown, shouldShowDonationPrompt } from '../../lib/donationPrompt'
import { useProjectStore } from '../../store/projectStore'
import { validateFormat } from '../../types/format'
import type { ExportFormat, ExportMode } from '../../types/project'
import { DonationPrompt } from './DonationPrompt'

const RESOLUTION_LABEL: Record<string, string> = {
  green: 'Sharp (≥300 dpi)',
  yellow: 'Usable but soft (200–299 dpi)',
  red: 'Low resolution — prints may look blurry',
}
const RESOLUTION_STYLE: Record<string, string> = {
  green: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  yellow: 'text-amber-700 bg-amber-50 border-amber-200',
  red: 'text-red-700 bg-red-50 border-red-200',
}

export function ExportPanel() {
  const format = useProjectStore((s) => s.format)
  const grid = useProjectStore((s) => s.grid)
  const gaps = useProjectStore((s) => s.gaps)
  const mapping = useProjectStore((s) => s.mapping)
  const crop = useProjectStore((s) => s.crop)
  const sourceImage = useProjectStore((s) => s.sourceImage)
  const adjustments = useProjectStore((s) => s.adjustments)
  const exportSettings = useProjectStore((s) => s.exportSettings)
  const setExportSettings = useProjectStore((s) => s.setExportSettings)

  const [includeFullScaleTemplate, setIncludeFullScaleTemplate] = useState(false)
  const [includeBackLabelSheet, setIncludeBackLabelSheet] = useState(true)
  const [paperSize, setPaperSize] = useState<PaperSize>('a4')
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDonation, setShowDonation] = useState(false)

  const formatErrors = validateFormat(format)
  const canExport = Boolean(sourceImage && crop) && formatErrors.length === 0

  let resolutionLevel: string | null = null
  let effectiveDpi = 0
  if (sourceImage && crop) {
    const previewCropPx = cropToPreviewPxRect(crop, sourceImage)
    const sourceRect = computeTileSourcePxRect(previewCropPx, format, grid, gaps, 0, 0, mapping)
    const fullResWidthPx = sourceRect.width * scaleToFullFactor(sourceImage)
    effectiveDpi = computeEffectiveDpi(fullResWidthPx, format.imageWidth)
    resolutionLevel = classifyResolution(effectiveDpi)
  }

  const handleExport = async () => {
    if (!sourceImage || !crop) return
    setIsExporting(true)
    setError(null)
    setProgress({ completed: 0, total: grid.rows * grid.cols })

    let engine: ExportEngine | null = null
    try {
      engine = await createExportEngine(sourceImage.fullCanvas)
      const cropPxFullRes = { x: crop.x, y: crop.y, width: crop.width, height: crop.height }
      const params = { format, grid, gaps, mapping, cropPx: cropPxFullRes, adjustments, exportSettings }

      const zipBlob = await buildExportZip(engine, params, grid, setProgress)
      downloadBlob(zipBlob, 'framosaic-tiles.zip')

      const overviewPng = await renderOverviewImagePng(sourceImage, crop, adjustments)
      const pdfBytes = await buildGluingTemplatePdf({
        format,
        grid,
        gaps,
        overviewImagePng: overviewPng,
        includeFullScaleTemplate,
        includeBackLabelSheet,
        paperSize,
      })
      downloadBlob(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }), 'framosaic-gluing-template.pdf')

      if (shouldShowDonationPrompt()) {
        setShowDonation(true)
        markDonationPromptShown()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed — please try again.')
    } finally {
      engine?.dispose()
      setIsExporting(false)
      setProgress(null)
    }
  }

  return (
    <div className="space-y-4">
      {!sourceImage || !crop ? (
        <p className="text-sm text-stone-500">Upload and crop a photo to enable export.</p>
      ) : null}

      {formatErrors.length > 0 && (
        <div role="alert" className="space-y-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {formatErrors.map((err) => (
            <p key={err}>{err}</p>
          ))}
          <p>Fix the custom format under "Format &amp; grid" before exporting.</p>
        </div>
      )}

      {resolutionLevel && (
        <div className={`rounded-md border px-3 py-2 text-xs ${RESOLUTION_STYLE[resolutionLevel]}`} role="status">
          Estimated print quality: {Math.round(effectiveDpi)} dpi — {RESOLUTION_LABEL[resolutionLevel]}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="block">
          DPI
          <select
            value={exportSettings.dpi}
            onChange={(e) => setExportSettings({ dpi: Number(e.target.value) })}
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1"
          >
            {[150, 300, 600].map((dpi) => (
              <option key={dpi} value={dpi}>
                {dpi} dpi
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          File format
          <select
            value={exportSettings.format}
            onChange={(e) => setExportSettings({ format: e.target.value as ExportFormat })}
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </label>
        <label className="block">
          Print area
          <select
            value={exportSettings.mode}
            onChange={(e) => setExportSettings({ mode: e.target.value as ExportMode })}
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1"
          >
            <option value="imageArea">Image area only</option>
            <option value="fullFrame">Full frame (white border baked in)</option>
          </select>
        </label>
        <label className="block">
          Bleed (mm)
          <input
            type="number"
            min={0}
            max={2}
            step={0.5}
            value={exportSettings.bleedMm}
            onChange={(e) => setExportSettings({ bleedMm: Number(e.target.value) })}
            className="mt-1 w-full rounded border border-stone-300 px-2 py-1"
          />
        </label>
      </div>

      <div className="space-y-2 border-t border-stone-200 pt-3 text-sm">
        <p className="text-xs font-medium text-stone-600">Gluing template PDF</p>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeFullScaleTemplate}
            onChange={(e) => setIncludeFullScaleTemplate(e.target.checked)}
          />
          Include 1:1 print-at-home template pages
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeBackLabelSheet}
            onChange={(e) => setIncludeBackLabelSheet(e.target.checked)}
          />
          Include back-label reference sheet
        </label>
        {includeFullScaleTemplate && (
          <label className="flex items-center gap-2">
            Paper size
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as PaperSize)}
              className="rounded border border-stone-300 px-2 py-1"
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </label>
        )}
      </div>

      <button
        type="button"
        disabled={!canExport || isExporting}
        onClick={handleExport}
        className="w-full rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {isExporting
          ? progress
            ? `Rendering tile ${progress.completed}/${progress.total}…`
            : 'Preparing export…'
          : 'Download ZIP + gluing template PDF'}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {showDonation && <DonationPrompt onDismiss={() => setShowDonation(false)} />}
    </div>
  )
}
