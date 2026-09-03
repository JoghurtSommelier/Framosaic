import type { Adjustments } from '../../types/project'
import { useProjectStore } from '../../store/projectStore'

const SLIDERS: Array<{ key: keyof Pick<Adjustments, 'brightness' | 'contrast' | 'saturation'>; label: string }> = [
  { key: 'brightness', label: 'Brightness' },
  { key: 'contrast', label: 'Contrast' },
  { key: 'saturation', label: 'Saturation' },
]

export function AdjustmentControls() {
  const adjustments = useProjectStore((s) => s.adjustments)
  const setAdjustments = useProjectStore((s) => s.setAdjustments)

  return (
    <div className="space-y-4">
      {SLIDERS.map(({ key, label }) => (
        <label key={key} className="block text-sm text-stone-700">
          {label}
          <div className="mt-1 flex items-center gap-3">
            <input
              type="range"
              min={-100}
              max={100}
              step={1}
              value={adjustments[key]}
              onChange={(e) => setAdjustments({ [key]: Number(e.target.value) })}
              className="flex-1"
              aria-label={label}
            />
            <span className="w-10 text-right text-xs text-stone-500">{adjustments[key]}</span>
          </div>
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={adjustments.grayscale}
          onChange={(e) => setAdjustments({ grayscale: e.target.checked })}
        />
        Black &amp; white
      </label>
    </div>
  )
}
