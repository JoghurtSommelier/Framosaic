import { Eye, FileImage, Ruler, SlidersHorizontal } from 'lucide-react'

const FEATURES = [
  {
    icon: Eye,
    title: 'Live preview',
    body: 'See the finished mosaic — with realistic frames, wall background, and tile numbers — update as you work.',
  },
  {
    icon: FileImage,
    title: 'Gluing template',
    body: 'A numbered PDF overview (plus an optional 1:1 alignment template) shows exactly where each print goes.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Custom spacing',
    body: 'Dial in gaps and outer margins in mm, cm, or inches — the crop updates live to match.',
  },
  {
    icon: Ruler,
    title: 'Resolution check',
    body: 'A traffic-light warning flags tiles that would print too soft, before you export.',
  },
]

export function FeatureHighlights() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-3xl font-semibold tracking-tight text-text">Built for getting it right</h2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex gap-4 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border/70 dark:shadow-none">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
              <feature.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-semibold text-text">{feature.title}</h3>
              <p className="mt-1 text-sm text-text-muted">{feature.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
