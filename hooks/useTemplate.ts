import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useBuilderStore } from '@/src/store/builderStore'

const AUTOSAVE_DELAY = 1500 // ms after last change before saving

export function useTemplate() {
  const {
    initPayload,
    templateId,
    templateName,
    templateDescription,
    templateMode,
    defaultAutonomy,
    steps,
    isDirty,
    isSaving,
    setIsSaving,
    setLastSavedAt,
    markClean,
  } = useBuilderStore()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const templateIdRef = useRef<string | null>(templateId)

  // Keep ref in sync so the save function always has the latest id
  useEffect(() => {
    templateIdRef.current = templateId
  }, [templateId])

  const save = useCallback(async () => {
    if (!initPayload || isSaving) return

    const supabase = createClient()
    setIsSaving(true)

    const payload = {
      firm_id: initPayload.firmId === 'dev-firm-id' ? null : initPayload.firmId,
      service_id: initPayload.serviceId === 'dev-service-id' ? null : initPayload.serviceId,
      name: templateName,
      description: templateDescription,
      mode: templateMode,
      default_autonomy: defaultAutonomy,
      steps_json: steps,
      updated_at: new Date().toISOString(),
    }

    try {
      if (templateIdRef.current && templateIdRef.current !== 'dev-template-id') {
        // Update existing
        const { error } = await supabase
          .from('process_templates')
          .update(payload)
          .eq('id', templateIdRef.current)

        if (error) throw error
      } else {
        // Insert new — only when connected to real Supabase
        if (initPayload.firmId !== 'dev-firm-id') {
          const { data, error } = await supabase
            .from('process_templates')
            .insert({ ...payload, created_by: initPayload.userId })
            .select('id')
            .single()

          if (error) throw error
          if (data) {
            templateIdRef.current = data.id
            useBuilderStore.setState({ templateId: data.id })
          }
        }
      }

      markClean()
      setLastSavedAt(new Date())
    } catch (err) {
      console.error('[Autosave] Failed:', err)
    } finally {
      setIsSaving(false)
    }
  }, [
    initPayload, isSaving, templateName, templateDescription,
    templateMode, defaultAutonomy, steps,
    setIsSaving, setLastSavedAt, markClean,
  ])

  // Debounced autosave — fires 1.5s after last change
  useEffect(() => {
    if (!isDirty) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      save()
    }, AUTOSAVE_DELAY)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isDirty, steps, templateName, save])

  // Load existing template on mount if templateId provided
  useEffect(() => {
    if (!initPayload?.templateId) return
    if (initPayload.templateId === 'dev-template-id') return
    if (initPayload.firmId === 'dev-firm-id') return

    const load = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('process_templates')
        .select('*')
        .eq('id', initPayload.templateId)
        .single()

      if (error || !data) return

      useBuilderStore.setState({
        templateId: data.id,
        templateName: data.name,
        templateDescription: data.description ?? '',
        templateMode: data.mode,
        defaultAutonomy: data.default_autonomy,
        steps: data.steps_json ?? [],
      })
    }

    load()
  }, [initPayload])

  return { save }
}