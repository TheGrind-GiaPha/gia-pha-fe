import { useDeferredValue, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, CircleAlert, Plus, RefreshCw, Search, TreePine } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { createClan, getClans } from '@/lib/api/clans'
import { getApiErrorMessage } from '@/lib/api/errors'
import { formatDate } from '@/lib/utils'

export function ClansPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    data: clans,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['clans', deferredSearch],
    queryFn: () => getClans(deferredSearch || undefined),
  })

  const createMutation = useMutation({
    mutationFn: createClan,
    onSuccess: () => {
      setName('')
      setDescription('')
      setFormError(null)
      void queryClient.invalidateQueries({ queryKey: ['clans'] })
    },
    onError: (mutationError) => {
      setFormError(getApiErrorMessage(mutationError))
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('Vui lòng nhập tên dòng họ.')
      return
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Không gian dữ liệu"
        title="Dòng họ"
        description="Mỗi dòng họ là một workspace riêng. Bản khung hiện tại dùng entity Clan để kiểm tra luồng 3-layer, Repository và DAO."
        actions={<Badge variant="brand">API đã kết nối</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card id="create-clan" className="h-fit scroll-mt-24">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Tạo dòng họ</h2>
              <p className="text-xs text-stone-500">Gọi POST /api/clans</p>
            </div>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="field-label" htmlFor="clan-name">
                Tên dòng họ
              </label>
              <input
                id="clan-name"
                className="text-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ví dụ: Gia phả họ Nguyễn Hữu"
                maxLength={200}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="clan-description">
                Mô tả
              </label>
              <textarea
                id="clan-description"
                className="text-input min-h-[96px] resize-y"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Quê quán, chi/nhánh, ghi chú ban đầu..."
                maxLength={2000}
              />
            </div>

            {formError ? (
              <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>{formError}</p>
              </div>
            ) : null}

            <Button type="submit" className="w-full" isLoading={createMutation.isPending}>
              Tạo dòng họ
            </Button>
          </form>
        </Card>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Danh sách dòng họ</h2>
              <p className="text-sm text-stone-500">
                {isLoading ? 'Đang tải...' : `${clans?.length ?? 0} bản ghi`}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                className="text-input pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên dòng họ..."
                aria-label="Tìm dòng họ"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="animate-pulse">
                  <div className="h-5 w-1/2 rounded bg-stone-100" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-stone-100" />
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="border-red-200 bg-red-50/50">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Không tải được danh sách</h3>
                  <p className="mt-1 text-sm text-red-700">{getApiErrorMessage(error)}</p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => void refetch()}
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Thử lại
                  </Button>
                </div>
              </div>
            </Card>
          ) : clans && clans.length > 0 ? (
            <div className="space-y-3">
              {clans.map((clan) => (
                <Card
                  key={clan.id}
                  className="group flex items-start gap-4 transition hover:border-brand-200"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <TreePine className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-stone-900">{clan.name}</h3>
                      <Badge variant="brand">Đang dựng</Badge>
                    </div>
                    <p className="mt-1 text-sm text-stone-500">
                      {clan.description ?? 'Chưa có mô tả.'}
                    </p>
                    <p className="mt-2 text-xs text-stone-400">
                      Tạo ngày {formatDate(clan.createdAt)}
                    </p>
                  </div>
                  <Link
                    to="/tree"
                    className="rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-brand-700"
                    aria-label={`Mở cây phả hệ ${clan.name}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TreePine}
              title="Chưa có dòng họ nào"
              description="Tạo dòng họ đầu tiên ở biểu mẫu bên trái. Sau đó chúng ta sẽ thêm Person, Union và ParentChild theo ERD."
            />
          )}
        </section>
      </div>
    </div>
  )
}
