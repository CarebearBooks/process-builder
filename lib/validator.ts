import { Step } from "@/src/types/step"

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateTemplate(
  name: string,
  steps: Step[],
  mode: 'simple' | 'flow'
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!name.trim()) {
    errors.push('Template must have a name')
  }

  if (steps.length === 0) {
    errors.push('Template must have at least one step')
  }

  steps.forEach((step, i) => {
    const label = `Step ${i + 1}`
    if (!step.name.trim() || step.name === step.type + ' Step') {
      warnings.push(`${label}: consider giving a more descriptive name`)
    }
    if (!step.description.trim()) {
      warnings.push(`${label} "${step.name}": missing description`)
    }
  })

  const humanSteps = steps.filter(s => s.type === 'human')
  if (humanSteps.length === 0 && steps.length > 2) {
    warnings.push('No human review step — consider adding one for quality control')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}