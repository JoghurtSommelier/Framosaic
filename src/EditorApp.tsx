import { useState } from 'react'
import { AboutPage } from './components/about/AboutPage'
import { AdjustmentControls } from './components/adjustments/AdjustmentControls'
import { CropTool } from './components/crop/CropTool'
import { ExportPanel } from './components/export/ExportPanel'
import { FormatPicker } from './components/format/FormatPicker'
import { GapControls } from './components/gaps/GapControls'
import { GridControls } from './components/grid/GridControls'
import { HomePrintPanel } from './components/homeprint/HomePrintPanel'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { Section } from './components/layout/Section'
import { MosaicPreview } from './components/preview/MosaicPreview'
import { ProjectIO } from './components/project/ProjectIO'
import { UploadDropzone } from './components/upload/UploadDropzone'

type EditorView = 'editor' | 'about'

export default function EditorApp({ onGoHome }: { onGoHome: () => void }) {
  const [view, setView] = useState<EditorView>('editor')

  if (view === 'about') {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <Header onGoHome={onGoHome} />
        <AboutPage onBack={() => setView('editor')} />
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header onGoHome={onGoHome} onOpenAbout={() => setView('about')} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 p-4 sm:p-6">
        <Section title="1. Upload a photo">
          <UploadDropzone />
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Section title="2. Format & grid">
              <div className="space-y-4">
                <FormatPicker />
                <div className="border-t border-border pt-3">
                  <GridControls />
                </div>
              </div>
            </Section>
            <Section title="4. Gaps & spacing">
              <GapControls />
            </Section>
            <Section title="5. Adjustments">
              <AdjustmentControls />
            </Section>
          </div>
          <Section title="3. Crop">
            <CropTool />
          </Section>
        </div>

        <Section title="6. Mosaic preview">
          <MosaicPreview />
        </Section>

        <Section title="7. Export">
          <div className="space-y-4">
            <ExportPanel />
            <div className="border-t border-border pt-4">
              <HomePrintPanel />
            </div>
          </div>
        </Section>

        <Section title="Project file">
          <ProjectIO />
        </Section>
      </main>
      <Footer />
    </div>
  )
}
