import { useMemo } from 'react'
import { Background, Controls, ReactFlow, type Edge } from '@xyflow/react'
import { hierarchy, tree as d3Tree } from 'd3-hierarchy'
import '@xyflow/react/dist/style.css'
import { TreeEdge } from '@/features/tree/TreeEdge'
import type { PublicPersonNode } from '@/types/public'
import { PublicPersonNodeCard, type PublicFlowNode } from './PublicPersonNodeCard'

const NODE_WIDTH = 224
const NODE_HEIGHT = 176
const GAP_X = 36
const GAP_Y = 48

const nodeTypes = { publicPerson: PublicPersonNodeCard }
const edgeTypes = { tree: TreeEdge }

export function PublicTreeCanvas({ tree }: { tree: PublicPersonNode }) {
  const { nodes, edges } = useMemo(() => {
    const root = hierarchy(tree, (node) => node.children)
    d3Tree<PublicPersonNode>()
      .nodeSize([NODE_WIDTH + GAP_X, NODE_HEIGHT + GAP_Y])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.2))(root)

    const flowNodes: PublicFlowNode[] = root.descendants().map((node) => ({
      id: node.data.person.id,
      type: 'publicPerson',
      position: { x: (node.x ?? 0) - NODE_WIDTH / 2, y: node.y ?? 0 },
      data: { person: node.data.person },
    }))

    const flowEdges: Edge[] = root.links().map((link) => ({
      id: `${link.source.data.person.id}-${link.target.data.person.id}`,
      source: link.source.data.person.id,
      target: link.target.data.person.id,
      type: 'tree',
      style: { stroke: '#d6d3d1', strokeWidth: 1 },
    }))

    return { nodes: flowNodes, edges: flowEdges }
  }, [tree])

  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-lg border border-stone-200 bg-white">
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
