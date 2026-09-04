import { Info, Ruler } from 'lucide-react'
import { appConfig } from '../../config/appConfig'
import { GitHubIcon } from './GitHubIcon'
import { SiteNav } from './SiteNav'
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
  return (
    <SiteNav
      onGoHome={onGoHome}
      extraActions={
        <>
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
        </>
      }
    />
  )
}
