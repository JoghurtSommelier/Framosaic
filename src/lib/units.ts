import type { Units } from '../types/project'

export const MM_PER_INCH = 25.4

export function mmToUnit(mm: number, unit: Units): number {
  switch (unit) {
    case 'mm':
      return mm
    case 'cm':
      return mm / 10
    case 'inch':
      return mm / MM_PER_INCH
  }
}

export function unitToMm(value: number, unit: Units): number {
  switch (unit) {
    case 'mm':
      return value
    case 'cm':
      return value * 10
    case 'inch':
      return value * MM_PER_INCH
  }
}

export function formatMm(mm: number, unit: Units): string {
  const digits = unit === 'inch' ? 2 : 1
  return `${mmToUnit(mm, unit).toFixed(digits)} ${unit}`
}
