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

export interface ServiceOption {
  id: string
  name: string
  vertical: string
  icon: string
}

export interface ProcessTemplate {
  id: string
  firm_id: string | null
  service_id: string 
  service_name?: string
  service_vertical?: string
  name: string
  description: string
  mode: BuilderMode
  status: TemplateStatus
  steps_json: Step[] | null
  graph_json: { nodes: unknown[]; edges: unknown[] } | null
  default_autonomy: Step['autonomy_level']
  version: number
  created_by: string | null
}