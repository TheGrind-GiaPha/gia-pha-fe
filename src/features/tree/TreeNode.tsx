import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, ChevronDown, ChevronRight, GitMerge, Plus, Trash2 } from 'lucide-react'
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
  const [expanded, setExpanded] = useState(depth < 2)
  const { person } = node
  const hasChildren = node.children.length > 0
  const portrait = resolvePortraitUrl(person.portraitUrl)
  const birthYear = person.birthDate?.year
  const deathYear = person.deathDate?.year

  return (
    <li>
      <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-stone-50">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          disabled={!hasChildren}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-stone-500 hover:bg-stone-100 disabled:opacity-0"
          aria-label={expanded ? 'Thu gọn' : 'Mở rộng'}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : null}
        </button>

        {portrait ? (
          <img src={portrait} alt={person.fullName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-800">
            {person.fullName.charAt(0)}
          </span>
        )}

        <span className="text-sm text-stone-900">{person.fullName}</span>
        <span className="text-xs text-stone-500">đời {person.generation}</span>
        {birthYear || deathYear ? (
          <span className="text-xs text-stone-400">
            {birthYear ?? '?'}–{deathYear ?? '?'}
          </span>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <ActionButton label="Thêm con" onClick={() => onAddChild(person)}>
            <Plus className="h-4 w-4" />
          </ActionButton>
          <ActionButton label="Di chuyển" onClick={() => onMove(person)}>
            <ArrowRight className="h-4 w-4" />
          </ActionButton>
          <ActionButton label="Gộp" onClick={() => onMerge(person)}>
            <GitMerge className="h-4 w-4" />
          </ActionButton>
          <ActionButton label="Xóa" onClick={() => onDelete(person)}>
            <Trash2 className="h-4 w-4" />
          </ActionButton>
        </div>
      </div>

      {expanded && hasChildren ? (
        <ul className="ml-5 border-l border-stone-200 pl-2">
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
      className="rounded p-1.5 text-stone-500 hover:bg-stone-200 hover:text-stone-800"
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  )
}
