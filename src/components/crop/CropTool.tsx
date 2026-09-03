import { useMemo, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { computeCropAspect } from '../../engine/layout'
import { useProjectStore } from '../../store/projectStore'

export function CropTool() {
  const format = useProjectStore((s) => s.format)
  const grid = useProjectStore((s) => s.grid)
  const gaps = useProjectStore((s) => s.gaps)
  const mapping = useProjectStore((s) => s.mapping)
  const sourceImage = useProjectStore((s) => s.sourceImage)
  const crop = useProjectStore((s) => s.crop)
  const setCrop = useProjectStore((s) => s.setCrop)

  const aspect = computeCropAspect(format, grid, gaps, mapping)

  const [cropPos, setCropPos] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(crop?.rotation ?? 0)

  const scaleToFull = sourceImage ? sourceImage.width / sourceImage.previewWidth : 1

  const initialCroppedAreaPixels: Area | undefined = useMemo(() => {
    if (!crop) return undefined
    return {
      x: crop.x / scaleToFull,
      y: crop.y / scaleToFull,
      width: crop.width / scaleToFull,
      height: crop.height / scaleToFull,
    }
  }, [crop, scaleToFull])

  if (!sourceImage) {
    return <p className="text-sm text-stone-500">Upload a photo to start cropping.</p>
  }

  return (
    <div className="space-y-3">
      <div className="relative h-96 w-full overflow-hidden rounded-lg bg-stone-900">
        <Cropper
          image={sourceImage.previewUrl}
          crop={cropPos}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          initialCroppedAreaPixels={initialCroppedAreaPixels}
          onCropChange={setCropPos}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={(_area, areaPixels) => {
            setCrop({
              x: areaPixels.x * scaleToFull,
              y: areaPixels.y * scaleToFull,
              width: areaPixels.width * scaleToFull,
              height: areaPixels.height * scaleToFull,
              rotation,
            })
          }}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-700">
        Zoom
        <input
          type="range"
          min={1}
          max={5}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1"
          aria-label="Crop zoom"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-stone-700">
        Rotation
        <input
          type="range"
          min={-45}
          max={45}
          step={1}
          value={rotation}
          onChange={(e) => setRotation(Number(e.target.value))}
          className="flex-1"
          aria-label="Crop rotation in degrees"
        />
        <span className="w-10 text-right text-xs text-stone-500">{rotation}°</span>
      </label>
    </div>
  )
}
