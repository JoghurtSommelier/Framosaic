import { Heart } from 'lucide-react'
import { appConfig } from '../../config/appConfig'
import { BRAND_DISCLAIMER } from '../../content/disclaimer'
import { GitHubIcon } from './GitHubIcon'

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg px-4 py-6 text-xs leading-relaxed text-text-muted sm:px-6 print:hidden">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={appConfig.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-text-muted transition-colors hover:text-text"
          >
            <GitHubIcon className="h-3.5 w-3.5" />
            GitHub
          </a>
          {appConfig.donationEnabled && appConfig.donationUrl && (
            <a
              href={appConfig.donationUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-text-muted transition-colors hover:text-text"
            >
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              Support Framosaic
            </a>
          )}
          <span>MIT License</span>
        </div>
        <p>{BRAND_DISCLAIMER}</p>
        <p>Your photo is processed entirely in your browser — nothing is uploaded to a server.</p>
        <p>
          Built with{' '}
          <a href="https://claude.com/claude-code" target="_blank" rel="noreferrer" className="underline hover:text-text">
            Claude Code
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
