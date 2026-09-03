import { FORMAT_PRESETS } from '../../data/formats'

export function FormatsShowcase() {
  return (
    <section id="formats" className="bg-black/[0.02] py-20 dark:bg-white/[0.03]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-text">Formats</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm text-text-muted">
          Every major instant-film size, or your own custom dimensions.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FORMAT_PRESETS.map((format) => (
            <div key={format.id} className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/70 dark:shadow-none">
              <h3 className="font-semibold text-text">{format.label}</h3>
              <p className="mt-1 text-sm text-text-muted">
                Film {format.filmWidth}×{format.filmHeight}mm · Image {format.imageWidth}×{format.imageHeight}mm
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
