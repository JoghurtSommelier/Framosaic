import type { PDFPage, rgb as rgbFn } from 'pdf-lib'

export const PT_PER_MM = 72 / 25.4
export const mmToPt = (mm: number) => mm * PT_PER_MM

export type PaperSize = 'a4' | 'letter'

export const PAPER_SIZES_MM: Record<PaperSize, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
}

/** Small L-shaped crop marks at the four corners of a rect (mm, top-left origin), for trim/alignment reference. */
export function drawCropMarks(
  page: PDFPage,
  xMm: number,
  yMm: number,
  widthMm: number,
  heightMm: number,
  yFromTop: (topMm: number) => number,
  rgb: typeof rgbFn,
) {
  const markLenMm = 4
  const corners: Array<[number, number]> = [
    [xMm, yMm],
    [xMm + widthMm, yMm],
    [xMm, yMm + heightMm],
    [xMm + widthMm, yMm + heightMm],
  ]
  for (const [cornerX, cornerTop] of corners) {
    page.drawLine({
      start: { x: mmToPt(cornerX - markLenMm), y: yFromTop(cornerTop) },
      end: { x: mmToPt(cornerX + markLenMm), y: yFromTop(cornerTop) },
      thickness: mmToPt(0.3),
      color: rgb(0, 0, 0),
    })
    page.drawLine({
      start: { x: mmToPt(cornerX), y: yFromTop(cornerTop - markLenMm) },
      end: { x: mmToPt(cornerX), y: yFromTop(cornerTop + markLenMm) },
      thickness: mmToPt(0.3),
      color: rgb(0, 0, 0),
    })
  }
}
