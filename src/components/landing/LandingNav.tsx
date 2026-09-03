import { useEffect, useState } from 'react'
import { appConfig } from '../../config/appConfig'
import { GitHubIcon } from '../layout/GitHubIcon'
import { ThemeToggle } from '../layout/ThemeToggle'

export function LandingNav({ onCreateMosaic }: { onCreateMosaic: () => void }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${scrolled ? 'glass border-b border-border' : 'border-b border-transparent bg-transparent'}`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <span className="text-lg font-semibold tracking-tight text-text">Framosaic</span>
        <nav className="hidden items-center gap-6 text-sm text-text-muted md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-text">
            How it works
          </a>
          <a href="#formats" className="transition-colors hover:text-text">
            Formats
          </a>
          <a href="#preview" className="transition-colors hover:text-text">
            Preview
          </a>
          <a
            href={appConfig.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-text"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={onCreateMosaic}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90"
          >
            Create mosaic
          </button>
        </div>
      </div>
    </header>
  )
}
