'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STEP_TYPE_CONFIG, AUTONOMY_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { Step } from '@/src/types/step'

interface StepNodeData {
  step?: Step // Made optional to account for edge cases where data might be missing
}

function StepNode({ data, selected }: NodeProps<StepNodeData>) {
  const { step } = data
  const { setSelectedStepId, deleteFlowNode } = useBuilderStore()

  // 1. Guard Clause: If step data is entirely missing or undefined, 
  // render a fallback UI instead of throwing a runtime TypeError.
  if (!step) {
    return (
      <div className="w-64 rounded-xl border border-dashed border-red-500/40 bg-red-950/20 p-4 text-center">
        <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Error</p>
        <p className="text-sm text-red-200/70 mt-1">Missing step configuration data.</p>
      </div>
    )
  }

  // 2. Safe Configuration Extraction: If step.type or step.autonomy_level 
  // does not match keys in your config dictionaries, fall back to safe defaults.
  const tc = STEP_TYPE_CONFIG[step.type] || {
    bgColor: '#1e293b',    // Slate-800
    color: '#94a3b8',      // Slate-400
    label: 'Unknown Type'
  }

  const ac = AUTONOMY_CONFIG[step.autonomy_level] || {
    pct: 0,
    color: '#64748b',      // Slate-500
    label: 'Unknown'
  }

  return (
    <div
      onClick={() => setSelectedStepId(step.id)}
      className={cn(
        'w-64 rounded-xl border cursor-pointer transition-all duration-150 shadow-lg',
        selected
          ? 'border-blue-500/70 shadow-blue-500/20'
          : 'border-white/[0.1] hover:border-white/25'
      )}
    >
      {/* Input handle — top center */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-white/20 !border-white/30 hover:!bg-blue-400 transition-colors"
      />

      {/* Header */}
      <div
        className="flex items-start gap-2 rounded-t-xl px-3 py-2.5"
        style={{ background: tc.bgColor }}
      >
        <span
          className="mt-0.5 h-2 w-2 shrink-0 rounded-sm"
          style={{ background: tc.color }}
        />
        <div className="flex-1 min-w-0">
          <p
            className="text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: tc.color }}
          >
            {tc.label}
          </p>
          <p className="text-sm font-medium text-white leading-snug truncate">
            {step.name}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteFlowNode(step.id)
          }}
          className="mt-0.5 rounded p-0.5 text-white/20 hover:bg-white/10 hover:text-white/60 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-2 bg-[#1a1d29] rounded-b-xl">
        <p className="text-[11px] text-white/35 leading-relaxed truncate">
          {step.description}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-white/[0.07]">
            <div
              className="h-1 rounded-full"
              style={{ width: `${ac.pct}%`, background: ac.color }}
            />
          </div>
          <span className="text-[10px] text-white/25">{ac.label}</span>
        </div>
      </div>

      {/* Output handle — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-white/20 !border-white/30 hover:!bg-emerald-400 transition-colors"
      />
    </div>
  )
}

export default memo(StepNode)