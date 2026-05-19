'use client'

import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'

import { X } from 'lucide-react'
import { useBuilderStore } from '@/src/store/builderStore'

export default function ConditionEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition, targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const deleteFlowEdge = useBuilderStore((s) => s.deleteFlowEdge)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1.5 }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex items-center gap-1"
        >
          {data?.condition && (
            <div className="rounded-md border border-white/10 bg-[#1a1d29] px-2 py-0.5 text-[10px] text-white/40">
              {data.condition}
            </div>
          )}
          <button
            onClick={() => deleteFlowEdge(id)}
            className="flex h-4 w-4 items-center justify-center rounded-full border border-white/10 bg-[#0f1117] text-white/25 hover:border-rose-500/40 hover:text-rose-400 transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}