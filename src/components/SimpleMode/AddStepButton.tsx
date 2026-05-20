'use client'

import { useState } from 'react'

import { nanoid } from 'nanoid'
import { Plus } from 'lucide-react'
import { STEP_TYPE_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { StepType } from '@/src/types/step'

export default function AddStepButton({ insertAt }: { insertAt: number }) {
  const [open, setOpen] = useState(false)
  const { addStep, theme } = useBuilderStore()

  const isDark = theme === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
  const textColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
  const popoverBg = isDark ? '#1a1d29' : '#ffffff'
  const popoverBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const itemText = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'
  const itemSubText = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const itemHover = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'

  const handlePick = (type: StepType) => {
    const cfg = STEP_TYPE_CONFIG[type]
    addStep(
      {
        id: nanoid(),
        type,
        name: `${cfg.label} Step`,
        description: cfg.description,
        autonomy_level: 'supervised',
        assigned_role: type === 'human' ? 'accountant' : 'ai_agent',
        config: {},
      },
      insertAt
    )
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: `1.5px dashed ${borderColor}`,
          color: textColor,
          background: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'
          e.currentTarget.style.color = '#60a5fa'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = borderColor
          e.currentTarget.style.color = textColor
        }}
      >
        <Plus size={11} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-7 top-0 z-20 w-48 rounded-xl p-1.5 shadow-xl"
            style={{
              background: popoverBg,
              border: `1px solid ${popoverBorder}`,
            }}
          >
            {(
              Object.entries(STEP_TYPE_CONFIG) as [
                StepType,
                (typeof STEP_TYPE_CONFIG)[StepType]
              ][]
            ).map(([type, cfg]) => (
              <button
                key={type}
                onClick={() => handlePick(type)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
                style={{ color: itemText }}
                onMouseEnter={e =>
                  (e.currentTarget.style.background = itemHover)
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-sm"
                  style={{ background: cfg.color }}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: 10, color: itemSubText }}>
                    {cfg.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}