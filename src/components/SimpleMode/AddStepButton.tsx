'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { nanoid } from 'nanoid'
import { useBuilderStore } from '@/src/store/builderStore'
import { StepType, Step } from '@/src/types/step'

const STEP_TYPES: { type: StepType; label: string; desc: string; color: string; lightColor: string }[] = [
  { type: 'data',          label: 'Data',          desc: 'Import, fetch, sync',     color: '#3b82f6', lightColor: '#2563eb' },
  { type: 'ai',            label: 'AI',            desc: 'Analyze, categorize',     color: '#a855f7', lightColor: '#7c3aed' },
  { type: 'human',         label: 'Human',         desc: 'Review, approve',         color: '#f59e0b', lightColor: '#d97706' },
  { type: 'communication', label: 'Communication', desc: 'Email, SMS, notify',      color: '#22c55e', lightColor: '#16a34a' },
  { type: 'logic',         label: 'Logic',         desc: 'Branch, condition',       color: '#f43f5e', lightColor: '#e11d48' },
  { type: 'reporting',     label: 'Reporting',     desc: 'Generate, export',        color: '#06b6d4', lightColor: '#0891b2' },
]

interface Props {
  insertAt: number
  isDark: boolean
}

export default function AddStepButton({ insertAt, isDark }: Props) {
  const [open, setOpen] = useState(false)
  const { addStep, defaultAutonomy } = useBuilderStore()

  function handleAdd(type: StepType) {
    const newStep: Step = {
      id:            nanoid(),
      type,
      name:          STEP_TYPES.find(t => t.type === type)?.label + ' Step',
      description:   STEP_TYPES.find(t => t.type === type)?.desc ?? '',
      autonomy_level: defaultAutonomy,
      assigned_role: type === 'human' ? 'accountant' : 'ai_agent',
      config:        {},
    }
    addStep(newStep, insertAt)
    setOpen(false)
  }

  const borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)'
  const dotColor    = isDark ? 'rgba(255,255,255,0.2)'  : 'rgba(0,0,0,0.25)'
  const popupBg     = isDark ? '#1e2130' : '#ffffff'
  const popupBorder = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.12)'
  const textMuted   = isDark ? 'rgba(255,255,255,0.4)'  : 'rgba(0,0,0,0.45)'
  const textMain    = isDark ? '#ffffff' : '#0f1117'
  const hoverBg     = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'

  return (
    <div className="relative flex flex-col items-center">
      <button
        className="flex h-5 w-5 items-center justify-center rounded-full transition-all duration-150"
        style={{
          border: `1.5px dashed ${open ? '#3b82f6' : borderColor}`,
          color:  open ? '#3b82f6' : dotColor,
          background: open ? 'rgba(59,130,246,0.1)' : 'transparent',
        }}
        onClick={() => setOpen(!open)}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.borderColor = '#3b82f6'
            e.currentTarget.style.color = '#3b82f6'
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = borderColor
            e.currentTarget.style.color = dotColor
          }
        }}
      >
        <Plus className="h-2.5 w-2.5" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          {/* Popup */}
          <div
            className="absolute top-7 z-20 rounded-xl p-2 shadow-xl"
            style={{
              background: popupBg,
              border: `1px solid ${popupBorder}`,
              width: '200px',
              boxShadow: isDark
                ? '0 8px 32px rgba(0,0,0,0.5)'
                : '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <p
              className="text-[10px] font-semibold tracking-widest uppercase px-2 pb-1.5"
              style={{ color: textMuted }}
            >
              Add Step
            </p>
            {STEP_TYPES.map(t => (
              <button
                key={t.type}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors text-left"
                style={{ background: 'transparent' }}
                onClick={() => handleAdd(t.type)}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="h-2 w-2 rounded-sm flex-shrink-0"
                  style={{ background: isDark ? t.color : t.lightColor }}
                />
                <div>
                  <div className="text-xs font-medium" style={{ color: textMain }}>{t.label}</div>
                  <div className="text-[10px]" style={{ color: textMuted }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}