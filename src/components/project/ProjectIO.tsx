import { FolderOpen, Save } from 'lucide-react'
import { useRef, useState } from 'react'
import { loadProjectFile, saveProjectFile } from '../../lib/projectFile'

export function ProjectIO() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => saveProjectFile()}
        className="flex items-center gap-1.5 rounded-full bg-border/40 px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-border/60"
      >
        <Save className="h-3.5 w-3.5" aria-hidden="true" />
        Save project (.json)
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 rounded-full bg-border/40 px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-border/60"
      >
        <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
        Load project…
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          const result = await loadProjectFile(file)
          setError(result.success ? null : (result.error ?? 'Could not load that file.'))
        }}
      />
      {error && (
        <p role="alert" className="w-full text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
