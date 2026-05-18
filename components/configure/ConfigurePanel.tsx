'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { STEP_TYPE_CONFIG, AUTONOMY_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { StepType, AutonomyLevel, Step } from '@/src/types/step'

export default function ConfigPanel() {
  const { selectedStepId, steps, updateStep } = useBuilderStore()
  const step = steps.find((s) => s.id === selectedStepId)

  return (
    <aside className="flex w-56 shrink-0 flex-col border-l border-white/[0.08] bg-[#0d0f18]">
      <div className="border-b border-white/[0.08] px-3 py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-white/25">
          Step Config
        </p>
      </div>

      {!step ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <p className="text-xs text-white/25">Click a step to configure it</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">

          {/* Step type indicator */}
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-2"
            style={{ background: STEP_TYPE_CONFIG[step.type].bgColor }}
          >
            <span className="h-2 w-2 rounded-sm" style={{ background: STEP_TYPE_CONFIG[step.type].color }} />
            <span className="text-xs font-medium text-white/70 truncate">{step.name}</span>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/40">Name</Label>
            <Input
              value={step.name}
              onChange={(e) => updateStep(step.id, { name: e.target.value })}
              className="h-8 border-white/10 bg-white/5 text-xs text-white focus-visible:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/40">Description</Label>
            <Textarea
              value={step.description}
              onChange={(e) => updateStep(step.id, { description: e.target.value })}
              className="min-h-[70px] border-white/10 bg-white/5 text-xs text-white focus-visible:ring-blue-500 resize-none"
            />
          </div>

          {/* Step type */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/40">Type</Label>
            <Select value={step.type} onValueChange={(v) => updateStep(step.id, { type: v as StepType })}>
              <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d29] border-white/10">
                {Object.entries(STEP_TYPE_CONFIG).map(([type, cfg]) => (
                  <SelectItem key={type} value={type} className="text-xs text-white/75">
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Autonomy */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/40">Autonomy Level</Label>
            <div className="space-y-0.5">
              {(Object.entries(AUTONOMY_CONFIG) as [AutonomyLevel, typeof AUTONOMY_CONFIG[AutonomyLevel]][]).map(([level, cfg]) => (
                <button
                  key={level}
                  onClick={() => updateStep(step.id, { autonomy_level: level })}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors',
                    step.autonomy_level === level ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                  )}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: cfg.color }} />
                  <span className={cn('text-[11px]', step.autonomy_level === level ? 'text-white/85' : 'text-white/40')}>
                    {cfg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Assigned role */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/40">Assigned To</Label>
            <Select value={step.assigned_role} onValueChange={(v) => updateStep(step.id, { assigned_role: v as Step['assigned_role'] })}>
              <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d29] border-white/10">
                <SelectItem value="accountant" className="text-xs text-white/75">Accountant</SelectItem>
                <SelectItem value="staff" className="text-xs text-white/75">Staff</SelectItem>
                <SelectItem value="ai_agent" className="text-xs text-white/75">AI Agent</SelectItem>
                <SelectItem value="client" className="text-xs text-white/75">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      )}
    </aside>
  )
}