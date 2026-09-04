import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { lazy, Suspense, useState } from 'react'
import { LandingPage } from './components/landing/LandingPage'
import { DURATION } from './lib/motion'

// Lazy so a landing-page-only visit never pays for react-easy-crop, pdf/zip
// export code, and the rest of the editor (spec §5.6's fast-LCP goal).
const EditorApp = lazy(() => import('./EditorApp'))

function App() {
  const [showEditor, setShowEditor] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // A consistent, dezent crossfade between landing and editor (spec §5.4) —
  // skipped entirely (snaps to the end state) under prefers-reduced-motion.
  const transition = prefersReducedMotion ? { duration: 0 } : { duration: DURATION.base }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!showEditor ? (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition}>
          <LandingPage onCreateMosaic={() => setShowEditor(true)} />
        </motion.div>
      ) : (
        <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition}>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-bg">
                <p className="text-sm text-text-muted">Loading…</p>
              </div>
            }
          >
            <EditorApp onGoHome={() => setShowEditor(false)} />
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
