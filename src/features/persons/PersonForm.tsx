import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import {
  CalendarLabel,
  GenderLabel,
  PrivacyLabel,
  type FlexibleDate,
  type PersonProfileRequest,
} from '@/types/person'

interface PersonFormProps {
  initial?: PersonProfileRequest | null
  submitLabel: string
  isLoading?: boolean
  onSubmit: (payload: PersonProfileRequest) => void
  error?: string | null
}

function toDate(year: string, calendar: number): FlexibleDate | null {
  const y = year.trim()
  if (!y) return null
  return { year: Number(y), month: null, day: null, calendar, isLeapMonth: false }
}

export function PersonForm({ initial, submitLabel, isLoading, onSubmit, error }: PersonFormProps) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '')
  const [gender, setGender] = useState(initial?.gender ?? 0)
  const [huyName, setHuyName] = useState(initial?.huyName ?? '')
  const [tuName, setTuName] = useState(initial?.tuName ?? '')
  const [thuyName, setThuyName] = useState(initial?.thuyName ?? '')
  const [birthYear, setBirthYear] = useState(initial?.birthDate?.year?.toString() ?? '')
  const [birthCalendar, setBirthCalendar] = useState(initial?.birthDate?.calendar ?? 0)
  const [deathYear, setDeathYear] = useState(initial?.deathDate?.year?.toString() ?? '')
  const [deathCalendar, setDeathCalendar] = useState(initial?.deathDate?.calendar ?? 0)
  const [biography, setBiography] = useState(initial?.biography ?? '')
  const [burialPlace, setBurialPlace] = useState(initial?.burialPlace ?? '')
  const [contact, setContact] = useState(initial?.contact ?? '')
  const [privacyLevel, setPrivacyLevel] = useState(initial?.privacyLevel ?? 0)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!fullName.trim()) return
    onSubmit({
      fullName: fullName.trim(),
      gender,
      huyName: huyName.trim() || null,
      tuName: tuName.trim() || null,
      thuyName: thuyName.trim() || null,
      otherNames: null,
      birthDate: toDate(birthYear, birthCalendar),
      deathDate: toDate(deathYear, deathCalendar),
      biography: biography.trim() || null,
      burialPlace: burialPlace.trim() || null,
      burialMapUrl: null,
      contact: contact.trim() || null,
      privacyLevel,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="pf-fullname">
          Họ tên
        </label>
        <input
          id="pf-fullname"
          className="text-input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="pf-gender">
            Giới tính
          </label>
          <select
            id="pf-gender"
            className="text-input"
            value={gender}
            onChange={(e) => setGender(Number(e.target.value))}
          >
            {Object.entries(GenderLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="pf-huy">
            Tên húy
          </label>
          <input
            id="pf-huy"
            className="text-input"
            value={huyName}
            onChange={(e) => setHuyName(e.target.value)}
            maxLength={200}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="pf-tu">
            Tên tự
          </label>
          <input
            id="pf-tu"
            className="text-input"
            value={tuName}
            onChange={(e) => setTuName(e.target.value)}
            maxLength={200}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="pf-thuy">
            Tên thụy
          </label>
          <input
            id="pf-thuy"
            className="text-input"
            value={thuyName}
            onChange={(e) => setThuyName(e.target.value)}
            maxLength={200}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="pf-birth">
            Năm sinh
          </label>
          <input
            id="pf-birth"
            className="text-input"
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="Ví dụ: 1950"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="pf-birth-cal">
            Lịch sinh
          </label>
          <select
            id="pf-birth-cal"
            className="text-input"
            value={birthCalendar}
            onChange={(e) => setBirthCalendar(Number(e.target.value))}
          >
            {Object.entries(CalendarLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="pf-death">
            Năm mất
          </label>
          <input
            id="pf-death"
            className="text-input"
            type="number"
            value={deathYear}
            onChange={(e) => setDeathYear(e.target.value)}
            placeholder="Để trống nếu còn sống"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="pf-death-cal">
            Lịch mất
          </label>
          <select
            id="pf-death-cal"
            className="text-input"
            value={deathCalendar}
            onChange={(e) => setDeathCalendar(Number(e.target.value))}
          >
            {Object.entries(CalendarLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="pf-bio">
          Tiểu sử
        </label>
        <textarea
          id="pf-bio"
          className="text-input min-h-[80px] resize-y"
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          maxLength={4000}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="pf-burial">
            Nơi an táng
          </label>
          <input
            id="pf-burial"
            className="text-input"
            value={burialPlace}
            onChange={(e) => setBurialPlace(e.target.value)}
            maxLength={500}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="pf-contact">
            Liên lạc
          </label>
          <input
            id="pf-contact"
            className="text-input"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="SĐT / email / Zalo"
            maxLength={500}
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="pf-privacy">
          Mức riêng tư
        </label>
        <select
          id="pf-privacy"
          className="text-input"
          value={privacyLevel}
          onChange={(e) => setPrivacyLevel(Number(e.target.value))}
        >
          {Object.entries(PrivacyLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{error}</p> : null}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  )
}
