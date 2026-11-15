import type { Node, NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { ArrowRight, GitMerge, Plus, Trash2, User } from 'lucide-react'
import { resolvePortraitUrl } from '@/lib/api/persons'
import type { Person } from '@/types/person'

export interface PersonNodeData {
  [key: string]: unknown
  person: Person
  onAddChild: (person: Person) => void
  onMove: (person: Person) => void
  onMerge: (person: Person) => void
  onDelete: (person: Person) => void
}

export type PersonFlowNode = Node<PersonNodeData, 'person'>

export function PersonNodeCard({ data }: NodeProps<PersonFlowNode>) {
  const { person, onAddChild, onMove, onMerge, onDelete } = data
  const portrait = resolvePortraitUrl(person.portraitUrl)
  const birthYear = person.birthDate?.year
  const deathYear = person.deathDate?.year

  // "Nguyễn Phúc Ánh (Gia Long)" -> hiển thị "Gia Long"; tên đầy đủ xem khi hover.
  const titleMatch = person.fullName.match(/\(([^)]+)\)/)
  const displayName = titleMatch ? titleMatch[1] : person.fullName

  return (
    <div className="w-56 rounded-lg border border-stone-200 bg-white p-3 text-center shadow-sm">
      <Handle type="target" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent" />

      {portrait ? (
        <img
          src={portrait}
          alt={person.fullName}
          className="mx-auto h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <User className="h-7 w-7" />
        </span>
      )}

      <p className="mt-2 truncate text-sm font-medium text-stone-900" title={person.fullName}>
        {displayName}
      </p>
      <p className="text-xs text-stone-500">
        Đời {person.generation}
        {birthYear || deathYear ? ` · ${birthYear ?? '?'}–${deathYear ?? '?'}` : ''}
      </p>
      {person.hasHiddenChildren ? <p className="text-xs text-stone-400">(…)</p> : null}

      {/* nodrag: bấm nút không kéo node */}
      <div className="nodrag mt-2 flex justify-center gap-0.5 border-t border-stone-100 pt-1.5">
        <ActionButton label="Thêm con" onClick={() => onAddChild(person)}>
          <Plus className="h-3.5 w-3.5" />
        </ActionButton>
        <ActionButton label="Di chuyển" onClick={() => onMove(person)}>
          <ArrowRight className="h-3.5 w-3.5" />
        </ActionButton>
        <ActionButton label="Gộp" onClick={() => onMerge(person)}>
          <GitMerge className="h-3.5 w-3.5" />
        </ActionButton>
        <ActionButton label="Xóa" onClick={() => onDelete(person)}>
          <Trash2 className="h-3.5 w-3.5" />
        </ActionButton>
      </div>

      <Handle type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent" />
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded p-1 text-stone-500 hover:bg-stone-200 hover:text-stone-800"
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  )
}
