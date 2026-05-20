'use client'

import { useState, useRef, useEffect } from 'react'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AUTONOMY_CONFIG, STEP_TYPE_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { Step } from '@/src/types/step'

export default function StepCard({ step }: { step: Step }) {
  const { selectedStepId, setSelectedStepId, deleteStep, updateStep, theme } = useBuilderStore()
  const tc = STEP_TYPE_CONFIG[step.type]
  const ac = AUTONOMY_CONFIG[step.autonomy_level]
  const isSelected = selectedStepId === step.id

  const isDark = theme === 'dark'
  const nodeBg = isDark ? '#1a1d29' : '#ffffff'
  const bodyBg = isDark ? '#13151f' : '#f9f9fa'
  const descColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const autoBarBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const autoLabelColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const assignColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const assignLabelColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'
  const borderColor = isSelected
    ? 'rgba(59,130,246,0.6)'
    : isDark
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.09)'
  const deleteColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'

  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editingName) nameRef.current?.focus() }, [editingName])
  useEffect(() => { if (editingDesc) descRef.current?.focus() }, [editingDesc])

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
        isSelected ? 'shadow-[0_0_0_1px_rgba(59,130,246,0.3)]' : ''
      )}
      style={{ borderColor, background: nodeBg }}
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
              className="w-full rounded px-1.5 py-0.5 text-sm font-medium outline-none ring-1 ring-blue-500/60"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                color: isDark ? '#ffffff' : '#0f1117',
              }}
            />
          ) : (
            <p
              className="text-sm font-medium leading-snug"
              style={{ color: isDark ? '#ffffff' : '#0f1117' }}
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

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); deleteStep(step.id) }}
          className="mt-0.5 rounded p-0.5 transition-colors"
          style={{ color: deleteColor }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
            e.currentTarget.style.color = '#f87171'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = deleteColor
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 rounded-b-xl" style={{ background: bodyBg }}>

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
            className="w-full rounded px-1.5 py-0.5 text-xs outline-none ring-1 ring-blue-500/40"
            style={{
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            }}
          />
        ) : (
          <p
            className="text-xs leading-relaxed"
            style={{ color: descColor }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setSelectedStepId(step.id)
              setEditingDesc(true)
            }}
            title="Double-click to edit"
          >
            {step.description || (
              <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No description</span>
            )}
          </p>
        )}

        {/* Autonomy bar */}
        <div className="mt-2.5 flex items-center gap-2">
          <div
            className="flex-1 h-1 rounded-full"
            style={{ background: autoBarBg }}
          >
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{ width: `${ac.pct}%`, background: ac.color }}
            />
          </div>
          <span className="text-[10px] whitespace-nowrap" style={{ color: autoLabelColor }}>
            {ac.label}
          </span>
        </div>

        {/* Assigned role */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[10px]" style={{ color: assignLabelColor }}>Assigned:</span>
          <span className="text-[10px] font-medium" style={{ color: assignColor }}>
            {step.assigned_role === 'ai_agent' ? 'AI Agent' :
             step.assigned_role === 'accountant' ? 'Accountant' :
             step.assigned_role === 'staff' ? 'Staff' : 'Client'}
          </span>
        </div>
      </div>
    </div>
  )
}