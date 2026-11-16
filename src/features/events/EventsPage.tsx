import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CalendarDays, Download, Info } from 'lucide-react'
import {
  downloadAnniversariesIcs,
  getAnniversaries,
  usePreferredClan,
  type AnniversaryItem,
} from '@/features/f3/api'
import { PersonAvatar } from '@/features/f3/PersonAvatar'
import { lunarMonthName } from './lunarMonthName'

function getCountdownLabel(daysDiff: number): string {
  if (daysDiff === 0) return 'Hôm nay'
  if (daysDiff === 1) return 'Ngày mai'
  return `Còn ${daysDiff} ngày`
}

export function EventsPage() {
  const { clanId, setClanId, clansQuery } = usePreferredClan()
  const [currentYear] = useState(() => new Date().getFullYear())
  const [todayStartMs] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  })
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState('')
  const [error, setError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  const params = {
    year,
    lunarMonth: month || undefined,
  }

  const calendar = useQuery({
    queryKey: ['f3-calendar', clanId, year, month],
    queryFn: () => getAnniversaries(clanId, params),
    enabled: !!clanId,
  })

  async function handleDownload() {
    if (!clanId) return
    setError('')
    setIsDownloading(true)
    try {
      const blob = await downloadAnniversariesIcs(clanId, params)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lich-gio-${year}.ics`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setError('Không thể tải lịch. Vui lòng thử lại.')
    } finally {
      setIsDownloading(false)
    }
  }

  const items = calendar.data?.items ?? []
  const upcoming = items
    .map((item) => {
      const [y, m, d] = item.solarDate.split('-').map(Number)
      const itemMs = new Date(y, m - 1, d).getTime()
      const daysDiff = Math.round((itemMs - todayStartMs) / 86_400_000)
      return { item, daysDiff }
    })
    .filter((x) => x.daysDiff >= 0 && x.daysDiff <= 30)
    .sort((a, b) => a.daysDiff - b.daysDiff)

  const monthsWithEvents = Array.from({ length: 12 }, (_, i) => i + 1).filter((m) =>
    items.some((x) => x.lunarMonth === m),
  )

  function renderEventCard(x: AnniversaryItem, countdownDays?: number) {
    return (
      <li
        key={`${x.personId}-${x.solarDate}`}
        className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <PersonAvatar fullName={x.fullName} portraitUrl={x.portraitUrl} size="sm" />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className="text-lg font-bold text-stone-900 underline decoration-stone-300 underline-offset-4 hover:text-brand-800 hover:decoration-brand-600"
                to={`/clans/${clanId}/persons/${x.personId}`}
              >
                {x.fullName}
              </Link>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
                Đời {x.generation}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-stone-700">
              <span className="font-semibold text-amber-800">
                {x.lunarDay}/{x.lunarMonth} ÂL
              </span>
              <span>→ Dương lịch: <strong>{x.solarDateDisplay}</strong></span>
              <span className="text-stone-500">Giỗ lần {x.yearsSinceDeath}</span>
            </div>

            {x.adjustmentNote && (
              <p className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-sm text-amber-900">
                <Info className="h-4 w-4 shrink-0" />
                <span>{x.adjustmentNote}</span>
              </p>
            )}
          </div>
        </div>

        {typeof countdownDays === 'number' && (
          <div className="shrink-0 self-start sm:self-center">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
              {getCountdownLabel(countdownDays)}
            </span>
          </div>
        )}
      </li>
    )
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 text-base">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Lịch giỗ dòng họ</h1>
          <p className="mt-1 text-stone-600">
            Quy đổi ngày giỗ Âm lịch sang Dương lịch theo từng năm và xuất lịch về điện thoại.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex min-h-[56px] shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-base font-bold text-stone-950 shadow-sm transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!clanId || isDownloading}
          onClick={() => void handleDownload()}
        >
          <Download className="h-5 w-5" />
          {isDownloading ? 'Đang tạo file .ics...' : 'Tải lịch giỗ về điện thoại (.ics)'}
        </button>
      </header>

      {/* Filter Card */}
      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-700">Dòng họ</span>
            <select
              aria-label="Dòng họ"
              className="w-full min-h-[56px] rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={clanId}
              onChange={(e) => setClanId(e.target.value)}
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
            <span className="text-sm font-medium text-stone-700">Lọc theo tháng âm lịch</span>
            <select
              aria-label="Tháng âm"
              className="w-full min-h-[56px] rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Tất cả 12 tháng âm lịch</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {lunarMonthName(i + 1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <button
            type="button"
            className="min-h-[56px] rounded-xl border border-stone-300 bg-white px-5 font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-40"
            disabled={year <= 1800}
            onClick={() => setYear(year - 1)}
          >
            ← Năm trước
          </button>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-stone-700">Năm dương lịch</span>
            <input
              className="w-32 min-h-[56px] rounded-xl border border-stone-300 bg-white px-4 text-center text-lg font-bold text-stone-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              type="number"
              min="1800"
              max="2199"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </label>

          <button
            type="button"
            className="min-h-[56px] rounded-xl border border-brand-200 bg-brand-50 px-5 font-semibold text-brand-900 hover:bg-brand-100"
            onClick={() => setYear(currentYear)}
          >
            Năm nay ({currentYear})
          </button>

          <button
            type="button"
            className="min-h-[56px] rounded-xl border border-stone-300 bg-white px-5 font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-40"
            disabled={year >= 2199}
            onClick={() => setYear(year + 1)}
          >
            Năm sau →
          </button>
        </div>
      </div>

      {(calendar.isError || error) && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {error || 'Không thể tải lịch giỗ.'}
        </p>
      )}

      {calendar.isLoading && (
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-stone-200" />
          <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />
        </div>
      )}

      {/* Upcoming 30 Days */}
      {calendar.data && (
        <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-xl font-bold text-amber-950">
              <CalendarDays className="h-5 w-5 text-amber-700" />
              Đám giỗ sắp tới (trong 30 ngày)
            </h2>
            <span className="rounded-full bg-amber-200/80 px-3 py-1 text-sm font-semibold text-amber-950">
              {upcoming.length} đám giỗ
            </span>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-stone-600">Không có đám giỗ nào trong 30 ngày tới.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map(({ item, daysDiff }) => renderEventCard(item, daysDiff))}
            </ul>
          )}
        </section>
      )}

      {/* Grouped by Lunar Month */}
      {calendar.data && (
        <div className="space-y-6">
          {monthsWithEvents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-stone-600">
              Không có ngày giỗ nào khớp với bộ lọc hiện tại.
            </p>
          ) : (
            monthsWithEvents.map((m) => {
              const monthItems = items.filter((x) => x.lunarMonth === m)
              return (
                <section key={m} className="space-y-3">
                  <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
                    <h2 className="text-2xl font-bold text-stone-900">{lunarMonthName(m)}</h2>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-sm font-medium text-stone-600">
                      {monthItems.length}
                    </span>
                  </div>
                  <ul className="space-y-3">{monthItems.map((x) => renderEventCard(x))}</ul>
                </section>
              )
            })
          )}
        </div>
      )}

      {/* Warnings for missing death dates */}
      {calendar.data && calendar.data.warnings.length > 0 && (
        <aside className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-amber-950">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            Thành viên đã mất nhưng thiếu ngày mất ({calendar.data.warnings.length})
          </h3>
          <ul className="space-y-2">
            {calendar.data.warnings.map((w) => (
              <li
                key={w.personId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-stone-800">
                  <strong>{w.fullName}:</strong> {w.message}
                </p>
                <Link
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-brand-300 bg-brand-50 px-4 text-sm font-semibold text-brand-900 hover:bg-brand-100"
                  to={`/clans/${clanId}/persons/${w.personId}`}
                >
                  Xem hồ sơ / Đề xuất bổ sung
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </section>
  )
}
