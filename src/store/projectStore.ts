import { create } from 'zustand'
import { FORMAT_PRESETS } from '../data/formats'
import type { Format } from '../types/format'
import {
  DEFAULT_ADJUSTMENTS,
  DEFAULT_EXPORT_SETTINGS,
  DEFAULT_GAPS,
  DEFAULT_GRID,
  type Adjustments,
  type Crop,
  type ExportSettings,
  type Gaps,
  type Grid,
  type Mapping,
  type Units,
} from '../types/project'

export interface SourceImage {
  /** Full-resolution, EXIF-normalized image — kept in memory for full-res export. */
  fullCanvas: HTMLCanvasElement
  width: number
  height: number
  /** Downscaled preview shown in the crop tool / mosaic preview. */
  previewUrl: string
  previewWidth: number
  previewHeight: number
  name: string
}

interface ProjectState {
  format: Format
  grid: Grid
  gaps: Gaps
  crop: Crop | null
  adjustments: Adjustments
  exportSettings: ExportSettings
  mapping: Mapping
  units: Units
  sourceImage: SourceImage | null

  setFormat: (format: Format) => void
  setGrid: (grid: Grid) => void
  setGaps: (gaps: Partial<Gaps>) => void
  setCrop: (crop: Crop) => void
  setAdjustments: (adjustments: Partial<Adjustments>) => void
  setExportSettings: (settings: Partial<ExportSettings>) => void
  setMapping: (mapping: Mapping) => void
  setUnits: (units: Units) => void
  setSourceImage: (image: SourceImage | null) => void
  resetCrop: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  format: FORMAT_PRESETS[0],
  grid: DEFAULT_GRID,
  gaps: DEFAULT_GAPS,
  crop: null,
  adjustments: DEFAULT_ADJUSTMENTS,
  exportSettings: DEFAULT_EXPORT_SETTINGS,
  mapping: 'spatial',
  units: 'mm',
  sourceImage: null,

  setFormat: (format) => set({ format }),
  setGrid: (grid) => set({ grid }),
  setGaps: (gaps) => set((s) => ({ gaps: { ...s.gaps, ...gaps } })),
  setCrop: (crop) => set({ crop }),
  setAdjustments: (adjustments) => set((s) => ({ adjustments: { ...s.adjustments, ...adjustments } })),
  setExportSettings: (settings) => set((s) => ({ exportSettings: { ...s.exportSettings, ...settings } })),
  setMapping: (mapping) => set({ mapping }),
  setUnits: (units) => set({ units }),
  setSourceImage: (image) => {
    const prev = get().sourceImage
    if (prev && prev.previewUrl !== image?.previewUrl) URL.revokeObjectURL(prev.previewUrl)
    set({ sourceImage: image, crop: null })
  },
  resetCrop: () => set({ crop: null }),
}))
