import { BANNER_TILE_URLS } from '../data/bannerTiles'

export interface ShowcaseConfig {
  bannerTiles: string[]
  wallSource: string
  wallFocus: string
}

const DEFAULT_WALL_SOURCE = `${import.meta.env.BASE_URL}showcase/wall/wall-source.png`
const DEFAULT_WALL_FOCUS = 'center'

export const DEFAULT_SHOWCASE: ShowcaseConfig = {
  bannerTiles: BANNER_TILE_URLS,
  wallSource: DEFAULT_WALL_SOURCE,
  wallFocus: DEFAULT_WALL_FOCUS,
}

interface ShowcaseManifest {
  banner?: string[]
  wallSource?: string
  wallFocus?: string
}

/**
 * Reads the operator-configurable showcase source, if set — spec §5.6/§6:
 * `VITE_SHOWCASE_BANNER` (comma-separated paths, checked at build time, no
 * fetch needed) takes priority over `/showcase/showcase.json` (checked at
 * runtime by useShowcaseConfig, for operators who'd rather drop in a file
 * than rebuild). Neither set → the bundled fallback art above.
 */
export function getEnvShowcaseConfig(): ShowcaseConfig | null {
  const envBanner = import.meta.env.VITE_SHOWCASE_BANNER
  if (!envBanner) return null
  const bannerTiles = envBanner
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (bannerTiles.length === 0) return null
  return {
    bannerTiles,
    wallSource: import.meta.env.VITE_SHOWCASE_WALL_SOURCE || DEFAULT_WALL_SOURCE,
    wallFocus: import.meta.env.VITE_SHOWCASE_WALL_FOCUS || DEFAULT_WALL_FOCUS,
  }
}

/**
 * Converts a fetched showcase.json manifest into a config, resolving its
 * paths against /showcase/. Fields are independent — a manifest overriding
 * only `wallSource`, say, still applies that override and falls back to the
 * bundled defaults for `banner`, rather than being discarded entirely.
 */
export function manifestToConfig(manifest: unknown): ShowcaseConfig | null {
  if (!manifest || typeof manifest !== 'object') return null
  const m = manifest as ShowcaseManifest
  const base = `${import.meta.env.BASE_URL}showcase/`

  const hasBanner = Array.isArray(m.banner) && m.banner.length > 0
  const hasWallSource = typeof m.wallSource === 'string'
  const hasWallFocus = typeof m.wallFocus === 'string'
  if (!hasBanner && !hasWallSource && !hasWallFocus) return null

  return {
    bannerTiles: hasBanner
      ? m.banner!.filter((p): p is string => typeof p === 'string').map((p) => `${base}${p}`)
      : DEFAULT_SHOWCASE.bannerTiles,
    wallSource: hasWallSource ? `${base}${m.wallSource}` : DEFAULT_WALL_SOURCE,
    wallFocus: hasWallFocus ? m.wallFocus! : DEFAULT_WALL_FOCUS,
  }
}
