import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_GRID } from '../../types/project'
import { canRedo, canUndo, redo, resetHistoryForTesting, undo } from '../history'
import { useProjectStore } from '../projectStore'

beforeEach(() => {
  vi.useFakeTimers()
  useProjectStore.setState({ grid: DEFAULT_GRID })
  resetHistoryForTesting()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('history', () => {
  it('starts with nothing to undo or redo', () => {
    expect(canUndo()).toBe(false)
    expect(canRedo()).toBe(false)
  })

  it('records a debounced snapshot and supports undo/redo', () => {
    useProjectStore.getState().setGrid({ rows: 6, cols: 6 })
    vi.advanceTimersByTime(500)

    expect(canUndo()).toBe(true)
    expect(useProjectStore.getState().grid).toEqual({ rows: 6, cols: 6 })

    undo()
    expect(useProjectStore.getState().grid).toEqual(DEFAULT_GRID)
    expect(canRedo()).toBe(true)

    redo()
    expect(useProjectStore.getState().grid).toEqual({ rows: 6, cols: 6 })
    expect(canRedo()).toBe(false)
  })

  it('coalesces rapid changes within the debounce window into one history entry', () => {
    useProjectStore.getState().setGrid({ rows: 6, cols: 6 })
    vi.advanceTimersByTime(100)
    useProjectStore.getState().setGrid({ rows: 7, cols: 7 })
    vi.advanceTimersByTime(500)

    undo()
    expect(useProjectStore.getState().grid).toEqual(DEFAULT_GRID)
    expect(canUndo()).toBe(false)
  })

  it('clears the redo stack once a new change is made after an undo', () => {
    useProjectStore.getState().setGrid({ rows: 6, cols: 6 })
    vi.advanceTimersByTime(500)
    undo()
    expect(canRedo()).toBe(true)

    useProjectStore.getState().setGrid({ rows: 8, cols: 8 })
    vi.advanceTimersByTime(500)
    expect(canRedo()).toBe(false)
  })
})
