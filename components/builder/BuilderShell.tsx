'use client'

import { useState, useEffect, useRef } from 'react'
import { sendToParent } from '@/lib/bridge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CheckIcon, CloudIcon, PencilIcon, Redo2, Undo2 } from 'lucide-react'
import { useBuilderStore } from '@/src/store/builderStore'
import StepPalette from './StepPalette'
import StepList from '@/src/components/SimpleMode/StepList'
import ConfigPanel from '../configure/ConfigurePanel'
import { useTemplate } from '@/hooks/useTemplate'
import { useBuilderKeyboard } from '@/hooks/createBuilderKey'
import { createClient } from '@/lib/supabase'

export default function BuilderShell() {
  useBuilderKeyboard()
  const {
    templateId,
    templateName, setTemplateName,
    templateMode, setTemplateMode,
    templateStatus,
    isSaving, lastSavedAt,
    isDirty,
    steps,
  } = useBuilderStore()

  const [editingName, setEditingName] = useState(false)
  const { undo, redo, canUndo, canRedo } = useBuilderStore()
  const { initPayload } = useBuilderStore()
  const nameRef = useRef<HTMLInputElement>(null)
  const { save } = useTemplate()

  useEffect(() => {
    if (editingName) nameRef.current?.focus()
  }, [editingName])

  // const handlePublish = () => {
  //   sendToParent('NSBC_PUBLISH_COMPLETE', { templateId: 'dev-template-id' })
  //   // TODO: wire to Supabase save + status update
  // }
  const handlePublish = async () => {
  await save()

  if (initPayload && initPayload.firmId !== 'dev-firm-id' && templateId) {
    const supabase = createClient()
    await supabase
      .from('process_templates')
      .update({
        status: 'active',
        published_at: new Date().toISOString(),
        version: supabase.rpc('increment_version', { template_id: templateId }),
      })
      .eq('id', templateId)
  }

  useBuilderStore.setState({ templateStatus: 'active' })
  sendToParent('NSBC_PUBLISH_COMPLETE', { templateId: templateId ?? 'dev' })
}

  // const handleSave = () => {
  //   sendToParent('NSBC_SAVE_COMPLETE', { templateId: 'dev-template-id' })
  //   // TODO: wire to Supabase save
  // }
  const handleSave = () => {
  save()
  sendToParent('NSBC_SAVE_COMPLETE', { templateId: templateId ?? 'dev' })
}

  const saveLabel = isSaving
    ? 'Saving…'
    : lastSavedAt
    ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : isDirty
    ? 'Unsaved changes'
    : 'All changes saved'

  return (
    <div className="flex h-screen flex-col bg-[#0f1117] overflow-hidden">

      {/* ── TOP BAR ── */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-white/[0.08] bg-[#0a0c12] px-4">

        {/* Template name */}
        <div className="flex items-center gap-1.5 min-w-0">
          {editingName ? (
            <Input
              ref={nameRef}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="h-7 w-56 border-white/20 bg-white/5 text-sm text-white focus-visible:ring-blue-500"
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
          onValueChange={(v) => setTemplateMode(v as 'simple' | 'flow')}
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

        {/* Step count */}
        <span className="text-xs text-white/25 ml-1">
          {steps.length} step{steps.length !== 1 ? 's' : ''}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save status */}
        <span className="flex items-center gap-1.5 text-xs text-white/30">
          <CloudIcon className="h-3.5 w-3.5" />
          {saveLabel}
        </span>
        {/* Undo / Redo */}
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

        {/* Actions */}
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

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0">
        <StepPalette />
        <main className="flex-1 overflow-y-auto">
          {templateMode === 'simple' ? (
            <StepList />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/30">
              Flow Mode canvas — coming next
            </div>
          )}
        </main>
        <ConfigPanel />
      </div>

    </div>
  )
}