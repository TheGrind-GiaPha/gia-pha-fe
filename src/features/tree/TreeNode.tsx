import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, ChevronDown, ChevronRight, GitMerge, Plus, Trash2, User } from 'lucide-react'
import { resolvePortraitUrl } from '@/lib/api/persons'
import type { Person, PersonNode } from '@/types/person'

interface TreeNodeProps {
  node: PersonNode
  depth: number
  onAddChild: (person: Person) => void
  onMove: (person: Person) => void
  onMerge: (person: Person) => void
  onDelete: (person: Person) => void
}

export function TreeNode({ node, depth, onAddChild, onMove, onMerge, onDelete }: TreeNodeProps) {
  // Chỉ mở tới đời 2 mặc định; các nhánh lớn (vd 27 con của Minh Mạng) thu gọn.
  const [expanded, setExpanded] = useState(depth < 1)
  const { person } = node
  const hasChildren = node.children.length > 0
  const portrait = resolvePortraitUrl(person.portraitUrl)
  const birthYear = person.birthDate?.year
  const deathYear = person.deathDate?.year

  // "Nguyễn Phúc Ánh (Gia Long)" -> hiển thị "Gia Long"; tên đầy đủ xem khi hover.
  const titleMatch = person.fullName.match(/\(([^)]+)\)/)
  const displayName = titleMatch ? titleMatch[1] : person.fullName

  return (
    <li>
      <div className="group relative flex flex-col items-center">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          disabled={!hasChildren}
          className="w-44 cursor-pointer rounded-lg border border-stone-200 bg-white p-3 text-center shadow-sm transition-shadow hover:shadow disabled:cursor-default"
          title={person.fullName}
          aria-label={`${person.fullName}, đời ${person.generation}`}
        >
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

          <p className="mt-2 truncate text-sm font-medium text-stone-900">{displayName}</p>
          <p className="text-xs text-stone-500">
            Đời {person.generation}
            {birthYear || deathYear ? ` · ${birthYear ?? '?'}–${deathYear ?? '?'}` : ''}
          </p>

          {hasChildren ? (
            <span className="mt-1 inline-flex items-center justify-center text-stone-400">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="text-xs">({node.children.length})</span>
            </span>
          ) : null}
        </button>

        {/* Hành động: hiện khi hover */}
        <div className="absolute -bottom-3 hidden gap-0.5 rounded-full border border-stone-200 bg-white px-1 shadow-sm group-hover:flex">
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
      </div>

      {expanded && hasChildren ? (
        <ul className="family-tree">
          {node.children.map((child) => (
            <TreeNode
              key={child.person.id}
              node={child}
              depth={depth + 1}
              onAddChild={onAddChild}
              onMove={onMove}
              onMerge={onMerge}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full p-1 text-stone-500 hover:bg-stone-200 hover:text-stone-800"
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  )
}
