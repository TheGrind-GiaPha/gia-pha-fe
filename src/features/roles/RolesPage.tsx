import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { getClans } from '@/lib/api/clans'
import { assignClanRole, getClanRoles, revokeClanRole } from '@/lib/api/clanRoles'
import { getApiErrorMessage } from '@/lib/api/errors'
import { getStoredUser } from '@/lib/auth'
import { ClanAdminRole, ClanRoleLabel, ClanRoleOptions } from '@/types/clanRole'

export function RolesPage() {
  const queryClient = useQueryClient()
  const currentUserId = getStoredUser()?.id
  const [clanId, setClanId] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(3)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: clans } = useQuery({
    queryKey: ['clans'],
    queryFn: () => getClans(),
  })

  const {
    data: roles,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['clan-roles', clanId],
    queryFn: () => getClanRoles(clanId),
    enabled: Boolean(clanId),
  })

  const assignMutation = useMutation({
    mutationFn: () => assignClanRole(clanId, email.trim(), role),
    onSuccess: () => {
      setEmail('')
      setFormError(null)
      void queryClient.invalidateQueries({ queryKey: ['clan-roles', clanId] })
    },
    onError: (mutationError) => setFormError(getApiErrorMessage(mutationError)),
  })

  const revokeMutation = useMutation({
    mutationFn: ({ userId, role: roleToRevoke }: { userId: string; role: number }) =>
      revokeClanRole(clanId, userId, roleToRevoke),
    onSuccess: () => {
      setFormError(null)
      void queryClient.invalidateQueries({ queryKey: ['clan-roles', clanId] })
    },
    onError: (mutationError) => setFormError(getApiErrorMessage(mutationError)),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) {
      setFormError('Vui lòng nhập email.')
      return
    }
    assignMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Phân quyền dòng họ" />

      <div>
        <label className="field-label" htmlFor="roles-clan">
          Chọn dòng họ
        </label>
        <select
          id="roles-clan"
          className="text-input max-w-sm"
          value={clanId}
          onChange={(event) => setClanId(event.target.value)}
        >
          <option value="">— Chọn dòng họ —</option>
          {clans?.map((clan) => (
            <option key={clan.id} value={clan.id}>
              {clan.name}
            </option>
          ))}
        </select>
      </div>

      {!clanId ? (
        <EmptyState
          title="Chưa chọn dòng họ"
          description="Chọn dòng họ để xem và gán vai trò cho thành viên."
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <section>
            <h2 className="text-base text-stone-900">Gán vai trò</h2>
            <p className="mt-1 text-xs text-stone-500">Chỉ Quản trị họ mới gán/thu hồi được.</p>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="field-label" htmlFor="role-email">
                  Email người dùng
                </label>
                <input
                  id="role-email"
                  className="text-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="thanhvien@example.com"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="role-select">
                  Vai trò
                </label>
                <select
                  id="role-select"
                  className="text-input"
                  value={role}
                  onChange={(event) => setRole(Number(event.target.value))}
                >
                  {ClanRoleOptions.map((value) => (
                    <option key={value} value={value}>
                      {ClanRoleLabel[value]}
                    </option>
                  ))}
                </select>
              </div>

              {formError ? (
                <p className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{formError}</p>
              ) : null}

              <Button type="submit" className="w-full" isLoading={assignMutation.isPending}>
                Gán vai trò
              </Button>
            </form>
          </section>

          <section>
            <h2 className="text-base text-stone-900">Danh sách phân quyền</h2>

            {isLoading ? (
              <p className="mt-4 text-sm text-stone-500">Đang tải...</p>
            ) : isError ? (
              <div className="mt-4 border-l-2 border-red-600 pl-3 text-sm text-red-800">
                <p>{getApiErrorMessage(error)}</p>
              </div>
            ) : roles && roles.length > 0 ? (
              <ul className="mt-4 divide-y divide-stone-200">
                {roles.map((assignment) => {
                  const isSelfAdmin =
                    assignment.userId === currentUserId &&
                    assignment.role === ClanAdminRole

                  return (
                    <li
                      key={assignment.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-stone-900">{assignment.displayName}</p>
                        <p className="truncate text-xs text-stone-500">{assignment.email}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-800">
                        {ClanRoleLabel[assignment.role]}
                      </span>
                      <button
                        type="button"
                        disabled={isSelfAdmin}
                        onClick={() => {
                          const label = ClanRoleLabel[assignment.role]
                          if (
                            !window.confirm(
                              `Thu hồi vai trò "${label}" của ${assignment.displayName}?`,
                            )
                          ) {
                            return
                          }
                          revokeMutation.mutate({
                            userId: assignment.userId,
                            role: assignment.role,
                          })
                        }}
                        className="shrink-0 rounded p-1.5 text-stone-500 hover:bg-stone-200 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-500"
                        title={
                          isSelfAdmin
                            ? 'Không thể tự thu hồi quyền Quản trị họ'
                            : 'Thu hồi'
                        }
                        aria-label="Thu hồi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState
                title="Chưa có phân quyền"
                description="Gán vai trò đầu tiên ở biểu mẫu bên trái."
              />
            )}
          </section>
        </div>
      )}
    </div>
  )
}
