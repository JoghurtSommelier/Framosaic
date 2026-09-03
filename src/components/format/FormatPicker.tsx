import { useState } from 'react'
import { createCustomFormat, FORMAT_PRESETS } from '../../data/formats'
import { validateFormat, type Format } from '../../types/format'
import { useProjectStore } from '../../store/projectStore'

const CUSTOM_FIELDS: Array<{ key: keyof Format; label: string }> = [
  { key: 'filmWidth', label: 'Film width (mm)' },
  { key: 'filmHeight', label: 'Film height (mm)' },
  { key: 'imageWidth', label: 'Image width (mm)' },
  { key: 'imageHeight', label: 'Image height (mm)' },
  { key: 'borderLeft', label: 'Border left (mm)' },
  { key: 'borderRight', label: 'Border right (mm)' },
  { key: 'borderTop', label: 'Border top (mm)' },
  { key: 'borderBottom', label: 'Border bottom (mm)' },
]

export function FormatPicker() {
  const format = useProjectStore((s) => s.format)
  const setFormat = useProjectStore((s) => s.setFormat)
  const [customDraft, setCustomDraft] = useState<Format>(() => createCustomFormat())

  const isCustom = format.id === 'custom'
  const errors = isCustom ? validateFormat(format) : []

  return (
    <div className="space-y-3">
      <label htmlFor="format-select" className="block text-sm font-medium text-stone-700">
        Instant film format
      </label>
      <select
        id="format-select"
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
        value={format.id}
        onChange={(e) => {
          if (e.target.value === 'custom') {
            setFormat(customDraft)
          } else {
            const preset = FORMAT_PRESETS.find((f) => f.id === e.target.value)
            if (preset) setFormat(preset)
          }
        }}
      >
        {FORMAT_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label} ({preset.imageWidth}×{preset.imageHeight}mm image area)
          </option>
        ))}
        <option value="custom">Custom…</option>
      </select>

      {isCustom && (
        <div className="grid grid-cols-2 gap-3 rounded-md border border-stone-200 bg-stone-50 p-3">
          {CUSTOM_FIELDS.map(({ key, label }) => (
            <label key={key} className="block text-xs text-stone-600">
              {label}
              <input
                type="number"
                min={0}
                step={0.1}
                className="mt-1 w-full rounded border border-stone-300 px-2 py-1 text-sm"
                value={format[key] as number}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  const next = { ...format, [key]: Number.isFinite(value) ? value : 0 }
                  setCustomDraft(next)
                  setFormat(next)
                }}
              />
            </label>
          ))}
          {errors.length > 0 && (
            <div role="alert" className="col-span-2 space-y-1 text-xs text-red-600">
              {errors.map((err) => (
                <p key={err}>{err}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
