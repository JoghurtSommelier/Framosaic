import { FORMAT_PRESETS } from '../../data/formats'
import { appConfig } from '../../config/appConfig'
import { BRAND_DISCLAIMER } from '../../content/disclaimer'

export function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-900">About Framosaic</h1>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md bg-stone-100 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-200"
        >
          ← Back to editor
        </button>
      </div>

      <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-700">
        <p>
          Framosaic turns a photo into a grid of tiles sized for instant-film formats, so you can print each tile
          and reassemble them into a wall mosaic. Upload a photo, pick a format and grid, crop, and export
          print-ready files plus a gluing template that shows exactly where each print goes.
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-700">
        <h2 className="font-semibold text-stone-900">Your privacy</h2>
        <p>
          Framosaic runs entirely in your browser. Your photo is never uploaded to a server — all cropping,
          adjustment, and export happens on your device, and nothing about your image leaves it.
          {appConfig.analyticsId
            ? ' This deployment uses cookie-free, aggregate analytics.'
            : ' This deployment has analytics disabled.'}
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-700">
        <h2 className="font-semibold text-stone-900">Supported formats</h2>
        <ul className="list-disc space-y-1 pl-5">
          {FORMAT_PRESETS.map((format) => (
            <li key={format.id}>
              {format.label} — {format.filmWidth}×{format.filmHeight}mm film, {format.imageWidth}×
              {format.imageHeight}mm image area
            </li>
          ))}
          <li>Custom — any film/image/border dimensions you enter</li>
        </ul>
        <p className="text-xs text-stone-500">
          These are industry-common approximations, not exact manufacturer specs — verify yours on the{' '}
          <span className="font-medium">Calibration</span> page before printing a large batch.
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-4 text-xs leading-relaxed text-stone-600">
        <h2 className="text-sm font-semibold text-stone-900">Trademark disclaimer</h2>
        <p>{BRAND_DISCLAIMER}</p>
      </div>

      <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-700">
        <h2 className="font-semibold text-stone-900">Open source</h2>
        <p>
          Framosaic is MIT-licensed and developed in the open on{' '}
          <a href={appConfig.githubUrl} target="_blank" rel="noreferrer" className="text-sky-700 underline">
            GitHub
          </a>
          . Bug reports, feature ideas, and contributions are welcome there.
        </p>
        {appConfig.donationEnabled && appConfig.donationUrl && (
          <p>
            If Framosaic is useful to you, you can{' '}
            <a href={appConfig.donationUrl} target="_blank" rel="noreferrer" className="text-sky-700 underline">
              support the project
            </a>
            .
          </p>
        )}
      </div>
    </div>
  )
}
