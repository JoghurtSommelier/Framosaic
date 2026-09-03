import { z } from 'zod'
import { useProjectStore } from '../store/projectStore'
import { ProjectSchema, type Project } from '../types/project'
import { downloadBlob } from './download'

export function projectFromStore(): Project {
  const s = useProjectStore.getState()
  return {
    version: 1,
    format: s.format,
    grid: s.grid,
    gaps: s.gaps,
    crop: s.crop,
    adjustments: s.adjustments,
    export: s.exportSettings,
    mapping: s.mapping,
    units: s.units,
  }
}

export function saveProjectFile(filename = 'framosaic-project.json'): void {
  const project = ProjectSchema.parse(projectFromStore())
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export interface LoadProjectResult {
  success: boolean
  error?: string
}

/** Loads a saved project's settings into the store. The source image is never part of the file (spec §6) — re-upload it separately. */
export async function loadProjectFile(file: File): Promise<LoadProjectResult> {
  try {
    const text = await file.text()
    const project = ProjectSchema.parse(JSON.parse(text))
    const store = useProjectStore.getState()
    store.setFormat(project.format)
    store.setGrid(project.grid)
    store.setGaps(project.gaps)
    if (project.crop) store.setCrop(project.crop)
    store.setAdjustments(project.adjustments)
    store.setExportSettings(project.export)
    store.setMapping(project.mapping)
    store.setUnits(project.units)
    return { success: true }
  } catch (err) {
    if (err instanceof z.ZodError || err instanceof SyntaxError) {
      return { success: false, error: 'That file doesn’t look like a valid Framosaic project.' }
    }
    return { success: false, error: 'Could not read that file.' }
  }
}
