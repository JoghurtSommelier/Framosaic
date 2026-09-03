import type { Gaps, Units } from '../../types/project'
import { mmToUnit, unitToMm } from '../../lib/units'
import { useProjectStore } from '../../store/projectStore'

const RANGE_BY_UNIT: Record<Units, { max: number; step: number }> = {
  mm: { max: 50, step: 0.5 },
  cm: { max: 5, step: 0.05 },
  inch: { max: 2, step: 0.02 },
}

const FIELDS: Array<{ key: keyof Gaps; label: string }> = [
  { key: 'x', label: 'Gap between columns' },
  { key: 'y', label: 'Gap between rows' },
  { key: 'marginX', label: 'Outer margin (left/right)' },
  { key: 'marginY', label: 'Outer margin (top/bottom)' },
]

// Plausibility ceiling (spec §7) — well beyond any real gap/margin, just guards against a stray extra digit or a malformed loaded project.
const MAX_GAP_MM = 300

function clampMm(mm: number): number {
  if (!Number.isFinite(mm)) return 0
  return Math.min(MAX_GAP_MM, Math.max(0, mm))
}

export function GapControls() {
  const gaps = useProjectStore((s) => s.gaps)
  const units = useProjectStore((s) => s.units)
  const setGaps = useProjectStore((s) => s.setGaps)
  const setUnits = useProjectStore((s) => s.setUnits)
  const { max, step } = RANGE_BY_UNIT[units]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-text">Units</span>
        {(['mm', 'cm', 'inch'] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnits(u)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              units === u ? 'bg-accent text-accent-contrast' : 'bg-border/40 text-text-muted hover:bg-border/60'
            }`}
            aria-pressed={units === u}
          >
            {u}
          </button>
        ))}
      </div>

      {FIELDS.map(({ key, label }) => {
        const displayValue = mmToUnit(gaps[key], units)
        return (
          <label key={key} className="block text-sm text-text">
            {label}
            <div className="mt-1 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={max}
                step={step}
                value={displayValue}
                onChange={(e) => setGaps({ [key]: clampMm(unitToMm(Number(e.target.value), units)) })}
                className="flex-1"
                aria-label={label}
              />
              <input
                type="number"
                min={0}
                max={mmToUnit(MAX_GAP_MM, units)}
                step={step}
                value={Number(displayValue.toFixed(2))}
                onChange={(e) => setGaps({ [key]: clampMm(unitToMm(Number(e.target.value), units)) })}
                className="w-20 field text-sm"
              />
            </div>
          </label>
        )
      })}
    </div>
  )
}
