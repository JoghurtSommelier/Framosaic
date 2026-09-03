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
        className="rounded-md bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200"
      >
        Save project (.json)
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-md bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200"
      >
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
        <p role="alert" className="w-full text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
