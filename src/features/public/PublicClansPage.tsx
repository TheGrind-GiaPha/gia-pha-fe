import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { getApiErrorMessage } from '@/lib/api/errors'
import { getPublicClans } from '@/lib/api/public'

export function PublicClansPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['public-clans'],
    queryFn: getPublicClans,
  })

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl text-stone-900">Dòng họ công khai</h1>
      <p className="mt-2 text-sm text-stone-600">
        Khách có thể xem cây phả hệ của các dòng họ đã bật công khai, không cần đăng nhập.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-stone-500">Đang tải...</p>
      ) : isError ? (
        <div className="mt-6 border-l-2 border-red-600 pl-3 text-sm text-red-800">
          <p>{getApiErrorMessage(error)}</p>
        </div>
      ) : data && data.length > 0 ? (
        <ul className="mt-6 divide-y divide-stone-200">
          {data.map((clan) => (
            <li key={clan.id} className="py-4">
              <Link to={`/public/${clan.id}`} className="text-base text-brand-700 hover:underline">
                {clan.name}
              </Link>
              {clan.description ? (
                <p className="mt-1 text-sm text-stone-600">{clan.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Chưa có dòng họ công khai" description="Hiện chưa dòng họ nào bật chế độ công khai." />
      )}

      <Link to="/login" className="mt-8 inline-block text-sm text-stone-500 hover:text-stone-800">
        Đăng nhập
      </Link>
    </main>
  )
}
