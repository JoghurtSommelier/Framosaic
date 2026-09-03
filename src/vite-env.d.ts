/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_URL?: string
  readonly VITE_DONATION_ENABLED?: string
  readonly VITE_DONATION_URL?: string
  readonly VITE_ANALYTICS_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
