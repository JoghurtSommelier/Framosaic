import { motion, useReducedMotion } from 'framer-motion'
import { Grid3x3, Printer, UploadCloud } from 'lucide-react'
import { DURATION, EASE_OUT_SOFT, fadeInUp } from '../../lib/motion'

const STEPS = [
  { icon: UploadCloud, title: 'Upload', body: 'Drop in a photo — it never leaves your browser.' },
  {
    icon: Grid3x3,
    title: 'Split & arrange',
    body: 'Pick a format and grid; crop, adjust, and preview live with realistic frames.',
  },
  {
    icon: Printer,
    title: 'Print & mount',
    body: 'Export print-ready tiles plus a gluing template that shows exactly where each one goes.',
  },
]

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-3xl font-semibold tracking-tight text-text">How it works</h2>
      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={prefersReducedMotion ? undefined : 'hidden'}
            whileInView={prefersReducedMotion ? undefined : 'visible'}
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeInUp}
            transition={{ duration: DURATION.slow, delay: i * 0.1, ease: EASE_OUT_SOFT }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
              <step.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="text-lg font-semibold text-text">{step.title}</h3>
            <p className="text-sm text-text-muted">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
