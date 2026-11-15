export interface AuditChange {
  field: string
  label: string
  before: string
  after: string
}

export interface AuditLog {
  id: string
  clanId: string
  entityType: string
  entityId: string
  action: string
  actionLabel: string
  actorId?: string | null
  actorLabel: string
  changeRequestId?: string | null
  batchId: string
  summary: string
  changes: AuditChange[]
  occurredAt: string
}

export interface AuditPage {
  items: AuditLog[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface AuditQuery {
  entityType?: string
  entityId?: string
  actorId?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}
