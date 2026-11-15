import { useMemo } from 'react'
import { Background, Controls, ReactFlow, type Edge } from '@xyflow/react'
import { hierarchy, tree as d3Tree } from 'd3-hierarchy'
import '@xyflow/react/dist/style.css'
import type { Person, PersonNode } from '@/types/person'
import { PersonNodeCard, type PersonFlowNode } from './PersonNodeCard'
import { TreeEdge } from './TreeEdge'

const NODE_WIDTH = 224
const NODE_HEIGHT = 176
const GAP_X = 36
const GAP_Y = 48

interface TreeCanvasProps {
  tree: PersonNode
  onAddChild: (person: Person) => void
  onMove: (person: Person) => void
  onMerge: (person: Person) => void
  onDelete: (person: Person) => void
}

// Phải khai báo ngoài component để React Flow không tạo lại mỗi render.
const nodeTypes = { person: PersonNodeCard }
const edgeTypes = { tree: TreeEdge }

export function TreeCanvas({ tree, onAddChild, onMove, onMerge, onDelete }: TreeCanvasProps) {
  const { nodes, edges } = useMemo(() => {
    // d3-hierarchy: tự động căn cha ở trên, con ở dưới, anh em xếp đều.
    const root = hierarchy(tree, (node) => node.children)
    d3Tree<PersonNode>()
      .nodeSize([NODE_WIDTH + GAP_X, NODE_HEIGHT + GAP_Y])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.2))(root)

    const flowNodes: PersonFlowNode[] = root.descendants().map((node) => ({
      id: node.data.person.id,
      type: 'person',
      position: { x: (node.x ?? 0) - NODE_WIDTH / 2, y: node.y ?? 0 },
      data: { person: node.data.person, onAddChild, onMove, onMerge, onDelete },
    }))

    const flowEdges: Edge[] = root.links().map((link) => ({
      id: `${link.source.data.person.id}-${link.target.data.person.id}`,
      source: link.source.data.person.id,
      target: link.target.data.person.id,
      type: 'tree',
      style: { stroke: '#d6d3d1', strokeWidth: 1 },
    }))

    return { nodes: flowNodes, edges: flowEdges }
  }, [tree, onAddChild, onMove, onMerge, onDelete])

  return (
    <div className="h-[72vh] w-full overflow-hidden rounded-lg border border-stone-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="#e7e5e4" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
