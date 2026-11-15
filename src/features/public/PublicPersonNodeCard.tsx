import type { Node, NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { User } from 'lucide-react'
import { resolvePortraitUrl } from '@/lib/api/persons'
import type { PublicPerson } from '@/types/public'

export interface PublicNodeData {
  [key: string]: unknown
  person: PublicPerson
}

export type PublicFlowNode = Node<PublicNodeData, 'publicPerson'>

export function PublicPersonNodeCard({ data }: NodeProps<PublicFlowNode>) {
  const { person } = data
  const portrait = resolvePortraitUrl(person.portraitUrl)
  const birthYear = person.birthDate?.year
  const deathYear = person.deathDate?.year
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
      {person.isLiving ? <p className="text-xs text-stone-400">Còn sống</p> : null}

      <Handle type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent" />
    </div>
  )
}
