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
    deleteStep,
    theme,
  } = useBuilderStore()

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const isDark = theme === 'dark'

  // Initialize canvas from steps or existing flowNodes
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

  // KEY FIX: Sync flowNodes from store → React Flow local state
  // This makes deletions from StepNode X button reflect immediately
  useEffect(() => {
    setNodes(flowNodes as Node[])
  }, [flowNodes])

  useEffect(() => {
    setEdges(flowEdges as Edge[])
  }, [flowEdges])

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes)
      setTimeout(() => {
        setNodes((current) => {
          setFlowNodes(current as any)
          return current
        })
      }, 0)
    },
    [onNodesChange, setFlowNodes]
  )

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes)
      setTimeout(() => {
        setEdges((current) => {
          setFlowEdges(current as any)
          return current
        })
      }, 0)
    },
    [onEdgesChange, setFlowEdges]
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
        x: 180,
        y: 100 + nodes.filter((n) => n.type === 'stepNode').length * 160,
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

    // Find the edge that currently points TO 'end'
    // and redirect it through the new node
    const edgeToEnd = edges.find((e) => e.target === 'end')

    if (edgeToEnd) {
      const newEdge1: Edge = {
        id: `e-${nanoid()}`,
        source: edgeToEnd.source,
        target: id,
        type: 'condition',
      }
      const newEdge2: Edge = {
        id: `e-${nanoid()}`,
        source: id,
        target: 'end',
        type: 'condition',
      }
      const updatedEdges = [
        ...edges.filter((e) => e.id !== edgeToEnd.id),
        newEdge1,
        newEdge2,
      ]
      setEdges(updatedEdges)
      setFlowEdges(updatedEdges as any)
    } else {
      // No edge to end yet — connect new node directly to end
      const endExists = nodes.find((n) => n.id === 'end')
      if (endExists) {
        const fallbackEdge: Edge = {
          id: `e-${nanoid()}`,
          source: id,
          target: 'end',
          type: 'condition',
        }
        const updatedEdges = [...edges, fallbackEdge]
        setEdges(updatedEdges)
        setFlowEdges(updatedEdges as any)
      }
    }

    setNodes((nds) => [...nds, newNode])
    addFlowNode(newNode as any)
  }

  // When React Flow deletes nodes via keyboard Delete key,
  // also remove from steps array
  const handleNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((n) => {
        if (n.type === 'stepNode' && n.data?.step?.id) {
          deleteStep(n.data.step.id)
        }
      })
    },
    [deleteStep]
  )

  const panelBg = isDark ? '#0d0f18' : '#ffffff'
  const panelBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const panelText = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)'
  const itemText = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.6)'
  const itemHover = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodesDelete={handleNodesDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode="Delete"
        style={{ background: isDark ? '#0d0f18' : '#ededee' }}
        defaultEdgeOptions={{
          type: 'condition',
          style: {
            stroke: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
            strokeWidth: 1.5,
          },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}
        />
        <Controls
          showInteractive={false}
          style={{
            background: isDark ? '#1a1d29' : '#ffffff',
            border: `1px solid ${panelBorder}`,
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        />
        <MiniMap
          style={{
            background: isDark ? '#0a0c12' : '#f4f4f5',
            border: `1px solid ${panelBorder}`,
            borderRadius: '10px',
          }}
          nodeColor={(node) => {
            if (node.type === 'startNode') return '#3b82f6'
            if (node.type === 'endNode') return '#10b981'
            const step = node.data?.step
            if (!step) return isDark ? '#374151' : '#d1d5db'
            return STEP_TYPE_CONFIG[step.type as StepType]?.color ?? '#374151'
          }}
          maskColor={isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)'}
        />

        {/* Add step panel */}
        <Panel position="top-left">
          <div
            className="flex flex-col gap-1 rounded-xl p-2.5 shadow-xl"
            style={{ background: panelBg, border: `1px solid ${panelBorder}` }}
          >
            <p
              className="mb-1 text-[9px] font-semibold uppercase tracking-[1.5px] px-1"
              style={{ color: panelText }}
            >
              Add Step
            </p>
            {(Object.entries(STEP_TYPE_CONFIG) as [StepType, typeof STEP_TYPE_CONFIG[StepType]][]).map(
              ([type, cfg]) => (
                <button
                  key={type}
                  onClick={() => handleAddNode(type)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors"
                  style={{ color: itemText }}
                  onMouseEnter={e => (e.currentTarget.style.background = itemHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ background: cfg.color }}
                  />
                  <span className="text-[12px]">{cfg.label}</span>
                </button>
              )
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}