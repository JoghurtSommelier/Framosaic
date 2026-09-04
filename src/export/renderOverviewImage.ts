import { adjustmentsToCssFilter } from '../lib/adjustments'
import { cropToPreviewPxRect } from '../lib/cropMapping'
import type { SourceImage } from '../store/projectStore'
import type { Adjustments, Crop } from '../types/project'

/**
 * Renders the cropped source (with adjustments baked in) as a PNG, for the
 * PDF gluing template's overview page. This spans the crop's own aspect —
 * for spatial mapping that equals the full mosaic footprint (gaps
 * included), so it's placed 1:1 as the mosaic background in the PDF; for
 * seamless mapping it's a reasonable schematic approximation (the packed,
 * gap-free crop stretched to fill the same footprint) since this image is
 * for the printed legend, not the pixel-exact tile exports.
 */
export async function renderOverviewImagePng(
  sourceImage: SourceImage,
  crop: Crop,
  adjustments: Adjustments,
  maxWidthPx = 1400,
): Promise<Uint8Array> {
  const previewCropPx = cropToPreviewPxRect(crop, sourceImage)
  const aspect = previewCropPx.width / previewCropPx.height
  const width = Math.max(1, Math.min(maxWidthPx, Math.round(previewCropPx.width)))
  const height = Math.max(1, Math.round(width / aspect))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')

  ctx.filter = adjustmentsToCssFilter(adjustments)
  ctx.drawImage(
    sourceImage.previewCanvas,
    previewCropPx.x,
    previewCropPx.y,
    previewCropPx.width,
    previewCropPx.height,
    0,
    0,
    width,
    height,
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b)
      else reject(new Error('canvas.toBlob failed'))
    }, 'image/png')
  })
  return new Uint8Array(await blob.arrayBuffer())
}
