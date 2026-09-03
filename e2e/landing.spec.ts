import { expect, test } from '@playwright/test'

test('the landing page renders the hero and an animated, transform-only mosaic banner', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Turn one photo into a wall of instant prints/ })).toBeVisible()

  const track = page.locator('.marquee-track').first()
  await expect(track).toBeVisible()
  const animationName = await track.evaluate((el) => getComputedStyle(el).animationName)
  expect(animationName).toBe('marquee')
})

test('prefers-reduced-motion swaps the banner to a static grid (no marquee tracks)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Turn one photo into a wall of instant prints/ })).toBeVisible()
  await expect(page.locator('.marquee-track')).toHaveCount(0)
})

test('both CTAs navigate from the landing page into the editor', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create mosaic' }).click()
  await expect(page.getByText('1. Upload a photo')).toBeVisible()

  // The header wordmark navigates back to the landing page.
  await page.getByRole('button', { name: 'Framosaic' }).click()
  await expect(page.getByRole('heading', { name: /Turn one photo into a wall of instant prints/ })).toBeVisible()
})
