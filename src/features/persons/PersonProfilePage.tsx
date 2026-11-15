import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { getApiErrorMessage } from '@/lib/api/errors'
import { getPerson, resolvePortraitUrl, updatePerson, uploadPortrait } from '@/lib/api/persons'
import {
  CalendarLabel,
  GenderLabel,
  PrivacyLabel,
  type PersonProfileRequest,
} from '@/types/person'
import { PersonForm } from './PersonForm'

function YearOf(value: { year?: number | null } | null | undefined): string {
  return value?.year ? String(value.year) : '?'
}

export function PersonProfilePage() {
  const { personId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const clanId = searchParams.get('clanId') ?? ''
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['person', clanId, personId],
    queryFn: () => getPerson(clanId, personId),
    enabled: Boolean(clanId && personId),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: PersonProfileRequest) => updatePerson(clanId, personId, payload),
    onSuccess: () => {
      setEditing(false)
      void queryClient.invalidateQueries({ queryKey: ['person', clanId, personId] })
      void queryClient.invalidateQueries({ queryKey: ['tree'] })
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadPortrait(clanId, personId, file),
    onSuccess: () => {
      setUploadError(null)
      void queryClient.invalidateQueries({ queryKey: ['person', clanId, personId] })
      void queryClient.invalidateQueries({ queryKey: ['tree'] })
    },
    onError: (uploadErr) => setUploadError(getApiErrorMessage(uploadErr)),
  })

  function handlePortraitChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
    // Reset để có thể chọn lại cùng một file.
    event.target.value = ''
  }

  if (!clanId || !personId) {
    return <p className="text-sm text-stone-600">Thiếu dòng họ hoặc mã người.</p>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={editing ? 'Sửa hồ sơ' : (data?.fullName ?? 'Hồ sơ')}
        actions={
          <Link to={`/tree`} className="text-sm text-brand-700 hover:underline">
            ← Về cây
          </Link>
        }
      />

      {isLoading ? (
        <p className="text-sm text-stone-500">Đang tải hồ sơ...</p>
      ) : isError ? (
        <div className="border-l-2 border-red-600 pl-3 text-sm text-red-800">
          <p>{getApiErrorMessage(error)}</p>
        </div>
      ) : editing && data ? (
        <PersonForm
          initial={data}
          submitLabel="Lưu thay đổi"
          isLoading={updateMutation.isPending}
          error={updateMutation.isError ? getApiErrorMessage(updateMutation.error) : null}
          onSubmit={(payload) => updateMutation.mutate(payload)}
        />
      ) : data ? (
        <div className="space-y-6">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar key={data.portraitUrl ?? 'none'} url={data.portraitUrl} name={data.fullName} />

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-medium text-stone-900">{data.fullName}</h2>
              <p className="mt-1 text-sm text-stone-500">Đời {data.generation}</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                onChange={handlePortraitChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3"
                isLoading={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {data.portraitUrl ? 'Đổi ảnh' : 'Đăng ảnh'}
              </Button>

              {uploadError ? (
                <p className="mt-2 border-l-2 border-red-600 pl-3 text-sm text-red-800">
                  {uploadError}
                </p>
              ) : null}
            </div>
          </section>

          <section>
            <h2 className="text-base text-stone-900">Thông tin cơ bản</h2>
            <dl className="mt-3 space-y-1 text-sm">
              <Row label="Giới tính" value={GenderLabel[data.gender] ?? '?'} />
              <Row label="Đời" value={String(data.generation)} />
              <Row label="Tên húy" value={data.huyName} />
              <Row label="Tên tự" value={data.tuName} />
              <Row label="Tên thụy" value={data.thuyName} />
              <Row label="Tên khác" value={data.otherNames} />
              <Row
                label="Sinh"
                value={`${YearOf(data.birthDate)} (${CalendarLabel[data.birthDate?.calendar ?? 0]})`}
              />
              <Row
                label="Mất"
                value={
                  data.deathDate
                    ? `${YearOf(data.deathDate)} (${CalendarLabel[data.deathDate.calendar]})`
                    : data.isLiving
                      ? 'Còn sống'
                      : '?'
                }
              />
              <Row label="Mức riêng tư" value={PrivacyLabel[data.privacyLevel] ?? '?'} />
              <Row label="Liên lạc" value={data.contact} />
            </dl>
          </section>

          {data.biography ? (
            <section>
              <h2 className="text-base text-stone-900">Tiểu sử</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">{data.biography}</p>
            </section>
          ) : null}

          {data.burialPlace ? (
            <section>
              <h2 className="text-base text-stone-900">Nơi an táng</h2>
              <p className="mt-2 text-sm text-stone-700">{data.burialPlace}</p>
            </section>
          ) : null}

          <section>
            <h2 className="text-base text-stone-900">Quan hệ</h2>
            <div className="mt-3 space-y-4">
              {data.spouses.length > 0 ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Vợ / chồng</p>
                  <ul className="mt-1 text-sm text-stone-700">
                    {data.spouses.map((s) => (
                      <li key={s.unionId}>
                        {s.fullName} (thứ {s.rank})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {data.parents.length > 0 ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Cha / mẹ</p>
                  <ul className="mt-1 text-sm text-stone-700">
                    {data.parents.map((p) => (
                      <li key={p.id}>{p.fullName}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {data.children.length > 0 ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Con</p>
                  <ul className="mt-1 text-sm text-stone-700">
                    {data.children.map((c) => (
                      <li key={c.id}>{c.fullName}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>

          <Button onClick={() => setEditing(true)}>Sửa hồ sơ</Button>
        </div>
      ) : (
        <p className="text-sm text-stone-500">Không tìm thấy người này.</p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-stone-500">{label}</dt>
      <dd className="text-stone-900">{value}</dd>
    </div>
  )
}

/** Ảnh chân dung, tự hiện icon mặc định khi chưa có ảnh hoặc ảnh lỗi. */
function Avatar({ url, name }: { url?: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  const resolved = url && !failed ? resolvePortraitUrl(url) : null

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={name}
        onError={() => setFailed(true)}
        className="h-24 w-24 shrink-0 rounded-full border border-stone-200 object-cover"
      />
    )
  }

  return (
    <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-400">
      <User className="h-10 w-10" />
    </span>
  )
}
