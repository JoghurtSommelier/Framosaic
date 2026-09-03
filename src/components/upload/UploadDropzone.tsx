import { useCallback, useEffect, useRef, useState } from 'react'
import { loadOrientedImage } from '../../lib/exif'
import { canvasToObjectUrl, downscaleCanvas } from '../../lib/image'
import { useProjectStore } from '../../store/projectStore'

const PREVIEW_MAX_DIMENSION = 2000

export function UploadDropzone() {
  const sourceImage = useProjectStore((s) => s.sourceImage)
  const setSourceImage = useProjectStore((s) => s.setSourceImage)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('That file doesn’t look like an image. Try a JPEG or PNG.')
        return
      }
      setError(null)
      setIsLoading(true)
      try {
        const { canvas, width, height } = await loadOrientedImage(file)
        const previewCanvas = downscaleCanvas(canvas, PREVIEW_MAX_DIMENSION)
        const previewUrl = await canvasToObjectUrl(previewCanvas)
        setSourceImage({
          fullCanvas: canvas,
          width,
          height,
          previewCanvas,
          previewUrl,
          previewWidth: previewCanvas.width,
          previewHeight: previewCanvas.height,
          name: file.name,
        })
      } catch {
        setError('Couldn’t read that image — it may be corrupted or in an unsupported format.')
      } finally {
        setIsLoading(false)
      }
    },
    [setSourceImage],
  )

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((i) => i.type.startsWith('image/'))
      const file = item?.getAsFile()
      if (file) void handleFile(file)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [handleFile])

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a photo: click to browse, drag and drop, or paste from clipboard"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file) void handleFile(file)
        }}
        className={`flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragOver ? 'border-sky-400 bg-sky-50' : 'border-stone-300 bg-stone-50 hover:border-stone-400'
        }`}
      >
        {isLoading ? (
          <p className="text-sm text-stone-500">Loading image…</p>
        ) : sourceImage ? (
          <>
            <p className="text-sm font-medium text-stone-700">{sourceImage.name}</p>
            <p className="text-xs text-stone-500">
              {sourceImage.width}×{sourceImage.height}px — click, drop, or paste to replace
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-stone-700">Drop a photo here, click to browse, or paste it</p>
            <p className="text-xs text-stone-500">JPEG or PNG, any resolution</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
