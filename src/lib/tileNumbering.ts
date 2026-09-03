/** Row-major running number for tile (row, col), 1-based (spec §4: "Reihe/Spalte + laufende Nummer"). */
export function tileNumber(row: number, col: number, cols: number): number {
  return row * cols + col + 1
}

export function tileFilename(row: number, col: number, cols: number, extension: string): string {
  return `kachel_r${row + 1}_c${col + 1}_nr${tileNumber(row, col, cols)}.${extension}`
}
