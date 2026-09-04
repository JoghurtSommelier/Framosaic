import { useEffect, useState, type ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'

export interface AnchorLink {
  label: string
  href: string
  external?: boolean
  icon?: ReactNode
}

/**
 * The one nav shared by the landing page and the editor (spec §5.4): same
 * sticky, frosted-on-scroll shell, wordmark, and theme toggle everywhere.
 * `anchorLinks` (hidden on mobile, like a marketing page's in-page nav) and
 * `extraActions`/`primaryAction` (always visible) are where each page's
 * context differs, without breaking the shared look.
 */
export function SiteNav({
  onGoHome,
  anchorLinks = [],
  extraActions,
  primaryAction,
}: {
  onGoHome?: () => void
  anchorLinks?: AnchorLink[]
  extraActions?: ReactNode
  primaryAction?: { label: string; onClick: () => void }
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const wordmark = (
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
    <header
      className={`sticky top-0 z-40 transition-colors print:hidden ${
        scrolled ? 'glass border-b border-border' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {onGoHome ? (
          <button
            type="button"
            onClick={onGoHome}
            className="rounded-full focus-visible:outline-2 focus-visible:outline-accent"
          >
            {wordmark}
          </button>
        ) : (
          wordmark
        )}

        {anchorLinks.length > 0 && (
          <nav className="hidden items-center gap-6 text-sm text-text-muted md:flex">
            {anchorLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                className="flex items-center gap-1.5 transition-colors hover:text-text"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-1 sm:gap-2">
          {extraActions}
          <ThemeToggle />
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90"
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
