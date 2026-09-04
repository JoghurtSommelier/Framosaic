/** Row-major running number for tile (row, col), 1-based (spec §4: "Reihe/Spalte + laufende Nummer"). */
export function tileNumber(row: number, col: number, cols: number): number {
  return row * cols + col + 1
}

export function tileFilename(row: number, col: number, cols: number, extension: string): string {
  return `tile_r${row + 1}_c${col + 1}_n${tileNumber(row, col, cols)}.${extension}`
}

/** The row/col part of tileFilename, shown on the gluing template so its labels match the exported filenames. */
export function tileLabel(row: number, col: number): string {
  return `R${row + 1}C${col + 1}`
}
