import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { getClanAudit, restoreAuditLog } from '@/lib/api/audit'
import { getClans } from '@/lib/api/clans'
import { getApiErrorMessage } from '@/lib/api/errors'
import { getTree } from '@/lib/api/persons'
import { flattenTree } from '@/lib/personTree'
import { cn, formatDateTime } from '@/lib/utils'
import type { AuditLog } from '@/types/audit'
import { buildAuditQuery, canRestoreLog } from './historyFilters'

const pageSize = 10

export function HistoryPage() {
  const [clanId, setClanId] = useState('')
  const [personId, setPersonId] = useState('')
  const [entityType, setEntityType] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const clansQuery = useQuery({
    queryKey: ['clans'],
    queryFn: () => getClans(),
  })

  const treeQuery = useQuery({
    queryKey: ['tree', clanId],
    queryFn: () => getTree(clanId),
    enabled: Boolean(clanId),
  })

  const auditQuery = useQuery({
    queryKey: ['audit', clanId, personId, entityType, fromDate, toDate, page],
    queryFn: () =>
      getClanAudit(
        clanId,
        buildAuditQuery({ personId, entityType, fromDate, toDate, page, pageSize }),
      ),
    enabled: Boolean(clanId),
  })

  const restoreMutation = useMutation({
    mutationFn: (logId: string) => restoreAuditLog(clanId, logId),
    onSuccess: (result) => {
      setActionMessage(result.message)
      setActionError(null)
      void auditQuery.refetch()
    },
    onError: (error) => {
      setActionMessage(null)
      setActionError(getApiErrorMessage(error))
    },
  })

  const persons = treeQuery.data ? flattenTree(treeQuery.data) : []
  const data = auditQuery.data
  const totalPages = data?.totalPages ?? 0

  function handleClanChange(value: string) {
    setClanId(value)
    setPersonId('')
    setEntityType('')
    setFromDate('')
    setToDate('')
    setPage(1)
    setActionMessage(null)
    setActionError(null)
  }

  function handlePersonChange(value: string) {
    setPersonId(value)
    setEntityType(value ? 'Person' : '')
    setPage(1)
  }

  function handleEntityTypeChange(value: string) {
    setEntityType(value)
    setPersonId('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <PageHeader title="Lịch sử thay đổi" />
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
          Mọi thay đổi dữ liệu được ghi tự động. Tên trường và giá trị đã được diễn giải sang
          tiếng Việt để người trong họ đọc được.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="field-label" htmlFor="history-clan">
            Dòng họ
          </label>
          <select
            id="history-clan"
            className="text-input"
            value={clanId}
            onChange={(event) => handleClanChange(event.target.value)}
          >
            <option value="">— Chọn dòng họ —</option>
            {clansQuery.data?.map((clan) => (
              <option key={clan.id} value={clan.id}>
                {clan.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="history-person">
            Thành viên
          </label>
          <select
            id="history-person"
            className="text-input"
            value={personId}
            onChange={(event) => handlePersonChange(event.target.value)}
            disabled={!clanId || entityType === 'Clan'}
          >
            <option value="">Tất cả thành viên</option>
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.fullName} (đời {person.generation})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="history-type">
            Loại dữ liệu
          </label>
          <select
            id="history-type"
            className="text-input"
            value={personId ? 'Person' : entityType}
            onChange={(event) => handleEntityTypeChange(event.target.value)}
            disabled={Boolean(personId)}
          >
            <option value="">Tất cả</option>
            <option value="Person">Thành viên</option>
            <option value="Clan">Dòng họ</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="history-from">
            Từ ngày
          </label>
          <input
            id="history-from"
            className="text-input"
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.target.value)
              setPage(1)
            }}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="history-to">
            Đến ngày
          </label>
          <input
            id="history-to"
            className="text-input"
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(event.target.value)
              setPage(1)
            }}
          />
        </div>
      </section>

      {actionMessage ? (
        <p className="border-l-2 border-emerald-600 pl-3 text-sm text-emerald-800">
          {actionMessage}
        </p>
      ) : null}

      {actionError ? (
        <p className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{actionError}</p>
      ) : null}

      {clansQuery.isError ? (
        <div className="border-l-2 border-red-600 pl-3 text-sm text-red-800">
          <p>{getApiErrorMessage(clansQuery.error)}</p>
        </div>
      ) : !clanId ? (
        <EmptyState
          title="Chưa chọn dòng họ"
          description="Chọn một dòng họ để xem lịch sử thay đổi của dòng họ đó."
        />
      ) : auditQuery.isLoading ? (
        <p className="text-sm text-stone-500">Đang tải lịch sử...</p>
      ) : auditQuery.isError ? (
        <div className="border-l-2 border-red-600 pl-3 text-sm text-red-800">
          <p>{getApiErrorMessage(auditQuery.error)}</p>
          <button type="button" className="mt-1 underline" onClick={() => void auditQuery.refetch()}>
            Thử lại
          </button>
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-600">
              {data.total} thay đổi · trang {data.page}/{data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Trước
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Sau
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {data.items.map((log) => (
              <AuditCard
                key={log.id}
                log={log}
                canRestore={canRestoreLog(log)}
                isRestoring={restoreMutation.isPending && restoreMutation.variables === log.id}
                onRestore={(logId) => {
                  if (
                    window.confirm(
                      'Khôi phục thay đổi này? Dữ liệu hiện tại sẽ trở về giá trị trước đó.',
                    )
                  ) {
                    restoreMutation.mutate(logId)
                  }
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="Chưa có thay đổi"
          description="Thử bỏ bộ lọc hoặc chọn một dòng họ khác."
        />
      )}
    </div>
  )
}

function AuditCard({
  log,
  canRestore,
  isRestoring,
  onRestore,
}: {
  log: AuditLog
  canRestore: boolean
  isRestoring: boolean
  onRestore: (logId: string) => void
}) {
  return (
    <article className="border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-2 py-0.5 text-xs', actionClass(log.action))}>
            {log.actionLabel}
          </span>
          <h2 className="text-sm text-stone-900">{log.summary}</h2>
        </div>

        {canRestore ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isRestoring}
            onClick={() => onRestore(log.id)}
          >
            Khôi phục
          </Button>
        ) : null}
      </div>

      <p className="mt-1 text-xs text-stone-500">
        {log.actorLabel} · {formatDateTime(log.occurredAt)} · {entityLabel(log.entityType)}
      </p>

      {log.changes.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="py-2 pr-4 font-normal">Trường</th>
                <th className="py-2 pr-4 font-normal">Trước</th>
                <th className="py-2 font-normal">Sau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {log.changes.map((change) => (
                <tr key={change.field}>
                  <td className="py-2 pr-4 text-stone-700">{change.label}</td>
                  <td className="py-2 pr-4 text-stone-500">{change.before}</td>
                  <td className="py-2 text-stone-900">{change.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm text-stone-500">Không có trường nào thay đổi.</p>
      )}
    </article>
  )
}

function entityLabel(entityType: string): string {
  switch (entityType) {
    case 'Person':
      return 'Thành viên'
    case 'Clan':
      return 'Dòng họ'
    case 'Branch':
      return 'Chi'
    default:
      return entityType
  }
}

function actionClass(action: string): string {
  switch (action) {
    case 'Create':
      return 'bg-emerald-50 text-emerald-700'
    case 'Delete':
      return 'bg-red-50 text-red-700'
    case 'Restore':
      return 'bg-blue-50 text-blue-700'
    default:
      return 'bg-amber-50 text-amber-700'
  }
}
