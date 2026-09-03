import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-stone-900">{title}</h2>
      {children}
    </section>
  )
}
