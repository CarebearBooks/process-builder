'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { STEP_TYPE_CONFIG, AUTONOMY_CONFIG } from '@/src/lib/stepConfig'
import { useBuilderStore } from '@/src/store/builderStore'
import { Step, StepType, AutonomyLevel } from '@/src/types/step'

export default function ConfigPanel() {
  const {
    selectedStepId, steps, flowNodes,
    templateMode, updateStep, updateFlowNode,
  } = useBuilderStore()

  const step =
    templateMode === 'simple'
      ? steps.find((s) => s.id === selectedStepId)
      : flowNodes.find((n) => n.data?.step?.id === selectedStepId)?.data?.step

  const handleUpdate = (patch: Partial<Step>) => {
    if (!step) return
    updateStep(step.id, patch)
    if (templateMode === 'flow') {
      updateFlowNode(step.id, { step: { ...step, ...patch } })
    }
  }

  const handleConfig = (patch: Record<string, unknown>) => {
    if (!step) return
    handleUpdate({ config: { ...step.config, ...patch } })
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-l border-white/[0.08] bg-[#0d0f18]">
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
        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {/* Type indicator */}
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-2"
            style={{ background: STEP_TYPE_CONFIG[step.type].bgColor }}
          >
            <span className="h-2 w-2 rounded-sm" style={{ background: STEP_TYPE_CONFIG[step.type].color }} />
            <span className="text-xs font-medium text-white/70 truncate">{step.name}</span>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label className="text-[11px] text-white/40">Name</Label>
            <Input
              value={step.name}
              onChange={(e) => handleUpdate({ name: e.target.value })}
              className="h-8 border-white/10 bg-white/5 text-xs text-white focus-visible:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-[11px] text-white/40">Description</Label>
            <Textarea
              value={step.description}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              className="min-h-[60px] border-white/10 bg-white/5 text-xs text-white focus-visible:ring-blue-500 resize-none"
            />
          </div>

          {/* Type */}
          <div className="space-y-1">
            <Label className="text-[11px] text-white/40">Type</Label>
            <Select value={step.type} onValueChange={(v) => handleUpdate({ type: v as StepType })}>
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
          <div className="space-y-1">
            <Label className="text-[11px] text-white/40">Autonomy</Label>
            <div className="space-y-0.5">
              {(Object.entries(AUTONOMY_CONFIG) as [AutonomyLevel, typeof AUTONOMY_CONFIG[AutonomyLevel]][]).map(([level, cfg]) => (
                <button
                  key={level}
                  onClick={() => handleUpdate({ autonomy_level: level })}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
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

          {/* Assigned to */}
          <div className="space-y-1">
            <Label className="text-[11px] text-white/40">Assigned To</Label>
            <Select
              value={step.assigned_role}
              onValueChange={(v) => handleUpdate({ assigned_role: v as Step['assigned_role'] })}
            >
              <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d29] border-white/10">
                <SelectItem value="accountant" className="text-xs text-white/75">Accountant</SelectItem>
                <SelectItem value="staff"      className="text-xs text-white/75">Staff</SelectItem>
                <SelectItem value="ai_agent"   className="text-xs text-white/75">AI Agent</SelectItem>
                <SelectItem value="client"     className="text-xs text-white/75">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Per-type config */}
          <StepTypeConfig step={step} onConfig={handleConfig} />

          {/* Delete */}
          <div className="pt-1">
            <button
              onClick={() => {
                const { deleteStep, deleteFlowNode, templateMode } = useBuilderStore.getState()
                if (templateMode === 'flow') deleteFlowNode(step.id)
                else deleteStep(step.id)
              }}
              className="w-full rounded-lg border border-rose-500/20 bg-rose-500/5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              Remove Step
            </button>
          </div>

        </div>
      )}
    </aside>
  )
}

