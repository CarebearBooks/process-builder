'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import StepCard from './StepCard'
import { Step } from '@/src/types/step'


interface Props {
  step: Step
  isDark: boolean
}

export default function SortableStepCard({ step, isDark }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} className="w-full max-w-md">
      <StepCard
        step={step}
        isDark={isDark}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}