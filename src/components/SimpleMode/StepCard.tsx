'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STEP_TYPE_CONFIG, AUTONOMY_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { Step } from '@/src/types/step'

export default function StepCard({ step }: { step: Step }) {
  const { selectedStepId, setSelectedStepId, deleteStep, updateStep } = useBuilderStore()
  const tc = STEP_TYPE_CONFIG[step.type]
  const ac = AUTONOMY_CONFIG[step.autonomy_level]
  const isSelected = selectedStepId === step.id

  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingName) nameRef.current?.focus()
  }, [editingName])

  useEffect(() => {
    if (editingDesc) descRef.current?.focus()
  }, [editingDesc])

  const commitName = (val: string) => {
    const trimmed = val.trim()
    if (trimmed) updateStep(step.id, { name: trimmed })
    setEditingName(false)
  }

  const commitDesc = (val: string) => {
    updateStep(step.id, { description: val.trim() })
    setEditingDesc(false)
  }

  return (
    <div
      onClick={() => setSelectedStepId(isSelected ? null : step.id)}
      className={cn(
        'w-full max-w-sm rounded-xl border cursor-pointer transition-all duration-150 select-none',
        isSelected
          ? 'border-blue-500/60 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
          : 'border-white/[0.08] hover:border-white/20'
      )}
    >
      {/* ── Header ── */}
      <div
        className="flex items-start gap-2.5 rounded-t-xl px-3 py-2.5"
        style={{ background: tc.bgColor }}
      >
        <span
          className="mt-0.5 h-2 w-2 shrink-0 rounded-sm"
          style={{ background: tc.color }}
        />

        <div className="flex-1 min-w-0">
          {/* Type label */}
          <p
            className="text-[9px] font-semibold uppercase tracking-wider mb-0.5"
            style={{ color: tc.color }}
          >
            {tc.label}
          </p>

          {/* Step name — double-click to edit */}
          {editingName ? (
            <input
              ref={nameRef}
              defaultValue={step.name}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => commitName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName(e.currentTarget.value)
                if (e.key === 'Escape') setEditingName(false)
              }}
              className="w-full rounded bg-white/10 px-1.5 py-0.5 text-sm font-medium text-white outline-none ring-1 ring-blue-500/60"
            />
          ) : (
            <p
              className="text-sm font-medium text-white leading-snug"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setSelectedStepId(step.id)
                setEditingName(true)
              }}
              title="Double-click to rename"
            >
              {step.name}
            </p>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteStep(step.id)
          }}
          className="mt-0.5 rounded p-0.5 text-white/20 hover:bg-white/10 hover:text-white/60 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="px-3 py-2.5 bg-[#1a1d29] rounded-b-xl">

        {/* Description — double-click to edit */}
        {editingDesc ? (
          <input
            ref={descRef}
            defaultValue={step.description}
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => commitDesc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitDesc(e.currentTarget.value)
              if (e.key === 'Escape') setEditingDesc(false)
            }}
            className="w-full rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/70 outline-none ring-1 ring-blue-500/40"
          />
        ) : (
          <p
            className="text-xs text-white/35 leading-relaxed"
            onDoubleClick={(e) => {
              e.stopPropagation()
              setSelectedStepId(step.id)
              setEditingDesc(true)
            }}
            title="Double-click to edit"
          >
            {step.description || <span className="italic text-white/20">No description</span>}
          </p>
        )}

        {/* Autonomy bar */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-white/[0.07]">
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{ width: `${ac.pct}%`, background: ac.color }}
            />
          </div>
          <span className="text-[10px] text-white/25 whitespace-nowrap">{ac.label}</span>
        </div>

        {/* Assigned role chip */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[10px] text-white/20">Assigned:</span>
          <span className="text-[10px] text-white/40 font-medium">
            {step.assigned_role === 'ai_agent' ? 'AI Agent' :
             step.assigned_role === 'accountant' ? 'Accountant' :
             step.assigned_role === 'staff' ? 'Staff' : 'Client'}
          </span>
        </div>

      </div>
    </div>
  )
}