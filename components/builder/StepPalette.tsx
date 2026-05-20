'use client'


import { STEP_TYPE_CONFIG, AUTONOMY_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { StepType } from '@/src/types/step'
import { nanoid } from 'nanoid'

export default function StepPalette() {
  const { addStep, theme } = useBuilderStore()

  const isDark = theme === 'dark'
  const bg = isDark ? '#0d0f18' : '#ffffff'
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const labelColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const itemColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.6)'
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'

  const handleAdd = (type: StepType) => {
    const cfg = STEP_TYPE_CONFIG[type]
    addStep({
      id: nanoid(),
      type,
      name: `${cfg.label} Step`,
      description: cfg.description,
      autonomy_level: 'supervised',
      assigned_role: type === 'human' ? 'accountant' : 'ai_agent',
      config: {},
    })
  }

  return (
    <aside
      className="flex w-44 shrink-0 flex-col border-r p-3 gap-4"
      style={{ background: bg, borderColor }}
    >
      <div>
        <p
          className="mb-2 text-[9px] font-semibold uppercase tracking-[1.5px]"
          style={{ color: labelColor }}
        >
          Step Types
        </p>
        <div className="flex flex-col gap-0.5">
          {(Object.entries(STEP_TYPE_CONFIG) as [StepType, typeof STEP_TYPE_CONFIG[StepType]][]).map(
            ([type, cfg]) => (
              <button
                key={type}
                onClick={() => handleAdd(type)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-left transition-colors w-full"
                style={{ color: itemColor }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-sm"
                  style={{ background: cfg.color }}
                />
                <span className="text-[12px]">{cfg.label}</span>
              </button>
            )
          )}
        </div>
      </div>

      <div>
        <p
          className="mb-2 text-[9px] font-semibold uppercase tracking-[1.5px]"
          style={{ color: labelColor }}
        >
          Autonomy
        </p>
        <div className="flex flex-col gap-1">
          {(Object.entries(AUTONOMY_CONFIG) as [string, typeof AUTONOMY_CONFIG[keyof typeof AUTONOMY_CONFIG]][]).map(
            ([level, cfg]) => (
              <div key={level} className="flex items-center gap-2 px-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: cfg.color }}
                />
                <span
                  className="text-[11px]"
                  style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}
                >
                  {cfg.label}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </aside>
  )
}