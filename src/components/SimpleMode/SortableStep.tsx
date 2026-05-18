'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import StepCard from './StepCard'
import { GripVertical } from 'lucide-react'
import { Step } from '@/src/types/step'

export default function SortableStepCard({ step }: { step: Step }) {
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
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-full max-w-sm group"
    >
      {/* Drag handle — appears on hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-7 top-1/2 -translate-y-1/2 flex h-8 w-6 cursor-grab items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-white/30" />
      </div>

      <StepCard step={step} />
    </div>
  )
}