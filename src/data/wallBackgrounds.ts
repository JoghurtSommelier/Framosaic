export interface WallBackground {
  id: string
  label: string
  kind: 'color' | 'texture'
  color: string
}

export const WALL_BACKGROUNDS: WallBackground[] = [
  { id: 'white', label: 'White', kind: 'color', color: '#fafaf9' },
  { id: 'warm-gray', label: 'Warm gray', kind: 'color', color: '#d6d3d1' },
  { id: 'sage', label: 'Sage', kind: 'color', color: '#9caf88' },
  { id: 'terracotta', label: 'Terracotta', kind: 'color', color: '#c1694f' },
  { id: 'plaster', label: 'Plaster texture', kind: 'texture', color: '#e7e2d8' },
]

/** A subtle speckled-plaster canvas pattern, tiled behind the mosaic when the "texture" background is selected. */
export function createPlasterPattern(ctx: CanvasRenderingContext2D, baseColor: string): CanvasPattern | null {
  const tile = document.createElement('canvas')
  tile.width = 48
  tile.height = 48
  const tileCtx = tile.getContext('2d')
  if (!tileCtx) return null

  tileCtx.fillStyle = baseColor
  tileCtx.fillRect(0, 0, tile.width, tile.height)

  let seed = 42
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0xffffffff
  }

  for (let i = 0; i < 90; i++) {
    const x = random() * tile.width
    const y = random() * tile.height
    const shade = random() > 0.5 ? 255 : 0
    tileCtx.fillStyle = `rgba(${shade},${shade},${shade},${0.04 + random() * 0.05})`
    tileCtx.fillRect(x, y, 1.5, 1.5)
  }

  return ctx.createPattern(tile, 'repeat')
}
