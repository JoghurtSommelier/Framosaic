import type { Format } from '../types/format'
import type { Gaps, Grid, Mapping } from '../types/project'

export interface DimensionsMm {
  width: number
  height: number
}

/**
 * Full mosaic footprint in mm, including every film's own border, the
 * gaps between tiles, and an optional outer margin — this is the
 * "spatial" mapping's canvas (spec §2.2/§2.3).
 */
export function computeMosaicDimensionsMm(format: Format, grid: Grid, gaps: Gaps): DimensionsMm {
  return {
    width: grid.cols * format.filmWidth + (grid.cols - 1) * gaps.x + 2 * gaps.marginX,
    height: grid.rows * format.filmHeight + (grid.rows - 1) * gaps.y + 2 * gaps.marginY,
  }
}

/**
 * Image areas packed edge-to-edge with no borders/gaps — the source space
 * for the "seamless" mapping mode (spec §2.3 alternative model).
 */
export function computePackedDimensionsMm(format: Format, grid: Grid): DimensionsMm {
  return {
    width: grid.cols * format.imageWidth,
    height: grid.rows * format.imageHeight,
  }
}

/** Picks packed vs. full mosaic dimensions depending on mapping mode — see computeCropAspect. */
export function computeMappingDimensionsMm(format: Format, grid: Grid, gaps: Gaps, mapping: Mapping): DimensionsMm {
  return mapping === 'seamless'
    ? computePackedDimensionsMm(format, grid)
    : computeMosaicDimensionsMm(format, grid, gaps)
}

export function computeCropAspect(format: Format, grid: Grid, gaps: Gaps, mapping: Mapping): number {
  const dims = computeMappingDimensionsMm(format, grid, gaps, mapping)
  return dims.width / dims.height
}

/** Suggests a grid that best matches a desired physical mosaic width (mm), keeping the format's own aspect. */
export function suggestGridForTargetWidth(
  format: Format,
  gaps: Gaps,
  targetWidthMm: number,
  targetAspect: number,
): Grid {
  const cols = Math.max(1, Math.round((targetWidthMm - 2 * gaps.marginX + gaps.x) / (format.filmWidth + gaps.x)))
  const mosaicWidth = cols * format.filmWidth + (cols - 1) * gaps.x + 2 * gaps.marginX
  const targetHeight = mosaicWidth / targetAspect
  const rows = Math.max(
    1,
    Math.round((targetHeight - 2 * gaps.marginY + gaps.y) / (format.filmHeight + gaps.y)),
  )
  return { rows, cols }
}
