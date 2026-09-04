import { Footer } from '../layout/Footer'
import { CtaBand } from './CtaBand'
import { FeatureHighlights } from './FeatureHighlights'
import { FormatsShowcase } from './FormatsShowcase'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { LandingNav } from './LandingNav'
import { WallShowcase } from './WallShowcase'

export function LandingPage({ onCreateMosaic }: { onCreateMosaic: () => void }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <LandingNav onCreateMosaic={onCreateMosaic} />
      <main>
        <Hero onCreateMosaic={onCreateMosaic} />
        <HowItWorks />
        <FormatsShowcase />
        <FeatureHighlights />
        <WallShowcase />
        <CtaBand onCreateMosaic={onCreateMosaic} />
      </main>
      <Footer />
    </div>
  )
}
