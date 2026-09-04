#!/usr/bin/env node
// Generates public/apple-touch-icon.png (180x180, opaque background — iOS
// applies its own rounded-corner mask and ignores transparency) from the
// existing favicon.svg, so home-screen bookmarks/social previews on iOS get
// a proper icon instead of a generic screenshot thumbnail.
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SVG = readFileSync(join(ROOT, 'public', 'favicon.svg'), 'utf-8')
const OUT_FILE = join(ROOT, 'public', 'apple-touch-icon.png')

const SIZE = 180

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body { margin:0; padding:0; width:${SIZE}px; height:${SIZE}px; background:#fafaf7; }
  .wrap { width:${SIZE}px; height:${SIZE}px; display:flex; align-items:center; justify-content:center; }
  svg { width:75%; height:75%; }
</style></head>
<body><div class="wrap">${SVG}</div></body></html>`

const tempHtmlPath = join(tmpdir(), `framosaic-apple-touch-icon-${Date.now()}.html`)
writeFileSync(tempHtmlPath, html)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 })
await page.goto(pathToFileURL(tempHtmlPath).href)
await page.waitForTimeout(100)
await page.screenshot({ path: OUT_FILE })
await browser.close()

console.log(`wrote ${OUT_FILE}`)
