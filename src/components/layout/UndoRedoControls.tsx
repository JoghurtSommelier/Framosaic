import { Redo2, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { canRedo, canUndo, redo, subscribeHistory, undo } from '../../store/history'

export function UndoRedoControls() {
  const [, forceRender] = useState(0)

  useEffect(() => subscribeHistory(() => forceRender((n) => n + 1)), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMod = event.metaKey || event.ctrlKey
      if (!isMod || event.key.toLowerCase() !== 'z') return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={!canUndo()}
        onClick={undo}
        className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-border/50 hover:text-text disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="Undo"
        title="Undo (Ctrl/Cmd+Z)"
      >
        <Undo2 className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        disabled={!canRedo()}
        onClick={redo}
        className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-border/50 hover:text-text disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="Redo"
        title="Redo (Ctrl/Cmd+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
