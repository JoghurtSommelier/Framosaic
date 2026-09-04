import type { PDFDocument, PDFFont, PDFImage, rgb as rgbFn } from 'pdf-lib'
import { computeMosaicDimensionsMm } from '../engine/layout'
import { computeTileFilmRectMm, computeTileImageRectMm } from '../engine/slicing'
import { computeCornerDetailLayout } from '../engine/technicalDrawingLayout'
import { tileNumber } from '../lib/tileNumbering'
import type { Format } from '../types/format'
import type { Gaps, Grid } from '../types/project'
import { mmToPt } from './pdfUnits'
import { drawDetailLabel, drawDimension, makeDetailTransform, type DimensionDrawContext } from './technicalDrawing'

export interface GluingTemplateOptions {
  format: Format
  grid: Grid
  gaps: Gaps
  /** The cropped, adjustment-baked mosaic content — see renderOverviewImagePng. */
  overviewImagePng: Uint8Array
  includeBackLabelSheet: boolean
}

export async function buildGluingTemplatePdf(options: GluingTemplateOptions): Promise<Uint8Array> {
  const { format, grid, gaps, overviewImagePng, includeBackLabelSheet } = options
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
  drawDimensionedSchemaPages(pdfDoc, { format, grid, gaps, mosaic, overviewImage, font, boldFont, rgb })

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

/**
 * A proportionally-scaled technical drawing of the whole layout (spec §4's
 * "Maßschema", mandatory): a full-mosaic overview page with outer
 * total-size dimensioning and tile numbers, plus a second page with a
 * larger-scale "corner detail" of the top-left tile(s), fully dimensioned —
 * film size, image-area size, all four border widths, and the gaps —
 * independent of the real grid size so it stays legible whether the mosaic
 * is 2x2 or 10x10. Two separate pages (rather than stacked on one) because
 * a tall/narrow mosaic can otherwise leave the detail almost no room: each
 * page fits its content to both the available width *and* height.
 */
function drawDimensionedSchemaPages(
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
  const marginMm = 15

  // --- Page A: full-mosaic overview, with outer total-size dimensioning ---
  const overviewPage = pdfDoc.addPage([mmToPt(pageWidthMm), mmToPt(pageHeightMm)])
  const yFromTop = (topMm: number) => mmToPt(pageHeightMm - topMm)

  overviewPage.drawText('Framosaic — Dimensioned Schema', { x: mmToPt(marginMm), y: yFromTop(15), size: 16, font: boldFont })
  overviewPage.drawText(`${format.label} — ${grid.cols}×${grid.rows} grid, overview`, {
    x: mmToPt(marginMm),
    y: yFromTop(22),
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.42),
  })

  const overviewBoxXMm = marginMm + 18
  const overviewBoxTopYMm = 42
  const overviewAvailWidthMm = pageWidthMm - marginMm - overviewBoxXMm
  const overviewAvailHeightMm = pageHeightMm - overviewBoxTopYMm - marginMm - 14 // room for a bottom legend line
  const overviewScale = Math.min(overviewAvailWidthMm / mosaic.width, overviewAvailHeightMm / mosaic.height)
  const overviewBoxWidthMm = mosaic.width * overviewScale
  const overviewBoxHeightMm = mosaic.height * overviewScale

  overviewPage.drawImage(overviewImage, {
    x: mmToPt(overviewBoxXMm),
    y: yFromTop(overviewBoxTopYMm + overviewBoxHeightMm),
    width: mmToPt(overviewBoxWidthMm),
    height: mmToPt(overviewBoxHeightMm),
  })

  const overviewTransform = makeDetailTransform(overviewBoxXMm, overviewBoxTopYMm, overviewScale)
  const overviewCtx: DimensionDrawContext = { font, rgb, yFromTop, transform: overviewTransform }

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const filmRect = computeTileFilmRectMm(format, grid, gaps, row, col)
      const imageRect = computeTileImageRectMm(format, grid, gaps, row, col, 'spatial')

      overviewPage.drawRectangle({
        x: mmToPt(overviewTransform.toPageX(filmRect.x)),
        y: yFromTop(overviewTransform.toPageY(filmRect.y + filmRect.height)),
        width: mmToPt(filmRect.width * overviewScale),
        height: mmToPt(filmRect.height * overviewScale),
        borderColor: rgb(1, 1, 1),
        borderWidth: 0.75,
      })

      const label = String(tileNumber(row, col, grid.cols))
      const labelSize = 6
      const labelXMm = overviewTransform.toPageX(imageRect.x + imageRect.width / 2)
      const labelYMm = overviewTransform.toPageY(imageRect.y + imageRect.height / 2)
      overviewPage.drawText(label, {
        x: mmToPt(labelXMm) - font.widthOfTextAtSize(label, labelSize) / 2,
        y: yFromTop(labelYMm) - labelSize / 2.5,
        size: labelSize,
        font,
        color: rgb(1, 1, 1),
      })
    }
  }

  drawDimension(
    overviewPage,
    { orientation: 'horizontal', start: 0, end: mosaic.width, linePos: -10, edgeStart: 0, edgeEnd: 0, label: `Total ${mosaic.width.toFixed(1)}mm` },
    overviewCtx,
  )
  drawDimension(
    overviewPage,
    { orientation: 'vertical', start: 0, end: mosaic.height, linePos: -10, edgeStart: 0, edgeEnd: 0, label: `Total ${mosaic.height.toFixed(1)}mm` },
    overviewCtx,
  )

  overviewPage.drawText(
    `Total mosaic size: ${mosaic.width.toFixed(1)} x ${mosaic.height.toFixed(1)} mm — see the next page for a fully-dimensioned detail.`,
    { x: mmToPt(marginMm), y: yFromTop(pageHeightMm - marginMm - 4), size: 8, font, color: rgb(0.4, 0.4, 0.42) },
  )

  // --- Page B: corner detail, enlarged and fully dimensioned, on its own page ---
  const detailPage = pdfDoc.addPage([mmToPt(pageWidthMm), mmToPt(pageHeightMm)])
  detailPage.drawText('Framosaic — Dimensioned Schema (detail)', { x: mmToPt(marginMm), y: yFromTop(15), size: 16, font: boldFont })
  detailPage.drawText('Top-left corner, enlarged for legibility — applies to every tile in the grid.', {
    x: mmToPt(marginMm),
    y: yFromTop(22),
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.42),
  })

  const detail = computeCornerDetailLayout(format, grid, gaps)
  const detailBoxTopYMm = 40
  const detailAvailWidthMm = pageWidthMm - marginMm * 2 - 10
  const detailAvailHeightMm = pageHeightMm - detailBoxTopYMm - marginMm
  const detailScale = Math.min(detailAvailWidthMm / detail.bounds.width, detailAvailHeightMm / detail.bounds.height)
  const detailOriginXMm = marginMm + 10 - detail.bounds.x * detailScale
  const detailOriginYMm = detailBoxTopYMm - detail.bounds.y * detailScale
  const detailTransform = makeDetailTransform(detailOriginXMm, detailOriginYMm, detailScale)
  const detailCtx: DimensionDrawContext = { font, rgb, yFromTop, transform: detailTransform }

  for (const tile of detail.tiles) {
    detailPage.drawRectangle({
      x: mmToPt(detailTransform.toPageX(tile.film.x)),
      y: yFromTop(detailTransform.toPageY(tile.film.y + tile.film.height)),
      width: mmToPt(tile.film.width * detailScale),
      height: mmToPt(tile.film.height * detailScale),
      borderColor: rgb(0.2, 0.2, 0.22),
      borderWidth: 0.75,
    })
    detailPage.drawRectangle({
      x: mmToPt(detailTransform.toPageX(tile.image.x)),
      y: yFromTop(detailTransform.toPageY(tile.image.y + tile.image.height)),
      width: mmToPt(tile.image.width * detailScale),
      height: mmToPt(tile.image.height * detailScale),
      color: rgb(0.85, 0.88, 0.92),
      borderColor: rgb(0.2, 0.2, 0.22),
      borderWidth: 0.5,
    })
  }

  for (const dim of detail.dimensions) {
    drawDimension(detailPage, dim, detailCtx)
  }
  for (const label of detail.borderLabels) {
    drawDetailLabel(detailPage, label, detailCtx)
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
