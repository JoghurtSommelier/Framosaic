import { describe, expect, it } from 'vitest'
import type { Format } from '../../types/format'
import type { Gaps, Grid } from '../../types/project'
import {
  computeCanvasSizePx,
  computeTileExportSizePx,
  computeTileFilmRectMm,
  computeTileImageRectMm,
  computeTileSourcePxRect,
  computeTileSourceRectMm,
  mmRectToPx,
  mmToPx,
  pxToMm,
} from '../slicing'

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

describe('mm/px conversion', () => {
  it('rounds mm to px at a given dpi', () => {
    expect(mmToPx(10, 300)).toBe(118) // 10/25.4*300 = 118.11...
    expect(mmToPx(25.4, 300)).toBe(300)
  })

  it('round-trips approximately', () => {
    expect(pxToMm(mmToPx(50, 300), 300)).toBeCloseTo(50, 0)
  })
})

describe('computeTileImageRectMm (spatial mapping)', () => {
  it('places the first tile at the format border offset', () => {
    expect(computeTileImageRectMm(miniLike, grid, gaps, 0, 0, 'spatial')).toEqual({
      x: 4,
      y: 6,
      width: 46,
      height: 62,
    })
  })

  it('advances by film size + gap per row/col', () => {
    // row=1, col=2 -> x0 = 2*(54+3) = 114, y0 = 1*(86+3) = 89
    expect(computeTileImageRectMm(miniLike, grid, gaps, 1, 2, 'spatial')).toEqual({
      x: 114 + 4,
      y: 89 + 6,
      width: 46,
      height: 62,
    })
  })

  it('honors an outer margin', () => {
    const withMargin: Gaps = { ...gaps, marginX: 10, marginY: 5 }
    expect(computeTileImageRectMm(miniLike, grid, withMargin, 0, 0, 'spatial')).toEqual({
      x: 10 + 4,
      y: 5 + 6,
      width: 46,
      height: 62,
    })
  })

  it('throws for an out-of-range tile', () => {
    expect(() => computeTileImageRectMm(miniLike, grid, gaps, 5, 0, 'spatial')).toThrow(RangeError)
    expect(() => computeTileImageRectMm(miniLike, grid, gaps, 0, -1, 'spatial')).toThrow(RangeError)
  })
})

describe('computeTileImageRectMm (seamless mapping)', () => {
  it('packs tiles edge-to-edge with no border/gap offset', () => {
    expect(computeTileImageRectMm(miniLike, grid, gaps, 0, 0, 'seamless')).toEqual({
      x: 0,
      y: 0,
      width: 46,
      height: 62,
    })
    expect(computeTileImageRectMm(miniLike, grid, gaps, 1, 2, 'seamless')).toEqual({
      x: 2 * 46,
      y: 1 * 62,
      width: 46,
      height: 62,
    })
  })

  it('is unaffected by gap/margin changes', () => {
    const withMargin: Gaps = { ...gaps, marginX: 10, marginY: 5, x: 20, y: 20 }
    expect(computeTileImageRectMm(miniLike, grid, withMargin, 1, 2, 'seamless')).toEqual({
      x: 2 * 46,
      y: 1 * 62,
      width: 46,
      height: 62,
    })
  })
})

describe('computeTileSourceRectMm (bleed)', () => {
  it('is identical to the image rect when bleed is 0', () => {
    const rect = computeTileImageRectMm(miniLike, grid, gaps, 0, 0, 'spatial')
    expect(computeTileSourceRectMm(miniLike, grid, gaps, 0, 0, 'spatial', 0)).toEqual(rect)
  })

  it('expands symmetrically by the bleed amount', () => {
    expect(computeTileSourceRectMm(miniLike, grid, gaps, 0, 0, 'spatial', 1)).toEqual({
      x: 4 - 1,
      y: 6 - 1,
      width: 46 + 2,
      height: 62 + 2,
    })
  })
})

describe('computeTileExportSizePx', () => {
  it('imageArea mode exports only the image area, no bleed', () => {
    const size = computeTileExportSizePx(miniLike, 300, 'imageArea', 0)
    expect(size.width).toBe(mmToPx(46, 300))
    expect(size.height).toBe(mmToPx(62, 300))
    expect(size.imageOffsetPx).toEqual({ x: 0, y: 0 })
  })

  it('imageArea mode with bleed grows the exported canvas', () => {
    const size = computeTileExportSizePx(miniLike, 300, 'imageArea', 1)
    expect(size.width).toBe(mmToPx(48, 300))
    expect(size.height).toBe(mmToPx(64, 300))
  })

  it('fullFrame mode exports the whole film, image inset by its border', () => {
    const size = computeTileExportSizePx(miniLike, 300, 'fullFrame', 0)
    expect(size.width).toBe(mmToPx(54, 300))
    expect(size.height).toBe(mmToPx(86, 300))
    expect(size.imageOffsetPx).toEqual({ x: mmToPx(4, 300), y: mmToPx(6, 300) })
    expect(size.imageSizePx).toEqual({ width: mmToPx(46, 300), height: mmToPx(62, 300) })
  })

  it('fullFrame mode with bleed shrinks the image offset accordingly', () => {
    const size = computeTileExportSizePx(miniLike, 300, 'fullFrame', 1)
    expect(size.imageOffsetPx).toEqual({ x: mmToPx(3, 300), y: mmToPx(5, 300) })
    expect(size.imageSizePx).toEqual({ width: mmToPx(48, 300), height: mmToPx(64, 300) })
  })
})

