import { Info, Ruler } from 'lucide-react'
import { appConfig } from '../../config/appConfig'
import { GitHubIcon } from './GitHubIcon'
import { ThemeToggle } from './ThemeToggle'
import { UndoRedoControls } from './UndoRedoControls'

export function Header({
  onOpenCalibration,
  onOpenAbout,
  onGoHome,
}: {
  onOpenCalibration?: () => void
  onOpenAbout?: () => void
  onGoHome?: () => void
}) {
  const Wordmark = (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden="true">
        <rect x="2" y="2" width="27" height="32" rx="2" fill="#fafaf7" stroke="#1f2937" strokeWidth="2" />
        <rect x="6" y="6" width="19" height="19" fill="#38bdf8" />
        <rect x="35" y="14" width="27" height="32" rx="2" fill="#fafaf7" stroke="#1f2937" strokeWidth="2" />
        <rect x="39" y="18" width="19" height="19" fill="#fb7185" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-text">Framosaic</span>
    </span>
  )

  return (
    <header className="glass sticky top-0 z-40 flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 print:hidden">
      {onGoHome ? (
        <button type="button" onClick={onGoHome} className="rounded-full focus-visible:outline-2 focus-visible:outline-accent">
          {Wordmark}
        </button>
      ) : (
        Wordmark
      )}
      <div className="flex items-center gap-1 sm:gap-2">
        <UndoRedoControls />
        {onOpenAbout && (
          <button
            type="button"
            onClick={onOpenAbout}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border/50 hover:text-text"
          >
            <Info className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">About</span>
          </button>
        )}
        {onOpenCalibration && (
          <button
            type="button"
            onClick={onOpenCalibration}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border/50 hover:text-text"
          >
            <Ruler className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Calibration</span>
          </button>
        )}
        <a
          href={appConfig.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border/50 hover:text-text"
          aria-label="View Framosaic on GitHub"
        >
          <GitHubIcon className="h-4 w-4" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <ThemeToggle />
      </div>
    </header>
  )
}
