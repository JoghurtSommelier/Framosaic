import { describe, expect, it } from 'vitest'
import { tileFilename, tileNumber } from '../tileNumbering'

describe('tileNumber', () => {
  it('numbers row-major, 1-based, starting at the top-left', () => {
    expect(tileNumber(0, 0, 4)).toBe(1)
    expect(tileNumber(0, 3, 4)).toBe(4)
    expect(tileNumber(1, 0, 4)).toBe(5)
    expect(tileNumber(2, 1, 4)).toBe(10)
  })
})

describe('tileFilename', () => {
  it('matches the spec pattern kachel_r{row}_c{col}_nr{index}, 1-indexed', () => {
    expect(tileFilename(0, 0, 4, 'png')).toBe('kachel_r1_c1_nr1.png')
    expect(tileFilename(1, 2, 4, 'jpg')).toBe('kachel_r2_c3_nr7.jpg')
  })
})
