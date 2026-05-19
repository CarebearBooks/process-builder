export type StepType = 'data' | 'ai' | 'human' | 'communication' | 'logic' | 'reporting'
export type AutonomyLevel = 'manual' | 'assisted' | 'supervised' | 'autonomous'

export interface Step {
  id: string
  type: StepType
  name: string
  description: string
  autonomy_level: AutonomyLevel
  assigned_role: string
  config: Record<string, unknown>
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
  data?: {
    condition?: string
  }
}

export interface FlowGraph {
  nodes: FlowNode[]
  edges: FlowEdge[]
}