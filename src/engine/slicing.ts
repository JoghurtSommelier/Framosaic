import type { Format } from '../types/format'
import type { ExportMode, Gaps, Grid, Mapping } from '../types/project'
import { computeMappingDimensionsMm } from './layout'

export interface MmRect {
  x: number
  y: number
  width: number
  height: number
}

export interface PxRect {
  x: number
  y: number
  width: number
  height: number
}

export function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi)
}

export function pxToMm(px: number, dpi: number): number {
  return (px * 25.4) / dpi
}

export function mmRectToPx(rect: MmRect, dpi: number): PxRect {
  return {
    x: mmToPx(rect.x, dpi),
    y: mmToPx(rect.y, dpi),
    width: mmToPx(rect.width, dpi),
    height: mmToPx(rect.height, dpi),
  }
}

function assertTileInRange(grid: Grid, row: number, col: number): void {
  if (row < 0 || row >= grid.rows || col < 0 || col >= grid.cols) {
    throw new RangeError(`Tile (${row}, ${col}) is outside the ${grid.rows}x${grid.cols} grid.`)
  }
}

/**
 * Where tile (row, col) physically sits on the wall — its full film
 * footprint, in mm. This is always the spatial/physical grid formula
 * (spec §2.2): printed tiles occupy real space with real gaps between
 * them no matter which *source* mapping mode is selected, so this does
 * not take a `mapping` parameter. Used for preview layout and the
 * gluing-template PDF.
 */
export function computeTileFilmRectMm(format: Format, grid: Grid, gaps: Gaps, row: number, col: number): MmRect {
  assertTileInRange(grid, row, col)
  return {
    x: gaps.marginX + col * (format.filmWidth + gaps.x),
    y: gaps.marginY + row * (format.filmHeight + gaps.y),
    width: format.filmWidth,
    height: format.filmHeight,
  }
}

/**
 * The image-area rectangle of one tile, in mm (spec §2.3 step 2).
 * "spatial" positions it at its true physical location within the mosaic
 * (borders/gaps fall on nothing, producing the classic white-grid look
 * when sliced from a mosaic-sized virtual canvas). "seamless" instead
 * maps tiles into a packed, gap-free source grid so image content lines
 * up flush — this is a *source-sampling* coordinate space, unrelated to
 * where the tile is physically hung (see computeTileFilmRectMm for that).
 */
export function computeTileImageRectMm(
  format: Format,
  grid: Grid,
  gaps: Gaps,
  row: number,
  col: number,
  mapping: Mapping,
): MmRect {
  if (mapping === 'seamless') {
    assertTileInRange(grid, row, col)
    return {
      x: col * format.imageWidth,
      y: row * format.imageHeight,
      width: format.imageWidth,
      height: format.imageHeight,
    }
  }

  const filmRect = computeTileFilmRectMm(format, grid, gaps, row, col)
  return {
    x: filmRect.x + format.borderLeft,
    y: filmRect.y + format.borderTop,
    width: format.imageWidth,
    height: format.imageHeight,
  }
}

/**
 * Which sub-rect of a (mapping-aware, aspect-locked) crop feeds tile
 * (row, col)'s image area. `cropPx` is the crop rectangle in whatever
 * pixel space the caller is working in (preview or full-resolution) —
 * the result is returned in that same space. An optional bleed (mm)
 * expands the sampled window symmetrically, matching computeTileSourceRectMm.
 */
export function computeTileSourcePxRect(
  cropPx: PxRect,
  format: Format,
  grid: Grid,
  gaps: Gaps,
  row: number,
  col: number,
  mapping: Mapping,
  bleedMm = 0,
): PxRect {
  const totalDims = computeMappingDimensionsMm(format, grid, gaps, mapping)
  const tileRectMm = computeTileSourceRectMm(format, grid, gaps, row, col, mapping, bleedMm)
  const fx = tileRectMm.x / totalDims.width
  const fy = tileRectMm.y / totalDims.height
  const fw = tileRectMm.width / totalDims.width
  const fh = tileRectMm.height / totalDims.height
  return {
    x: cropPx.x + fx * cropPx.width,
    y: cropPx.y + fy * cropPx.height,
    width: fw * cropPx.width,
    height: fh * cropPx.height,
  }
}

/** Image rect expanded by an optional bleed margin, for sampling source pixels (spec §2.4). */
export function computeTileSourceRectMm(
  format: Format,
  grid: Grid,
  gaps: Gaps,
  row: number,
  col: number,
  mapping: Mapping,
  bleedMm = 0,
): MmRect {
  const rect = computeTileImageRectMm(format, grid, gaps, row, col, mapping)
  return {
    x: rect.x - bleedMm,
    y: rect.y - bleedMm,
    width: rect.width + 2 * bleedMm,
    height: rect.height + 2 * bleedMm,
  }
}

export interface TileExportSizePx {
  width: number
  height: number
  /** Where the sampled image content is placed within the exported canvas. */
  imageOffsetPx: { x: number; y: number }
  imageSizePx: { width: number; height: number }
}

/** Pixel dimensions (and image placement) of one exported tile (spec §2.4). */
export function computeTileExportSizePx(
  format: Format,
  dpi: number,
  mode: ExportMode,
  bleedMm = 0,
): TileExportSizePx {
  const imageSizePx = {
    width: mmToPx(format.imageWidth + 2 * bleedMm, dpi),
    height: mmToPx(format.imageHeight + 2 * bleedMm, dpi),
  }

  if (mode === 'imageArea') {
    return { width: imageSizePx.width, height: imageSizePx.height, imageOffsetPx: { x: 0, y: 0 }, imageSizePx }
  }

  return {
    width: mmToPx(format.filmWidth, dpi),
    height: mmToPx(format.filmHeight, dpi),
    imageOffsetPx: {
      x: mmToPx(format.borderLeft - bleedMm, dpi),
      y: mmToPx(format.borderTop - bleedMm, dpi),
    },
    imageSizePx,
  }
}

export function computeCanvasSizePx(mosaicWidthMm: number, mosaicHeightMm: number, dpi: number): {
  width: number
  height: number
} {
  return { width: mmToPx(mosaicWidthMm, dpi), height: mmToPx(mosaicHeightMm, dpi) }
}
