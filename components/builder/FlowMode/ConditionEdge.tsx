'use client'

import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow'
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
  const { deleteFlowEdge, theme } = useBuilderStore()
  const isDark = theme === 'dark'

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const edgeColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)'
  const labelBg = isDark ? '#1a1d29' : '#ffffff'
  const labelBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const labelText = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const deleteColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
  const deleteBg = isDark ? '#0f1117' : '#f4f4f5'
  const deleteBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: edgeColor, strokeWidth: 1.5 }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          className="nodrag nopan"
        >
          {data?.condition && (
            <div
              style={{
                borderRadius: 4,
                border: `1px solid ${labelBorder}`,
                background: labelBg,
                padding: '1px 6px',
                fontSize: 9,
                color: labelText,
              }}
            >
              {data.condition}
            </div>
          )}
          <button
            onClick={() => deleteFlowEdge(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: `1px solid ${deleteBorder}`,
              background: deleteBg,
              color: deleteColor,
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
              e.currentTarget.style.color = '#f87171'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = deleteBorder
              e.currentTarget.style.color = deleteColor
            }}
          >
            <X size={9} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}