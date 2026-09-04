import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ensureSamplePng } from './utils/samplePng'

async function assertNoSeriousViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
}

async function goToEditor(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create mosaic' }).click()
  await expect(page.getByText('1. Upload a photo')).toBeVisible()
}

test('the landing page has no serious/critical accessibility violations', async ({ page }) => {
  await page.goto('/')
  await assertNoSeriousViolations(page)
})

test('the landing page in dark mode has no serious/critical accessibility violations', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Switch to dark mode/ }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await assertNoSeriousViolations(page)
})

test('the empty editor has no serious/critical accessibility violations', async ({ page }) => {
  await goToEditor(page)
  await assertNoSeriousViolations(page)
})

test('the editor with a photo loaded has no serious/critical accessibility violations', async ({ page }) => {
  await goToEditor(page)
  await page.locator('input[type="file"][accept="image/*"]').setInputFiles(ensureSamplePng())
  await expect(page.getByText(/\d+×\d+px/)).toBeVisible()
  await assertNoSeriousViolations(page)
})

test('the About page has no serious/critical accessibility violations', async ({ page }) => {
  await goToEditor(page)

  await page.getByRole('button', { name: 'About' }).click()
  await assertNoSeriousViolations(page)
})

test('the editor in dark mode has no serious/critical accessibility violations', async ({ page }) => {
  await goToEditor(page)
  await page.getByRole('button', { name: /Switch to dark mode/ }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await assertNoSeriousViolations(page)

  await page.locator('input[type="file"][accept="image/*"]').setInputFiles(ensureSamplePng())
  await expect(page.getByText(/\d+×\d+px/)).toBeVisible()
  await assertNoSeriousViolations(page)
})
