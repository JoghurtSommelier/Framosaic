# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [Unreleased]

## [1.2.0] - 2026-09-04

### Added

- A mandatory dimensioned technical drawing in the gluing-template PDF
  (spec §4): a full-mosaic overview page with outer total-size dimension
  lines, plus a corner-detail page showing film/image-area dimension
  chains, gap dimensions, and border widths — all rendered as vector
  CAD-style dimension lines with arrowheads and labels via `pdf-lib`.
- A shared `SiteNav` component so the editor and landing page use
  identical chrome (spec §5.4) — same sticky/frosted navbar, wordmark,
  GitHub link, and theme toggle, with the editor contextually extending
  it (Undo/Redo, About, Calibration). A `framer-motion` crossfade now
  transitions between landing and editor.
- Operator-configurable showcase art (spec §5.6/§6): a single "See it on
  the wall" image (auto-cropped via `object-fit: cover` with an optional
  focus point) replaces the tile-grid preview section. Both the wall
  image and the hero banner tiles are swappable without a rebuild via
  `VITE_SHOWCASE_*` env vars or a `public/showcase/showcase.json`
  manifest, falling back to bundled placeholder art.
- Search engine optimizations: a descriptive `<title>`, canonical link,
  theme-color, Open Graph/Twitter Card meta backed by a generated
  1200×630 social card image, `WebApplication` JSON-LD structured data,
  `robots.txt`, and `sitemap.xml`.
- Optional, consent-gated Google Analytics (GA4) via
  `VITE_GA_MEASUREMENT_ID` — off by default until the visitor accepts a
  consent banner (togglable later from the About page), since GA is
  cookie-based unlike the app's existing cookie-free `analyticsId` slot.
  The CSP now allows `googletagmanager.com`/`google-analytics.com`, and
  the About page's privacy copy describes both analytics paths
  accurately instead of a blanket "cookie-free" claim.

- A footer disclaimer noting the app was built with Claude Code.

### Changed

- Donation link now points to Buy Me a Coffee instead of PayPal.

## [1.1.0] - 2026-09-03

### Added

- An Apple-inspired design system (spec §5.5): token-based light/dark
  theming (system-aware, with a manual toggle) via Tailwind v4 + CSS
  custom properties, a frosted-glass sticky header, restyled shared
  chrome and form controls, and `lucide-react` icons throughout.
- A marketing landing page (spec §5.6) as the app's entry point: sticky
  frosted nav, a hero with an endlessly-looping, dual-direction
  scrolling mosaic banner (transform/opacity-only, pauses on hover,
  swaps to a static grid under `prefers-reduced-motion`), how-it-works,
  format cards, feature highlights, a preview gallery, and a CTA band.
  The editor now loads on demand (code-split) so a landing-page-only
  visit doesn't pay for it.
- `framer-motion` for restrained, reduced-motion-aware scroll reveals.

## [1.0.0] - 2026-09-03

### Added

- Project scaffold: Vite + React + TypeScript + Tailwind v4, oxlint,
  Vitest + Testing Library, Playwright + axe, CI (lint/typecheck/test/
  build/e2e/gitleaks + a GitHub Pages deploy job), Dependabot, issue/PR
  templates, MIT license, `SECURITY.md`.
- Mosaic engine: mosaic/packed dimensions and crop aspect for both mapping
  modes (spatial vs. seamless), per-tile physical layout and source-sampling
  rects, mm↔px conversion, per-tile export sizing (image-area or full-frame,
  with optional bleed), and the resolution-warning traffic light — all pure,
  unit-tested functions. Five instant-film presets plus a validated custom
  format.
- Core editor UI: drag/drop/paste upload with EXIF-orientation correction
  and a downscaled preview; format picker; grid controls with manual entry
  and a target-width auto-suggest, plus quick presets; an aspect-locked crop
  tool; gap/margin controls with mm/cm/inch switching; non-destructive
  brightness/contrast/saturation/grayscale adjustments.
- Mosaic preview: framed/frameless canvas rendering with a wall background,
  tile numbering, grid lines, zoom, and a per-tile inspector showing real
  effective-DPI resolution warnings.
- Export pipeline: an OffscreenCanvas + Web Worker renderer (main-thread
  fallback) producing a ZIP of correctly-named tile images, plus a
  pdf-lib gluing-template PDF (numbered overview + legend, optional 1:1
  print-at-home pages with crop marks and a scale bar, optional
  back-label sheet). A post-export donation prompt, config-gated and
  throttled.
- Should-haves: a home-print mode (full-frame tiles at true size on
  A4/Letter with crop marks, for printing on regular paper instead of
  instant film), undo/redo with keyboard shortcuts, project save/load as
  zod-validated `.json`, and a calibration test page.
- Hardening: format-validity export guards, gap/margin plausibility
  limits, a `Content-Security-Policy` (meta tag + `netlify.toml`/
  `vercel.json` for hosts that support full response headers), an About
  page with the brand disclaimer, and an accessibility pass verified with
  `@axe-core/playwright` (zero serious/critical violations on the editor,
  About, and Calibration pages).

[Unreleased]: https://github.com/JoghurtSommelier/Framosaic/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/JoghurtSommelier/Framosaic/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/JoghurtSommelier/Framosaic/releases/tag/v1.0.0
