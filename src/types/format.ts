import { z } from 'zod'

export const OrientationSchema = z.enum(['portrait', 'landscape', 'square'])
export type Orientation = z.infer<typeof OrientationSchema>

export const FormatSchema = z.object({
  id: z.string(),
  label: z.string(),
  compatibleWith: z.string().optional(),
  filmWidth: z.number().positive(),
  filmHeight: z.number().positive(),
  imageWidth: z.number().positive(),
  imageHeight: z.number().positive(),
  borderTop: z.number().min(0),
  borderRight: z.number().min(0),
  borderBottom: z.number().min(0),
  borderLeft: z.number().min(0),
  orientation: OrientationSchema,
})
export type Format = z.infer<typeof FormatSchema>

/** Image area (plus its borders) must fit inside the film — see spec §7. */
export function validateFormat(format: Format): string[] {
  const errors: string[] = []
  const epsilon = 0.01
  if (format.imageWidth + format.borderLeft + format.borderRight > format.filmWidth + epsilon) {
    errors.push('Image area width plus left/right borders exceeds the film width.')
  }
  if (format.imageHeight + format.borderTop + format.borderBottom > format.filmHeight + epsilon) {
    errors.push('Image area height plus top/bottom borders exceeds the film height.')
  }
  return errors
}
