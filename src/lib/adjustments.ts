import type { Adjustments } from '../types/project'

/** CSS filter string for a non-destructive live preview of the current adjustments. */
export function adjustmentsToCssFilter(adjustments: Adjustments): string {
  const brightness = 1 + adjustments.brightness / 100
  const contrast = 1 + adjustments.contrast / 100
  const saturation = adjustments.grayscale ? 0 : 1 + adjustments.saturation / 100
  return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`
}
