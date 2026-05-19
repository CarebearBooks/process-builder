'use client'

import { useState } from 'react'
import { useBuilderStore } from '@/src/store/builderStore'
import { DEV_SERVICES } from '@/lib/devServices'
import { STEP_TYPE_CONFIG, AUTONOMY_CONFIG } from '@/src/lib/stepConfig'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AutonomyLevel, StepType } from '@/src/types/step'

const STEP_STARTERS = [
  { type: 'data',   label: 'Data import',      checked: true  },
  { type: 'ai',     label: 'AI processing',     checked: true  },
  { type: 'human',  label: 'Human review',      checked: true  },
  { type: 'report', label: 'Generate report',   checked: false },
  { type: 'comm',   label: 'Send notification', checked: false },
]

export default function NewTemplateWizard() {
  const {
    setTemplateName,
    setTemplateDescription,
    setTemplateMode,
    setDefaultAutonomy,
    setServiceContext,
    setWizardComplete,
    addStep,
  } = useBuilderStore()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [mode, setMode] = useState<'simple' | 'flow'>('simple')
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('supervised')
  const [starters, setStarters] = useState(STEP_STARTERS)

  // Group services by vertical
  const grouped = DEV_SERVICES.reduce((acc, svc) => {
    if (!acc[svc.vertical]) acc[svc.vertical] = []
    acc[svc.vertical].push(svc)
    return acc
  }, {} as Record<string, typeof DEV_SERVICES>)

  const selectedSvc = DEV_SERVICES.find(s => s.id === selectedService)
  const canProceed1 = name.trim().length > 0 && selectedService !== null

  const handleFinish = () => {
    if (!name.trim()) return

    setTemplateName(name.trim())
    setTemplateDescription(description.trim())
    setTemplateMode(mode)
    setDefaultAutonomy(autonomy)

    if (selectedSvc) {
      setServiceContext(selectedSvc.id, selectedSvc.name, selectedSvc.vertical)
    }

    const checkedStarters = starters.filter(s => s.checked)
    checkedStarters.forEach((starter) => {
      const type = starter.type as StepType
      const cfg = STEP_TYPE_CONFIG[type] ?? STEP_TYPE_CONFIG.data
      addStep({
        id: nanoid(),
        type,
        name: cfg.label + ' Step',
        description: cfg.description,
        autonomy_level: autonomy,
        assigned_role: type === 'human' ? 'accountant' : 'ai_agent',
        config: {},
      })
    })

    setWizardComplete(true)
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#0f1117]">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#13151f] overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-[#0a0c12] px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-[2px] text-blue-400">
              New Template
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    s === step ? 'w-5 bg-blue-500' :
                    s < step  ? 'w-1.5 bg-blue-500/40' :
                                'w-1.5 bg-white/10'
                  )}
                />
              ))}
            </div>
          </div>
          <div className="mt-2 text-base font-semibold text-white">
            {step === 1 && 'Template basics'}
            {step === 2 && 'Workflow type'}
            {step === 3 && 'Starter steps'}
          </div>
          <div className="mt-0.5 text-xs text-white/35">
            {step === 1 && 'Name your template and pick the service it belongs to'}
            {step === 2 && 'Choose how this workflow is structured'}
            {step === 3 && 'Add some steps to get started quickly'}
          </div>
        </div>

        {/* Step 1 — Name + Service */}
        {step === 1 && (
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Template Name</Label>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canProceed1 && setStep(2)}
                placeholder="e.g. Bi-Weekly Payroll Run"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this template accomplish?"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/50">Service</Label>
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {Object.entries(grouped).map(([vertical, services]) => (
                  <div key={vertical}>
                    <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-white/20 mb-1.5 px-1">
                      {vertical}
                    </div>
                    <div className="space-y-1">
                      {services.map((svc) => (
                        <button
                          key={svc.id}
                          onClick={() => setSelectedService(svc.id)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left border transition-all',
                            selectedService === svc.id
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                          )}
                        >
                          <span className="text-base">{svc.icon}</span>
                          <span className={cn(
                            'text-sm',
                            selectedService === svc.id ? 'text-white' : 'text-white/60'
                          )}>
                            {svc.name}
                          </span>
                          {selectedService === svc.id && (
                            <div className="ml-auto w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M2 5L4 7L8 3"/>
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Mode + Autonomy */}
        {step === 2 && (
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs text-white/50">Workflow Structure</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('simple')}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all',
                    mode === 'simple'
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15'
                  )}
                >
                  <div className="text-lg mb-2">▤</div>
                  <div className={cn('text-sm font-medium mb-1', mode === 'simple' ? 'text-white' : 'text-white/60')}>
                    Simple
                  </div>
                  <div className="text-[11px] text-white/30 leading-relaxed">
                    Linear step-by-step. Best for payroll, standard tax returns, monthly bookkeeping.
                  </div>
                  <div className="mt-2 text-[10px] text-blue-400/60">
                    Recommended for most workflows
                  </div>
                </button>
                <button
                  onClick={() => setMode('flow')}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all',
                    mode === 'flow'
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15'
                  )}
                >
                  <div className="text-lg mb-2">⟋</div>
                  <div className={cn('text-sm font-medium mb-1', mode === 'flow' ? 'text-white' : 'text-white/60')}>
                    Flow
                  </div>
                  <div className="text-[11px] text-white/30 leading-relaxed">
                    Branching workflow with conditions. Best for S-Corp vs 1040, complex reconciliation.
                  </div>
                  <div className="mt-2 text-[10px] text-purple-400/60">
                    Use when the path depends on conditions
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/50">Default Autonomy Level</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(AUTONOMY_CONFIG) as [AutonomyLevel, typeof AUTONOMY_CONFIG[AutonomyLevel]][]).map(([level, cfg]) => (
                  <button
                    key={level}
                    onClick={() => setAutonomy(level)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all',
                      autonomy === level
                        ? 'border-white/20 bg-white/[0.06]'
                        : 'border-white/[0.06] hover:border-white/12'
                    )}
                  >
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cfg.color }} />
                    <div>
                      <div className={cn('text-xs font-medium', autonomy === level ? 'text-white' : 'text-white/50')}>
                        {cfg.label}
                      </div>
                      <div className="text-[10px] text-white/25 mt-0.5 leading-tight">
                        {cfg.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Starter steps */}
        {step === 3 && (
          <div className="px-6 py-5 space-y-4">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span>{selectedSvc?.icon}</span>
                <div>
                  <div className="text-sm font-medium text-white">{name}</div>
                  <div className="text-xs text-white/35 mt-0.5">
                    {selectedSvc?.name} · {mode === 'simple' ? 'Simple' : 'Flow'} mode
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/50">Add starter steps (optional)</Label>
              <div className="space-y-1.5">
                {starters.map((starter, i) => (
                  <button
                    key={starter.type}
                    onClick={() => {
                      const next = [...starters]
                      next[i] = { ...next[i], checked: !next[i].checked }
                      setStarters(next)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 border text-left transition-all',
                      starter.checked
                        ? 'border-white/15 bg-white/[0.05]'
                        : 'border-white/[0.05] hover:border-white/10'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all',
                      starter.checked ? 'bg-blue-500 border-blue-500' : 'border-white/20'
                    )}>
                      {starter.checked && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 5L4 7L8 3"/>
                        </svg>
                      )}
                    </div>
                    <span className={cn('text-sm', starter.checked ? 'text-white/75' : 'text-white/35')}>
                      {starter.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-white/20 px-1">
                You can add, remove, and reorder steps in the builder
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-[#0a0c12]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step > 1 && setStep((step - 1) as 1 | 2 | 3)}
            className={cn(
              'text-white/40 hover:text-white/70 hover:bg-white/5',
              step === 1 && 'invisible'
            )}
          >
            ← Back
          </Button>
          <div className="text-[10px] text-white/20">
            Step {step} of 3
          </div>
          {step < 3 ? (
            <Button
              size="sm"
              onClick={() => setStep((step + 1) as 2 | 3)}
              disabled={step === 1 && !canProceed1}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30"
            >
              Continue →
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleFinish}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Open Builder →
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}