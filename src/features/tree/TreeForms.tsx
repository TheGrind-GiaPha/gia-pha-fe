import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { getApiErrorMessage } from '@/lib/api/errors'
import { addChildren, deletePerson, mergePersons, moveSubtree } from '@/lib/api/persons'
import { GenderLabel } from '@/types/person'
import type { Person } from '@/types/person'

function invalidateTree(queryClient: ReturnType<typeof useQueryClient>, clanId: string) {
  void queryClient.invalidateQueries({ queryKey: ['tree', clanId] })
}

export function AddChildForm({
  clanId,
  fatherId,
  onDone,
}: {
  clanId: string
  fatherId: string
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState(0)
  const [birthYear, setBirthYear] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      addChildren(clanId, fatherId, {
        children: [
          {
            fullName: fullName.trim(),
            gender,
            relationType: 0,
            birthDate: birthYear
              ? { year: Number(birthYear), month: null, day: null, calendar: 0, isLeapMonth: false }
              : null,
          },
        ],
      }),
    onSuccess: () => {
      onDone()
      invalidateTree(queryClient, clanId)
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên.')
      return
    }
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="add-child-name">
          Họ tên
        </label>
        <input
          id="add-child-name"
          className="text-input"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Ví dụ: Nguyễn Văn A"
          maxLength={200}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="add-child-gender">
            Giới tính
          </label>
          <select
            id="add-child-gender"
            className="text-input"
            value={gender}
            onChange={(event) => setGender(Number(event.target.value))}
          >
            {Object.entries(GenderLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="add-child-birth">
            Năm sinh
          </label>
          <input
            id="add-child-birth"
            className="text-input"
            type="number"
            value={birthYear}
            onChange={(event) => setBirthYear(event.target.value)}
            placeholder="Ví dụ: 1990"
          />
        </div>
      </div>

      {error ? <p className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{error}</p> : null}

      <Button type="submit" className="w-full" isLoading={mutation.isPending}>
        Thêm con
      </Button>
    </form>
  )
}

export function DeletePersonForm({
  clanId,
  person,
  persons,
  onDone,
}: {
  clanId: string
  person: Person
  persons: Person[]
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [strategy, setStrategy] = useState('block')
  const [newFatherId, setNewFatherId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      deletePerson(clanId, person.id, strategy, strategy === 'reparent' ? newFatherId || undefined : undefined),
    onSuccess: () => {
      onDone()
      invalidateTree(queryClient, clanId)
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (strategy === 'reparent' && !newFatherId) {
      setError('Vui lòng chọn người cha mới.')
      return
    }
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-stone-600">
        Xóa <span className="font-medium">{person.fullName}</span> (đời {person.generation}). Người này chỉ bị ẩn đi,
        không xóa cứng.
      </p>

      <div>
        <label className="field-label" htmlFor="delete-strategy">
          Cách xử lý
        </label>
        <select
          id="delete-strategy"
          className="text-input"
          value={strategy}
          onChange={(event) => setStrategy(event.target.value)}
        >
          <option value="block">Chặn nếu còn con (block)</option>
          <option value="cascade">Xóa cả cây con (cascade)</option>
          <option value="reparent">Chuyển con sang cha mới (reparent)</option>
        </select>
      </div>

      {strategy === 'reparent' ? (
        <div>
          <label className="field-label" htmlFor="delete-new-father">
            Người cha mới
          </label>
          <select
            id="delete-new-father"
            className="text-input"
            value={newFatherId}
            onChange={(event) => setNewFatherId(event.target.value)}
          >
            <option value="">— Chọn người cha mới —</option>
            {persons
              .filter((p) => p.id !== person.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} (đời {p.generation})
                </option>
              ))}
          </select>
        </div>
      ) : null}

      {error ? <p className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{error}</p> : null}

      <Button type="submit" variant="danger" className="w-full" isLoading={mutation.isPending}>
        Xóa
      </Button>
    </form>
  )
}

export function MovePersonForm({
  clanId,
  person,
  persons,
  onDone,
}: {
  clanId: string
  person: Person
  persons: Person[]
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [newFatherId, setNewFatherId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => moveSubtree(clanId, person.id, newFatherId),
    onSuccess: () => {
      onDone()
      invalidateTree(queryClient, clanId)
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newFatherId) {
      setError('Vui lòng chọn người cha mới.')
      return
    }
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-stone-600">
        Di chuyển <span className="font-medium">{person.fullName}</span> cùng toàn bộ hậu duệ sang người cha mới.
      </p>

      <div>
        <label className="field-label" htmlFor="move-new-father">
          Người cha mới
        </label>
        <select
          id="move-new-father"
          className="text-input"
          value={newFatherId}
          onChange={(event) => setNewFatherId(event.target.value)}
        >
          <option value="">— Chọn người cha mới —</option>
          {persons
            .filter((p) => p.id !== person.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} (đời {p.generation})
              </option>
            ))}
        </select>
      </div>

      {error ? <p className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{error}</p> : null}

      <Button type="submit" className="w-full" isLoading={mutation.isPending}>
        Di chuyển
      </Button>
    </form>
  )
}

export function MergePersonsForm({
  clanId,
  person,
  persons,
  onDone,
}: {
  clanId: string
  person: Person
  persons: Person[]
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [keepId, setKeepId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => mergePersons(clanId, keepId, person.id),
    onSuccess: () => {
      onDone()
      invalidateTree(queryClient, clanId)
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!keepId) {
      setError('Vui lòng chọn người giữ lại.')
      return
    }
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-stone-600">
        Gộp <span className="font-medium">{person.fullName}</span> vào một người khác (người này sẽ bị ẩn).
      </p>

      <div>
        <label className="field-label" htmlFor="merge-keep">
          Người giữ lại (keep)
        </label>
        <select
          id="merge-keep"
          className="text-input"
          value={keepId}
          onChange={(event) => setKeepId(event.target.value)}
        >
          <option value="">— Chọn người giữ lại —</option>
          {persons
            .filter((p) => p.id !== person.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} (đời {p.generation})
              </option>
            ))}
        </select>
      </div>

      {error ? <p className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{error}</p> : null}

      <Button type="submit" className="w-full" isLoading={mutation.isPending}>
        Gộp
      </Button>
    </form>
  )
}
