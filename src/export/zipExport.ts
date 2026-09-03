import { tileFilename } from '../lib/tileNumbering'
import type { Grid } from '../types/project'
import type { ExportEngine } from './exportApi'
import { renderAllTiles, type ExportProgress } from './renderAllTiles'
import type { TileRenderParams } from './renderTile'

export type { ExportProgress } from './renderAllTiles'

/** Renders every tile and packs them into a ZIP, named per spec §3.1 (kachel_r{row}_c{col}_nr{index}). */
export async function buildExportZip(
  engine: ExportEngine,
  params: TileRenderParams,
  grid: Grid,
  onProgress?: (progress: ExportProgress) => void,
): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const extension = params.exportSettings.format === 'jpeg' ? 'jpg' : 'png'

  const tiles = await renderAllTiles(engine, params, grid, onProgress)
  for (const tile of tiles) {
    zip.file(tileFilename(tile.row, tile.col, grid.cols, extension), tile.blob)
  }

  return zip.generateAsync({ type: 'blob' })
}
