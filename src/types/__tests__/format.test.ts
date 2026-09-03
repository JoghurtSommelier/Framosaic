import { describe, expect, it } from 'vitest'
import { FORMAT_PRESETS } from '../../data/formats'
import { validateFormat, type Format } from '../format'

const base: Format = {
  id: 'base',
  label: 'Base',
  filmWidth: 54,
  filmHeight: 86,
  imageWidth: 46,
  imageHeight: 62,
  borderLeft: 4,
  borderRight: 4,
  borderTop: 6,
  borderBottom: 18,
  orientation: 'portrait',
}

describe('validateFormat', () => {
  it('accepts a consistent format', () => {
    expect(validateFormat(base)).toEqual([])
  })

  it('rejects an image area wider than the film', () => {
    const errors = validateFormat({ ...base, imageWidth: 60 })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatch(/width/i)
  })

  it('rejects an image area taller than the film', () => {
    const errors = validateFormat({ ...base, imageHeight: 90 })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatch(/height/i)
  })

  it('flags both dimensions when both are inconsistent', () => {
    expect(validateFormat({ ...base, imageWidth: 60, imageHeight: 90 })).toHaveLength(2)
  })
})

describe('FORMAT_PRESETS', () => {
  it('every preset has an image area that fits within its film', () => {
    for (const format of FORMAT_PRESETS) {
      expect(validateFormat(format)).toEqual([])
    }
  })

  it('has unique ids', () => {
    const ids = FORMAT_PRESETS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
