import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  GitFork,
  Lock,
  MapPin,
  Pencil,
  Phone,
  UserCheck,
  Users,
} from 'lucide-react'
import { getProfile, myPersonKey, resolvePortraitUrl, type ProfileRelation } from './api'
import { PersonAvatar } from './PersonAvatar'

export function F3PersonProfilePage() {
  const { clanId = '', personId = '' } = useParams()
  const [isMarkedMe, setIsMarkedMe] = useState(
    () => !!clanId && localStorage.getItem(myPersonKey(clanId)) === personId,
  )
  const [justMarked, setJustMarked] = useState(false)

  const result = useQuery({
    queryKey: ['f3-profile', clanId, personId],
    queryFn: () => getProfile(clanId, personId),
    enabled: !!clanId && !!personId,
  })

  if (result.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-44 animate-pulse rounded-2xl bg-stone-200" />
        <div className="h-56 animate-pulse rounded-2xl bg-stone-100" />
      </div>
    )
  }

  if (result.isError || !result.data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-lg text-red-700"
        >
          Không thể tải hồ sơ.
        </p>
        <Link
          to="/persons"
          className="inline-flex min-h-[56px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 text-base font-medium text-stone-800 hover:bg-stone-50"
        >
          <ArrowLeft className="h-5 w-5" />
          Quay lại danh sách
        </Link>
      </div>
    )
  }

  const p = result.data
  const safeMap = p.burialMapUrl && /^https?:\/\//i.test(p.burialMapUrl) ? p.burialMapUrl : null
  const genderLabel = p.gender === 1 ? 'Nữ' : 'Nam'

  function handleSetAsMe() {
    localStorage.setItem(myPersonKey(clanId), personId)
    setIsMarkedMe(true)
    setJustMarked(true)
  }

  function renderRelationList(title: string, people: ProfileRelation[]) {
    if (people.length === 0) return null
    return (
      <div className="space-y-2.5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">{title}</h3>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {people.map((x) => (
            <Link
              key={x.personId}
              to={`/clans/${clanId}/persons/${x.personId}`}
              className="flex min-h-[56px] items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 transition-colors hover:border-brand-400 hover:bg-brand-50/50"
            >
              <span className="text-base font-medium text-stone-900">{x.fullName}</span>
              <span className="shrink-0 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-stone-600 shadow-sm">
                Đời {x.generation}
              </span>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-4xl space-y-6 text-base">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/persons"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl px-3 text-base font-medium text-stone-700 hover:bg-stone-100"
        >
          <ArrowLeft className="h-5 w-5" />
          Danh sách thành viên
        </Link>

        {isMarkedMe && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            Đang chọn làm “Tôi” trong dòng họ này
          </span>
        )}
      </div>

      {justMarked && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
          <p className="font-medium">
            Đã đặt <strong>{p.fullName}</strong> làm “Tôi”. Khi mở trang Tra xưng hô, hệ thống sẽ tự
            động điền vào ô Người A.
          </p>
          <Link
            to={`/kinship?clanId=${clanId}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Mở Tra xưng hô ngay
          </Link>
        </div>
      )}

      {/* Hero Card */}
      <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <PersonAvatar fullName={p.fullName} portraitUrl={p.portraitUrl} size="lg" />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-700 px-3 py-1 text-sm font-semibold text-white">
                Đời {p.generation}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                {p.branchName}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                {genderLabel}
              </span>
              <span
                className={
                  p.isLiving
                    ? 'rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700'
                    : 'rounded-full bg-stone-200 px-3 py-1 text-sm font-medium text-stone-700'
                }
              >
                {p.isLiving ? 'Còn sống' : 'Đã mất'}
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-stone-900">{p.fullName}</h1>

            {(p.huyName || p.tuName || p.thuyName) && (
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-base text-stone-700">
                {p.huyName && (
                  <span>
                    <strong className="font-medium text-stone-500">Tên húy:</strong> {p.huyName}
                  </span>
                )}
                {p.tuName && (
                  <span>
                    <strong className="font-medium text-stone-500">Tên tự:</strong> {p.tuName}
                  </span>
                )}
                {p.thuyName && (
                  <span>
                    <strong className="font-medium text-stone-500">Tên thụy:</strong> {p.thuyName}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {p.isRedacted && (
          <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Lock className="h-4 w-4 shrink-0" />
            <span>Một số thông tin cá nhân được giới hạn hiển thị theo quyền riêng tư.</span>
          </div>
        )}
      </header>

      {/* Action Buttons (Elder-friendly >= 56px) */}
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={handleSetAsMe}
          className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-base font-semibold text-amber-900 transition-colors hover:bg-amber-100"
        >
          <UserCheck className="h-5 w-5" />
          Đặt người này làm Tôi
        </button>

        <Link
          to={`/kinship?clanId=${clanId}&to=${personId}`}
          className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-base font-semibold text-white transition-colors hover:bg-brand-800"
        >
          <GitFork className="h-5 w-5" />
          Tra xưng hô với người này
        </Link>

        <Link
          to={`/approvals?propose=UpdatePerson&clanId=${clanId}&personId=${personId}`}
          className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-base font-semibold text-stone-800 transition-colors hover:bg-stone-50"
        >
          <Pencil className="h-5 w-5" />
          Đề xuất chỉnh sửa thông tin
        </Link>
      </div>

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900">
            <Calendar className="h-5 w-5 text-brand-700" />
            Thông tin sinh – mất & Liên hệ
          </h2>
          <dl className="space-y-3 text-base">
            <div className="rounded-xl bg-stone-50 p-3.5">
              <dt className="text-sm font-medium text-stone-500">Ngày sinh</dt>
              <dd className="mt-0.5 font-medium text-stone-900">
                {p.birthDateDisplay || 'Chưa rõ'}
              </dd>
            </div>
            {!p.isLiving && (
              <div className="rounded-xl bg-amber-50/70 p-3.5">
                <dt className="text-sm font-medium text-amber-800">Ngày mất (Dương / Âm lịch)</dt>
                <dd className="mt-0.5 font-semibold text-stone-900">
                  {p.deathDateDisplay || 'Chưa rõ ngày mất'}
                </dd>
              </div>
            )}
            {p.phoneNumber && (
              <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-3.5">
                <Phone className="h-5 w-5 text-stone-500" />
                <div>
                  <dt className="text-sm font-medium text-stone-500">Số điện thoại</dt>
                  <dd className="font-medium text-stone-900">{p.phoneNumber}</dd>
                </div>
              </div>
            )}
          </dl>
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900">
            <MapPin className="h-5 w-5 text-brand-700" />
            Tiểu sử & Nơi an táng
          </h2>

          <div className="space-y-3">
            <div className="rounded-xl bg-stone-50 p-3.5">
              <p className="text-sm font-medium text-stone-500">Tiểu sử</p>
              <p className="mt-1 whitespace-pre-wrap text-stone-800">
                {p.biography || 'Chưa có thông tin tiểu sử.'}
              </p>
            </div>

            {!p.isLiving && (
              <div className="rounded-xl bg-stone-50 p-3.5">
                <p className="text-sm font-medium text-stone-500">Nơi an táng</p>
                <p className="mt-1 font-medium text-stone-900">
                  {p.burialPlace || 'Chưa cập nhật địa điểm an táng.'}
                </p>
                {safeMap && (
                  <a
                    href={safeMap}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-brand-300 bg-white px-4 text-sm font-semibold text-brand-800 hover:bg-brand-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Mở bản đồ chỉ đường
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Family Relations */}
      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900">
          <Users className="h-5 w-5 text-brand-700" />
          Quan hệ gia đình
        </h2>

        {!p.father && p.spouses.length === 0 && p.children.length === 0 ? (
          <p className="text-stone-500">Chưa có liên kết gia đình trực tiếp.</p>
        ) : (
          <div className="space-y-5">
            {p.father && renderRelationList('Cha', [p.father])}
            {renderRelationList('Vợ / Chồng', p.spouses)}
            {renderRelationList(`Các con (${p.children.length})`, p.children)}
          </div>
        )}
      </section>

      {/* Photos Album */}
      {p.photos.length > 0 && (
        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900">Album ảnh ({p.photos.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {p.photos.map((x) => {
              const src = resolvePortraitUrl(x.url) ?? x.url
              return (
                <figure
                  key={x.id}
                  className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
                >
                  <img
                    className="h-48 w-full object-cover"
                    src={src}
                    alt={x.caption || 'Ảnh gia đình'}
                  />
                  {x.caption && (
                    <figcaption className="px-3 py-2 text-sm text-stone-700">
                      {x.caption}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        </section>
      )}
    </article>
  )
}
