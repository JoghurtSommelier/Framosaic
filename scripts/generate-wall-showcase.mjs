#!/usr/bin/env node
// Generates the bundled fallback source photo for the landing page's "See
// it on the wall" section (spec §5.6) — a single square, coherent image
// (a procedurally-drawn sunset scene, zero licensing concerns) that the
// section slices into a 3x3 grid via CSS, the same way a real photo would
// be sliced across a 3x3 mosaic. Output is committed to public/showcase/wall/.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'showcase', 'wall')
const OUT_FILE = join(OUT_DIR, 'wall-source.png')

const SIZE = 1200

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body { margin:0; padding:0; width:${SIZE}px; height:${SIZE}px; overflow:hidden; }
  body {
    position: relative;
    background: linear-gradient(180deg, #2b3a67 0%, #5c5470 24%, #d9695f 48%, #f0a868 62%, #f6cf7a 74%, #f7e6a3 100%);
  }
  .sun {
    position: absolute;
    left: 50%;
    top: 46%;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle at 50% 45%, #fff3d0 0%, #ffd873 35%, #ff9d5c 70%, rgba(255,157,92,0) 100%);
  }
  .mountain {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
  }
  .bird {
    position: absolute;
    border-bottom: 3px solid rgba(30,20,40,0.55);
    border-radius: 50%;
    width: 26px;
    height: 13px;
    border-top: none;
  }
</style></head>
<body>
  <div class="sun"></div>
  <svg class="mountain" viewBox="0 0 1200 1200" width="1200" height="1200" preserveAspectRatio="none">
    <polygon points="0,1200 0,760 180,560 340,700 520,420 700,650 860,500 1050,720 1200,600 1200,1200" fill="#1f1b2e" opacity="0.9" />
    <polygon points="0,1200 0,880 220,760 420,880 640,740 900,860 1200,780 1200,1200" fill="#140f22" opacity="0.95" />
  </svg>
  <div class="bird" style="left:220px; top:180px; transform: rotate(-8deg);"></div>
  <div class="bird" style="left:270px; top:165px; transform: rotate(-8deg) scale(0.8);"></div>
  <div class="bird" style="left:860px; top:230px; transform: rotate(6deg) scale(0.9);"></div>
</body></html>`

mkdirSync(OUT_DIR, { recursive: true })

const tempHtmlPath = join(tmpdir(), `framosaic-wall-showcase-${Date.now()}.html`)
writeFileSync(tempHtmlPath, html)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 })
await page.goto(pathToFileURL(tempHtmlPath).href)
await page.waitForTimeout(200)
await page.screenshot({ path: OUT_FILE })
await browser.close()

console.log(`wrote ${OUT_FILE}`)
