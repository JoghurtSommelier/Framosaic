import type { Format } from '../types/format'
import type { Gaps, Grid } from '../types/project'
import { computeTileFilmRectMm, computeTileImageRectMm, type MmRect } from './slicing'

/**
 * A fully-dimensioned "arrow" measurement: a line from `start` to `end` (mm,
 * along the measured axis) drawn at `linePos` (mm, along the perpendicular
 * axis), with extension lines running from the actual measured edges
 * (`edgeStart`/`edgeEnd`) to that line. `start` is always < `end`.
 */
export interface DetailDimension {
  orientation: 'horizontal' | 'vertical'
  start: number
  end: number
  linePos: number
  edgeStart: number
  edgeEnd: number
  label: string
}

/** A simple centered text label (e.g. a border width), no arrows. */
export interface DetailLabel {
  x: number
  y: number
  label: string
}

export interface CornerDetailTile {
  row: number
  col: number
  film: MmRect
  image: MmRect
}

export interface CornerDetailLayout {
  tiles: CornerDetailTile[]
  dimensions: DetailDimension[]
  borderLabels: DetailLabel[]
  /** Bounding box of the whole detail (tiles + dimension lines), mosaic-space mm. */
  bounds: { x: number; y: number; width: number; height: number }
}

const DIM_GAP_MM = 3

/**
 * Lays out a 1-2 x 1-2 "corner detail" of the mosaic (top-left tile, plus its
 * right/below neighbors if the grid is big enough to have them) with full
 * dimensioning — film size, image-area size, all four border widths, and the
 * horizontal/vertical gaps — independent of the overall grid size, so it
 * stays legible regardless of how many tiles the real mosaic has (spec §4's
 * "Maßschema" requirement).
 */
export function computeCornerDetailLayout(format: Format, grid: Grid, gaps: Gaps): CornerDetailLayout {
  const cols = Math.min(2, grid.cols)
  const rows = Math.min(2, grid.rows)

  const tiles: CornerDetailTile[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles.push({
        row,
        col,
        film: computeTileFilmRectMm(format, grid, gaps, row, col),
        image: computeTileImageRectMm(format, grid, gaps, row, col, 'spatial'),
      })
    }
  }

  const tile00 = tiles[0]
  const dimensions: DetailDimension[] = []

  // Film width/height of the reference tile — outermost of the "nested" dimension chain.
  dimensions.push({
    orientation: 'horizontal',
    start: tile00.film.x,
    end: tile00.film.x + tile00.film.width,
    linePos: tile00.film.y - DIM_GAP_MM * 2,
    edgeStart: tile00.film.y,
    edgeEnd: tile00.film.y,
    label: `Film ${format.filmWidth}mm`,
  })
  dimensions.push({
    orientation: 'vertical',
    start: tile00.film.y,
    end: tile00.film.y + tile00.film.height,
    linePos: tile00.film.x - DIM_GAP_MM * 2,
    edgeStart: tile00.film.x,
    edgeEnd: tile00.film.x,
    label: `Film ${format.filmHeight}mm`,
  })

  // Image-area width/height — nested one step closer in.
  dimensions.push({
    orientation: 'horizontal',
    start: tile00.image.x,
    end: tile00.image.x + tile00.image.width,
    linePos: tile00.film.y - DIM_GAP_MM,
    edgeStart: tile00.image.y,
    edgeEnd: tile00.image.y,
    label: `Image ${format.imageWidth}mm`,
  })
  dimensions.push({
    orientation: 'vertical',
    start: tile00.image.y,
    end: tile00.image.y + tile00.image.height,
    linePos: tile00.film.x - DIM_GAP_MM,
    edgeStart: tile00.image.x,
    edgeEnd: tile00.image.x,
    label: `Image ${format.imageHeight}mm`,
  })

  // Horizontal gap between tile00 and its right neighbor — placed in the same
  // clear margin above the tiles as the film/image chains (outermost of the
  // three), rather than below the tiles, where it would crowd the vertical
  // gap dimension right at the shared tile corner.
  if (cols > 1) {
    const right = tiles.find((t) => t.row === 0 && t.col === 1)!
    dimensions.push({
      orientation: 'horizontal',
      start: tile00.film.x + tile00.film.width,
      end: right.film.x,
      linePos: tile00.film.y - DIM_GAP_MM * 3,
      edgeStart: tile00.film.y,
      edgeEnd: right.film.y,
      label: `Gap ${gaps.x}mm`,
    })
  }

  // Vertical gap between tile00 and the tile below it — placed in the clear
  // margin to the left of the tiles, mirroring the horizontal gap above.
  if (rows > 1) {
    const below = tiles.find((t) => t.row === 1 && t.col === 0)!
    dimensions.push({
      orientation: 'vertical',
      start: tile00.film.y + tile00.film.height,
      end: below.film.y,
      linePos: tile00.film.x - DIM_GAP_MM * 3,
      edgeStart: tile00.film.x,
      edgeEnd: below.film.x,
      label: `Gap ${gaps.y}mm`,
    })
  }

  const borderLabels: DetailLabel[] = [
    {
      x: tile00.image.x + tile00.image.width / 2,
      y: tile00.film.y + format.borderTop / 2,
      label: `${format.borderTop}mm`,
    },
    {
      x: tile00.image.x + tile00.image.width / 2,
      y: tile00.image.y + tile00.image.height + format.borderBottom / 2,
      label: `${format.borderBottom}mm`,
    },
    {
      x: tile00.film.x + format.borderLeft / 2,
      y: tile00.image.y + tile00.image.height / 2,
      label: `${format.borderLeft}mm`,
    },
    {
      x: tile00.image.x + tile00.image.width + format.borderRight / 2,
      y: tile00.image.y + tile00.image.height / 2,
      label: `${format.borderRight}mm`,
    },
  ]

  const allX = tiles.flatMap((t) => [t.film.x, t.film.x + t.film.width])
  const allY = tiles.flatMap((t) => [t.film.y, t.film.y + t.film.height])
  // A 'vertical' dimension's linePos is an X-coordinate (its line runs vertically,
  // offset along the perpendicular/X axis); a 'horizontal' dimension's linePos is
  // a Y-coordinate — so each only contributes to the matching axis's bounds.
  const verticalLinePositions = dimensions.filter((d) => d.orientation === 'vertical').map((d) => d.linePos)
  const horizontalLinePositions = dimensions.filter((d) => d.orientation === 'horizontal').map((d) => d.linePos)
  const minX = Math.min(...allX, ...verticalLinePositions)
  const maxX = Math.max(...allX, ...verticalLinePositions)
  const minY = Math.min(...allY, ...horizontalLinePositions)
  const maxY = Math.max(...allY, ...horizontalLinePositions)

  return {
    tiles,
    dimensions,
    borderLabels,
    bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
  }
}
