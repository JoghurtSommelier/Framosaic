#!/usr/bin/env node
// Generates the social-share card (Open Graph / Twitter) — the standard
// 1200x630 canvas, built the same way as generate-wall-showcase.mjs: the
// same procedurally-generated tile art plus the wordmark and tagline, so
// there's zero licensing question and it stays visually consistent with
// the rest of the bundled placeholder art. Output is committed to public/.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SAMPLES_DIR = join(ROOT, 'public', 'samples')
const OUT_FILE = join(ROOT, 'public', 'og-image.png')

const WIDTH = 1200
const HEIGHT = 630

const tileUrls = Array.from({ length: 10 }, (_, i) => pathToFileURL(join(SAMPLES_DIR, `tile-${i + 1}.png`)).href)

const layout = [
  { x: -40, y: 60, w: 150, h: 190, rot: -8 },
  { x: 900, y: 40, w: 150, h: 190, rot: 6 },
  { x: 1030, y: 260, w: 150, h: 190, rot: -5 },
  { x: -60, y: 300, w: 150, h: 190, rot: 5 },
  { x: 60, y: 440, w: 150, h: 190, rot: -3 },
  { x: 950, y: 440, w: 150, h: 190, rot: 4 },
]

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body { margin:0; padding:0; width:${WIDTH}px; height:${HEIGHT}px; overflow:hidden; }
  body {
    background:
      radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35), transparent 55%),
      linear-gradient(180deg, #e9e3d8 0%, #ddd4c4 55%, #cfc3ae 100%);
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .tile {
    position: absolute;
    background: #fafaf7;
    padding: 8px 8px 26px 8px;
    border-radius: 3px;
    box-shadow: 0 14px 24px rgba(30,20,10,0.26), 0 3px 6px rgba(30,20,10,0.14);
  }
  .tile img { display:block; width:100%; height:100%; object-fit:cover; border-radius: 1px; }
  .copy {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .wordmark {
    font-size: 84px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #1c1a16;
  }
  .tagline {
    margin-top: 14px;
    font-size: 28px;
    font-weight: 500;
    color: #4a453c;
    max-width: 640px;
  }
</style></head>
<body>
  ${layout
    .map(
      (t, i) => `
    <div class="tile" style="left:${t.x}px; top:${t.y}px; width:${t.w}px; height:${t.h}px; transform: rotate(${t.rot}deg);">
      <img src="${tileUrls[i % tileUrls.length]}" />
    </div>`,
    )
    .join('')}
  <div class="copy">
    <div class="wordmark">Framosaic</div>
    <div class="tagline">Turn a photo into a wall mosaic of instant-film prints</div>
  </div>
</body></html>`

mkdirSync(dirname(OUT_FILE), { recursive: true })

const tempHtmlPath = join(tmpdir(), `framosaic-og-image-${Date.now()}.html`)
writeFileSync(tempHtmlPath, html)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 })
await page.goto(pathToFileURL(tempHtmlPath).href)
await page.waitForTimeout(200)
await page.screenshot({ path: OUT_FILE })
await browser.close()

console.log(`wrote ${OUT_FILE}`)
