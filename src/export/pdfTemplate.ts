import type { PDFFont, PDFPage, rgb as rgbFn } from 'pdf-lib'
import { computeMosaicDimensionsMm } from '../engine/layout'
import { computeTileFilmRectMm, computeTileImageRectMm } from '../engine/slicing'
import { tileLabel } from '../lib/tileNumbering'
import type { Format } from '../types/format'
import type { Gaps, Grid } from '../types/project'
import { mmToPt } from './pdfUnits'

export interface GluingTemplateOptions {
  format: Format
  grid: Grid
  gaps: Gaps
  /** The cropped, adjustment-baked mosaic content — see renderOverviewImagePng. */
  overviewImagePng: Uint8Array
}

export async function buildGluingTemplatePdf(options: GluingTemplateOptions): Promise<Uint8Array> {
  const { format, grid, gaps, overviewImagePng } = options
  const mosaic = computeMosaicDimensionsMm(format, grid, gaps)

  // Dynamically imported so pdf-lib's ~700kB parses only when the user actually exports.
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle('Framosaic Gluing Template')
  pdfDoc.setProducer('Framosaic')

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const overviewImage = await pdfDoc.embedPng(overviewImagePng)

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

      // Outer box = the film's cut line (full tile, border included). Drawn
      // solid so it reads as "cut here".
      page.drawRectangle({
        x: mmToPt(boxXMm + filmRect.x * scale),
        y: yFromTop(boxTopYMm + (filmRect.y + filmRect.height) * scale),
        width: mmToPt(filmRect.width * scale),
        height: mmToPt(filmRect.height * scale),
        borderColor: rgb(1, 1, 1),
        borderWidth: 1,
      })

      // Inner box = exactly where the printed photo's white border starts —
      // an outline, not a filled/painted area, so it marks the boundary
      // without covering up the photo preview underneath it.
      page.drawRectangle({
        x: mmToPt(boxXMm + imageRect.x * scale),
        y: yFromTop(boxTopYMm + (imageRect.y + imageRect.height) * scale),
        width: mmToPt(imageRect.width * scale),
        height: mmToPt(imageRect.height * scale),
        borderColor: rgb(1, 1, 1),
        borderWidth: 0.75,
        borderDashArray: [2, 1.5],
      })

      drawTileLabel(page, {
        text: tileLabel(row, col),
        xMm: boxXMm + (imageRect.x + imageRect.width / 2) * scale,
        topMm: boxTopYMm + (imageRect.y + imageRect.height / 2) * scale,
        font,
        rgb,
        yFromTop,
      })
    }
  }

  const legendTopMm = boxTopYMm + boxHeightMm + 12
  const legendLines = [
    `Format: ${format.label} — ${format.filmWidth}×${format.filmHeight}mm film, ${format.imageWidth}×${format.imageHeight}mm image area`,
    `Border: ${format.borderTop}mm top, ${format.borderBottom}mm bottom, ${format.borderLeft}mm left, ${format.borderRight}mm right (dashed box on each tile)`,
    `Grid: ${grid.cols} columns x ${grid.rows} rows = ${grid.cols * grid.rows} prints`,
    `Gaps: ${gaps.x}mm horizontal, ${gaps.y}mm vertical — outer margin ${gaps.marginX}mm x ${gaps.marginY}mm`,
    `Total size (incl. film border): ${mosaic.width.toFixed(1)} x ${mosaic.height.toFixed(1)} mm (${(mosaic.width / 25.4).toFixed(1)} x ${(mosaic.height / 25.4).toFixed(1)} in)`,
    'Labels match the exported filenames (tile_rX_cY_nZ). Glue/hang left-to-right, top-to-bottom.',
  ]
  legendLines.forEach((line, i) => {
    page.drawText(line, { x: mmToPt(marginMm), y: yFromTop(legendTopMm + i * 6), size: 9, font })
  })

  return pdfDoc.save()
}

function drawTileLabel(
  page: PDFPage,
  {
    text,
    xMm,
    topMm,
    font,
    rgb,
    yFromTop,
  }: {
    text: string
    xMm: number
    topMm: number
    font: PDFFont
    rgb: typeof rgbFn
    yFromTop: (topMm: number) => number
  },
) {
  const size = 7
  page.drawText(text, {
    x: mmToPt(xMm) - font.widthOfTextAtSize(text, size) / 2,
    y: yFromTop(topMm) - size / 2.5,
    size,
    font,
    color: rgb(1, 1, 1),
  })
}
