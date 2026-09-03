import { beforeEach, describe, expect, it } from 'vitest'
import { FORMAT_PRESETS } from '../../data/formats'
import { useProjectStore } from '../../store/projectStore'
import { DEFAULT_GAPS, DEFAULT_GRID, ProjectSchema } from '../../types/project'
import { loadProjectFile, projectFromStore } from '../projectFile'

beforeEach(() => {
  useProjectStore.setState({
    format: FORMAT_PRESETS[0],
    grid: DEFAULT_GRID,
    gaps: DEFAULT_GAPS,
    crop: null,
    units: 'mm',
    mapping: 'spatial',
  })
})

describe('projectFromStore', () => {
  it('produces a schema-valid project from the current store state', () => {
    const project = projectFromStore()
    expect(() => ProjectSchema.parse(project)).not.toThrow()
    expect(project.version).toBe(1)
    expect(project.format).toEqual(FORMAT_PRESETS[0])
  })

  it('allows a null crop (project saved before cropping)', () => {
    const project = projectFromStore()
    expect(project.crop).toBeNull()
    expect(() => ProjectSchema.parse(project)).not.toThrow()
  })
})

describe('loadProjectFile', () => {
  it('applies a valid project file to the store', async () => {
    useProjectStore.getState().setGrid({ rows: 9, cols: 9 })
    const project = projectFromStore()
    const file = new File([JSON.stringify(project)], 'project.json', { type: 'application/json' })

    useProjectStore.setState({ grid: DEFAULT_GRID }) // change state before loading, to prove load overwrites it
    const result = await loadProjectFile(file)

    expect(result.success).toBe(true)
    expect(useProjectStore.getState().grid).toEqual({ rows: 9, cols: 9 })
  })

  it('rejects invalid JSON with a friendly error, leaving the store untouched', async () => {
    const file = new File(['not json'], 'broken.json', { type: 'application/json' })
    const before = useProjectStore.getState().grid

    const result = await loadProjectFile(file)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    expect(useProjectStore.getState().grid).toEqual(before)
  })

  it('rejects a well-formed but schema-invalid JSON file', async () => {
    const file = new File([JSON.stringify({ hello: 'world' })], 'wrong-shape.json', {
      type: 'application/json',
    })

    const result = await loadProjectFile(file)

    expect(result.success).toBe(false)
  })
})
