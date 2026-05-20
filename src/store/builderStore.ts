import { create } from 'zustand'

import type { NSBCInitPayload } from '@/lib/bridge'
import { AutonomyLevel, FlowEdge, FlowNode, Step } from '../types/step'
import { BuilderMode, TemplateStatus } from '../types/template'
import { graphToSteps } from '@/lib/serlializer'

interface BuilderState {
  // Auth / context
  initPayload: NSBCInitPayload | null
  setInitPayload: (payload: NSBCInitPayload) => void

  // Template meta
  templateId: string | null
  templateName: string
  templateMode: BuilderMode
  templateStatus: TemplateStatus
  defaultAutonomy: AutonomyLevel
  setTemplateName: (name: string) => void
  setTemplateDescription: (desc: string) => void
  setTemplateMode: (mode: BuilderMode) => void
  setDefaultAutonomy: (level: AutonomyLevel) => void
  templateDescription: string
  serviceId: string | null
  serviceName: string
  serviceVertical: string
  wizardComplete: boolean
  setServiceContext: (id: string, name: string, vertical: string) => void
  setWizardComplete: (v: boolean) => void

  // Steps
  steps: Step[]
  setSteps: (steps: Step[], pushHistory?: boolean) => void
  addStep: (step: Step, insertAt?: number) => void
  updateStep: (id: string, patch: Partial<Step>) => void
  deleteStep: (id: string) => void

  // Flow Mode graph
  flowNodes: FlowNode[]
  flowEdges: FlowEdge[]
  setFlowNodes: (nodes: FlowNode[]) => void
  setFlowEdges: (edges: FlowEdge[]) => void
  addFlowNode: (node: FlowNode) => void
  updateFlowNode: (id: string, data: Partial<FlowNode['data']>) => void
  deleteFlowNode: (id: string) => void
  connectFlowNodes: (edge: FlowEdge) => void
  deleteFlowEdge: (id: string) => void

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
  setTemplateMode: (mode) => {
  const current = get()
  // Switching Flow → Simple: sync graph back to steps array
  if (current.templateMode === 'flow' && mode === 'simple') {
  
    const synced = graphToSteps({
      nodes: current.flowNodes,
      edges: current.flowEdges,
    })
    if (synced.length > 0) {
      set({ templateMode: mode, steps: synced, isDirty: true })
      return
    }
  }
  // Switching Simple → Flow: clear graph so FlowCanvas rebuilds from steps
  if (current.templateMode === 'simple' && mode === 'flow') {
    set({ templateMode: mode, flowNodes: [], flowEdges: [], isDirty: true })
    return
  }
  set({ templateMode: mode, isDirty: true })
},
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
  flowNodes: [],
flowEdges: [],
setFlowNodes: (nodes) => set({ flowNodes: nodes, isDirty: true }),
setFlowEdges: (edges) => set({ flowEdges: edges, isDirty: true }),
addFlowNode: (node) =>
  set((state) => ({
    flowNodes: [...state.flowNodes, node],
    isDirty: true,
  })),
updateFlowNode: (id, data) =>
  set((state) => ({
    flowNodes: state.flowNodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n
    ),
    isDirty: true,
  })),
deleteFlowNode: (id) =>
  set((state) => ({
    flowNodes: state.flowNodes.filter((n) => n.id !== id),
    flowEdges: state.flowEdges.filter(
      (e) => e.source !== id && e.target !== id
    ),
    isDirty: true,
  })),
connectFlowNodes: (edge) =>
  set((state) => ({
    flowEdges: [...state.flowEdges, edge],
    isDirty: true,
  })),
deleteFlowEdge: (id) =>
  set((state) => ({
    flowEdges: state.flowEdges.filter((e) => e.id !== id),
    isDirty: true,
  })),
  serviceId: null,
  serviceName: '',
  serviceVertical: '',
  wizardComplete: false,
  setServiceContext: (id, name, vertical) =>
  set({ serviceId: id, serviceName: name, serviceVertical: vertical }),
  setWizardComplete: (v) => set({ wizardComplete: v }),

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