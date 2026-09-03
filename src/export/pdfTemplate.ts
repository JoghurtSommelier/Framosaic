import type { PDFDocument, PDFFont, PDFImage, rgb as rgbFn } from 'pdf-lib'
import { computeMosaicDimensionsMm } from '../engine/layout'
import { computeTileFilmRectMm, computeTileImageRectMm } from '../engine/slicing'
import { tileNumber } from '../lib/tileNumbering'
import type { Format } from '../types/format'
import type { Gaps, Grid } from '../types/project'
import { drawCropMarks, mmToPt, PAPER_SIZES_MM, type PaperSize } from './pdfUnits'

export type { PaperSize } from './pdfUnits'

export interface GluingTemplateOptions {
  format: Format
  grid: Grid
  gaps: Gaps
  /** The cropped, adjustment-baked mosaic content — see renderOverviewImagePng. */
  overviewImagePng: Uint8Array
  includeFullScaleTemplate: boolean
  includeBackLabelSheet: boolean
  paperSize: PaperSize
}

export async function buildGluingTemplatePdf(options: GluingTemplateOptions): Promise<Uint8Array> {
  const { format, grid, gaps, overviewImagePng, includeFullScaleTemplate, includeBackLabelSheet, paperSize } = options
  const mosaic = computeMosaicDimensionsMm(format, grid, gaps)

  // Dynamically imported so pdf-lib's ~700kB parses only when the user actually exports.
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle('Framosaic Gluing Template')
  pdfDoc.setProducer('Framosaic')

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const overviewImage = await pdfDoc.embedPng(overviewImagePng)

  drawOverviewPage(pdfDoc, { format, grid, gaps, mosaic, overviewImage, font, boldFont, rgb })

  if (includeFullScaleTemplate) {
    drawFullScaleTemplate(pdfDoc, { mosaic, overviewImage, font, paperSize, rgb })
  }

  if (includeBackLabelSheet) {
    drawBackLabelSheet(pdfDoc, { grid, font, boldFont, rgb })
  }

  return pdfDoc.save()
}

function drawOverviewPage(
  pdfDoc: PDFDocument,
  {
    format,
    grid,
    gaps,
    mosaic,
    overviewImage,
    font,
    boldFont,
    rgb,
  }: {
    format: Format
    grid: Grid
    gaps: Gaps
    mosaic: { width: number; height: number }
    overviewImage: PDFImage
    font: PDFFont
    boldFont: PDFFont
    rgb: typeof rgbFn
  },
) {
  const pageWidthMm = 210
  const pageHeightMm = 297
  const page = pdfDoc.addPage([mmToPt(pageWidthMm), mmToPt(pageHeightMm)])
  const yFromTop = (topMm: number) => mmToPt(pageHeightMm - topMm)

  const marginMm = 15
  const boxXMm = marginMm
  const boxTopYMm = 25
  const boxWidthMm = pageWidthMm - marginMm * 2
  const boxHeightMm = boxWidthMm / (mosaic.width / mosaic.height)
  const scale = boxWidthMm / mosaic.width

  page.drawText('Framosaic — Gluing Template', { x: mmToPt(marginMm), y: yFromTop(15), size: 16, font: boldFont })

  page.drawImage(overviewImage, {
    x: mmToPt(boxXMm),
    y: yFromTop(boxTopYMm + boxHeightMm),
    width: mmToPt(boxWidthMm),
    height: mmToPt(boxHeightMm),
  })

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const filmRect = computeTileFilmRectMm(format, grid, gaps, row, col)
      const imageRect = computeTileImageRectMm(format, grid, gaps, row, col, 'spatial')

      const rectXMm = boxXMm + filmRect.x * scale
      const rectTopMm = boxTopYMm + filmRect.y * scale
      const rectWMm = filmRect.width * scale
      const rectHMm = filmRect.height * scale

      page.drawRectangle({
        x: mmToPt(rectXMm),
        y: yFromTop(rectTopMm + rectHMm),
        width: mmToPt(rectWMm),
        height: mmToPt(rectHMm),
        borderColor: rgb(1, 1, 1),
        borderWidth: 1,
      })

      const label = String(tileNumber(row, col, grid.cols))
      const labelSize = 8
      const labelXMm = boxXMm + (imageRect.x + imageRect.width / 2) * scale
      const labelTopMm = boxTopYMm + (imageRect.y + imageRect.height / 2) * scale
      page.drawText(label, {
        x: mmToPt(labelXMm) - font.widthOfTextAtSize(label, labelSize) / 2,
        y: yFromTop(labelTopMm) - labelSize / 2.5,
        size: labelSize,
        font,
        color: rgb(1, 1, 1),
      })
    }
  }

  const legendTopMm = boxTopYMm + boxHeightMm + 12
  const legendLines = [
    `Format: ${format.label} — ${format.filmWidth}×${format.filmHeight}mm film, ${format.imageWidth}×${format.imageHeight}mm image area`,
    `Grid: ${grid.cols} columns x ${grid.rows} rows = ${grid.cols * grid.rows} prints`,
    `Gaps: ${gaps.x}mm horizontal, ${gaps.y}mm vertical — outer margin ${gaps.marginX}mm x ${gaps.marginY}mm`,
    `Total mosaic size: ${mosaic.width.toFixed(1)} x ${mosaic.height.toFixed(1)} mm (${(mosaic.width / 25.4).toFixed(1)} x ${(mosaic.height / 25.4).toFixed(1)} in)`,
    'Numbers show each print position, counted left-to-right then top-to-bottom (top-left = 1). Glue/hang in this order.',
  ]
  legendLines.forEach((line, i) => {
    page.drawText(line, { x: mmToPt(marginMm), y: yFromTop(legendTopMm + i * 6), size: 9, font })
  })
}

