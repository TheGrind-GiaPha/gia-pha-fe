import { useDeferredValue, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
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
      <PageHeader title="Dòng họ" />

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <section>
          <h2 className="text-base text-stone-900">Tạo dòng họ</h2>

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
              <p className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{formError}</p>
            ) : null}

            <Button type="submit" className="w-full" isLoading={createMutation.isPending}>
              Tạo dòng họ
            </Button>
          </form>
        </section>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base text-stone-900">Danh sách dòng họ</h2>
              <p className="mt-1 text-sm text-stone-600">
                {isLoading ? 'Đang tải...' : `${clans?.length ?? 0} dòng họ`}
              </p>
            </div>

            <div className="w-full sm:w-64">
              <label className="sr-only" htmlFor="clan-search">
                Tìm dòng họ
              </label>
              <input
                id="clan-search"
                className="text-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên..."
              />
            </div>
          </div>

          {isLoading ? (
            <p className="mt-4 text-sm text-stone-500">Đang tải dữ liệu...</p>
          ) : isError ? (
            <div className="mt-4 border-l-2 border-red-600 pl-3 text-sm text-red-800">
              <p>{getApiErrorMessage(error)}</p>
              <button type="button" className="mt-1 underline" onClick={() => void refetch()}>
                Thử lại
              </button>
            </div>
          ) : clans && clans.length > 0 ? (
            <ul className="mt-4 divide-y divide-stone-200">
              {clans.map((clan) => (
                <li key={clan.id} className="py-4">
                  <h3 className="text-sm text-stone-900">{clan.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    {clan.description ?? 'Chưa có mô tả.'}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">Tạo ngày {formatDate(clan.createdAt)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Chưa có dòng họ"
              description="Tạo dòng họ đầu tiên ở biểu mẫu bên trái."
            />
          )}
        </section>
      </div>
    </div>
  )
}
