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
  const connectorColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const emptyTextColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
  const emptySubColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
  const emptyBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = steps.findIndex((s) => s.id === active.id)
    const newIndex = steps.findIndex((s) => s.id === over.id)
    setSteps(arrayMove(steps, oldIndex, newIndex))
  }

  return (
    <div className="flex flex-col items-center py-8 px-4 min-h-full">

      {/* START */}
      <div className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
        Start
      </div>

      {steps.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="h-8 w-px" style={{ background: connectorColor }} />
          <AddStepButton insertAt={0} />
          <div className="h-8 w-px" style={{ background: connectorColor }} />
          <div
            className="rounded-lg border border-dashed px-10 py-8 text-center"
            style={{ borderColor: emptyBorder }}
          >
            <p className="text-sm" style={{ color: emptyTextColor }}>No steps yet</p>
            <p className="mt-1 text-xs" style={{ color: emptySubColor }}>
              Click a type in the left panel or use + to add
            </p>
          </div>
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
            <div className="flex flex-col items-center w-full max-w-sm">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center w-full">
                  <div className="h-3 w-px" style={{ background: connectorColor }} />
                  <AddStepButton insertAt={index} />
                  <div className="h-3 w-px" style={{ background: connectorColor }} />
                  <SortableStepCard step={step} />
                </div>
              ))}
              <div className="h-3 w-px" style={{ background: connectorColor }} />
              <AddStepButton insertAt={steps.length} />
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="h-4 w-px" style={{ background: connectorColor }} />

      {/* END */}
      <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
        End
      </div>
    </div>
  )
}