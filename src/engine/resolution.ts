export type ResolutionLevel = 'green' | 'yellow' | 'red'

export const RESOLUTION_THRESHOLDS = { green: 300, yellow: 200 } as const

/** DPI a tile will actually print at, given the source pixels available for it (spec §2.5). */
export function computeEffectiveDpi(tileSourceWidthPx: number, imageWidthMm: number): number {
  return tileSourceWidthPx / (imageWidthMm / 25.4)
}

export function classifyResolution(effectiveDpi: number): ResolutionLevel {
  if (effectiveDpi >= RESOLUTION_THRESHOLDS.green) return 'green'
  if (effectiveDpi >= RESOLUTION_THRESHOLDS.yellow) return 'yellow'
  return 'red'
}
