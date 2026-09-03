import { ArrowLeft } from 'lucide-react'
import { FORMAT_PRESETS } from '../../data/formats'
import { appConfig } from '../../config/appConfig'
import { BRAND_DISCLAIMER } from '../../content/disclaimer'

export function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text">About Framosaic</h1>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full bg-border/40 px-3 py-1.5 text-sm text-text transition-colors hover:bg-border/60"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to editor
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-surface p-5 text-sm text-text">
        <p>
          Framosaic turns a photo into a grid of tiles sized for instant-film formats, so you can print each tile
          and reassemble them into a wall mosaic. Upload a photo, pick a format and grid, crop, and export
          print-ready files plus a gluing template that shows exactly where each print goes.
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-border bg-surface p-5 text-sm text-text">
        <h2 className="font-semibold text-text">Your privacy</h2>
        <p>
          Framosaic runs entirely in your browser. Your photo is never uploaded to a server — all cropping,
          adjustment, and export happens on your device, and nothing about your image leaves it.
          {appConfig.analyticsId
            ? ' This deployment uses cookie-free, aggregate analytics.'
            : ' This deployment has analytics disabled.'}
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-border bg-surface p-5 text-sm text-text">
        <h2 className="font-semibold text-text">Supported formats</h2>
        <ul className="list-disc space-y-1 pl-5">
          {FORMAT_PRESETS.map((format) => (
            <li key={format.id}>
              {format.label} — {format.filmWidth}×{format.filmHeight}mm film, {format.imageWidth}×
              {format.imageHeight}mm image area
            </li>
          ))}
          <li>Custom — any film/image/border dimensions you enter</li>
        </ul>
        <p className="text-xs text-text-muted">
          These are industry-common approximations, not exact manufacturer specs — verify yours on the{' '}
          <span className="font-medium">Calibration</span> page before printing a large batch.
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-border bg-surface p-5 text-xs leading-relaxed text-text-muted">
        <h2 className="text-sm font-semibold text-text">Trademark disclaimer</h2>
        <p>{BRAND_DISCLAIMER}</p>
      </div>

      <div className="space-y-2 rounded-2xl border border-border bg-surface p-5 text-sm text-text">
        <h2 className="font-semibold text-text">Open source</h2>
        <p>
          Framosaic is MIT-licensed and developed in the open on{' '}
          <a href={appConfig.githubUrl} target="_blank" rel="noreferrer" className="text-accent-fg underline">
            GitHub
          </a>
          . Bug reports, feature ideas, and contributions are welcome there.
        </p>
        {appConfig.donationEnabled && appConfig.donationUrl && (
          <p>
            If Framosaic is useful to you, you can{' '}
            <a href={appConfig.donationUrl} target="_blank" rel="noreferrer" className="text-accent-fg underline">
              support the project
            </a>
            .
          </p>
        )}
      </div>
    </div>
  )
}
