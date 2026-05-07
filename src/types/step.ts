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