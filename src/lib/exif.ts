/**
 * Minimal JPEG EXIF orientation reader — just enough to read tag 0x0112
 * from IFD0, no external dependency. Any parse failure (non-JPEG, missing
 * EXIF, malformed segment) falls back to orientation 1 (no transform).
 */
export async function readExifOrientation(file: Blob): Promise<number> {
  try {
    const buffer = await file.slice(0, 131072).arrayBuffer()
    const view = new DataView(buffer)
    if (view.getUint16(0) !== 0xffd8) return 1 // not a JPEG

    let offset = 2
    while (offset + 4 <= view.byteLength) {
      const marker = view.getUint16(offset)
      if (marker === 0xffd8) {
        offset += 2
        continue
      }
      if (marker === 0xffda || marker === 0xffd9) break // start-of-scan / end-of-image: EXIF can't appear after this
      const length = view.getUint16(offset + 2)
      if (marker === 0xffe1) {
        const exifStart = offset + 4
        if (view.getUint32(exifStart) === 0x45786966 /* "Exif" */) {
          return parseTiffOrientation(view, exifStart + 6)
        }
      }
      offset += 2 + length
    }
    return 1
  } catch {
    return 1
  }
}

function parseTiffOrientation(view: DataView, tiffStart: number): number {
  const littleEndian = view.getUint16(tiffStart) === 0x4949
  const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian)
  const ifdStart = tiffStart + firstIfdOffset
  const entryCount = view.getUint16(ifdStart, littleEndian)
  for (let i = 0; i < entryCount; i++) {
    const entryOffset = ifdStart + 2 + i * 12
    if (view.getUint16(entryOffset, littleEndian) === 0x0112) {
      return view.getUint16(entryOffset + 8, littleEndian)
    }
  }
  return 1
}

export interface OrientedImage {
  canvas: HTMLCanvasElement
  width: number
  height: number
}

/** Draws a source image onto a canvas with EXIF orientation 1-8 normalized away. */
export function drawOriented(
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  orientation: number,
): OrientedImage {
  const swapDims = orientation >= 5
  const width = swapDims ? sourceHeight : sourceWidth
  const height = swapDims ? sourceWidth : sourceHeight

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')

  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0)
      break
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height)
      break
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height)
      break
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0)
      break
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0)
      break
    case 7:
      ctx.transform(0, -1, -1, 0, height, width)
      break
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width)
      break
    default:
      break
  }

  ctx.drawImage(image, 0, 0, sourceWidth, sourceHeight)
  return { canvas, width, height }
}

export async function loadOrientedImage(file: File): Promise<OrientedImage> {
  const orientation = await readExifOrientation(file)
  const bitmap = await createImageBitmap(file, { imageOrientation: 'none' })
  try {
    return drawOriented(bitmap, bitmap.width, bitmap.height, orientation)
  } finally {
    bitmap.close()
  }
}
