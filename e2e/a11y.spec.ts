import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ensureSamplePng } from './utils/samplePng'

async function assertNoSeriousViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
}

test('the empty editor has no serious/critical accessibility violations', async ({ page }) => {
  await page.goto('/')
  await assertNoSeriousViolations(page)
})

test('the editor with a photo loaded has no serious/critical accessibility violations', async ({ page }) => {
  await page.goto('/')
  await page.locator('input[type="file"][accept="image/*"]').setInputFiles(ensureSamplePng())
  await expect(page.getByText(/\d+×\d+px/)).toBeVisible()
  await assertNoSeriousViolations(page)
})

test('the About and Calibration pages have no serious/critical accessibility violations', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'About' }).click()
  await assertNoSeriousViolations(page)

  await page.getByRole('button', { name: 'Back to editor' }).click()
  await page.getByRole('button', { name: 'Calibration' }).click()
  await assertNoSeriousViolations(page)
})

test('dark mode has no serious/critical accessibility violations', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Switch to dark mode/ }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await assertNoSeriousViolations(page)

  await page.locator('input[type="file"][accept="image/*"]').setInputFiles(ensureSamplePng())
  await expect(page.getByText(/\d+×\d+px/)).toBeVisible()
  await assertNoSeriousViolations(page)
})
