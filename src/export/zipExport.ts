import { tileFilename } from '../lib/tileNumbering'
import type { Grid } from '../types/project'
import type { ExportEngine } from './exportApi'
import type { TileRenderParams } from './renderTile'

export interface ExportProgress {
  completed: number
  total: number
}

/** Renders every tile and packs them into a ZIP, named per spec §3.1 (kachel_r{row}_c{col}_nr{index}). */
export async function buildExportZip(
  engine: ExportEngine,
  params: TileRenderParams,
  grid: Grid,
  onProgress?: (progress: ExportProgress) => void,
): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const total = grid.rows * grid.cols
  let completed = 0
  const extension = params.exportSettings.format === 'jpeg' ? 'jpg' : 'png'

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const blob = await engine.renderTile(params, row, col)
      zip.file(tileFilename(row, col, grid.cols, extension), blob)
      completed += 1
      onProgress?.({ completed, total })
    }
  }

  return zip.generateAsync({ type: 'blob' })
}
