import { useProjectStore } from './projectStore'
import type { Format } from '../types/format'
import type { Adjustments, Crop, ExportSettings, Gaps, Grid, Mapping, Units } from '../types/project'

interface HistorySnapshot {
  format: Format
  grid: Grid
  gaps: Gaps
  crop: Crop | null
  adjustments: Adjustments
  exportSettings: ExportSettings
  mapping: Mapping
  units: Units
}

const HISTORY_LIMIT = 50
const DEBOUNCE_MS = 400

function snapshotOf(state: ReturnType<typeof useProjectStore.getState>): HistorySnapshot {
  return {
    format: state.format,
    grid: state.grid,
    gaps: state.gaps,
    crop: state.crop,
    adjustments: state.adjustments,
    exportSettings: state.exportSettings,
    mapping: state.mapping,
    units: state.units,
  }
}

let past: HistorySnapshot[] = []
let future: HistorySnapshot[] = []
let lastRecorded: HistorySnapshot = snapshotOf(useProjectStore.getState())
let isApplyingHistory = false
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const listeners = new Set<() => void>()
function notifyListeners(): void {
  listeners.forEach((listener) => listener())
}

export function subscribeHistory(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function canUndo(): boolean {
  return past.length > 0
}

export function canRedo(): boolean {
  return future.length > 0
}

/** Test-only: clears history state so each test starts fresh (history is otherwise process-lifetime module state). */
export function resetHistoryForTesting(): void {
  past = []
  future = []
  lastRecorded = snapshotOf(useProjectStore.getState())
}

function recordIfChanged(): void {
  const current = snapshotOf(useProjectStore.getState())
  if (JSON.stringify(current) === JSON.stringify(lastRecorded)) return
  past.push(lastRecorded)
  if (past.length > HISTORY_LIMIT) past.shift()
  future = []
  lastRecorded = current
  notifyListeners()
}

useProjectStore.subscribe(() => {
  if (isApplyingHistory) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(recordIfChanged, DEBOUNCE_MS)
})

function applySnapshot(snapshot: HistorySnapshot): void {
  isApplyingHistory = true
  lastRecorded = snapshot
  useProjectStore.setState(snapshot)
  isApplyingHistory = false
  notifyListeners()
}

export function undo(): void {
  const previous = past.pop()
  if (!previous) return
  future.push(lastRecorded)
  applySnapshot(previous)
}

export function redo(): void {
  const next = future.pop()
  if (!next) return
  past.push(lastRecorded)
  applySnapshot(next)
}
