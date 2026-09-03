import type { PxRect } from '../engine/slicing'
import type { SourceImage } from '../store/projectStore'
import type { Crop } from '../types/project'

/** How many full-resolution source pixels one preview pixel represents. */
export function scaleToFullFactor(sourceImage: Pick<SourceImage, 'width' | 'previewWidth'>): number {
  return sourceImage.width / sourceImage.previewWidth
}

/** Converts a full-resolution-space crop rect (the persisted Project model) into preview-canvas pixel space. */
export function cropToPreviewPxRect(crop: Crop, sourceImage: SourceImage): PxRect {
  const scale = scaleToFullFactor(sourceImage)
  return {
    x: crop.x / scale,
    y: crop.y / scale,
    width: crop.width / scale,
    height: crop.height / scale,
  }
}
