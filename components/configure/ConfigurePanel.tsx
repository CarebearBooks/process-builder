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
    templateMode, updateStep, updateFlowNode, theme,
  } = useBuilderStore()

  const isDark = theme === 'dark'
  const panelBg = isDark ? '#0d0f18' : '#ffffff'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const labelColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const emptyColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'
  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    color: isDark ? '#ffffff' : '#0f1117',
  }

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
    <aside
      className="flex w-60 shrink-0 flex-col border-l"
      style={{ background: panelBg, borderColor }}
    >
      <div className="border-b px-3 py-2.5" style={{ borderColor }}>
        <p
          className="text-[9px] font-semibold uppercase tracking-[1.5px]"
          style={{ color: labelColor }}
        >
          Step Config
        </p>
      </div>

      {!step ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <p className="text-xs" style={{ color: emptyColor }}>
            Click a step to configure it
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {/* Type indicator */}
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-2"
            style={{ background: STEP_TYPE_CONFIG[step.type].bgColor }}
          >
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: STEP_TYPE_CONFIG[step.type].color }}
            />
            <span
              className="text-xs font-medium truncate"
              style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
            >
              {step.name}
            </span>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label className="text-[11px]" style={{ color: labelColor }}>Name</Label>
            <Input
              value={step.name}
              onChange={(e) => handleUpdate({ name: e.target.value })}
              className="h-8 text-xs focus-visible:ring-blue-500"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-[11px]" style={{ color: labelColor }}>Description</Label>
            <Textarea
              value={step.description}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              className="min-h-[60px] text-xs focus-visible:ring-blue-500 resize-none"
              style={inputStyle}
            />
          </div>

          {/* Type */}
          <div className="space-y-1">
            <Label className="text-[11px]" style={{ color: labelColor }}>Type</Label>
            <Select value={step.type} onValueChange={(v) => handleUpdate({ type: v as StepType })}>
              <SelectTrigger className="h-8 text-xs" style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: isDark ? '#1a1d29' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }}
              >
                {Object.entries(STEP_TYPE_CONFIG).map(([type, cfg]) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="text-xs"
                    style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)' }}
                  >
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Autonomy */}
          <div className="space-y-1">
            <Label className="text-[11px]" style={{ color: labelColor }}>Autonomy</Label>
            <div className="space-y-0.5">
              {(Object.entries(AUTONOMY_CONFIG) as [AutonomyLevel, typeof AUTONOMY_CONFIG[AutonomyLevel]][]).map(
                ([level, cfg]) => (
                  <button
                    key={level}
                    onClick={() => handleUpdate({ autonomy_level: level })}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                    )}
                    style={{
                      background: step.autonomy_level === level
                        ? isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                        : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (step.autonomy_level !== level) {
                        e.currentTarget.style.background = isDark
                          ? 'rgba(255,255,255,0.04)'
                          : 'rgba(0,0,0,0.03)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (step.autonomy_level !== level) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: cfg.color }}
                    />
                    <span
                      className="text-[11px]"
                      style={{
                        color: step.autonomy_level === level
                          ? isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)'
                          : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                      }}
                    >
                      {cfg.label}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Assigned to */}
          <div className="space-y-1">
            <Label className="text-[11px]" style={{ color: labelColor }}>Assigned To</Label>
            <Select
              value={step.assigned_role}
              onValueChange={(v) => handleUpdate({ assigned_role: v as Step['assigned_role'] })}
            >
              <SelectTrigger className="h-8 text-xs" style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: isDark ? '#1a1d29' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }}
              >
                {['accountant', 'staff', 'ai_agent', 'client'].map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    className="text-xs"
                    style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)' }}
                  >
                    {role === 'ai_agent' ? 'AI Agent' :
                     role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

          {/* Per-type config */}
          <StepTypeConfig step={step} onConfig={handleConfig} isDark={isDark} inputStyle={inputStyle} labelColor={labelColor} />

          {/* Delete */}
          <div className="pt-1">
            <button
              onClick={() => {
                const store = useBuilderStore.getState()
                if (store.templateMode === 'flow') store.deleteFlowNode(step.id)
                else store.deleteStep(step.id)
              }}
              className="w-full rounded-lg py-1.5 text-xs transition-colors"
              style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
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
  step, onConfig, isDark, inputStyle, labelColor,
}: {
  step: Step
  onConfig: (patch: Record<string, unknown>) => void
  isDark: boolean
  inputStyle: React.CSSProperties
  labelColor: string
}) {
  const cfg = step.config as Record<string, unknown>
  const selectContentStyle = {
    background: isDark ? '#1a1d29' : '#ffffff',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  }
  const selectItemStyle = {
    color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)',
  }

  if (step.type === 'data') return (
    <div className="space-y-2">
      <Label className="text-[11px]" style={{ color: labelColor }}>Data Source</Label>
      <Select value={(cfg.source as string) ?? ''} onValueChange={(v) => onConfig({ source: v })}>
        <SelectTrigger className="h-8 text-xs" style={inputStyle}>
          <SelectValue placeholder="Select source…" />
        </SelectTrigger>
        <SelectContent style={selectContentStyle}>
          {[
            ['bank_feed', 'Bank Feed'],
            ['csv_upload', 'CSV Upload'],
            ['quickbooks', 'QuickBooks'],
            ['manual_entry', 'Manual Entry'],
            ['api', 'API / Integration'],
          ].map(([v, l]) => (
            <SelectItem key={v} value={v} className="text-xs" style={selectItemStyle}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  if (step.type === 'ai') return (
    <div className="space-y-2">
      <Label className="text-[11px]" style={{ color: labelColor }}>AI Task</Label>
      <Select value={(cfg.task as string) ?? ''} onValueChange={(v) => onConfig({ task: v })}>
        <SelectTrigger className="h-8 text-xs" style={inputStyle}>
          <SelectValue placeholder="Select task…" />
        </SelectTrigger>
        <SelectContent style={selectContentStyle}>
          {[
            ['categorize', 'Categorize transactions'],
            ['extract', 'Extract from documents'],
            ['summarize', 'Summarize & analyze'],
            ['calculate', 'Calculate & compute'],
            ['review', 'Review for errors'],
            ['generate', 'Generate report content'],
          ].map(([v, l]) => (
            <SelectItem key={v} value={v} className="text-xs" style={selectItemStyle}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Label className="text-[11px]" style={{ color: labelColor }}>Prompt Hint (optional)</Label>
      <Textarea
        value={(cfg.prompt_hint as string) ?? ''}
        onChange={(e) => onConfig({ prompt_hint: e.target.value })}
        placeholder="Describe what the AI should focus on…"
        className="min-h-[55px] text-xs focus-visible:ring-blue-500 resize-none"
        style={{ ...inputStyle, opacity: 1 }}
      />
    </div>
  )

  if (step.type === 'human') return (
    <div className="space-y-2">
      <Label className="text-[11px]" style={{ color: labelColor }}>Deadline (days)</Label>
      <Input
        type="number"
        min={1}
        max={30}
        value={(cfg.deadline_days as number) ?? ''}
        onChange={(e) => onConfig({ deadline_days: parseInt(e.target.value) || undefined })}
        placeholder="e.g. 2"
        className="h-8 text-xs focus-visible:ring-blue-500"
        style={inputStyle}
      />
      <Label className="text-[11px]" style={{ color: labelColor }}>Instructions</Label>
      <Textarea
        value={(cfg.instructions as string) ?? ''}
        onChange={(e) => onConfig({ instructions: e.target.value })}
        placeholder="What should the reviewer check for?"
        className="min-h-[55px] text-xs focus-visible:ring-blue-500 resize-none"
        style={inputStyle}
      />
    </div>
  )

  if (step.type === 'communication') return (
    <div className="space-y-2">
      <Label className="text-[11px]" style={{ color: labelColor }}>Channel</Label>
      <Select value={(cfg.channel as string) ?? ''} onValueChange={(v) => onConfig({ channel: v })}>
        <SelectTrigger className="h-8 text-xs" style={inputStyle}>
          <SelectValue placeholder="Select channel…" />
        </SelectTrigger>
        <SelectContent style={selectContentStyle}>
          {[['email', 'Email (via Nylas)'], ['sms', 'SMS (via ClickSend)'], ['portal', 'Client Portal']].map(([v, l]) => (
            <SelectItem key={v} value={v} className="text-xs" style={selectItemStyle}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Label className="text-[11px]" style={{ color: labelColor }}>Recipient</Label>
      <Select value={(cfg.recipient as string) ?? ''} onValueChange={(v) => onConfig({ recipient: v })}>
        <SelectTrigger className="h-8 text-xs" style={inputStyle}>
          <SelectValue placeholder="Select recipient…" />
        </SelectTrigger>
        <SelectContent style={selectContentStyle}>
          {[['client', 'Client'], ['accountant', 'Accountant'], ['staff', 'Staff'], ['all', 'All parties']].map(([v, l]) => (
            <SelectItem key={v} value={v} className="text-xs" style={selectItemStyle}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Label className="text-[11px]" style={{ color: labelColor }}>Message hint</Label>
      <Textarea
        value={(cfg.template_hint as string) ?? ''}
        onChange={(e) => onConfig({ template_hint: e.target.value })}
        placeholder="e.g. Notify client their return is ready"
        className="min-h-[55px] text-xs focus-visible:ring-blue-500 resize-none"
        style={inputStyle}
      />
    </div>
  )

  if (step.type === 'logic') return (
    <div className="space-y-2">
      <Label className="text-[11px]" style={{ color: labelColor }}>Condition Type</Label>
      <Select value={(cfg.condition_type as string) ?? ''} onValueChange={(v) => onConfig({ condition_type: v })}>
        <SelectTrigger className="h-8 text-xs" style={inputStyle}>
          <SelectValue placeholder="Select condition…" />
        </SelectTrigger>
        <SelectContent style={selectContentStyle}>
          {[
            ['if_else', 'If / Else'],
            ['entity_type', 'Entity type check'],
            ['threshold', 'Amount threshold'],
            ['amount_check', 'Balance check'],
            ['date_check', 'Date / deadline check'],
          ].map(([v, l]) => (
            <SelectItem key={v} value={v} className="text-xs" style={selectItemStyle}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Label className="text-[11px]" style={{ color: labelColor }}>Condition Description</Label>
      <Textarea
        value={(cfg.condition_description as string) ?? ''}
        onChange={(e) => onConfig({ condition_description: e.target.value })}
        placeholder="e.g. If entity type is S-Corp → path A, else → path B"
        className="min-h-[55px] text-xs focus-visible:ring-blue-500 resize-none"
        style={inputStyle}
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px]" style={{ color: labelColor }}>True branch</Label>
          <Input
            value={(cfg.true_label as string) ?? ''}
            onChange={(e) => onConfig({ true_label: e.target.value })}
            placeholder="e.g. S-Corp"
            className="h-8 text-xs focus-visible:ring-blue-500"
            style={inputStyle}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]" style={{ color: labelColor }}>False branch</Label>
          <Input
            value={(cfg.false_label as string) ?? ''}
            onChange={(e) => onConfig({ false_label: e.target.value })}
            placeholder="e.g. Individual"
            className="h-8 text-xs focus-visible:ring-blue-500"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  )

  if (step.type === 'reporting') return (
    <div className="space-y-2">
      <Label className="text-[11px]" style={{ color: labelColor }}>Output Type</Label>
      <Select value={(cfg.output_type as string) ?? ''} onValueChange={(v) => onConfig({ output_type: v })}>
        <SelectTrigger className="h-8 text-xs" style={inputStyle}>
          <SelectValue placeholder="Select output…" />
        </SelectTrigger>
        <SelectContent style={selectContentStyle}>
          {[
            ['pdf', 'PDF Report'],
            ['excel', 'Excel Spreadsheet'],
            ['dashboard', 'Dashboard Update'],
            ['email_summary', 'Email Summary'],
          ].map(([v, l]) => (
            <SelectItem key={v} value={v} className="text-xs" style={selectItemStyle}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Label className="text-[11px]" style={{ color: labelColor }}>Report Name</Label>
      <Input
        value={(cfg.report_name as string) ?? ''}
        onChange={(e) => onConfig({ report_name: e.target.value })}
        placeholder="e.g. Monthly P&L Report"
        className="h-8 text-xs focus-visible:ring-blue-500"
        style={inputStyle}
      />
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onConfig({ auto_send: !cfg.auto_send })}
          className="w-8 h-4 rounded-full transition-colors relative"
          style={{ background: cfg.auto_send ? '#10b981' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        >
          <div
            className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all"
            style={{ left: cfg.auto_send ? '16px' : '2px' }}
          />
        </button>
        <span className="text-[11px]" style={{ color: labelColor }}>
          Auto-send when complete
        </span>
      </div>
    </div>
  )

  return null
}