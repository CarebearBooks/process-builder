'use client'

import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'

import StepNode from './StepNode'
import { StartNode, EndNode } from './StartEndNodes'
import ConditionEdge from './ConditionEdge'
import { nanoid } from 'nanoid'
import { stepsToGraph } from '@/lib/serlializer'
import { STEP_TYPE_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { StepType } from '@/src/types/step'

const nodeTypes = {
  stepNode: StepNode,
  startNode: StartNode,
  endNode: EndNode,
}

const edgeTypes = {
  condition: ConditionEdge,
}

export default function FlowCanvas() {
  const {
    steps,
    flowNodes, setFlowNodes,
    flowEdges, setFlowEdges,
    connectFlowNodes,
    addFlowNode,
  } = useBuilderStore()

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Initialize from steps when switching to Flow mode
  useEffect(() => {
    if (flowNodes.length === 0 && steps.length > 0) {
      const graph = stepsToGraph(steps)
      setNodes(graph.nodes as Node[])
      setEdges(graph.edges as Edge[])
      setFlowNodes(graph.nodes)
      setFlowEdges(graph.edges)
    } else if (flowNodes.length > 0) {
      setNodes(flowNodes as Node[])
      setEdges(flowEdges as Edge[])
    } else {
      // Empty canvas — just START and END
      const graph = stepsToGraph([])
      setNodes(graph.nodes as Node[])
      setEdges(graph.edges as Edge[])
    }
  }, [])

  // Sync local React Flow state → Zustand on every change
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes)
      setFlowNodes(nodes as any)
    },
    [nodes, onNodesChange, setFlowNodes]
  )

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes)
      setFlowEdges(edges as any)
    },
    [edges, onEdgesChange, setFlowEdges]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `e-${nanoid()}`,
        type: 'condition',
      } as Edge
      setEdges((eds) => addEdge(newEdge, eds))
      connectFlowNodes(newEdge as any)
    },
    [setEdges, connectFlowNodes]
  )

  const handleAddNode = (type: StepType) => {
    const cfg = STEP_TYPE_CONFIG[type]
    const id = nanoid()
    const newNode: Node = {
      id,
      type: 'stepNode',
      position: {
        x: 100 + Math.random() * 200,
        y: 100 + nodes.filter((n) => n.type === 'stepNode').length * 140,
      },
      data: {
        step: {
          id,
          type,
          name: `${cfg.label} Step`,
          description: cfg.description,
          autonomy_level: 'supervised',
          assigned_role: type === 'human' ? 'accountant' : 'ai_agent',
          config: {},
        },
      },
    }
    setNodes((nds) => [...nds, newNode])
    addFlowNode(newNode as any)
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode="Delete"
        className="bg-[#0d0f18]"
        defaultEdgeOptions={{
          type: 'condition',
          style: { stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1.5 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        <Controls
          className="!bg-[#1a1d29] !border-white/10 !rounded-xl overflow-hidden"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-[#0a0c12] !border-white/10 !rounded-xl"
          nodeColor={(node) => {
            if (node.type === 'startNode') return '#3b82f6'
            if (node.type === 'endNode') return '#10b981'
            const step = node.data?.step
            if (!step) return '#374151'
            return STEP_TYPE_CONFIG[step.type as StepType]?.color ?? '#374151'
          }}
          maskColor="rgba(0,0,0,0.4)"
        />

        {/* Add step panel — top left */}
        <Panel position="top-left">
          <div className="flex flex-col gap-1 rounded-xl border border-white/[0.08] bg-[#0d0f18] p-2.5 shadow-xl">
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[1.5px] text-white/25 px-1">
              Add Step
            </p>
            {(Object.entries(STEP_TYPE_CONFIG) as [StepType, typeof STEP_TYPE_CONFIG[StepType]][]).map(
              ([type, cfg]) => (
                <button
                  key={type}
                  onClick={() => handleAddNode(type)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left hover:bg-white/[0.06] transition-colors"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ background: cfg.color }}
                  />
                  <span className="text-[12px] text-white/55">{cfg.label}</span>
                </button>
              )
            )}
          </div>
        </Panel>

      </ReactFlow>
    </div>
  )
}