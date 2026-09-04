export interface AppConfig {
  githubUrl: string
  donationEnabled: boolean
  donationUrl?: string
  analyticsId?: string
}

// Non-secret defaults — see .env.example. Every VITE_* var here is compiled
// straight into the public bundle; nothing sensitive belongs behind it.
export const appConfig: AppConfig = {
  githubUrl: import.meta.env.VITE_GITHUB_URL || 'https://github.com/JoghurtSommelier/Framosaic',
  donationEnabled: (import.meta.env.VITE_DONATION_ENABLED ?? 'true') !== 'false',
  donationUrl: import.meta.env.VITE_DONATION_URL || 'https://buymeacoffee.com/joghurt',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || undefined,
}
