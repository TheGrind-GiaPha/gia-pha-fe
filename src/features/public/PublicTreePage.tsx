import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '@/lib/api/errors'
import { getPublicTree } from '@/lib/api/public'
import { PublicTreeCanvas } from './PublicTreeCanvas'

export function PublicTreePage() {
  const { clanId = '' } = useParams()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['public-tree', clanId],
    queryFn: () => getPublicTree(clanId),
    enabled: Boolean(clanId),
  })

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl text-stone-900">Cây phả hệ công khai</h1>
        <Link to="/public" className="text-sm text-brand-700 hover:underline">
          ← Danh sách dòng họ
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-stone-500">Đang tải cây phả hệ...</p>
      ) : isError ? (
        <div className="border-l-2 border-red-600 pl-3 text-sm text-red-800">
          <p>{getApiErrorMessage(error)}</p>
        </div>
      ) : data ? (
        <PublicTreeCanvas tree={data} />
      ) : null}

      <p className="mt-4 text-xs text-stone-500">
        Dữ liệu công khai đã ẩn thông tin nhạy cảm của người còn sống.
      </p>
    </main>
  )
}