function StepTypeConfig({
  step,
  onConfig,
}: {
  step: Step
  onConfig: (patch: Record<string, unknown>) => void
}) {
  const cfg = step.config as Record<string, unknown>

  if (step.type === 'data') return (
    <div className="space-y-2">
      <Label className="text-[11px] text-white/40">Data Source</Label>
      <Select
        value={(cfg.source as string) ?? ''}
        onValueChange={(v) => onConfig({ source: v })}
      >
        <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
          <SelectValue placeholder="Select source…" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1d29] border-white/10">
          <SelectItem value="bank_feed"     className="text-xs text-white/75">Bank Feed</SelectItem>
          <SelectItem value="csv_upload"    className="text-xs text-white/75">CSV Upload</SelectItem>
          <SelectItem value="quickbooks"    className="text-xs text-white/75">QuickBooks</SelectItem>
          <SelectItem value="manual_entry"  className="text-xs text-white/75">Manual Entry</SelectItem>
          <SelectItem value="api"           className="text-xs text-white/75">API / Integration</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  if (step.type === 'ai') return (
    <div className="space-y-2">
      <Label className="text-[11px] text-white/40">AI Task</Label>
      <Select
        value={(cfg.task as string) ?? ''}
        onValueChange={(v) => onConfig({ task: v })}
      >
        <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
          <SelectValue placeholder="Select task…" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1d29] border-white/10">
          <SelectItem value="categorize" className="text-xs text-white/75">Categorize transactions</SelectItem>
          <SelectItem value="extract"    className="text-xs text-white/75">Extract from documents</SelectItem>
          <SelectItem value="summarize"  className="text-xs text-white/75">Summarize & analyze</SelectItem>
          <SelectItem value="calculate"  className="text-xs text-white/75">Calculate & compute</SelectItem>
          <SelectItem value="review"     className="text-xs text-white/75">Review for errors</SelectItem>
          <SelectItem value="generate"   className="text-xs text-white/75">Generate report content</SelectItem>
        </SelectContent>
      </Select>
      <div className="space-y-1">
        <Label className="text-[11px] text-white/40">Prompt Hint (optional)</Label>
        <Textarea
          value={(cfg.prompt_hint as string) ?? ''}
          onChange={(e) => onConfig({ prompt_hint: e.target.value })}
          placeholder="Describe what the AI should focus on…"
          className="min-h-[55px] border-white/10 bg-white/5 text-xs text-white placeholder:text-white/20 focus-visible:ring-blue-500 resize-none"
        />
      </div>
    </div>
  )

  if (step.type === 'human') return (
    <div className="space-y-2">
      <Label className="text-[11px] text-white/40">Deadline (days)</Label>
      <Input
        type="number"
        min={1}
        max={30}
        value={(cfg.deadline_days as number) ?? ''}
        onChange={(e) => onConfig({ deadline_days: parseInt(e.target.value) || undefined })}
        placeholder="e.g. 2"
        className="h-8 border-white/10 bg-white/5 text-xs text-white focus-visible:ring-blue-500"
      />
      <Label className="text-[11px] text-white/40">Instructions</Label>
      <Textarea
        value={(cfg.instructions as string) ?? ''}
        onChange={(e) => onConfig({ instructions: e.target.value })}
        placeholder="What should the reviewer check for?"
        className="min-h-[55px] border-white/10 bg-white/5 text-xs text-white placeholder:text-white/20 focus-visible:ring-blue-500 resize-none"
      />
    </div>
  )

  if (step.type === 'communication') return (
    <div className="space-y-2">
      <Label className="text-[11px] text-white/40">Channel</Label>
      <Select
        value={(cfg.channel as string) ?? ''}
        onValueChange={(v) => onConfig({ channel: v })}
      >
        <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
          <SelectValue placeholder="Select channel…" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1d29] border-white/10">
          <SelectItem value="email"  className="text-xs text-white/75">Email (via Nylas)</SelectItem>
          <SelectItem value="sms"    className="text-xs text-white/75">SMS (via ClickSend)</SelectItem>
          <SelectItem value="portal" className="text-xs text-white/75">Client Portal</SelectItem>
        </SelectContent>
      </Select>
      <Label className="text-[11px] text-white/40">Recipient</Label>
      <Select
        value={(cfg.recipient as string) ?? ''}
        onValueChange={(v) => onConfig({ recipient: v })}
      >
        <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
          <SelectValue placeholder="Select recipient…" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1d29] border-white/10">
          <SelectItem value="client"     className="text-xs text-white/75">Client</SelectItem>
          <SelectItem value="accountant" className="text-xs text-white/75">Accountant</SelectItem>
          <SelectItem value="staff"      className="text-xs text-white/75">Staff</SelectItem>
          <SelectItem value="all"        className="text-xs text-white/75">All parties</SelectItem>
        </SelectContent>
      </Select>
      <Label className="text-[11px] text-white/40">Message hint</Label>
      <Textarea
        value={(cfg.template_hint as string) ?? ''}
        onChange={(e) => onConfig({ template_hint: e.target.value })}
        placeholder="e.g. Notify client their return is ready"
        className="min-h-[55px] border-white/10 bg-white/5 text-xs text-white placeholder:text-white/20 focus-visible:ring-blue-500 resize-none"
      />
    </div>
  )

  if (step.type === 'logic') return (
    <div className="space-y-2">
      <Label className="text-[11px] text-white/40">Condition Type</Label>
      <Select
        value={(cfg.condition_type as string) ?? ''}
        onValueChange={(v) => onConfig({ condition_type: v })}
      >
        <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
          <SelectValue placeholder="Select condition…" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1d29] border-white/10">
          <SelectItem value="if_else"      className="text-xs text-white/75">If / Else</SelectItem>
          <SelectItem value="entity_type"  className="text-xs text-white/75">Entity type check</SelectItem>
          <SelectItem value="threshold"    className="text-xs text-white/75">Amount threshold</SelectItem>
          <SelectItem value="amount_check" className="text-xs text-white/75">Balance check</SelectItem>
          <SelectItem value="date_check"   className="text-xs text-white/75">Date / deadline check</SelectItem>
        </SelectContent>
      </Select>
      <Label className="text-[11px] text-white/40">Condition Description</Label>
      <Textarea
        value={(cfg.condition_description as string) ?? ''}
        onChange={(e) => onConfig({ condition_description: e.target.value })}
        placeholder="e.g. If entity type is S-Corp → path A, else → path B"
        className="min-h-[55px] border-white/10 bg-white/5 text-xs text-white placeholder:text-white/20 focus-visible:ring-blue-500 resize-none"
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-white/40">True branch</Label>
          <Input
            value={(cfg.true_label as string) ?? ''}
            onChange={(e) => onConfig({ true_label: e.target.value })}
            placeholder="e.g. S-Corp"
            className="h-8 border-white/10 bg-white/5 text-xs text-white focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-white/40">False branch</Label>
          <Input
            value={(cfg.false_label as string) ?? ''}
            onChange={(e) => onConfig({ false_label: e.target.value })}
            placeholder="e.g. Individual"
            className="h-8 border-white/10 bg-white/5 text-xs text-white focus-visible:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )

  if (step.type === 'reporting') return (
    <div className="space-y-2">
      <Label className="text-[11px] text-white/40">Output Type</Label>
      <Select
        value={(cfg.output_type as string) ?? ''}
        onValueChange={(v) => onConfig({ output_type: v })}
      >
        <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
          <SelectValue placeholder="Select output…" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1d29] border-white/10">
          <SelectItem value="pdf"           className="text-xs text-white/75">PDF Report</SelectItem>
          <SelectItem value="excel"         className="text-xs text-white/75">Excel Spreadsheet</SelectItem>
          <SelectItem value="dashboard"     className="text-xs text-white/75">Dashboard Update</SelectItem>
          <SelectItem value="email_summary" className="text-xs text-white/75">Email Summary</SelectItem>
        </SelectContent>
      </Select>
      <Label className="text-[11px] text-white/40">Report Name</Label>
      <Input
        value={(cfg.report_name as string) ?? ''}
        onChange={(e) => onConfig({ report_name: e.target.value })}
        placeholder="e.g. Monthly P&L Report"
        className="h-8 border-white/10 bg-white/5 text-xs text-white focus-visible:ring-blue-500"
      />
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onConfig({ auto_send: !cfg.auto_send })}
          className={cn(
            'w-8 h-4 rounded-full transition-colors relative',
            cfg.auto_send ? 'bg-emerald-500' : 'bg-white/10'
          )}
        >
          <div className={cn(
            'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all',
            cfg.auto_send ? 'left-4' : 'left-0.5'
          )} />
        </button>
        <span className="text-[11px] text-white/40">Auto-send when complete</span>
      </div>
    </div>
  )

  return null
}