#!/usr/bin/env node
// Generates the bundled fallback image for the landing page's "See it on the
// wall" section (spec §5.6) — a wide, wall-styled composition of the same
// procedurally-generated tile art used in the hero banner, so there's a
// working default with zero real photos/licensing concerns. Run once (after
// generate-banner-tiles.mjs); output is committed to public/showcase/wall/.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SAMPLES_DIR = join(ROOT, 'public', 'samples')
const OUT_DIR = join(ROOT, 'public', 'showcase', 'wall')
const OUT_FILE = join(OUT_DIR, 'wall-source.png')

const WIDTH = 1600
const HEIGHT = 1000

const tileUrls = Array.from({ length: 10 }, (_, i) => pathToFileURL(join(SAMPLES_DIR, `tile-${i + 1}.png`)).href)

const layout = [
  { x: 90, y: 160, w: 190, h: 240, rot: -4 },
  { x: 320, y: 100, w: 190, h: 240, rot: 3 },
  { x: 560, y: 190, w: 190, h: 240, rot: -2 },
  { x: 260, y: 400, w: 190, h: 240, rot: 5 },
  { x: 60, y: 560, w: 190, h: 240, rot: -3 },
  { x: 800, y: 120, w: 190, h: 240, rot: -5 },
  { x: 1030, y: 200, w: 190, h: 240, rot: 4 },
  { x: 1270, y: 130, w: 190, h: 240, rot: -3 },
  { x: 950, y: 460, w: 190, h: 240, rot: 2 },
  { x: 1190, y: 420, w: 190, h: 240, rot: -4 },
]

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body { margin:0; padding:0; width:${WIDTH}px; height:${HEIGHT}px; overflow:hidden; }
  body {
    background:
      radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35), transparent 55%),
      linear-gradient(180deg, #e9e3d8 0%, #ddd4c4 55%, #cfc3ae 100%);
    position: relative;
    font-family: sans-serif;
  }
  .tile {
    position: absolute;
    background: #fafaf7;
    padding: 10px 10px 34px 10px;
    border-radius: 3px;
    box-shadow: 0 18px 30px rgba(30,20,10,0.28), 0 4px 8px rgba(30,20,10,0.15);
  }
  .tile img { display:block; width:100%; height:100%; object-fit:cover; border-radius: 1px; }
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
</body></html>`

mkdirSync(OUT_DIR, { recursive: true })

// Written to a real file (rather than page.setContent) so file:// <img> src
// references resolve — setContent's synthetic document has no base URL.
const tempHtmlPath = join(tmpdir(), `framosaic-wall-showcase-${Date.now()}.html`)
writeFileSync(tempHtmlPath, html)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 })
await page.goto(pathToFileURL(tempHtmlPath).href)
await page.waitForTimeout(200)
await page.screenshot({ path: OUT_FILE })
await browser.close()

console.log(`wrote ${OUT_FILE}`)
