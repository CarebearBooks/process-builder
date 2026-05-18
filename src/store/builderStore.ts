import { create } from 'zustand'
import type { NSBCInitPayload } from '@/lib/bridge'
import { AutonomyLevel, Step } from '../types/step'
import { BuilderMode, TemplateStatus } from '../types/template'

interface BuilderState {
  // Auth / context
  initPayload: NSBCInitPayload | null
  setInitPayload: (payload: NSBCInitPayload) => void

  // Template meta
  templateId: string | null
  templateName: string
  templateDescription: string
  templateMode: BuilderMode
  templateStatus: TemplateStatus
  defaultAutonomy: AutonomyLevel
  setTemplateName: (name: string) => void
  setTemplateDescription: (desc: string) => void
  setTemplateMode: (mode: BuilderMode) => void
  setDefaultAutonomy: (level: AutonomyLevel) => void

  // Steps (Simple Mode)
  steps: Step[]
  setSteps: (steps: Step[]) => void
  addStep: (step: Step, insertAt?: number) => void
  updateStep: (id: string, patch: Partial<Step>) => void
  deleteStep: (id: string) => void

  // Selection
  selectedStepId: string | null
  setSelectedStepId: (id: string | null) => void

  // Save state
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: Date | null
  setIsSaving: (v: boolean) => void
  setLastSavedAt: (d: Date) => void
  markDirty: () => void
  markClean: () => void
}

export const useBuilderStore = create<BuilderState>((set) => ({
  initPayload: null,
  setInitPayload: (payload) => set({ initPayload: payload }),

  templateId: null,
  templateName: 'Untitled Template',
  templateDescription: '',
  templateMode: 'simple',
  templateStatus: 'draft',
  defaultAutonomy: 'supervised',
  setTemplateName: (name) => set({ templateName: name, isDirty: true }),
  setTemplateDescription: (desc) => set({ templateDescription: desc, isDirty: true }),
  setTemplateMode: (mode) => set({ templateMode: mode, isDirty: true }),
  setDefaultAutonomy: (level) => set({ defaultAutonomy: level, isDirty: true }),

  steps: [],
  setSteps: (steps) => set({ steps, isDirty: true }),
  addStep: (step, insertAt) =>
    set((state) => {
      const next = [...state.steps]
      if (insertAt !== undefined) next.splice(insertAt, 0, step)
      else next.push(step)
      return { steps: next, isDirty: true }
    }),
  updateStep: (id, patch) =>
    set((state) => ({
      steps: state.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      isDirty: true,
    })),
  deleteStep: (id) =>
    set((state) => ({
      steps: state.steps.filter((s) => s.id !== id),
      selectedStepId: state.selectedStepId === id ? null : state.selectedStepId,
      isDirty: true,
    })),

  selectedStepId: null,
  setSelectedStepId: (id) => set({ selectedStepId: id }),

  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  setIsSaving: (v) => set({ isSaving: v }),
  setLastSavedAt: (d) => set({ lastSavedAt: d }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
}))