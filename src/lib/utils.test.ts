import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime } from '@/lib/utils'

describe('date formatting', () => {
  it('formats date and date-time in Vietnamese style', () => {
    expect(formatDate('2026-11-15T12:00:00Z')).toMatch(/\d{2}\/\d{2}\/2026/)
    expect(formatDateTime('2026-11-15T12:00:00Z')).toMatch(/\d{2}\/\d{2}\/2026/)
  })
})
