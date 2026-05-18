import { StepType, AutonomyLevel } from "../types/step"


export const STEP_TYPE_CONFIG: Record<StepType, {
  label: string
  color: string
  bgColor: string
  description: string
  icon: string
}> = {
  data:          { label: 'Data',          color: '#3b82f6', bgColor: 'rgba(59,130,246,0.12)',  description: 'Import, fetch, or sync data', icon: '⬇' },
  ai:            { label: 'AI',            color: '#a855f7', bgColor: 'rgba(168,85,247,0.12)',  description: 'Categorize, analyze, extract', icon: '✦' },
  human:         { label: 'Human',         color: '#f59e0b', bgColor: 'rgba(245,158,11,0.12)',  description: 'Review, approve, decide', icon: '👤' },
  communication: { label: 'Communication', color: '#22c55e', bgColor: 'rgba(34,197,94,0.12)',   description: 'Email, SMS, notify', icon: '✉' },
  logic:         { label: 'Logic',         color: '#f43f5e', bgColor: 'rgba(244,63,94,0.12)',   description: 'Branch, condition, loop', icon: '⟋' },
  reporting:     { label: 'Reporting',     color: '#06b6d4', bgColor: 'rgba(6,182,212,0.12)',   description: 'Generate, export, trigger', icon: '📊' },
}

export const AUTONOMY_CONFIG: Record<AutonomyLevel, {
  label: string
  color: string
  pct: number
  description: string
}> = {
  manual:     { label: 'Manual',     color: '#94a3b8', pct: 0,   description: 'Human does everything' },
  assisted:   { label: 'Assisted',   color: '#60a5fa', pct: 33,  description: 'AI suggests, human approves' },
  supervised: { label: 'Supervised', color: '#818cf8', pct: 66,  description: 'AI acts, human can override' },
  autonomous: { label: 'Autonomous', color: '#34d399', pct: 100, description: 'AI end-to-end, exceptions only' },
}