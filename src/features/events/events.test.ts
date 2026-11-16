import { describe, expect, it } from 'vitest'
import { lunarMonthName } from './lunarMonthName'

describe('lunarMonthName', () => {
  it('gọi tháng Giêng và tháng Chạp', () => {
    expect(lunarMonthName(1)).toBe('Tháng Giêng')
    expect(lunarMonthName(12)).toBe('Tháng Chạp')
    expect(lunarMonthName(6)).toBe('Tháng 6')
  })
})
