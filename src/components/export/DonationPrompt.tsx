import { appConfig } from '../../config/appConfig'

export function DonationPrompt({ onDismiss }: { onDismiss: () => void }) {
  if (!appConfig.donationEnabled || !appConfig.donationUrl) return null

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm"
    >
      <span className="text-amber-900">Enjoying Framosaic? It's free and ad-free — support keeps it that way.</span>
      <div className="flex items-center gap-2">
        <a
          href={appConfig.donationUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
        >
          Support / buy me a coffee
        </a>
        <button
          type="button"
          onClick={onDismiss}
          className="text-amber-700 hover:text-amber-900"
          aria-label="Dismiss support message"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
