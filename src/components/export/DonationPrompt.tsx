import { Heart, X } from 'lucide-react'
import { appConfig } from '../../config/appConfig'

export function DonationPrompt({ onDismiss }: { onDismiss: () => void }) {
  if (!appConfig.donationEnabled || !appConfig.donationUrl) return null

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950"
    >
      <span className="text-amber-900 dark:text-amber-200">
        Enjoying Framosaic? It's free and ad-free — support keeps it that way.
      </span>
      <div className="flex items-center gap-2">
        <a
          href={appConfig.donationUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
        >
          <Heart className="h-3.5 w-3.5" aria-hidden="true" />
          Support / buy me a coffee
        </a>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-1 text-amber-700 transition-colors hover:bg-amber-200/50 hover:text-amber-900 dark:text-amber-300 dark:hover:bg-amber-900/50 dark:hover:text-amber-100"
          aria-label="Dismiss support message"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
