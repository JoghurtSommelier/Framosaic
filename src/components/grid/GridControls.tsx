import { useState } from 'react'
import { computeCropAspect, computeMosaicDimensionsMm, suggestGridForTargetWidth } from '../../engine/layout'
import { formatMm, unitToMm } from '../../lib/units'
import { useProjectStore } from '../../store/projectStore'
import type { Grid } from '../../types/project'

const GRID_PRESETS: Grid[] = [
  { rows: 3, cols: 3 },
  { rows: 4, cols: 4 },
  { rows: 4, cols: 5 },
  { rows: 5, cols: 7 },
]

export function GridControls() {
  const format = useProjectStore((s) => s.format)
  const grid = useProjectStore((s) => s.grid)
  const gaps = useProjectStore((s) => s.gaps)
  const mapping = useProjectStore((s) => s.mapping)
  const units = useProjectStore((s) => s.units)
  const setGrid = useProjectStore((s) => s.setGrid)

  const [targetWidth, setTargetWidth] = useState(60)
  const mosaic = computeMosaicDimensionsMm(format, grid, gaps)

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <label className="block text-sm text-stone-700">
          Columns
          <input
            type="number"
            min={1}
            max={20}
            value={grid.cols}
            onChange={(e) => setGrid({ ...grid, cols: clamp(Number(e.target.value)) })}
            className="mt-1 w-20 rounded border border-stone-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="block text-sm text-stone-700">
          Rows
          <input
            type="number"
            min={1}
            max={20}
            value={grid.rows}
            onChange={(e) => setGrid({ ...grid, rows: clamp(Number(e.target.value)) })}
            className="mt-1 w-20 rounded border border-stone-300 px-2 py-1 text-sm"
          />
        </label>
      </div>

      <p className="text-xs text-stone-500">
        Mosaic size: {formatMm(mosaic.width, units)} × {formatMm(mosaic.height, units)}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {GRID_PRESETS.map((preset) => (
          <button
            key={`${preset.cols}x${preset.rows}`}
            type="button"
            onClick={() => setGrid(preset)}
            className={`rounded px-2 py-1 text-xs font-medium ${
              grid.cols === preset.cols && grid.rows === preset.rows
                ? 'bg-stone-800 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {preset.cols}×{preset.rows}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2 border-t border-stone-200 pt-3">
        <label className="block text-sm text-stone-700">
          Target width ({units})
          <input
            type="number"
            min={1}
            value={targetWidth}
            onChange={(e) => setTargetWidth(Number(e.target.value))}
            className="mt-1 w-24 rounded border border-stone-300 px-2 py-1 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const aspect = computeCropAspect(format, grid, gaps, mapping)
            const suggested = suggestGridForTargetWidth(format, gaps, unitToMm(targetWidth, units), aspect)
            setGrid(suggested)
          }}
          className="rounded-md bg-stone-800 px-3 py-1.5 text-sm text-white hover:bg-stone-700"
        >
          Suggest grid
        </button>
      </div>
    </div>
  )
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(20, Math.max(1, Math.round(value)))
}
