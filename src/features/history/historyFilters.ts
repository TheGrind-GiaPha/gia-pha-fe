import type { AuditQuery } from '@/types/audit'

export interface HistoryFilterInput {
  personId: string
  entityType: string
  fromDate: string
  toDate: string
  page: number
  pageSize?: number
}

export function buildAuditQuery(input: HistoryFilterInput): AuditQuery {
  return {
    page: input.page,
    pageSize: input.pageSize ?? 10,
    entityType: input.personId ? 'Person' : input.entityType || undefined,
    entityId: input.personId || undefined,
    from: toIso(input.fromDate, false),
    to: toIso(input.toDate, true),
  }
}

function toIso(value: string, endOfDay: boolean): string | undefined {
  if (!value) return undefined

  const date = new Date(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}`)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}