describe('computeCanvasSizePx / mmRectToPx', () => {
  it('converts the full mosaic canvas to px', () => {
    expect(computeCanvasSizePx(225, 442, 300)).toEqual({
      width: mmToPx(225, 300),
      height: mmToPx(442, 300),
    })
  })

  it('converts an mm rect to px componentwise', () => {
    expect(mmRectToPx({ x: 4, y: 6, width: 46, height: 62 }, 300)).toEqual({
      x: mmToPx(4, 300),
      y: mmToPx(6, 300),
      width: mmToPx(46, 300),
      height: mmToPx(62, 300),
    })
  })
})

describe('computeTileFilmRectMm', () => {
  it('is the film footprint at the physical grid position', () => {
    expect(computeTileFilmRectMm(miniLike, grid, gaps, 1, 2)).toEqual({
      x: 2 * (54 + 3),
      y: 1 * (86 + 3),
      width: 54,
      height: 86,
    })
  })

  it('does not depend on mapping mode (no mapping parameter to get wrong)', () => {
    // spatial image rect must always be the film rect plus the format's own border offset
    const film = computeTileFilmRectMm(miniLike, grid, gaps, 1, 2)
    const image = computeTileImageRectMm(miniLike, grid, gaps, 1, 2, 'spatial')
    expect(image).toEqual({
      x: film.x + miniLike.borderLeft,
      y: film.y + miniLike.borderTop,
      width: miniLike.imageWidth,
      height: miniLike.imageHeight,
    })
  })
})

describe('computeTileSourcePxRect', () => {
  const fullCropPx = { x: 0, y: 0, width: 225, height: 442 } // matches the spatial mosaic aspect for `grid`/`gaps`

  it('spatial mode: tile (0,0) maps to its fractional position within the crop', () => {
    const rect = computeTileSourcePxRect(fullCropPx, miniLike, grid, gaps, 0, 0, 'spatial')
    const imageRect = computeTileImageRectMm(miniLike, grid, gaps, 0, 0, 'spatial')
    expect(rect.x).toBeCloseTo((imageRect.x / 225) * fullCropPx.width, 6)
    expect(rect.y).toBeCloseTo((imageRect.y / 442) * fullCropPx.height, 6)
    expect(rect.width).toBeCloseTo((imageRect.width / 225) * fullCropPx.width, 6)
    expect(rect.height).toBeCloseTo((imageRect.height / 442) * fullCropPx.height, 6)
  })

  it('seamless mode: tiles tile the crop edge-to-edge with no gaps', () => {
    const packedCropPx = { x: 0, y: 0, width: 4 * 46, height: 5 * 62 } // packed dims for `grid`
    const first = computeTileSourcePxRect(packedCropPx, miniLike, grid, gaps, 0, 0, 'seamless')
    const next = computeTileSourcePxRect(packedCropPx, miniLike, grid, gaps, 0, 1, 'seamless')
    expect(first.x + first.width).toBeCloseTo(next.x, 6)
    expect(first.y).toBeCloseTo(next.y, 6)
  })

  it('offsets by the crop origin, not just its size', () => {
    const offsetCropPx = { x: 100, y: 50, width: 225, height: 442 }
    const rect = computeTileSourcePxRect(offsetCropPx, miniLike, grid, gaps, 0, 0, 'spatial')
    const atOrigin = computeTileSourcePxRect(fullCropPx, miniLike, grid, gaps, 0, 0, 'spatial')
    expect(rect.x).toBeCloseTo(atOrigin.x + 100, 6)
    expect(rect.y).toBeCloseTo(atOrigin.y + 50, 6)
  })

  it('expands the sampled window when a bleed is given', () => {
    const noBleed = computeTileSourcePxRect(fullCropPx, miniLike, grid, gaps, 0, 0, 'spatial', 0)
    const withBleed = computeTileSourcePxRect(fullCropPx, miniLike, grid, gaps, 0, 0, 'spatial', 1)
    expect(withBleed.width).toBeGreaterThan(noBleed.width)
    expect(withBleed.height).toBeGreaterThan(noBleed.height)
    expect(withBleed.x).toBeLessThan(noBleed.x)
    expect(withBleed.y).toBeLessThan(noBleed.y)
  })
})
