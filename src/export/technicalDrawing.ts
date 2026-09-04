import type { PDFFont, PDFPage, rgb as rgbFn } from 'pdf-lib'
import type { DetailDimension, DetailLabel } from '../engine/technicalDrawingLayout'
import { mmToPt } from './pdfUnits'

/**
 * Maps mosaic-space mm (as produced by computeCornerDetailLayout) to real
 * page mm ("mm from top-left of the page"). `scale` lets the detail be drawn
 * larger than 1:1 so it stays legible regardless of the real film size.
 */
export interface DetailTransform {
  scale: number
  toPageX: (localMm: number) => number
  toPageY: (localMm: number) => number
}

export function makeDetailTransform(originXMm: number, originYMm: number, scale: number): DetailTransform {
  return {
    scale,
    toPageX: (localMm) => originXMm + localMm * scale,
    toPageY: (localMm) => originYMm + localMm * scale,
  }
}

export interface DimensionDrawContext {
  font: PDFFont
  rgb: typeof rgbFn
  yFromTop: (topMm: number) => number
  transform: DetailTransform
}

const LINE_RGB: [number, number, number] = [0.35, 0.35, 0.38]
const LABEL_RGB: [number, number, number] = [0.2, 0.2, 0.22]
const LINE_WIDTH_MM = 0.2
const ARROW_LEN_MM = 2.2
const ARROW_WING_MM = 0.9
const LABEL_SIZE_PT = 6.5

function drawArrowAt(page: PDFPage, xMm: number, yMm: number, dir: 'left' | 'right' | 'up' | 'down', ctx: DimensionDrawContext) {
  const { rgb, yFromTop } = ctx
  const color = rgb(...LINE_RGB)
  const thickness = mmToPt(LINE_WIDTH_MM)
  const horizontal = dir === 'left' || dir === 'right'
  const sign = dir === 'left' || dir === 'up' ? -1 : 1

  if (horizontal) {
    const backXMm = xMm - sign * ARROW_LEN_MM
    page.drawLine({
      start: { x: mmToPt(xMm), y: yFromTop(yMm) },
      end: { x: mmToPt(backXMm), y: yFromTop(yMm - ARROW_WING_MM) },
      thickness,
      color,
    })
    page.drawLine({
      start: { x: mmToPt(xMm), y: yFromTop(yMm) },
      end: { x: mmToPt(backXMm), y: yFromTop(yMm + ARROW_WING_MM) },
      thickness,
      color,
    })
  } else {
    const backYMm = yMm - sign * ARROW_LEN_MM
    page.drawLine({
      start: { x: mmToPt(xMm), y: yFromTop(yMm) },
      end: { x: mmToPt(xMm - ARROW_WING_MM), y: yFromTop(backYMm) },
      thickness,
      color,
    })
    page.drawLine({
      start: { x: mmToPt(xMm), y: yFromTop(yMm) },
      end: { x: mmToPt(xMm + ARROW_WING_MM), y: yFromTop(backYMm) },
      thickness,
      color,
    })
  }
}

/** Draws one fully-arrowed, labeled dimension (spec §4's "Maßschema"). `dim` coordinates are mosaic-space mm; start is always < end. */
export function drawDimension(page: PDFPage, dim: DetailDimension, ctx: DimensionDrawContext) {
  const { rgb, yFromTop, font, transform } = ctx
  const { toPageX, toPageY } = transform
  const color = rgb(...LINE_RGB)
  const thickness = mmToPt(LINE_WIDTH_MM)

  if (dim.orientation === 'horizontal') {
    const lineY = toPageY(dim.linePos)
    const startX = toPageX(dim.start)
    const endX = toPageX(dim.end)

    page.drawLine({ start: { x: mmToPt(startX), y: yFromTop(toPageY(dim.edgeStart)) }, end: { x: mmToPt(startX), y: yFromTop(lineY) }, thickness, color })
    page.drawLine({ start: { x: mmToPt(endX), y: yFromTop(toPageY(dim.edgeEnd)) }, end: { x: mmToPt(endX), y: yFromTop(lineY) }, thickness, color })
    page.drawLine({ start: { x: mmToPt(startX), y: yFromTop(lineY) }, end: { x: mmToPt(endX), y: yFromTop(lineY) }, thickness, color })

    drawArrowAt(page, startX, lineY, 'left', ctx)
    drawArrowAt(page, endX, lineY, 'right', ctx)

    const midX = (startX + endX) / 2
    const textWidth = font.widthOfTextAtSize(dim.label, LABEL_SIZE_PT)
    page.drawText(dim.label, {
      x: mmToPt(midX) - textWidth / 2,
      y: yFromTop(lineY) + mmToPt(0.6),
      size: LABEL_SIZE_PT,
      font,
      color: rgb(...LABEL_RGB),
    })
  } else {
    const lineX = toPageX(dim.linePos)
    const startY = toPageY(dim.start)
    const endY = toPageY(dim.end)

    page.drawLine({ start: { x: mmToPt(toPageX(dim.edgeStart)), y: yFromTop(startY) }, end: { x: mmToPt(lineX), y: yFromTop(startY) }, thickness, color })
    page.drawLine({ start: { x: mmToPt(toPageX(dim.edgeEnd)), y: yFromTop(endY) }, end: { x: mmToPt(lineX), y: yFromTop(endY) }, thickness, color })
    page.drawLine({ start: { x: mmToPt(lineX), y: yFromTop(startY) }, end: { x: mmToPt(lineX), y: yFromTop(endY) }, thickness, color })

    drawArrowAt(page, lineX, startY, 'up', ctx)
    drawArrowAt(page, lineX, endY, 'down', ctx)

    const midY = (startY + endY) / 2
    const textWidth = font.widthOfTextAtSize(dim.label, LABEL_SIZE_PT)
    page.drawText(dim.label, {
      x: mmToPt(lineX) - textWidth - mmToPt(1),
      y: yFromTop(midY) - LABEL_SIZE_PT * 0.32,
      size: LABEL_SIZE_PT,
      font,
      color: rgb(...LABEL_RGB),
    })
  }
}

/** Draws a plain centered text label (e.g. a border width) with no arrows. */
export function drawDetailLabel(page: PDFPage, label: DetailLabel, ctx: DimensionDrawContext) {
  const { rgb, yFromTop, font, transform } = ctx
  const size = 5
  const xPage = transform.toPageX(label.x)
  const yPage = transform.toPageY(label.y)
  const textWidth = font.widthOfTextAtSize(label.label, size)
  page.drawText(label.label, {
    x: mmToPt(xPage) - textWidth / 2,
    y: yFromTop(yPage) - size * 0.32,
    size,
    font,
    color: rgb(0.45, 0.45, 0.48),
  })
}
