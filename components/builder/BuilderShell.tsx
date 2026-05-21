'use client'

import { useState, useEffect, useRef } from 'react'
import { notifyError, notifyPublished, notifySaved } from '@/lib/bridge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  CheckIcon, CloudIcon, PencilIcon,
  Undo2, Redo2, AlertCircle, Sun, Moon,
} from 'lucide-react'
import StepPalette from './StepPalette'
import FlowCanvas from './FlowMode/FlowCanvas'
import NewTemplateWizard from './NewTemplateWizard'
import { useTemplate } from '@/hooks/useTemplate'
import { getSupabaseClient } from '@/lib/supabase'
import { validateTemplate } from '@/lib/validator'
import { useBuilderKeyboard } from '@/hooks/createBuilderKey'

import ConfigPanel from '../configure/ConfigurePanel'
import StepList from '@/src/components/SimpleMode/StepList'
import { useBuilderStore } from '@/src/store/builderStore'

export default function BuilderShell() {
  useBuilderKeyboard()

  const {
    templateId, templateName, setTemplateName,
    templateMode, setTemplateMode,
    templateStatus,
    serviceName, serviceVertical,
    isSaving, setIsSaving,
    lastSavedAt, setLastSavedAt,
    isDirty,
    steps, wizardComplete,
    undo, redo, canUndo, canRedo,
    initPayload, theme, setTheme,
  } = useBuilderStore()

  const [editingName, setEditingName] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (steps.length > 0 && !wizardComplete) {
      useBuilderStore.setState({ wizardComplete: true })
    }
  }, [])

  useEffect(() => {
    if (editingName) nameRef.current?.focus()
  }, [editingName])

  const isNewTemplate = !templateId && steps.length === 0 && !wizardComplete
  if (isNewTemplate) return <NewTemplateWizard />

  const validation = validateTemplate(templateName, steps, templateMode)

  const handleSave = async () => {
    const { initPayload, steps, templateName } = useBuilderStore.getState()
    if (!initPayload?.templateId) return
    setIsSaving(true)
    const supabase = getSupabaseClient(initPayload.token)
    const { error } = await supabase
      .from('process_templates')
      .update({
        name:       templateName,
        steps_json: steps,
        updated_at: new Date().toISOString(),
      })
      .eq('id', initPayload.templateId)
    setIsSaving(false)
    if (!error) {
      setLastSavedAt(new Date())
      notifySaved(initPayload.templateId)
    } else {
      notifyError('Save failed: ' + error.message)
    }
  }

  const handlePublish = async () => {
    const { initPayload, steps, templateName } = useBuilderStore.getState()
    if (!initPayload?.templateId) return
    const supabase = getSupabaseClient(initPayload.token)
    const { error } = await supabase
      .from('process_templates')
      .update({
        name:         templateName,
        steps_json:   steps,
        status:       'active',
        published_at: new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      })
      .eq('id', initPayload.templateId)
    if (!error) notifyPublished(initPayload.templateId)
    else notifyError('Publish failed: ' + error.message)
  }

  const saveLabel = isSaving
    ? 'Saving…'
    : lastSavedAt
    ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : isDirty ? 'Unsaved changes'
    : 'All changes saved'

  const isDark      = theme === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const barBg       = isDark ? '#0a0c12' : '#ffffff'
  const textPrimary = isDark ? '#ffffff' : '#0f1117'
  const textMuted   = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)'
  const hoverBg     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: isDark ? '#0f1117' : '#f4f4f5' }}
    >
      {/* Validation error banner */}
      {showValidation && !validation.valid && (
        <div
          className="flex items-center gap-3 px-4 py-2 border-b"
          style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }}
        >
          <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <div className="flex-1">
            {validation.errors.map((e, i) => (
              <span key={i} className="text-xs text-rose-400 mr-3">{e}</span>
            ))}
          </div>
          <button onClick={() => setShowValidation(false)} className="text-rose-400/50 hover:text-rose-400 text-xs">✕</button>
        </div>
      )}

      {/* Validation warnings banner */}
      {showValidation && validation.valid && validation.warnings.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-2 border-b"
          style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' }}
        >
          <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-400 flex-1">
            {validation.warnings[0]}
            {validation.warnings.length > 1 && ` (+${validation.warnings.length - 1} more)`}
          </span>
          <button onClick={() => setShowValidation(false)} className="text-amber-400/50 hover:text-amber-400 text-xs ml-auto">✕</button>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <header
        className="flex h-12 shrink-0 items-center gap-3 border-b px-4"
        style={{ background: barBg, borderColor }}
      >
        {/* Service breadcrumb */}
        {serviceName && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: textMuted }}>
            <span>{serviceVertical}</span>
            <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
              {serviceName}
            </span>
            <span style={{ opacity: 0.4 }}>›</span>
          </div>
        )}

        {/* Template name */}
        <div className="flex items-center gap-1.5 min-w-0">
          {editingName ? (
            <Input
              ref={nameRef}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="h-7 w-52 text-sm focus-visible:ring-blue-500"
              style={{
                background:  isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                borderColor: isDark ? 'rgba(255,255,255,0.2)'  : 'rgba(0,0,0,0.2)',
                color: textPrimary,
              }}
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium transition-colors"
              style={{ color: textPrimary }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {templateName}
              <PencilIcon className="h-3 w-3" style={{ color: textMuted }} />
            </button>
          )}
          <Badge
            variant="outline"
            className={`text-[10px] ${templateStatus === 'active' ? 'text-emerald-400 border-emerald-400/30' : ''}`}
            style={templateStatus !== 'active' ? { color: textMuted, borderColor } : {}}
          >
            {templateStatus}
          </Badge>
        </div>

        {/* ── MODE TOGGLE — clearly visible in both themes ── */}
        <div
          className="ml-2 flex items-center rounded-lg p-0.5 gap-0.5"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            border: `1px solid ${borderColor}`,
          }}
        >
          {(['simple', 'flow'] as const).map((m) => {
            const isActive = templateMode === m
            return (
              <button
                key={m}
                onClick={() => setTemplateMode(m)}
                className="h-6 rounded-md px-3 text-xs font-medium transition-all duration-150"
                style={{
                  background: isActive
                    ? isDark ? 'rgba(255,255,255,0.15)' : '#ffffff'
                    : 'transparent',
                  color: isActive ? textPrimary : textMuted,
                  boxShadow: isActive && !isDark ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            )
          })}
        </div>

        <span className="text-xs ml-1" style={{ color: textMuted }}>
          {steps.length} step{steps.length !== 1 ? 's' : ''}
        </span>

        <div className="flex-1" />

        {/* Save status */}
        <span className="flex items-center gap-1.5 text-xs" style={{ color: textMuted }}>
          <CloudIcon className="h-3.5 w-3.5" />
          {saveLabel}
        </span>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => canUndo() && undo()}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
            className="flex h-7 w-7 items-center justify-center rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ color: textMuted }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => canRedo() && redo()}
            disabled={!canRedo()}
            title="Redo (Ctrl+Shift+Z)"
            className="flex h-7 w-7 items-center justify-center rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ color: textMuted }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={isDark ? 'Switch to light' : 'Switch to dark'}
          className="flex h-7 w-7 items-center justify-center rounded transition-colors"
          style={{ color: textMuted }}
          onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        <Separator orientation="vertical" className="h-5" style={{ background: borderColor }} />

        {/* Save + Publish */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="h-7 text-xs"
          style={{
            background:  isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            borderColor,
            color: textPrimary,
          }}
        >
          {isSaving ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button
          size="sm"
          onClick={handlePublish}
          className="h-7 bg-emerald-500 text-xs font-medium text-black hover:bg-emerald-400"
        >
          <CheckIcon className="mr-1 h-3.5 w-3.5" />
          Publish
        </Button>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0">
        {templateMode === 'simple' && <StepPalette />}
        <main className="flex-1 overflow-y-auto">
          {templateMode === 'simple' ? <StepList /> : <FlowCanvas />}
        </main>
        <ConfigPanel />
      </div>
    </div>
  )
}