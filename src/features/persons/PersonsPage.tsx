import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Lock, Search, Sparkles, Users, X } from 'lucide-react'
import { searchPeople, usePreferredClan } from '@/features/f3/api'
import { PersonAvatar } from '@/features/f3/PersonAvatar'

const DEMO_QUERIES = [
  { label: 'dam (Minh Mạng)', value: 'dam' },
  { label: 'nguyen phuc', value: 'nguyen phuc' },
  { label: 'duc duc', value: 'duc duc' },
  { label: 'tu duc', value: 'tu duc' },
]

export function PersonsPage() {
  const { clanId, setClanId, clansQuery } = usePreferredClan()
  const [text, setText] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [generation, setGeneration] = useState('')
  const [living, setLiving] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(text)
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [text])

  const people = useQuery({
    queryKey: ['f3-search', clanId, q, page, generation, living],
    queryFn: () =>
      searchPeople(clanId, {
        q,
        page,
        pageSize: 12,
        generation: generation || undefined,
        isLiving: living || undefined,
      }),
    enabled: !!clanId,
  })

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Thành viên dòng họ</h1>
          <p className="mt-1 text-base text-stone-600">
            Tìm kiếm nhanh theo họ tên, tên húy, tên tự, tên thụy (hỗ trợ gõ không dấu).
          </p>
        </div>
        {people.data && (
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">
            <Users className="h-4 w-4" />
            <span>{people.data.totalCount} thành viên</span>
          </div>
        )}
      </header>

      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-700">Dòng họ</span>
            <select
              aria-label="Dòng họ"
              className="w-full min-h-[56px] rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={clanId}
              onChange={(e) => {
                setClanId(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Chọn dòng họ</option>
              {clansQuery.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-700">Tìm tên</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                className="w-full min-h-[56px] rounded-xl border border-stone-300 bg-white pl-12 pr-12 text-base text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tên có dấu hoặc không dấu"
              />
              {text && (
                <button
                  type="button"
                  aria-label="Xóa từ khóa"
                  onClick={() => {
                    setText('')
                    setQ('')
                    setPage(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-700">Đời thứ</span>
            <input
              className="w-full min-h-[56px] rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              type="number"
              min="1"
              placeholder="Tất cả đời"
              value={generation}
              onChange={(e) => {
                setGeneration(e.target.value)
                setPage(1)
              }}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-700">Trạng thái</span>
            <select
              className="w-full min-h-[56px] rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={living}
              onChange={(e) => {
                setLiving(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Tất cả</option>
              <option value="true">Còn sống</option>
              <option value="false">Đã mất</option>
            </select>
          </label>

          <div className="flex flex-col justify-end sm:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Gợi ý tìm nhanh:
              </span>
              {DEMO_QUERIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setText(item.value)
                    setQ(item.value)
                    setPage(1)
                  }}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {people.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-stone-200 bg-stone-100"
            />
          ))}
        </div>
      )}

      {people.isError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700"
        >
          Không thể tải thành viên. Vui lòng thử lại.
        </p>
      )}

      {people.data && people.data.items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
          <p className="text-lg font-medium text-stone-700">
            Không tìm thấy thành viên nào phù hợp.
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Thử xóa bộ lọc hoặc nhập tên không dấu (ví dụ: nguyen phuc).
          </p>
        </div>
      )}

      {people.data && people.data.items.length > 0 && (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.data.items.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/clans/${clanId}/persons/${p.id}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-brand-400 hover:shadow-md"
                >
                  <PersonAvatar fullName={p.fullName} portraitUrl={p.portraitUrl} size="md" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="line-clamp-2 text-lg font-semibold text-stone-900 group-hover:text-brand-800">
                        {p.fullName}
                      </h2>
                      {p.isRedacted && (
                        <span
                          title="Thông tin được giới hạn theo quyền riêng tư"
                          className="shrink-0 rounded-full bg-amber-100 p-1 text-amber-800"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-xs font-medium">
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-brand-800">
                        Đời {p.generation}
                      </span>
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-700">
                        {p.branchName}
                      </span>
                      <span
                        className={
                          p.isLiving
                            ? 'rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700'
                            : 'rounded-md bg-stone-100 px-2 py-0.5 text-stone-600'
                        }
                      >
                        {p.isLiving ? 'Còn sống' : 'Đã mất'}
                      </span>
                    </div>

                    <div className="text-sm text-stone-600">
                      {p.huyName && <span>Húy: {p.huyName}</span>}
                      {p.huyName && (p.birthYear || p.deathYear) && <span> • </span>}
                      {(p.birthYear || p.deathYear) && (
                        <span>
                          {p.birthYear ?? '?'} – {p.isLiving ? 'nay' : (p.deathYear ?? '?')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
            <button
              type="button"
              className="inline-flex min-h-[56px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 text-base font-medium text-stone-800 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
              Trang trước
            </button>
            <span className="text-base font-medium text-stone-700">
              Trang {page} / {Math.max(1, people.data.totalPages)}
            </span>
            <button
              type="button"
              className="inline-flex min-h-[56px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 text-base font-medium text-stone-800 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page >= people.data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Trang sau
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </section>
  )
}
