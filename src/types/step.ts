// export type StepType = 'data' | 'ai' | 'human' | 'communication' | 'logic' | 'reporting'
// export type AutonomyLevel = 'manual' | 'assisted' | 'supervised' | 'autonomous'

// export interface Step {
//   id: string
//   type: StepType
//   name: string
//   description: string
//   autonomy_level: AutonomyLevel
//   assigned_role: string
//   config: Record<string, unknown>
// }
// export interface FlowNode {
//   id: string
//   type: 'stepNode' | 'startNode' | 'endNode'
//   position: { x: number; y: number }
//   data: {
//     step?: Step
//     label?: string
//   }
// }

// export interface FlowEdge {
//   id: string
//   source: string
//   target: string
//   type?: 'default' | 'condition'
//   label?: string
//   data?: {
//     condition?: string
//   }
// }

// export interface FlowGraph {
//   nodes: FlowNode[]
//   edges: FlowEdge[]
// }
export type StepType =
  | 'data'
  | 'ai'
  | 'human'
  | 'communication'
  | 'logic'
  | 'reporting'

export type AutonomyLevel =
  | 'manual'
  | 'assisted'
  | 'supervised'
  | 'autonomous'

// Per-type config shapes
export interface DataStepConfig {
  source?: 'bank_feed' | 'csv_upload' | 'quickbooks' | 'manual_entry' | 'api'
  description?: string
}

export interface AIStepConfig {
  task?: 'categorize' | 'extract' | 'summarize' | 'calculate' | 'review' | 'generate'
  model?: string
  prompt_hint?: string
}

export interface HumanStepConfig {
  reviewer_role?: 'accountant' | 'staff' | 'client' | 'manager'
  deadline_days?: number
  instructions?: string
}

export interface CommunicationStepConfig {
  channel?: 'email' | 'sms' | 'portal'
  recipient?: 'client' | 'accountant' | 'staff' | 'all'
  template_hint?: string
}

export interface LogicStepConfig {
  condition_type?: 'if_else' | 'threshold' | 'entity_type' | 'amount_check' | 'date_check'
  condition_description?: string
  true_label?: string
  false_label?: string
}

export interface ReportingStepConfig {
  output_type?: 'pdf' | 'excel' | 'dashboard' | 'email_summary'
  report_name?: string
  auto_send?: boolean
}

export type StepConfig =
  | DataStepConfig
  | AIStepConfig
  | HumanStepConfig
  | CommunicationStepConfig
  | LogicStepConfig
  | ReportingStepConfig

export interface Step {
  id: string
  type: StepType
  name: string
  description: string
  autonomy_level: AutonomyLevel
  assigned_role: 'accountant' | 'staff' | 'ai_agent' | 'client'
  config: StepConfig
}

export interface FlowNode {
  id: string
  type: 'stepNode' | 'startNode' | 'endNode'
  position: { x: number; y: number }
  data: {
    step?: Step
    label?: string
  }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  type?: 'default' | 'condition'
  label?: string
  data?: { condition?: string }
}

export interface FlowGraph {
  nodes: FlowNode[]
  edges: FlowEdge[]
}