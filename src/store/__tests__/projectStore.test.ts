import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FORMAT_PRESETS } from '../../data/formats'
import { DEFAULT_GAPS, DEFAULT_GRID } from '../../types/project'
import { useProjectStore } from '../projectStore'

function resetStore() {
  useProjectStore.setState({
    format: FORMAT_PRESETS[0],
    grid: DEFAULT_GRID,
    gaps: DEFAULT_GAPS,
    crop: null,
    sourceImage: null,
    units: 'mm',
  })
}

beforeEach(resetStore)

describe('useProjectStore', () => {
  it('defaults to the first preset format and default grid/gaps', () => {
    const state = useProjectStore.getState()
    expect(state.format).toBe(FORMAT_PRESETS[0])
    expect(state.grid).toEqual(DEFAULT_GRID)
    expect(state.gaps).toEqual(DEFAULT_GAPS)
  })

  it('setGaps merges partial updates instead of replacing the object', () => {
    useProjectStore.getState().setGaps({ x: 10 })
    const gaps = useProjectStore.getState().gaps
    expect(gaps.x).toBe(10)
    expect(gaps.y).toBe(DEFAULT_GAPS.y)
    expect(gaps.marginX).toBe(DEFAULT_GAPS.marginX)
  })

  it('setAdjustments merges partial updates', () => {
    useProjectStore.getState().setAdjustments({ grayscale: true })
    const adjustments = useProjectStore.getState().adjustments
    expect(adjustments.grayscale).toBe(true)
    expect(adjustments.brightness).toBe(0)
  })

  it('setSourceImage clears the current crop', () => {
    useProjectStore.setState({ crop: { x: 1, y: 2, width: 3, height: 4, rotation: 0 } })
    useProjectStore.getState().setSourceImage(null)
    expect(useProjectStore.getState().crop).toBeNull()
  })

  it('setSourceImage revokes the previous preview URL when replaced', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const canvas = document.createElement('canvas')
    const first = {
      fullCanvas: canvas,
      width: 100,
      height: 100,
      previewUrl: 'blob:first',
      previewWidth: 100,
      previewHeight: 100,
      name: 'a.png',
    }
    const second = { ...first, previewUrl: 'blob:second' }

    useProjectStore.getState().setSourceImage(first)
    useProjectStore.getState().setSourceImage(second)

    expect(revoke).toHaveBeenCalledWith('blob:first')
    revoke.mockRestore()
  })
})
