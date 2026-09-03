import { describe, expect, it } from 'vitest'
import type { Format } from '../../types/format'
import type { Gaps, Grid } from '../../types/project'
import {
  computeCropAspect,
  computeMosaicDimensionsMm,
  computePackedDimensionsMm,
  suggestGridForTargetWidth,
} from '../layout'

const miniLike: Format = {
  id: 'test-mini',
  label: 'Test Mini',
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

const grid: Grid = { rows: 5, cols: 4 }
const gaps: Gaps = { x: 3, y: 3, marginX: 0, marginY: 0 }

describe('computeMosaicDimensionsMm', () => {
  it('sums film sizes plus inter-tile gaps (spatial canvas)', () => {
    expect(computeMosaicDimensionsMm(miniLike, grid, gaps)).toEqual({
      width: 4 * 54 + 3 * 3, // 225
      height: 5 * 86 + 4 * 3, // 442
    })
  })

  it('adds the outer margin on both sides', () => {
    const withMargin: Gaps = { ...gaps, marginX: 10, marginY: 5 }
    expect(computeMosaicDimensionsMm(miniLike, grid, withMargin)).toEqual({
      width: 225 + 20,
      height: 442 + 10,
    })
  })

  it('collapses gaps entirely for a single tile', () => {
    const single: Grid = { rows: 1, cols: 1 }
    expect(computeMosaicDimensionsMm(miniLike, single, gaps)).toEqual({
      width: 54,
      height: 86,
    })
  })
})

describe('computePackedDimensionsMm', () => {
  it('sums image areas with no border/gap contribution', () => {
    expect(computePackedDimensionsMm(miniLike, grid)).toEqual({
      width: 4 * 46, // 184
      height: 5 * 62, // 310
    })
  })
})

describe('computeCropAspect', () => {
  it('uses the full mosaic aspect in spatial mode', () => {
    const aspect = computeCropAspect(miniLike, grid, gaps, 'spatial')
    expect(aspect).toBeCloseTo(225 / 442, 6)
  })

  it('uses the packed (gap-free) aspect in seamless mode', () => {
    const aspect = computeCropAspect(miniLike, grid, gaps, 'seamless')
    expect(aspect).toBeCloseTo(184 / 310, 6)
  })

  it('changes live when grid, gaps, or format change', () => {
    const base = computeCropAspect(miniLike, grid, gaps, 'spatial')
    const biggerGrid = computeCropAspect(miniLike, { rows: 5, cols: 6 }, gaps, 'spatial')
    const widerGaps = computeCropAspect(miniLike, grid, { ...gaps, x: 10 }, 'spatial')
    expect(biggerGrid).not.toBeCloseTo(base, 6)
    expect(widerGaps).not.toBeCloseTo(base, 6)
  })
})

describe('suggestGridForTargetWidth', () => {
  it('picks a grid whose mosaic width is close to the target', () => {
    const suggested = suggestGridForTargetWidth(miniLike, gaps, 600, 225 / 442)
    const dims = computeMosaicDimensionsMm(miniLike, suggested, gaps)
    expect(dims.width).toBeGreaterThan(0)
    expect(Math.abs(dims.width - 600)).toBeLessThan(miniLike.filmWidth + gaps.x)
  })

  it('never suggests fewer than one row or column', () => {
    const suggested = suggestGridForTargetWidth(miniLike, gaps, 1, 1)
    expect(suggested.cols).toBeGreaterThanOrEqual(1)
    expect(suggested.rows).toBeGreaterThanOrEqual(1)
  })
})
