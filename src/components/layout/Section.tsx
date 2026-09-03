import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-sm shadow-black/[0.03] ring-1 ring-border/70 dark:shadow-none">
      <h2 className="mb-4 text-sm font-semibold tracking-tight text-text">{title}</h2>
      {children}
    </section>
  )
}
