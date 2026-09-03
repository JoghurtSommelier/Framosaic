import * as Comlink from 'comlink'
import type { ExportWorkerApi } from '../workers/export.worker'
import { renderTileBlob, type TileRenderParams } from './renderTile'

export interface ExportEngine {
  usingWorker: boolean
  renderTile: (params: TileRenderParams, row: number, col: number) => Promise<Blob>
  dispose: () => void
}

/**
 * Prefers an OffscreenCanvas-backed Web Worker (spec §6: slicing/export must
 * not block the UI thread). Falls back to rendering on the main thread when
 * Workers or OffscreenCanvas aren't available (spec §7 browser-compat note).
 */
export async function createExportEngine(sourceCanvas: HTMLCanvasElement): Promise<ExportEngine> {
  const supportsWorkerPath = typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined'

  if (supportsWorkerPath) {
    try {
      const worker = new Worker(new URL('../workers/export.worker.ts', import.meta.url), { type: 'module' })
      const api = Comlink.wrap<ExportWorkerApi>(worker)
      const bitmap = await createImageBitmap(sourceCanvas)
      await api.setSource(Comlink.transfer(bitmap, [bitmap]))
      return {
        usingWorker: true,
        renderTile: (params, row, col) => api.renderTile(params, row, col),
        dispose: () => {
          void api.dispose()
          worker.terminate()
        },
      }
    } catch {
      // Fall through to the main-thread path below.
    }
  }

  const bitmap = await createImageBitmap(sourceCanvas)
  return {
    usingWorker: false,
    renderTile: (params, row, col) => renderTileBlob(bitmap, params, row, col),
    dispose: () => bitmap.close(),
  }
}
