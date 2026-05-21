'use client'

import { useState, useRef } from 'react'
import { GripVertical, X } from 'lucide-react'
import { useBuilderStore } from '@/src/store/builderStore';
import { Step } from '@/src/types/step';


const TYPE_CONFIG: Record<string, { color: string; lightColor: string; label: string; bgDark: string; bgLight: string }> = {
  data:          { color: '#3b82f6', lightColor: '#2563eb', label: 'Data',          bgDark: 'rgba(59,130,246,0.12)',  bgLight: 'rgba(37,99,235,0.07)'  },
  ai:            { color: '#a855f7', lightColor: '#7c3aed', label: 'AI',            bgDark: 'rgba(168,85,247,0.12)', bgLight: 'rgba(124,58,237,0.07)' },
  human:         { color: '#f59e0b', lightColor: '#d97706', label: 'Human',         bgDark: 'rgba(245,158,11,0.12)', bgLight: 'rgba(217,119,6,0.07)'  },
  communication: { color: '#22c55e', lightColor: '#16a34a', label: 'Communication', bgDark: 'rgba(34,197,94,0.12)',  bgLight: 'rgba(22,163,74,0.07)'  },
  logic:         { color: '#f43f5e', lightColor: '#e11d48', label: 'Logic',         bgDark: 'rgba(244,63,94,0.12)',  bgLight: 'rgba(225,29,72,0.07)'  },
  reporting:     { color: '#06b6d4', lightColor: '#0891b2', label: 'Reporting',     bgDark: 'rgba(6,182,212,0.12)',  bgLight: 'rgba(8,145,178,0.07)'  },
}

const AUTONOMY_CONFIG = [
  { label: 'Manual',     color: '#94a3b8', pct: 0   },
  { label: 'Assisted',   color: '#60a5fa', pct: 33  },
  { label: 'Supervised', color: '#818cf8', pct: 66  },
  { label: 'Autonomous', color: '#34d399', pct: 100 },
]

const AUTONOMY_MAP: Record<string, number> = {
  manual: 0, assisted: 1, supervised: 2, autonomous: 3,
}

interface Props {
  step: Step
  isDark: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export default function StepCard({ step, isDark, dragHandleProps }: Props) {
  const { selectedStepId, setSelectedStepId, updateStep, deleteStep } = useBuilderStore()

  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [nameVal, setNameVal] = useState(step.name)
  const [descVal, setDescVal] = useState(step.description ?? '')
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLInputElement>(null)

  const isSelected = selectedStepId === step.id
  const tc = TYPE_CONFIG[step.type] ?? TYPE_CONFIG.data
  const autonomyIdx = AUTONOMY_MAP[step.autonomy_level ?? 'supervised'] ?? 2
  const ac = AUTONOMY_CONFIG[autonomyIdx]

  const cardBg     = isDark ? '#1a1d26' : '#ffffff'
  const borderBase = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const borderSel  = tc.color
  const textMain   = isDark ? '#ffffff' : '#0f1117'
  const textMuted  = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const headerBg   = isDark ? tc.bgDark : tc.bgLight
  const typeColor  = isDark ? tc.color : tc.lightColor

  function commitName() {
    updateStep(step.id, { name: nameVal })
    setEditingName(false)
  }

  function commitDesc() {
    updateStep(step.id, { description: descVal })
    setEditingDesc(false)
  }

  return (
    <div
      className="w-full rounded-xl overflow-hidden cursor-pointer transition-all duration-150"
      style={{
        background: cardBg,
        border: `1.5px solid ${isSelected ? borderSel : borderBase}`,
        boxShadow: isSelected
          ? `0 0 0 3px ${isDark ? tc.color + '22' : tc.lightColor + '18'}`
          : isDark
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 1px 4px rgba(0,0,0,0.08)',
      }}
      onClick={() => setSelectedStepId(isSelected ? null : step.id)}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: headerBg }}
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="flex items-center cursor-grab active:cursor-grabbing touch-none"
          style={{ color: textMuted }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>

        {/* Type dot + label */}
        <div
          className="h-2 w-2 rounded-sm flex-shrink-0"
          style={{ background: typeColor }}
        />
        <span
          className="text-[10px] font-bold tracking-widest uppercase flex-1"
          style={{ color: typeColor }}
        >
          {tc.label}
        </span>

        {/* Delete */}
        <button
          className="flex h-5 w-5 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: textMuted }}
          onClick={(e) => {
            e.stopPropagation()
            deleteStep(step.id)
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f43f5e')}
          onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Body */}
      <div className="group px-3 py-2.5">
        {/* Step name */}
        {editingName ? (
          <input
            ref={nameRef}
            autoFocus
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => {
              if (e.key === 'Enter') commitName()
              if (e.key === 'Escape') { setNameVal(step.name); setEditingName(false) }
            }}
            onClick={e => e.stopPropagation()}
            className="w-full bg-transparent text-sm font-semibold outline-none border-b"
            style={{
              color: textMain,
              borderColor: typeColor,
            }}
          />
        ) : (
          <p
            className="text-sm font-semibold mb-0.5 truncate"
            style={{ color: textMain }}
            onDoubleClick={e => { e.stopPropagation(); setEditingName(true) }}
          >
            {step.name}
          </p>
        )}

        {/* Step description */}
        {editingDesc ? (
          <input
            ref={descRef}
            autoFocus
            value={descVal}
            onChange={e => setDescVal(e.target.value)}
            onBlur={commitDesc}
            onKeyDown={e => {
              if (e.key === 'Enter') commitDesc()
              if (e.key === 'Escape') { setDescVal(step.description ?? ''); setEditingDesc(false) }
            }}
            onClick={e => e.stopPropagation()}
            className="w-full bg-transparent text-xs outline-none border-b"
            style={{ color: textMuted, borderColor: typeColor }}
          />
        ) : (
          <p
            className="text-xs truncate"
            style={{ color: textMuted }}
            onDoubleClick={e => { e.stopPropagation(); setEditingDesc(true) }}
          >
            {step.description || 'Double-click to add description'}
          </p>
        )}

        {/* Autonomy bar */}
        <div className="flex items-center gap-2 mt-2.5">
          <div
            className="flex-1 rounded-full overflow-hidden"
            style={{
              height: '3px',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${ac.pct}%`, background: ac.color }}
            />
          </div>
          <span className="text-[10px] flex-shrink-0" style={{ color: textMuted }}>
            {ac.label}
          </span>
        </div>
      </div>
    </div>
  )
}