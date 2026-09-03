import { BANNER_TILE_URLS } from '../../data/bannerTiles'

const ROTATIONS = [-2, 1.5, -1, 2, -2.5, 1, -1.5, 2.5, -1]

export function PreviewGallery() {
  const tiles = BANNER_TILE_URLS.slice(0, 9)
  return (
    <section id="preview" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-3xl font-semibold tracking-tight text-text">See it on the wall</h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-sm text-text-muted">
        A 3×3 mosaic, framed and ready to hang — the same live preview you'll see while you work.
      </p>
      <div className="mt-10 flex justify-center rounded-2xl bg-black/[0.03] p-10 dark:bg-white/[0.04]">
        <div className="grid grid-cols-3 gap-3">
          {tiles.map((src, i) => (
            <div
              key={src}
              className="flex h-28 w-24 flex-col rounded-md bg-white p-1.5 pb-3 shadow-md shadow-black/20 sm:h-36 sm:w-32"
              style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
            >
              <img src={src} alt="" className="h-full w-full rounded-sm object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
