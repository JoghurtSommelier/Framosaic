import { describe, expect, it } from 'vitest'
import { classifyResolution, computeEffectiveDpi } from '../resolution'

describe('computeEffectiveDpi', () => {
  it('divides source pixels by the physical image width in inches', () => {
    // 46mm = 1.8110... in; 1500px / 1.8110in ~= 828.26 dpi
    expect(computeEffectiveDpi(1500, 46)).toBeCloseTo(828.26, 1)
  })

  it('scales linearly with source pixel count', () => {
    const base = computeEffectiveDpi(1000, 46)
    expect(computeEffectiveDpi(2000, 46)).toBeCloseTo(base * 2, 6)
  })
})

describe('classifyResolution', () => {
  it('is green at and above 300 dpi', () => {
    expect(classifyResolution(300)).toBe('green')
    expect(classifyResolution(450)).toBe('green')
  })

  it('is yellow between 200 and 299.99 dpi', () => {
    expect(classifyResolution(299.99)).toBe('yellow')
    expect(classifyResolution(200)).toBe('yellow')
  })

  it('is red below 200 dpi', () => {
    expect(classifyResolution(199.99)).toBe('red')
    expect(classifyResolution(0)).toBe('red')
  })
})
