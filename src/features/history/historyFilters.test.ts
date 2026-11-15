import { describe, expect, it } from 'vitest'
import { buildAuditQuery } from './historyFilters'

describe('buildAuditQuery', () => {
  it('uses the selected person instead of the entity type filter', () => {
    const query = buildAuditQuery({
      personId: 'person-1',
      entityType: 'Clan',
      fromDate: '2026-11-01',
      toDate: '2026-11-15',
      page: 2,
    })

    expect(query.page).toBe(2)
    expect(query.pageSize).toBe(10)
    expect(query.entityType).toBe('Person')
    expect(query.entityId).toBe('person-1')
    expect(query.from).toBe(new Date('2026-11-01T00:00:00').toISOString())
    expect(query.to).toBe(new Date('2026-11-15T23:59:59').toISOString())
  })

  it('omits empty filters', () => {
    const query = buildAuditQuery({
      personId: '',
      entityType: '',
      fromDate: '',
      toDate: '',
      page: 1,
    })

    expect(query.page).toBe(1)
    expect(query.pageSize).toBe(10)
    expect(query.entityType).toBeUndefined()
    expect(query.entityId).toBeUndefined()
    expect(query.from).toBeUndefined()
    expect(query.to).toBeUndefined()
  })

  it('keeps an explicit entity type when no person is selected', () => {
    const query = buildAuditQuery({
      personId: '',
      entityType: 'Clan',
      fromDate: '',
      toDate: '',
      page: 1,
    })

    expect(query.entityType).toBe('Clan')
    expect(query.entityId).toBeUndefined()
  })
})
