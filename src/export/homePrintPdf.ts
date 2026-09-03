import { tileNumber } from '../lib/tileNumbering'
import type { Format } from '../types/format'
import type { Grid } from '../types/project'
import { drawCropMarks, mmToPt, PAPER_SIZES_MM, type PaperSize } from './pdfUnits'

export interface HomePrintTile {
  row: number
  col: number
  /** A fullFrame-mode PNG rendered at format.filmWidth x format.filmHeight physical size (white border baked in). */
  pngBytes: Uint8Array
}

export interface HomePrintOptions {
  format: Format
  grid: Grid
  tiles: HomePrintTile[]
  paperSize: PaperSize
}

const MARGIN_MM = 10
const GAP_MM = 6
const LABEL_HEIGHT_MM = 4

/**
 * Arranges each tile's actual image at true physical size on A4/Letter
 * sheets with crop marks, as a print-at-home alternative to ordering real
 * instant-film prints (spec §3.2/D5).
 */
export async function buildHomePrintPdf(options: HomePrintOptions): Promise<Uint8Array> {
  const { format, grid, tiles, paperSize } = options
  const paper = PAPER_SIZES_MM[paperSize]
  const usableWidthMm = paper.width - MARGIN_MM * 2
  const usableHeightMm = paper.height - MARGIN_MM * 2
  const tileWMm = format.filmWidth
  const tileHMm = format.filmHeight

  if (tileWMm > usableWidthMm || tileHMm + LABEL_HEIGHT_MM > usableHeightMm) {
    throw new Error(`This format doesn't fit on ${paperSize.toUpperCase()} paper — try a larger paper size.`)
  }

  const cols = Math.max(1, Math.floor((usableWidthMm + GAP_MM) / (tileWMm + GAP_MM)))
  const rows = Math.max(1, Math.floor((usableHeightMm + GAP_MM) / (tileHMm + LABEL_HEIGHT_MM + GAP_MM)))
  const perPage = cols * rows

  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle('Framosaic Home Print Sheets')
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const yFromTop = (topMm: number) => mmToPt(paper.height - topMm)

  const addPage = () => {
    const page = pdfDoc.addPage([mmToPt(paper.width), mmToPt(paper.height)])
    page.drawText('Print at 100% / actual size — do not scale to fit page. Cut along the marks.', {
      x: mmToPt(MARGIN_MM),
      y: mmToPt(5),
      size: 7,
      font,
      color: rgb(0.4, 0.4, 0.4),
    })
    return page
  }

  let page = addPage()

  for (let i = 0; i < tiles.length; i++) {
    const onPageIndex = i % perPage
    if (i > 0 && onPageIndex === 0) {
      page = addPage()
    }

    const gridCol = onPageIndex % cols
    const gridRow = Math.floor(onPageIndex / cols)
    const xMm = MARGIN_MM + gridCol * (tileWMm + GAP_MM)
    const topMm = MARGIN_MM + gridRow * (tileHMm + LABEL_HEIGHT_MM + GAP_MM)

    const tile = tiles[i]
    const image = await pdfDoc.embedPng(tile.pngBytes)
    page.drawImage(image, {
      x: mmToPt(xMm),
      y: yFromTop(topMm + LABEL_HEIGHT_MM + tileHMm),
      width: mmToPt(tileWMm),
      height: mmToPt(tileHMm),
    })
    drawCropMarks(page, xMm, topMm + LABEL_HEIGHT_MM, tileWMm, tileHMm, yFromTop, rgb)

    page.drawText(`#${tileNumber(tile.row, tile.col, grid.cols)}`, {
      x: mmToPt(xMm),
      y: yFromTop(topMm + LABEL_HEIGHT_MM),
      size: 8,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
  }

  return pdfDoc.save()
}
