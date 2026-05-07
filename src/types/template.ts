import type { Step } from './step'

export type BuilderMode = 'simple' | 'flow'
export type TemplateStatus = 'draft' | 'active' | 'archived'

export interface ProcessTemplate {
  id: string
  firm_id: string | null
  service_id: string
  name: string
  description: string
  mode: BuilderMode
  status: TemplateStatus
  steps_json: Step[] | null
  graph_json: { nodes: unknown[]; edges: unknown[] } | null
  default_autonomy: Step['autonomy_level']
  version: number
}