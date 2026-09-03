import type { Format } from '../types/format'
import type { Gaps, Grid, Mapping } from '../types/project'

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

/**
 * The image-area rectangle of one tile within the mosaic, in mm (spec §2.3
 * step 2). "spatial" keeps the tile at its true position (borders/gaps fall
 * on nothing, producing the classic white-grid look). "seamless" instead
 * maps tiles into a packed, gap-free grid so image content lines up flush.
 */
export function computeTileImageRectMm(
  format: Format,
  grid: Grid,
  gaps: Gaps,
  row: number,
  col: number,
  mapping: Mapping,
): MmRect {
  if (row < 0 || row >= grid.rows || col < 0 || col >= grid.cols) {
    throw new RangeError(`Tile (${row}, ${col}) is outside the ${grid.rows}x${grid.cols} grid.`)
  }

  if (mapping === 'seamless') {
    return {
      x: col * format.imageWidth,
      y: row * format.imageHeight,
      width: format.imageWidth,
      height: format.imageHeight,
    }
  }

  const x0 = gaps.marginX + col * (format.filmWidth + gaps.x)
  const y0 = gaps.marginY + row * (format.filmHeight + gaps.y)
  return {
    x: x0 + format.borderLeft,
    y: y0 + format.borderTop,
    width: format.imageWidth,
    height: format.imageHeight,
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

export type ExportMode = 'imageArea' | 'fullFrame'

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
