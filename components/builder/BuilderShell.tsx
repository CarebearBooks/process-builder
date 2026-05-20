'use client'

import { useState, useEffect, useRef } from 'react'
import { useBuilderStore } from '@/src/store/builderStore'
import { sendToParent } from '@/lib/bridge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CheckIcon, CloudIcon, PencilIcon, Undo2, Redo2, AlertCircle } from 'lucide-react'
import StepPalette from './StepPalette'

import FlowCanvas from './FlowMode/FlowCanvas'
import NewTemplateWizard from './NewTemplateWizard'
import { useTemplate } from '@/hooks/useTemplate'

import { createClient } from '@/lib/supabase'
import { validateTemplate } from '@/lib/validator'
import ConfigPanel from '../configure/ConfigurePanel'
import StepList from '@/src/components/SimpleMode/StepList'
import { useBuilderKeyboard } from '@/hooks/createBuilderKey'

export default function BuilderShell() {
  useBuilderKeyboard()
  // If steps already exist in store (e.g. after hot reload), skip wizard
  useEffect(() => {
    if (steps.length > 0 && !wizardComplete) {
      useBuilderStore.setState({ wizardComplete: true })
    }
  }, [])

  const {
  templateId, templateName, setTemplateName,
  templateMode, setTemplateMode,
  templateStatus, templateDescription,
  serviceName, serviceVertical,
  isSaving, lastSavedAt, isDirty,
  steps,                        
  wizardComplete,
  undo, redo, canUndo, canRedo,
  initPayload,
} = useBuilderStore()

  const [editingName, setEditingName] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const { save } = useTemplate()

  

  useEffect(() => {
    if (editingName) nameRef.current?.focus()
  }, [editingName])

  // Show wizard only for genuinely new templates
  const isNewTemplate = !templateId && steps.length === 0 && !wizardComplete
  if (isNewTemplate) {
    return <NewTemplateWizard />
  }

  const validation = validateTemplate(templateName, steps, templateMode)

  const handlePublish = async () => {
    if (!validation.valid) {
      setShowValidation(true)
      return
    }
    await save()
    if (initPayload && initPayload.firmId !== 'dev-firm-id' && templateId) {
      const supabase = createClient()
      await supabase
        .from('process_templates')
        .update({
          status: 'active',
          published_at: new Date().toISOString(),
        })
        .eq('id', templateId)
    }
    useBuilderStore.setState({ templateStatus: 'active' })
    sendToParent('NSBC_PUBLISH_COMPLETE', { templateId: templateId ?? 'dev' })
  }

  const handleSave = () => {
    save()
    sendToParent('NSBC_SAVE_COMPLETE', { templateId: templateId ?? 'dev' })
  }

  const saveLabel = isSaving
    ? 'Saving…'
    : lastSavedAt
    ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : isDirty ? 'Unsaved changes'
    : 'All changes saved'

  return (
    <div className="flex h-screen flex-col bg-[#0f1117] overflow-hidden">

      {/* Validation banner */}
      {showValidation && !validation.valid && (
        <div className="flex items-center gap-3 bg-rose-500/10 border-b border-rose-500/20 px-4 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <div className="flex-1">
            {validation.errors.map((e, i) => (
              <span key={i} className="text-xs text-rose-400 mr-3">{e}</span>
            ))}
          </div>
          <button
            onClick={() => setShowValidation(false)}
            className="text-rose-400/50 hover:text-rose-400 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Warnings banner */}
      {showValidation && validation.valid && validation.warnings.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-400">
            {validation.warnings[0]}
            {validation.warnings.length > 1 && ` (+${validation.warnings.length - 1} more)`}
          </span>
          <button
            onClick={() => setShowValidation(false)}
            className="ml-auto text-amber-400/50 hover:text-amber-400 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP BAR */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-white/[0.08] bg-[#0a0c12] px-4">

        {/* Service breadcrumb */}
        {serviceName && (
          <>
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <span>{serviceVertical}</span>
              <span className="text-white/15">›</span>
              <span className="text-white/50">{serviceName}</span>
              <span className="text-white/15">›</span>
            </div>
          </>
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
              className="h-7 w-52 border-white/20 bg-white/5 text-sm text-white focus-visible:ring-blue-500"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium text-white hover:bg-white/5"
            >
              {templateName}
              <PencilIcon className="h-3 w-3 text-white/30" />
            </button>
          )}
          <Badge
            variant="outline"
            className={`text-[10px] border-white/10 ${
              templateStatus === 'active'
                ? 'text-emerald-400 border-emerald-400/30'
                : 'text-zinc-500'
            }`}
          >
            {templateStatus}
          </Badge>
        </div>

        {/* Mode toggle */}
        <Tabs
          value={templateMode}
          onValueChange={(v) => {
            const newMode = v as 'simple' | 'flow'
            if (newMode === 'flow') {
              useBuilderStore.getState().setFlowNodes([])
              useBuilderStore.getState().setFlowEdges([])
            }
            setTemplateMode(newMode)
          }}
          className="ml-2"
        >
          <TabsList className="h-7 bg-white/5 border border-white/10">
            <TabsTrigger value="simple" className="h-5 px-3 text-xs data-[state=active]:bg-white/10">
              Simple
            </TabsTrigger>
            <TabsTrigger value="flow" className="h-5 px-3 text-xs data-[state=active]:bg-white/10">
              Flow
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <span className="text-xs text-white/25">
          {steps.length} step{steps.length !== 1 ? 's' : ''}
        </span>

        <div className="flex-1" />

        <span className="flex items-center gap-1.5 text-xs text-white/30">
          <CloudIcon className="h-3.5 w-3.5" />
          {saveLabel}
        </span>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => canUndo() && undo()}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
            className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => canRedo() && redo()}
            disabled={!canRedo()}
            title="Redo (Ctrl+Shift+Z)"
            className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <Separator orientation="vertical" className="h-5 bg-white/10" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="h-7 border-white/15 bg-white/5 text-xs text-white hover:bg-white/10"
        >
          Save Draft
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

      {/* BODY */}
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