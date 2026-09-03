#!/usr/bin/env node
// Generates small, procedurally-drawn abstract gradient tiles for the
// landing page's scrolling mosaic banner (spec §5.6's default: bundled,
// royalty-free sample art — not real photos, so there's no licensing
// question). Run once; output is committed to public/samples/.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'samples')
const SIZE = 320

let crcTable = null
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c
    }
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function buildGradientPng({ size, stops, focus }) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type RGB

  const raw = Buffer.alloc((size * 3 + 1) * size)
  let p = 0
  for (let y = 0; y < size; y++) {
    raw[p++] = 0
    const t = y / size
    const segment = t < 0.5 ? 0 : 1
    const localT = segment === 0 ? t / 0.5 : (t - 0.5) / 0.5
    const [r0, g0, b0] = stops[segment]
    const [r1, g1, b1] = stops[segment + 1]
    let baseR = lerp(r0, r1, localT)
    let baseG = lerp(g0, g1, localT)
    let baseB = lerp(b0, b1, localT)

    for (let x = 0; x < size; x++) {
      let r = baseR
      let g = baseG
      let b = baseB
      if (focus) {
        const dx = x - focus.x * size
        const dy = y - focus.y * size
        const dist = Math.sqrt(dx * dx + dy * dy)
        const radius = focus.r * size
        if (dist < radius) {
          const glow = 1 - dist / radius
          r = lerp(r, focus.color[0], glow * 0.85)
          g = lerp(g, focus.color[1], glow * 0.85)
          b = lerp(b, focus.color[2], glow * 0.85)
        }
      }
      raw[p++] = Math.max(0, Math.min(255, Math.round(r)))
      raw[p++] = Math.max(0, Math.min(255, Math.round(g)))
      raw[p++] = Math.max(0, Math.min(255, Math.round(b)))
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const PALETTES = [
  { stops: [[255, 183, 94], [255, 94, 121], [70, 40, 110]], focus: { x: 0.5, y: 0.62, r: 0.22, color: [255, 235, 190] } },
  { stops: [[76, 201, 240], [67, 97, 238], [58, 12, 163]], focus: { x: 0.3, y: 0.3, r: 0.3, color: [220, 245, 255] } },
  { stops: [[247, 37, 133], [181, 23, 158], [114, 9, 183]], focus: { x: 0.7, y: 0.25, r: 0.25, color: [255, 214, 240] } },
  { stops: [[8, 145, 178], [16, 185, 129], [253, 224, 71]], focus: null },
  { stops: [[251, 146, 60], [239, 68, 68], [124, 58, 237]], focus: { x: 0.5, y: 0.5, r: 0.35, color: [255, 241, 214] } },
  { stops: [[15, 23, 42], [30, 64, 175], [56, 189, 248]], focus: { x: 0.65, y: 0.7, r: 0.3, color: [186, 230, 253] } },
  { stops: [[132, 204, 22], [16, 185, 129], [6, 95, 70]], focus: null },
  { stops: [[244, 63, 94], [251, 113, 133], [254, 205, 211]], focus: { x: 0.4, y: 0.4, r: 0.3, color: [255, 255, 255] } },
  { stops: [[99, 102, 241], [168, 85, 247], [217, 70, 239]], focus: { x: 0.5, y: 0.2, r: 0.25, color: [237, 233, 254] } },
  { stops: [[251, 191, 36], [249, 115, 22], [190, 24, 93]], focus: { x: 0.3, y: 0.6, r: 0.28, color: [255, 237, 213] } },
]

mkdirSync(OUT_DIR, { recursive: true })
PALETTES.forEach((palette, i) => {
  const png = buildGradientPng({ size: SIZE, stops: palette.stops, focus: palette.focus })
  const path = join(OUT_DIR, `tile-${i + 1}.png`)
  writeFileSync(path, png)
  console.log(`wrote ${path} (${png.length} bytes)`)
})
