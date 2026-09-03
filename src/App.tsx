import { lazy, Suspense, useState } from 'react'
import { LandingPage } from './components/landing/LandingPage'

// Lazy so a landing-page-only visit never pays for react-easy-crop, pdf/zip
// export code, and the rest of the editor (spec §5.6's fast-LCP goal).
const EditorApp = lazy(() => import('./EditorApp'))

function App() {
  const [showEditor, setShowEditor] = useState(false)

  if (!showEditor) {
    return <LandingPage onCreateMosaic={() => setShowEditor(true)} />
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg">
          <p className="text-sm text-text-muted">Loading…</p>
        </div>
      }
    >
      <EditorApp onGoHome={() => setShowEditor(false)} />
    </Suspense>
  )
}

export default App
