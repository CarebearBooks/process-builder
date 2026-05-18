'use client'


import { STEP_TYPE_CONFIG, AUTONOMY_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { StepType } from '@/src/types/step'
import { nanoid } from 'nanoid'  // install: npm install nanoid

export default function StepPalette() {
  const addStep = useBuilderStore((s) => s.addStep)

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
    <aside className="flex w-44 shrink-0 flex-col border-r border-white/[0.08] bg-[#0d0f18] p-3 gap-4">
      <div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[1.5px] text-white/25">
          Step Types
        </p>
        <div className="flex flex-col gap-0.5">
          {(Object.entries(STEP_TYPE_CONFIG) as [StepType, typeof STEP_TYPE_CONFIG[StepType]][]).map(([type, cfg]) => (
            <button
              key={type}
              onClick={() => handleAdd(type)}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-white/[0.06]"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{ background: cfg.color }}
              />
              <span className="text-[12px] text-white/60">{cfg.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[1.5px] text-white/25">
          Autonomy
        </p>
        <div className="flex flex-col gap-1">
          {(Object.entries(AUTONOMY_CONFIG) as [string, typeof AUTONOMY_CONFIG[keyof typeof AUTONOMY_CONFIG]][]).map(([level, cfg]) => (
            <div key={level} className="flex items-center gap-2 px-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: cfg.color }}
              />
              <span className="text-[11px] text-white/35">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}