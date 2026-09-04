import { Share2 } from 'lucide-react'

/** Plain share-intent links (no SDKs, no brand icons — just real <a> tags) so the page has a way to be shared. */
export function ShareLinks() {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const text = 'Framosaic — turn a photo into a wall of instant prints'
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)

  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="flex items-center gap-1">
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        Share:
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="text-text-muted transition-colors hover:text-text"
      >
        X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="text-text-muted transition-colors hover:text-text"
      >
        Facebook
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="text-text-muted transition-colors hover:text-text"
      >
        LinkedIn
      </a>
    </span>
  )
}
