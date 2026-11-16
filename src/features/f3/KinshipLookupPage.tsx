import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowLeftRight, GitFork, Info, Search, Sparkles } from 'lucide-react'
import { getKinship, myPersonKey, searchPeople, usePreferredClan } from './api'
import { PersonAvatar } from './PersonAvatar'

export function KinshipLookupPage() {
  const [params] = useSearchParams()
  const { clanId, setClanId, clansQuery } = usePreferredClan(params.get('clanId') || '')
  const [fromState, setFromState] = useState(
    () => (clanId ? localStorage.getItem(myPersonKey(clanId)) : '') || '',
  )
  const [to, setTo] = useState(() => params.get('to') || '')
  const [q, setQ] = useState('')
  const [lookup, setLookup] = useState<{ clanId: string; from: string; to: string } | null>(null)

  const storedFrom = clanId ? localStorage.getItem(myPersonKey(clanId)) || '' : ''
  const from = fromState || storedFrom

  const people = useQuery({
    queryKey: ['kinship-people', clanId, q],
    queryFn: () => searchPeople(clanId, { q, pageSize: 100 }),
    enabled: !!clanId,
  })

  const result = useQuery({
    queryKey: ['kinship', lookup],
    queryFn: () => getKinship(lookup!.clanId, lookup!.from, lookup!.to),
    enabled: !!lookup,
  })

  const items = people.data?.items ?? []
  const personA = items.find((p) => p.id === from)
  const personB = items.find((p) => p.id === to)

  function handleClanChange(nextClanId: string) {
    setClanId(nextClanId)
    setFromState(nextClanId ? localStorage.getItem(myPersonKey(nextClanId)) || '' : '')
    setTo('')
    setLookup(null)
  }

  function handleSelectFrom(id: string) {
    setFromState(id)
    if (clanId && id) {
      localStorage.setItem(myPersonKey(clanId), id)
    }
  }

  function handleSwap() {
    const nextFrom = to
    const nextTo = from
    setFromState(nextFrom)
    setTo(nextTo)
    if (clanId && nextFrom && nextTo) {
      setLookup({ clanId, from: nextFrom, to: nextTo })
    }
  }

  function applyQuickDemo(nameA: string, nameB: string) {
    const a = items.find((p) => p.fullName.includes(nameA))
    const b = items.find((p) => p.fullName.includes(nameB))
    if (!a || !b || !clanId) return
    setFromState(a.id)
    setTo(b.id)
    setLookup({ clanId, from: a.id, to: b.id })
  }

  const canDemoMinhMangGiaLong =
    items.some((p) => p.fullName.includes('Minh Mạng')) &&
    items.some((p) => p.fullName.includes('Gia Long'))
  const canDemoDucDucDongKhanh =
    items.some((p) => p.fullName.includes('Dục Đức')) &&
    items.some((p) => p.fullName.includes('Đồng Khánh'))

  return (
    <section className="mx-auto max-w-5xl space-y-6 text-base">
      <header>
        <h1 className="text-3xl font-bold text-stone-900">Tra cứu xưng hô gia phả</h1>
        <p className="mt-1 text-stone-600">
          Xác định cách gọi hai chiều trong phạm vi 4 đời dựa trên cây phụ hệ, thứ bậc nhánh và
          quan hệ hôn nhân.
        </p>
      </header>

      {/* Selector Card */}
      <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-700">Dòng họ</span>
            <select
              aria-label="Dòng họ"
              className="w-full min-h-[56px] rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={clanId}
              onChange={(e) => handleClanChange(e.target.value)}
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
            <span className="text-sm font-medium text-stone-700">Lọc danh sách theo tên</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                aria-label="Tìm người"
                className="w-full min-h-[56px] rounded-xl border border-stone-300 bg-white pl-12 pr-4 text-base text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="Nhập tên để lọc nhanh..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-brand-900">Người A (Tôi)</span>
              <select
                className="w-full min-h-[56px] rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
                value={from}
                onChange={(e) => handleSelectFrom(e.target.value)}
              >
                <option value="">Chọn Người A</option>
                {from && !items.some((p) => p.id === from) && (
                  <option value={from}>Người đã chọn</option>
                )}
                {items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} — Đời {p.generation}
                  </option>
                ))}
              </select>
            </label>
            {personA && (
              <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <PersonAvatar
                  fullName={personA.fullName}
                  portraitUrl={personA.portraitUrl}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900">{personA.fullName}</p>
                  <p className="text-sm text-stone-500">
                    Đời {personA.generation} • {personA.branchName}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-amber-900">Người B</span>
              <select
                className="w-full min-h-[56px] rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                <option value="">Chọn Người B</option>
                {to && !items.some((p) => p.id === to) && <option value={to}>Người đã chọn</option>}
                {items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} — Đời {p.generation}
                  </option>
                ))}
              </select>
            </label>
            {personB && (
              <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <PersonAvatar
                  fullName={personB.fullName}
                  portraitUrl={personB.portraitUrl}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900">{personB.fullName}</p>
                  <p className="text-sm text-stone-500">
                    Đời {personB.generation} • {personB.branchName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {(canDemoMinhMangGiaLong || canDemoDucDucDongKhanh) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Cặp demo nhanh:
            </span>
            {canDemoMinhMangGiaLong && (
              <button
                type="button"
                onClick={() => applyQuickDemo('Minh Mạng', 'Gia Long')}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
              >
                Minh Mạng ↔ Gia Long (Cha - Con)
              </button>
            )}
            {canDemoDucDucDongKhanh && (
              <button
                type="button"
                onClick={() => applyQuickDemo('Dục Đức', 'Đồng Khánh')}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
              >
                Dục Đức ↔ Đồng Khánh (Con chú - Con bác)
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 text-base font-semibold text-stone-800 transition-colors hover:bg-stone-50"
            onClick={handleSwap}
          >
            <ArrowLeftRight className="h-5 w-5" />
            Đảo chiều A ↔ B
          </button>

          <button
            type="button"
            className="inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            disabled={!from || !to || !clanId}
            onClick={() => setLookup({ clanId, from, to })}
          >
            <GitFork className="h-5 w-5" />
            Tra cứu
          </button>
        </div>
      </div>

      {result.isLoading && (
        <div className="h-44 animate-pulse rounded-2xl border border-stone-200 bg-stone-100" />
      )}

      {result.isError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          Không thể tra cứu quan hệ.
        </p>
      )}

      {result.data && (
        <div className="space-y-6">
          {/* Result Card */}
          <div className="space-y-4 rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
            {result.data.isOutOfScope ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                <p className="text-xl font-bold">Ngoài phạm vi tra cứu MVP (4 đời)</p>
                <p className="mt-1 text-base">{result.data.outOfScopeMessage}</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
                    <p className="text-sm font-medium text-brand-800">Người A gọi Người B là</p>
                    <p className="mt-1 text-2xl font-bold text-brand-950">
                      {result.data.fromCallsTo}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">Người B gọi Người A là</p>
                    <p className="mt-1 text-2xl font-bold text-amber-950">
                      {result.data.toCallsFrom}
                    </p>
                  </div>
                </div>

                <p className="text-lg font-medium text-stone-800">{result.data.summary}</p>
              </>
            )}

            {result.data.regionalAliases.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-sm font-medium text-stone-500">
                  Cách gọi vùng miền (Huế / Miền Trung):
                </span>
                {result.data.regionalAliases.map((alias) => (
                  <span
                    key={alias}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            )}

            {result.data.adoptionNote && (
              <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{result.data.adoptionNote}</span>
              </div>
            )}
          </div>

          {/* Lineage Path Timeline */}
          {result.data.path.length > 0 && (
            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-stone-900">Sơ đồ đường quan hệ phả hệ</h2>
              <ol className="space-y-2">
                {result.data.path.map((node, idx) => {
                  const isAncestor = node.roleInPath === 'CommonAncestor'
                  return (
                    <li key={`${node.personId}-${idx}`} className="flex flex-col items-stretch">
                      <div
                        className={
                          isAncestor
                            ? 'flex items-center gap-4 rounded-xl border-2 border-amber-400 bg-amber-50/70 p-4'
                            : 'flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4'
                        }
                      >
                        <PersonAvatar
                          fullName={node.fullName}
                          portraitUrl={node.portraitUrl}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/clans/${clanId}/persons/${node.personId}`}
                              className="text-lg font-bold text-stone-900 underline decoration-stone-300 underline-offset-4 hover:text-brand-800"
                            >
                              {node.fullName}
                            </Link>
                            <span className="rounded-md bg-white px-2.5 py-0.5 text-xs font-semibold text-stone-700 shadow-sm">
                              {node.stepLabel}
                            </span>
                            {isAncestor && (
                              <span className="rounded-full bg-amber-200 px-3 py-0.5 text-xs font-bold text-amber-950">
                                Tổ tiên chung
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {node.relationToNext && (
                        <div className="my-1.5 flex items-center gap-2 pl-8 text-sm font-semibold text-brand-700">
                          <ArrowDown className="h-4 w-4" />
                          <span>{node.relationToNext}</span>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
