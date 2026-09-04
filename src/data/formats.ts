import type { Format } from '../types/format'

/**
 * Instant-film dimensions are industry-common approximations, not exact
 * manufacturer specs — they vary by unit/batch. These are editable defaults
 * (spec §2.1): verify them against a real print and adjust as needed.
 * Border widths are split to match each format's well-known look (e.g.
 * instant film's larger bottom border).
 */
export const FORMAT_PRESETS: Format[] = [
  {
    id: 'instax-mini',
    label: 'Instax Mini',
    compatibleWith: 'Fujifilm Instax Mini',
    filmWidth: 54,
    filmHeight: 86,
    imageWidth: 46,
    imageHeight: 62,
    borderLeft: 4,
    borderRight: 4,
    borderTop: 6,
    borderBottom: 18,
    orientation: 'portrait',
  },
  {
    id: 'instax-square',
    label: 'Instax Square',
    compatibleWith: 'Fujifilm Instax Square',
    filmWidth: 72,
    filmHeight: 86,
    imageWidth: 62,
    imageHeight: 62,
    borderLeft: 5,
    borderRight: 5,
    borderTop: 10,
    borderBottom: 14,
    orientation: 'square',
  },
  {
    id: 'instax-wide',
    label: 'Instax Wide',
    compatibleWith: 'Fujifilm Instax Wide',
    filmWidth: 108,
    filmHeight: 86,
    imageWidth: 99,
    imageHeight: 62,
    borderLeft: 4.5,
    borderRight: 4.5,
    borderTop: 6,
    borderBottom: 18,
    orientation: 'landscape',
  },
  {
    id: 'polaroid-600',
    label: 'Polaroid 600 / i-Type',
    compatibleWith: 'Polaroid 600, i-Type',
    filmWidth: 88,
    filmHeight: 107,
    imageWidth: 79,
    imageHeight: 79,
    borderLeft: 4.5,
    borderRight: 4.5,
    borderTop: 6,
    borderBottom: 22,
    orientation: 'portrait',
  },
  {
    id: 'polaroid-go',
    label: 'Polaroid Go',
    compatibleWith: 'Polaroid Go',
    // Spec lists 66.6 x 53.9mm film / ~47 x 46mm image but tags this format
    // "Portrait" — width/height are swapped here from the spec table so the
    // dimensions actually match a portrait aspect (real Polaroid Go prints
    // are taller than wide).
    filmWidth: 53.9,
    filmHeight: 66.6,
    imageWidth: 46,
    imageHeight: 47,
    borderLeft: 3.95,
    borderRight: 3.95,
    borderTop: 6,
    borderBottom: 13.6,
    orientation: 'portrait',
  },
]

export function createCustomFormat(overrides: Partial<Format> = {}): Format {
  return {
    id: 'custom',
    label: 'Custom',
    filmWidth: 60,
    filmHeight: 90,
    imageWidth: 52,
    imageHeight: 66,
    borderLeft: 4,
    borderRight: 4,
    borderTop: 6,
    borderBottom: 18,
    orientation: 'portrait',
    ...overrides,
  }
}
