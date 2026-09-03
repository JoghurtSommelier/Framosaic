/** Procedurally-generated placeholder art for the landing page banner — see scripts/generate-banner-tiles.mjs. */
export const BANNER_TILE_URLS = Array.from(
  { length: 10 },
  (_, i) => `${import.meta.env.BASE_URL}samples/tile-${i + 1}.png`,
)
