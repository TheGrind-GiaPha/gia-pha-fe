import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { getClans } from '@/lib/api/clans'
import { getApiErrorMessage } from '@/lib/api/errors'
import { getTree } from '@/lib/api/persons'
import type { Person, PersonNode } from '@/types/person'
import { TreeNode } from './TreeNode'
import { AddChildForm, DeletePersonForm, MergePersonsForm, MovePersonForm } from './TreeForms'

type TreeAction =
  | { type: 'addChild' | 'delete' | 'move' | 'merge'; person: Person }
  | null

export function TreePage() {
  const [clanId, setClanId] = useState('')
  const [action, setAction] = useState<TreeAction>(null)

  const { data: clans } = useQuery({
    queryKey: ['clans'],
    queryFn: () => getClans(),
  })

  const { data: tree, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tree', clanId],
    queryFn: () => getTree(clanId),
    enabled: Boolean(clanId),
  })

  const persons = tree ? flattenTree(tree) : []

  return (
    <div className="space-y-6">
      <PageHeader title="Cây phả hệ" />

      <div>
        <label className="field-label" htmlFor="tree-clan">
          Chọn dòng họ
        </label>
        <select
          id="tree-clan"
          className="text-input max-w-sm"
          value={clanId}
          onChange={(event) => setClanId(event.target.value)}
        >
          <option value="">— Chọn dòng họ —</option>
          {clans?.map((clan) => (
            <option key={clan.id} value={clan.id}>
              {clan.name}
            </option>
          ))}
        </select>
      </div>

      {!clanId ? (
        <EmptyState title="Chưa chọn dòng họ" description="Chọn một dòng họ ở trên để xem cây phả hệ." />
      ) : isLoading ? (
        <p className="text-sm text-stone-500">Đang tải cây phả hệ...</p>
      ) : isError ? (
        <div className="border-l-2 border-red-600 pl-3 text-sm text-red-800">
          <p>{getApiErrorMessage(error)}</p>
          <button type="button" className="mt-1 underline" onClick={() => void refetch()}>
            Thử lại
          </button>
        </div>
      ) : tree ? (
        <div className="overflow-x-auto pb-10">
          <ul className="family-tree">
            <TreeNode
              node={tree}
              depth={0}
              onAddChild={(person) => setAction({ type: 'addChild', person })}
              onMove={(person) => setAction({ type: 'move', person })}
              onMerge={(person) => setAction({ type: 'merge', person })}
              onDelete={(person) => setAction({ type: 'delete', person })}
            />
          </ul>
        </div>
      ) : null}

      <Modal open={action !== null} title={modalTitle(action)} onClose={() => setAction(null)}>
        {action?.type === 'addChild' ? (
          <AddChildForm clanId={clanId} fatherId={action.person.id} onDone={() => setAction(null)} />
        ) : action?.type === 'delete' ? (
          <DeletePersonForm
            clanId={clanId}
            person={action.person}
            persons={persons}
            onDone={() => setAction(null)}
          />
        ) : action?.type === 'move' ? (
          <MovePersonForm
            clanId={clanId}
            person={action.person}
            persons={persons}
            onDone={() => setAction(null)}
          />
        ) : action?.type === 'merge' ? (
          <MergePersonsForm
            clanId={clanId}
            person={action.person}
            persons={persons}
            onDone={() => setAction(null)}
          />
        ) : null}
      </Modal>
    </div>
  )
}

function flattenTree(node: PersonNode): Person[] {
  return [node.person, ...node.children.flatMap(flattenTree)]
}

function modalTitle(action: TreeAction): string {
  switch (action?.type) {
    case 'addChild':
      return 'Thêm con'
    case 'delete':
      return 'Xóa người'
    case 'move':
      return 'Di chuyển cây con'
    case 'merge':
      return 'Gộp người trùng'
    default:
      return ''
  }
}
