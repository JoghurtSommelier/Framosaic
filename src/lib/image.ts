/** Downscales a canvas to fit within maxDimension, preserving aspect ratio. Returns the input unchanged if it already fits. */
export function downscaleCanvas(source: HTMLCanvasElement, maxDimension: number): HTMLCanvasElement {
  const scale = Math.min(1, maxDimension / Math.max(source.width, source.height))
  if (scale === 1) return source

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.width * scale))
  canvas.height = Math.max(1, Math.round(source.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

export function canvasToObjectUrl(canvas: HTMLCanvasElement, type = 'image/png'): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode canvas to a blob'))
        return
      }
      resolve(URL.createObjectURL(blob))
    }, type)
  })
}
