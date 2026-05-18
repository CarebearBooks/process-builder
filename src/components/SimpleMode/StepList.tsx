// 'use client'

// import { useBuilderStore } from "@/src/store/builderStore"
// import AddStepButton from "./AddStepButton"
// import StepCard from "./StepCard"

// export default function StepList() {
//   const steps = useBuilderStore((s) => s.steps)

//   return (
//     <div className="flex flex-col items-center py-8 px-4 gap-0 min-h-full">

//       {/* START node */}
//       <div className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
//         Start
//       </div>

//       {steps.length === 0 ? (
//         <div className="mt-6 flex flex-col items-center gap-3">
//           <div className="h-8 w-px bg-white/10" />
//           <div className="rounded-lg border border-dashed border-white/10 px-8 py-6 text-center">
//             <p className="text-sm text-white/30">No steps yet</p>
//             <p className="mt-1 text-xs text-white/20">Click a step type in the left panel to add one</p>
//           </div>
//         </div>
//       ) : (
//         steps.map((step, index) => (
//           <div key={step.id} className="flex flex-col items-center w-full max-w-sm">
//             <div className="h-4 w-px bg-white/10" />
//             <AddStepButton insertAt={index} />
//             <div className="h-4 w-px bg-white/10" />
//             <StepCard step={step} />
//           </div>
//         ))
//       )}

//       <div className="h-4 w-px bg-white/10" />
//       <AddStepButton insertAt={steps.length} />
//       <div className="h-4 w-px bg-white/10" />

//       {/* END node */}
//       <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
//         End
//       </div>
//     </div>
//   )
// }
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
  const { steps, setSteps } = useBuilderStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }, // prevents accidental drags on click
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
          <div className="h-8 w-px bg-white/10" />
          <AddStepButton insertAt={0} />
          <div className="h-8 w-px bg-white/10" />
          <div className="rounded-lg border border-dashed border-white/10 px-10 py-8 text-center">
            <p className="text-sm text-white/30">No steps yet</p>
            <p className="mt-1 text-xs text-white/20">Click a type in the left panel or use + to add</p>
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
                  <div className="h-3 w-px bg-white/10" />
                  <AddStepButton insertAt={index} />
                  <div className="h-3 w-px bg-white/10" />
                  <SortableStepCard step={step} />
                </div>
              ))}
              <div className="h-3 w-px bg-white/10" />
              <AddStepButton insertAt={steps.length} />
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="h-4 w-px bg-white/10" />

      {/* END */}
      <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
        End
      </div>

    </div>
  )
}