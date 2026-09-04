import { describe, expect, it } from 'vitest'
import { tileFilename, tileLabel, tileNumber } from '../tileNumbering'

describe('tileNumber', () => {
  it('numbers row-major, 1-based, starting at the top-left', () => {
    expect(tileNumber(0, 0, 4)).toBe(1)
    expect(tileNumber(0, 3, 4)).toBe(4)
    expect(tileNumber(1, 0, 4)).toBe(5)
    expect(tileNumber(2, 1, 4)).toBe(10)
  })
})

describe('tileFilename', () => {
  it('matches the spec pattern tile_r{row}_c{col}_n{index}, 1-indexed', () => {
    expect(tileFilename(0, 0, 4, 'png')).toBe('tile_r1_c1_n1.png')
    expect(tileFilename(1, 2, 4, 'jpg')).toBe('tile_r2_c3_n7.jpg')
  })
})

describe('tileLabel', () => {
  it('matches the r{row}_c{col} part of tileFilename, 1-indexed', () => {
    expect(tileLabel(0, 0)).toBe('R1C1')
    expect(tileLabel(1, 2)).toBe('R2C3')
  })
})
