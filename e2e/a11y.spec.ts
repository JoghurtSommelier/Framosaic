import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ensureSamplePng } from './utils/samplePng'

test('the empty editor has no serious/critical accessibility violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})

test('the editor with a photo loaded has no serious/critical accessibility violations', async ({ page }) => {
  await page.goto('/')
  await page.locator('input[type="file"][accept="image/*"]').setInputFiles(ensureSamplePng())
  await expect(page.getByText(/\d+×\d+px/)).toBeVisible()

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
})

test('the About and Calibration pages have no serious/critical accessibility violations', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'About' }).click()
  const aboutResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const aboutSerious = aboutResults.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(aboutSerious, JSON.stringify(aboutSerious, null, 2)).toEqual([])

  await page.getByRole('button', { name: '← Back to editor' }).click()
  await page.getByRole('button', { name: 'Calibration' }).click()
  const calibrationResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const calibrationSerious = calibrationResults.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(calibrationSerious, JSON.stringify(calibrationSerious, null, 2)).toEqual([])
})
