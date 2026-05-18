import { useBuilderStore } from '@/src/store/builderStore'
import { useEffect } from 'react'

export function useBuilderKeyboard() {
  const { undo, redo, canUndo, canRedo, deleteStep, selectedStepId } = useBuilderStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const ctrl = isMac ? e.metaKey : e.ctrlKey

      // Ignore if typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        if (canUndo()) undo()
        return
      }

      if (ctrl && (e.shiftKey && e.key === 'z') || (ctrl && e.key === 'y')) {
        e.preventDefault()
        if (canRedo()) redo()
        return
      }

      // Delete or Backspace removes selected step
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedStepId) {
        // Only if not focused on an input
        e.preventDefault()
        deleteStep(selectedStepId)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, canUndo, canRedo, deleteStep, selectedStepId])
}