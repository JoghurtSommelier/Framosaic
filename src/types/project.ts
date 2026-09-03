import { z } from 'zod'
import { FormatSchema } from './format'

export const GridSchema = z.object({
  rows: z.number().int().min(1).max(20),
  cols: z.number().int().min(1).max(20),
})
export type Grid = z.infer<typeof GridSchema>

export const GapsSchema = z.object({
  x: z.number().min(0).max(300),
  y: z.number().min(0).max(300),
  marginX: z.number().min(0).max(300),
  marginY: z.number().min(0).max(300),
})
export type Gaps = z.infer<typeof GapsSchema>

export const CropSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number(),
})
export type Crop = z.infer<typeof CropSchema>

export const AdjustmentsSchema = z.object({
  brightness: z.number(),
  contrast: z.number(),
  saturation: z.number(),
  grayscale: z.boolean(),
})
export type Adjustments = z.infer<typeof AdjustmentsSchema>

export const ExportModeSchema = z.enum(['imageArea', 'fullFrame'])
export type ExportMode = z.infer<typeof ExportModeSchema>

export const ExportFormatSchema = z.enum(['png', 'jpeg'])
export type ExportFormat = z.infer<typeof ExportFormatSchema>

export const ExportSettingsSchema = z.object({
  dpi: z.number().int().positive(),
  mode: ExportModeSchema,
  format: ExportFormatSchema,
  bleedMm: z.number().min(0),
})
export type ExportSettings = z.infer<typeof ExportSettingsSchema>

export const MappingSchema = z.enum(['spatial', 'seamless'])
export type Mapping = z.infer<typeof MappingSchema>

export const UnitsSchema = z.enum(['mm', 'cm', 'inch'])
export type Units = z.infer<typeof UnitsSchema>

export const ProjectSchema = z.object({
  version: z.literal(1),
  format: FormatSchema,
  grid: GridSchema,
  gaps: GapsSchema,
  crop: CropSchema.nullable(),
  adjustments: AdjustmentsSchema,
  export: ExportSettingsSchema,
  mapping: MappingSchema,
  units: UnitsSchema,
})
export type Project = z.infer<typeof ProjectSchema>

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  grayscale: false,
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  dpi: 300,
  mode: 'imageArea',
  format: 'png',
  bleedMm: 0,
}

export const DEFAULT_GAPS: Gaps = { x: 3, y: 3, marginX: 0, marginY: 0 }
export const DEFAULT_GRID: Grid = { rows: 4, cols: 5 }
