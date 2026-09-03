import { AdjustmentControls } from './components/adjustments/AdjustmentControls'
import { CropTool } from './components/crop/CropTool'
import { ExportPanel } from './components/export/ExportPanel'
import { FormatPicker } from './components/format/FormatPicker'
import { GapControls } from './components/gaps/GapControls'
import { GridControls } from './components/grid/GridControls'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { Section } from './components/layout/Section'
import { MosaicPreview } from './components/preview/MosaicPreview'
import { UploadDropzone } from './components/upload/UploadDropzone'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-100">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 p-4 sm:p-6">
        <Section title="1. Upload a photo">
          <UploadDropzone />
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Section title="2. Format & grid">
              <div className="space-y-4">
                <FormatPicker />
                <div className="border-t border-stone-200 pt-3">
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
          <ExportPanel />
        </Section>
      </main>
      <Footer />
    </div>
  )
}

export default App
