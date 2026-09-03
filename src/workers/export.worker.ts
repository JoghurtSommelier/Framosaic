import * as Comlink from 'comlink'
import { renderTileBlob, type TileRenderParams } from '../export/renderTile'

let source: ImageBitmap | null = null

const api = {
  setSource(bitmap: ImageBitmap) {
    source?.close()
    source = bitmap
  },
  async renderTile(params: TileRenderParams, row: number, col: number): Promise<Blob> {
    if (!source) throw new Error('Export worker: no source image set')
    return renderTileBlob(source, params, row, col)
  },
  dispose() {
    source?.close()
    source = null
  },
}

export type ExportWorkerApi = typeof api

Comlink.expose(api)
