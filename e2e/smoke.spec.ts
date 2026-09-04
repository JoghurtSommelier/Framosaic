import { expect, test } from '@playwright/test'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ensureSamplePng } from './utils/samplePng'

test('upload, configure, and export produces a correctly-named ZIP and a gluing-template PDF', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Upload a photo' }).click()

  await page.locator('input[type="file"][accept="image/*"]').setInputFiles(ensureSamplePng())
  await expect(page.getByText(/\d+×\d+px/)).toBeVisible()

  await page.getByRole('spinbutton', { name: 'Columns' }).fill('3')
  await page.getByRole('spinbutton', { name: 'Rows' }).fill('2')

  // The export triggers two downloads (ZIP, then PDF) from one click, with an
  // async gap between them — wait for the first tied to the click, then the
  // second afterward, rather than registering two listeners simultaneously
  // (which can both resolve to the same first event).
  const [download1] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Download ZIP/ }).click(),
  ])
  const download2 = await page.waitForEvent('download')

  const zipDownload = download1.suggestedFilename().endsWith('.zip') ? download1 : download2
  const pdfDownload = download1.suggestedFilename().endsWith('.pdf') ? download1 : download2

  const zipPath = join(tmpdir(), 'framosaic-e2e-export.zip')
  const pdfPath = join(tmpdir(), 'framosaic-e2e-export.pdf')
  await zipDownload.saveAs(zipPath)
  await pdfDownload.saveAs(pdfPath)

  const zip = await JSZip.loadAsync(readFileSync(zipPath))
  expect(Object.keys(zip.files).sort()).toEqual([
    'tile_r1_c1_n1.png',
    'tile_r1_c2_n2.png',
    'tile_r1_c3_n3.png',
    'tile_r2_c1_n4.png',
    'tile_r2_c2_n5.png',
    'tile_r2_c3_n6.png',
  ])

  const pdfDoc = await PDFDocument.load(readFileSync(pdfPath))
  // A single overview page: numbered/lettered tiles, film + image-area boxes, legend.
  expect(pdfDoc.getPageCount()).toBe(1)
})
