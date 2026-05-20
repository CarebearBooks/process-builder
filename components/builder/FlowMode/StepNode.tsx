'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STEP_TYPE_CONFIG, AUTONOMY_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { Step } from '@/src/types/step'


interface StepNodeData {
  step: Step
}

function StepNode({ data, selected }: NodeProps<StepNodeData>) {
  const { step } = data
  const { setSelectedStepId, deleteFlowNode, theme } = useBuilderStore()
  const tc = STEP_TYPE_CONFIG[step.type]
  const ac = AUTONOMY_CONFIG[step.autonomy_level]

  const isDark = theme === 'dark'

  const nodeBg = isDark ? '#1a1d29' : '#ffffff'
  const bodyBg = isDark ? '#13151f' : '#f9f9fa'
  const borderColor = selected
    ? 'rgba(59,130,246,0.7)'
    : isDark
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(0,0,0,0.1)'
  const descColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)'
  const autoBarBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const autoLabelColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const deleteColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'

  return (
    <div
      onClick={() => setSelectedStepId(step.id)}
      style={{
        width: 230,
        borderRadius: 10,
        border: `1.5px solid ${borderColor}`,
        overflow: 'hidden',
        cursor: 'pointer',
        background: nodeBg,
        boxShadow: selected
          ? '0 0 0 1px rgba(59,130,246,0.25)'
          : isDark
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Input handle — top */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
          border: isDark ? '2px solid rgba(255,255,255,0.25)' : '2px solid rgba(0,0,0,0.2)',
          borderRadius: '50%',
        }}
      />

      {/* Header */}
      <div
        style={{
          background: tc.bgColor,
          padding: '8px 10px 7px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: 2,
            background: tc.color,
            flexShrink: 0,
            marginTop: 5,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: tc.color,
              marginBottom: 2,
            }}
          >
            {tc.label}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: isDark ? '#ffffff' : '#0f1117',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {step.name}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteFlowNode(step.id)
          }}
          style={{
            marginTop: 2,
            padding: 2,
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: deleteColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
            e.currentTarget.style.color = '#f87171'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = deleteColor
          }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Body */}
      <div style={{ background: bodyBg, padding: '7px 10px 9px' }}>
        <div
          style={{
            fontSize: 11,
            color: descColor,
            lineHeight: 1.4,
            marginBottom: 7,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {step.description}
        </div>

        {/* Autonomy bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              flex: 1,
              height: 2,
              background: autoBarBg,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${ac.pct}%`,
                height: '100%',
                background: ac.color,
                borderRadius: 2,
                transition: 'width 0.3s',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 9,
              color: autoLabelColor,
              whiteSpace: 'nowrap',
            }}
          >
            {ac.label}
          </span>
        </div>
      </div>

      {/* Output handle — bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
          border: isDark ? '2px solid rgba(255,255,255,0.25)' : '2px solid rgba(0,0,0,0.2)',
          borderRadius: '50%',
        }}
      />
    </div>
  )
}

export default memo(StepNode)