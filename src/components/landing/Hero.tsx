import { MosaicBanner } from './MosaicBanner'

export function Hero({ onCreateMosaic }: { onCreateMosaic: () => void }) {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24">
      <h1 className="text-4xl font-semibold tracking-tight text-text sm:text-6xl">
        Turn one photo into a wall of instant prints
      </h1>
      <p className="max-w-xl text-lg text-text-muted">
        Framosaic splits your photo into a grid sized for Polaroid, Instax, and other instant-film formats — print
        each tile, and reassemble them into one big mosaic on your wall.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCreateMosaic}
          className="rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-contrast transition-opacity hover:opacity-90"
        >
          Upload a photo
        </button>
        <a
          href="#how-it-works"
          className="rounded-full bg-border/40 px-6 py-3 text-base font-medium text-text transition-colors hover:bg-border/60"
        >
          See how it works
        </a>
      </div>
      <div className="mt-6 w-full">
        <MosaicBanner />
      </div>
    </section>
  )
}
