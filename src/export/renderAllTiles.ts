import type { Grid } from '../types/project'
import type { ExportEngine } from './exportApi'
import type { TileRenderParams } from './renderTile'

export interface ExportProgress {
  completed: number
  total: number
}

export interface RenderedTile {
  row: number
  col: number
  blob: Blob
}

export async function renderAllTiles(
  engine: ExportEngine,
  params: TileRenderParams,
  grid: Grid,
  onProgress?: (progress: ExportProgress) => void,
): Promise<RenderedTile[]> {
  const tiles: RenderedTile[] = []
  const total = grid.rows * grid.cols
  let completed = 0

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const blob = await engine.renderTile(params, row, col)
      tiles.push({ row, col, blob })
      completed += 1
      onProgress?.({ completed, total })
    }
  }

  return tiles
}
