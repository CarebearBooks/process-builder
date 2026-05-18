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

  // Steps
  steps: Step[]
  setSteps: (steps: Step[], pushHistory?: boolean) => void
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

  // History (undo/redo)
  history: Step[][]
  historyIndex: number
  pushHistory: (steps: Step[]) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

const MAX_HISTORY = 50

export const useBuilderStore = create<BuilderState>((set, get) => ({
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
  setSteps: (steps, push = true) => {
    if (push) get().pushHistory(get().steps)
    set({ steps, isDirty: true })
  },
  addStep: (step, insertAt) => {
    get().pushHistory(get().steps)
    set((state) => {
      const next = [...state.steps]
      if (insertAt !== undefined) next.splice(insertAt, 0, step)
      else next.push(step)
      return { steps: next, isDirty: true }
    })
  },
  updateStep: (id, patch) => {
    get().pushHistory(get().steps)
    set((state) => ({
      steps: state.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      isDirty: true,
    }))
  },
  deleteStep: (id) => {
    get().pushHistory(get().steps)
    set((state) => ({
      steps: state.steps.filter((s) => s.id !== id),
      selectedStepId: state.selectedStepId === id ? null : state.selectedStepId,
      isDirty: true,
    }))
  },

  selectedStepId: null,
  setSelectedStepId: (id) => set({ selectedStepId: id }),

  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  setIsSaving: (v) => set({ isSaving: v }),
  setLastSavedAt: (d) => set({ lastSavedAt: d }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),

  // ── History ──────────────────────────────────────────
  history: [],
  historyIndex: -1,

  pushHistory: (steps) => {
    const { history, historyIndex } = get()
    // Slice off any redo states ahead of current index
    const trimmed = history.slice(0, historyIndex + 1)
    const next = [...trimmed, steps].slice(-MAX_HISTORY)
    set({ history: next, historyIndex: next.length - 1 })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < 0) return
    const steps = history[historyIndex]
    set({
      steps,
      historyIndex: historyIndex - 1,
      isDirty: true,
      selectedStepId: null,
    })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const steps = history[historyIndex + 1]
    set({
      steps,
      historyIndex: historyIndex + 1,
      isDirty: true,
      selectedStepId: null,
    })
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}))