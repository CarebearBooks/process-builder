'use client'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'

import AddStepButton from './AddStepButton'
import { useBuilderStore } from '@/src/store/builderStore'
import SortableStepCard from './SortableStep'

export default function StepList() {
  const { steps, setSteps, theme } = useBuilderStore()

  const isDark = theme === 'dark'

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = steps.findIndex((s) => s.id === active.id)
    const newIndex = steps.findIndex((s) => s.id === over.id)
    setSteps(arrayMove(steps, oldIndex, newIndex))
  }

  // Connector line between nodes
  const Connector = () => (
    <div className="flex flex-col items-center">
      <div
        style={{
          width: '2px',
          height: '24px',
          background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.18)',
          borderRadius: '1px',
        }}
      />
    </div>
  )

  return (
    <div
      className="flex flex-col items-center py-8 px-4 min-h-full"
      style={{ background: isDark ? '#0f1117' : '#f4f4f5' }}
    >
      {/* START node */}
      <div
        className="rounded-full px-5 py-1.5 text-xs font-bold tracking-widest uppercase"
        style={{
          border: `2px solid ${isDark ? '#3b82f6' : '#2a5cff'}`,
          color: isDark ? '#3b82f6' : '#2a5cff',
          background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(42,92,255,0.08)',
        }}
      >
        Start
      </div>

      <Connector />

      {/* Top add button */}
      <AddStepButton insertAt={0} isDark={isDark} />

      <Connector />

      {steps.length === 0 ? (
        /* Empty state */
        <div
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-10 py-12 text-center"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          }}
        >
          <div className="text-3xl mb-3">✦</div>
          <p
            className="text-sm font-medium mb-1"
            style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
          >
            No steps yet
          </p>
          <p
            className="text-xs"
            style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)' }}
          >
            Click a step type in the left panel or use the + button above
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col items-center w-full max-w-md gap-0">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center w-full">
                  <SortableStepCard step={step} isDark={isDark} />
                  <Connector />
                  <AddStepButton insertAt={index + 1} isDark={isDark} />
                  {index < steps.length - 1 && <Connector />}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Connector />

      {/* END node */}
      <div
        className="rounded-full px-5 py-1.5 text-xs font-bold tracking-widest uppercase"
        style={{
          border: `2px solid ${isDark ? '#34d399' : '#059669'}`,
          color: isDark ? '#34d399' : '#059669',
          background: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(5,150,105,0.08)',
        }}
      >
        End
      </div>
    </div>
  )
}