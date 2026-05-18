'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STEP_TYPE_CONFIG, AUTONOMY_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { Step } from '@/src/types/step'

export default function StepCard({ step }: { step: Step }) {
  const { selectedStepId, setSelectedStepId, deleteStep } = useBuilderStore()
  const tc = STEP_TYPE_CONFIG[step.type]
  const ac = AUTONOMY_CONFIG[step.autonomy_level]
  const isSelected = selectedStepId === step.id

  return (
    <div
      onClick={() => setSelectedStepId(isSelected ? null : step.id)}
      className={cn(
        'w-full max-w-sm rounded-xl border cursor-pointer transition-all duration-150',
        isSelected
          ? 'border-blue-500/60 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
          : 'border-white/[0.08] hover:border-white/20'
      )}
    >
      {/* Header */}
      <div
        className="flex items-start gap-2.5 rounded-t-xl px-3 py-2.5"
        style={{ background: tc.bgColor }}
      >
        <span
          className="mt-0.5 h-2 w-2 shrink-0 rounded-sm"
          style={{ background: tc.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: tc.color }}>
            {tc.label}
          </p>
          <p className="text-sm font-medium text-white leading-snug">{step.name}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); deleteStep(step.id) }}
          className="mt-0.5 rounded p-0.5 text-white/20 hover:bg-white/10 hover:text-white/60 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 bg-[#1a1d29] rounded-b-xl">
        <p className="text-xs text-white/35 leading-relaxed">{step.description}</p>
        {/* Autonomy bar */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-white/[0.07]">
            <div
              className="h-1 rounded-full transition-all"
              style={{ width: `${ac.pct}%`, background: ac.color }}
            />
          </div>
          <span className="text-[10px] text-white/25 whitespace-nowrap">{ac.label}</span>
        </div>
      </div>
    </div>
  )
}