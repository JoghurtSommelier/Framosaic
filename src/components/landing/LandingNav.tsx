import { appConfig } from '../../config/appConfig'
import { GitHubIcon } from '../layout/GitHubIcon'
import { SiteNav } from '../layout/SiteNav'

export function LandingNav({ onCreateMosaic }: { onCreateMosaic: () => void }) {
  return (
    <SiteNav
      anchorLinks={[
        { label: 'How it works', href: '#how-it-works' },
        { label: 'Formats', href: '#formats' },
        { label: 'Preview', href: '#preview' },
      ]}
      extraActions={
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
      }
      primaryAction={{ label: 'Create mosaic', onClick: onCreateMosaic }}
    />
  )
}
