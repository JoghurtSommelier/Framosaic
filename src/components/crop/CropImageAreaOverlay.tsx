import type { Size } from 'react-easy-crop'
import { computeTileSourcePxRect } from '../../engine/slicing'
import type { Format } from '../../types/format'
import type { Gaps, Grid, Mapping } from '../../types/project'

/**
 * Draws a box for every tile's actual image area within the crop rect,
 * using the same math the export pipeline uses to sample each tile —
 * replaces react-easy-crop's built-in rule-of-thirds grid, which had no
 * relation to the real grid/gap/border layout being cropped for.
 */
export function CropImageAreaOverlay({
  cropSize,
  format,
  grid,
  gaps,
  mapping,
}: {
  cropSize: Size
  format: Format
  grid: Grid
  gaps: Gaps
  mapping: Mapping
}) {
  const cropPx = { x: 0, y: 0, width: cropSize.width, height: cropSize.height }
  const boxes = []
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      boxes.push({
        key: `${row}-${col}`,
        rect: computeTileSourcePxRect(cropPx, format, grid, gaps, row, col, mapping),
      })
    }
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{ width: cropSize.width, height: cropSize.height, transform: 'translate(-50%, -50%)' }}
    >
      {boxes.map(({ key, rect }) => (
        <div
          key={key}
          className="absolute border border-white/80"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
          }}
        />
      ))}
    </div>
  )
}
