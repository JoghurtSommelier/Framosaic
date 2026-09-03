export function CtaBand({ onCreateMosaic }: { onCreateMosaic: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <h2 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Ready to make your mosaic?</h2>
      <p className="mt-3 text-text-muted">
        Free, open source, and entirely private — your photo never leaves your browser.
      </p>
      <button
        type="button"
        onClick={onCreateMosaic}
        className="mt-6 rounded-full bg-accent px-8 py-3 text-base font-medium text-accent-contrast transition-opacity hover:opacity-90"
      >
        Create your mosaic
      </button>
    </section>
  )
}
