import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FORMAT_PRESETS } from '../../../data/formats'
import { computeTileSourcePxRect } from '../../../engine/slicing'
import { CropImageAreaOverlay } from '../CropImageAreaOverlay'

const format = FORMAT_PRESETS[0]
const gaps = { x: 3, y: 3, marginX: 5, marginY: 5 }
const cropSize = { width: 400, height: 300 }

describe('CropImageAreaOverlay', () => {
  it('renders one box per grid tile', () => {
    const grid = { rows: 2, cols: 3 }
    const { container } = render(
      <CropImageAreaOverlay cropSize={cropSize} format={format} grid={grid} gaps={gaps} mapping="spatial" />,
    )
    expect(container.querySelectorAll('[style]').length).toBe(1 + grid.rows * grid.cols)
  })

  it('positions each box using the same math the export pipeline samples from', () => {
    const grid = { rows: 2, cols: 2 }
    const { container } = render(
      <CropImageAreaOverlay cropSize={cropSize} format={format} grid={grid} gaps={gaps} mapping="spatial" />,
    )
    const boxes = Array.from(container.querySelectorAll('.pointer-events-none > div'))
    const expected = computeTileSourcePxRect(
      { x: 0, y: 0, width: cropSize.width, height: cropSize.height },
      format,
      grid,
      gaps,
      0,
      0,
      'spatial',
    )
    const first = boxes[0] as HTMLElement
    expect(first.style.left).toBe(`${expected.x}px`)
    expect(first.style.top).toBe(`${expected.y}px`)
    expect(first.style.width).toBe(`${expected.width}px`)
    expect(first.style.height).toBe(`${expected.height}px`)
  })

  it('packs boxes edge-to-edge (no gaps) under seamless mapping', () => {
    const grid = { rows: 1, cols: 2 }
    const { container } = render(
      <CropImageAreaOverlay cropSize={cropSize} format={format} grid={grid} gaps={gaps} mapping="seamless" />,
    )
    const boxes = Array.from(container.querySelectorAll('.pointer-events-none > div')) as HTMLElement[]
    const left = boxes[0]
    const right = boxes[1]
    expect(parseFloat(left.style.left) + parseFloat(left.style.width)).toBeCloseTo(parseFloat(right.style.left), 5)
  })
})