function drawFullScaleTemplate(
  pdfDoc: PDFDocument,
  {
    mosaic,
    overviewImage,
    font,
    paperSize,
    rgb,
  }: {
    mosaic: { width: number; height: number }
    overviewImage: PDFImage
    font: PDFFont
    paperSize: PaperSize
    rgb: typeof rgbFn
  },
) {
  const paper = PAPER_SIZES_MM[paperSize]
  const pageMarginMm = 12
  const contentWidthMm = paper.width - pageMarginMm * 2
  const contentHeightMm = paper.height - pageMarginMm * 2

  const pagesX = Math.max(1, Math.ceil(mosaic.width / contentWidthMm))
  const pagesY = Math.max(1, Math.ceil(mosaic.height / contentHeightMm))

  for (let py = 0; py < pagesY; py++) {
    for (let px = 0; px < pagesX; px++) {
      const page = pdfDoc.addPage([mmToPt(paper.width), mmToPt(paper.height)])
      const yFromTop = (topMm: number) => mmToPt(paper.height - topMm)

      page.drawText('Print at 100% / actual size — do not scale to fit page', {
        x: mmToPt(pageMarginMm),
        y: yFromTop(pageMarginMm - 6),
        size: 7,
        font,
        color: rgb(0.4, 0.4, 0.4),
      })
      const pageLabel = `Sheet col ${px + 1}/${pagesX}, row ${py + 1}/${pagesY}`
      page.drawText(pageLabel, {
        x: mmToPt(paper.width - pageMarginMm) - font.widthOfTextAtSize(pageLabel, 7),
        y: yFromTop(pageMarginMm - 6),
        size: 7,
        font,
        color: rgb(0.4, 0.4, 0.4),
      })

      if (px === 0 && py === 0) {
        const barTopMm = pageMarginMm + contentHeightMm + 4
        page.drawLine({
          start: { x: mmToPt(pageMarginMm), y: yFromTop(barTopMm) },
          end: { x: mmToPt(pageMarginMm + 50), y: yFromTop(barTopMm) },
          thickness: mmToPt(0.4),
          color: rgb(0, 0, 0),
        })
        page.drawText('This bar = 50mm — measure it after printing to verify scale', {
          x: mmToPt(pageMarginMm),
          y: yFromTop(barTopMm + 5),
          size: 7,
          font,
        })
      }

      // Content outside a PDF page's boundary is clipped by viewers/printers,
      // so the image can simply be drawn at true 1:1 scale, offset per page —
      // no explicit clip path needed.
      const offsetXMm = px * contentWidthMm
      const offsetYMm = py * contentHeightMm
      page.drawImage(overviewImage, {
        x: mmToPt(pageMarginMm - offsetXMm),
        y: yFromTop(pageMarginMm - offsetYMm + mosaic.height),
        width: mmToPt(mosaic.width),
        height: mmToPt(mosaic.height),
      })

      drawCropMarks(page, pageMarginMm, pageMarginMm, contentWidthMm, contentHeightMm, yFromTop, rgb)
    }
  }
}

function drawBackLabelSheet(
  pdfDoc: PDFDocument,
  { grid, font, boldFont, rgb }: { grid: Grid; font: PDFFont; boldFont: PDFFont; rgb: typeof rgbFn },
) {
  const pageWidthMm = 210
  const pageHeightMm = 297
  const page = pdfDoc.addPage([mmToPt(pageWidthMm), mmToPt(pageHeightMm)])
  const yFromTop = (topMm: number) => mmToPt(pageHeightMm - topMm)
  const marginMm = 15

  page.drawText('Framosaic — Back-Label Reference', { x: mmToPt(marginMm), y: yFromTop(15), size: 16, font: boldFont })
  page.drawText('Write this number on the back of each printed photo before hanging it.', {
    x: mmToPt(marginMm),
    y: yFromTop(23),
    size: 9,
    font,
  })

  const cols = 8
  const cellWidthMm = (pageWidthMm - marginMm * 2) / cols
  const rowHeightMm = 14
  const startTopMm = 34
  const total = grid.rows * grid.cols
  const rowsPerPage = Math.floor((pageHeightMm - startTopMm - marginMm) / rowHeightMm)
  const perPage = cols * rowsPerPage

  let currentPage = page
  for (let i = 0; i < total; i++) {
    const onPageIndex = i % perPage
    if (i > 0 && onPageIndex === 0) {
      currentPage = pdfDoc.addPage([mmToPt(pageWidthMm), mmToPt(pageHeightMm)])
    }
    const row = Math.floor(i / grid.cols)
    const col = i % grid.cols
    const number = tileNumber(row, col, grid.cols)

    const gridCol = onPageIndex % cols
    const gridRow = Math.floor(onPageIndex / cols)
    const xMm = marginMm + gridCol * cellWidthMm
    const topMm = startTopMm + gridRow * rowHeightMm

    currentPage.drawText(`#${number}`, { x: mmToPt(xMm), y: yFromTop(topMm + 5), size: 11, font: boldFont })
    currentPage.drawText(`row ${row + 1}, col ${col + 1}`, {
      x: mmToPt(xMm),
      y: yFromTop(topMm + 11),
      size: 6,
      font,
      color: rgb(0.4, 0.4, 0.4),
    })
  }
}
