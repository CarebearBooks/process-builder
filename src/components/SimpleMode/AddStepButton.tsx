'use client'

import { useState } from 'react'

import { nanoid } from 'nanoid'
import { Plus } from 'lucide-react'
import { STEP_TYPE_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { StepType } from '@/src/types/step'

export default function AddStepButton({ insertAt }: { insertAt: number }) {
  const [open, setOpen] = useState(false)
  const addStep = useBuilderStore((s) => s.addStep)

  const handlePick = (type: StepType) => {
    const cfg = STEP_TYPE_CONFIG[type]
    addStep({
      id: nanoid(),
      type,
      name: `${cfg.label} Step`,
      description: cfg.description,
      autonomy_level: 'supervised',
      assigned_role: type === 'human' ? 'accountant' : 'ai_agent',
      config: {},
    }, insertAt)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-white/20 text-white/25 transition-all hover:border-blue-500/60 hover:text-blue-400"
      >
        <Plus className="h-3 w-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-7 top-0 z-20 w-44 rounded-xl border border-white/10 bg-[#1a1d29] p-1.5 shadow-xl">
            {(Object.entries(STEP_TYPE_CONFIG) as [StepType, typeof STEP_TYPE_CONFIG[StepType]][]).map(([type, cfg]) => (
              <button
                key={type}
                onClick={() => handlePick(type)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-white/[0.06]"
              >
                <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: cfg.color }} />
                <div>
                  <div className="font-medium text-white/75">{cfg.label}</div>
                  <div className="text-[10px] text-white/30">{cfg.description}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}