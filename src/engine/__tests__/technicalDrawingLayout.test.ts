import { describe, expect, it } from 'vitest'
import type { Format } from '../../types/format'
import type { Gaps, Grid } from '../../types/project'
import { computeCornerDetailLayout } from '../technicalDrawingLayout'

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

const gaps: Gaps = { x: 3, y: 3, marginX: 0, marginY: 0 }

describe('computeCornerDetailLayout', () => {
  it('a 1x1 grid shows one tile, film/image dimensions, and no gap dimensions', () => {
    const grid: Grid = { rows: 1, cols: 1 }
    const layout = computeCornerDetailLayout(miniLike, grid, gaps)

    expect(layout.tiles).toHaveLength(1)
    expect(layout.dimensions.map((d) => d.label)).toEqual([
      'Film 54mm',
      'Film 86mm',
      'Image 46mm',
      'Image 62mm',
    ])
    expect(layout.borderLabels).toHaveLength(4)
  })

  it('a multi-tile grid adds horizontal and vertical gap dimensions', () => {
    const grid: Grid = { rows: 5, cols: 4 }
    const layout = computeCornerDetailLayout(miniLike, grid, gaps)

    expect(layout.tiles).toHaveLength(4) // capped at a 2x2 corner
    const labels = layout.dimensions.map((d) => d.label)
    expect(labels).toContain('Gap 3mm')
    expect(labels.filter((l) => l === 'Gap 3mm')).toHaveLength(2) // gapX and gapY, both 3mm here
  })

  it('a single-column grid (multiple rows) only adds a vertical gap dimension', () => {
    const grid: Grid = { rows: 3, cols: 1 }
    const layout = computeCornerDetailLayout(miniLike, grid, gaps)

    expect(layout.tiles).toHaveLength(2) // 1 col x 2 rows
    const horizontalGap = layout.dimensions.find((d) => d.orientation === 'horizontal' && d.label.startsWith('Gap'))
    const verticalGap = layout.dimensions.find((d) => d.orientation === 'vertical' && d.label.startsWith('Gap'))
    expect(horizontalGap).toBeUndefined()
    expect(verticalGap).toBeDefined()
  })

  it('every dimension has start < end', () => {
    const grid: Grid = { rows: 4, cols: 5 }
    const layout = computeCornerDetailLayout(miniLike, grid, gaps)
    for (const dim of layout.dimensions) {
      expect(dim.start).toBeLessThan(dim.end)
    }
  })

  it('the film-width dimension exactly spans the reference tile film rect', () => {
    const grid: Grid = { rows: 2, cols: 2 }
    const layout = computeCornerDetailLayout(miniLike, grid, gaps)
    const filmWidthDim = layout.dimensions.find((d) => d.label === 'Film 54mm')!
    expect(filmWidthDim.start).toBeCloseTo(layout.tiles[0].film.x, 6)
    expect(filmWidthDim.end).toBeCloseTo(layout.tiles[0].film.x + 54, 6)
  })

  it('the horizontal gap dimension spans exactly gaps.x between the two film rects', () => {
    const grid: Grid = { rows: 2, cols: 2 }
    const wideGaps: Gaps = { x: 7, y: 5, marginX: 0, marginY: 0 }
    const layout = computeCornerDetailLayout(miniLike, grid, wideGaps)
    const gapDim = layout.dimensions.find((d) => d.orientation === 'horizontal' && d.label.startsWith('Gap'))!
    expect(gapDim.end - gapDim.start).toBeCloseTo(7, 6)
  })

  it('the bounds fully contain every tile and every dimension line', () => {
    const grid: Grid = { rows: 3, cols: 3 }
    const layout = computeCornerDetailLayout(miniLike, grid, gaps)
    const { bounds } = layout

    for (const tile of layout.tiles) {
      expect(tile.film.x).toBeGreaterThanOrEqual(bounds.x)
      expect(tile.film.y).toBeGreaterThanOrEqual(bounds.y)
      expect(tile.film.x + tile.film.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1e-6)
      expect(tile.film.y + tile.film.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1e-6)
    }
    for (const dim of layout.dimensions) {
      if (dim.orientation === 'vertical') {
        expect(dim.linePos).toBeGreaterThanOrEqual(bounds.x - 1e-6)
        expect(dim.linePos).toBeLessThanOrEqual(bounds.x + bounds.width + 1e-6)
      } else {
        expect(dim.linePos).toBeGreaterThanOrEqual(bounds.y - 1e-6)
        expect(dim.linePos).toBeLessThanOrEqual(bounds.y + bounds.height + 1e-6)
      }
    }
  })

  it('border labels sum consistently with film/image size differences', () => {
    const grid: Grid = { rows: 1, cols: 1 }
    const layout = computeCornerDetailLayout(miniLike, grid, gaps)
    const [top, bottom, left, right] = layout.borderLabels
    expect(top.label).toBe('6mm')
    expect(bottom.label).toBe('18mm')
    expect(left.label).toBe('4mm')
    expect(right.label).toBe('4mm')
  })
})
