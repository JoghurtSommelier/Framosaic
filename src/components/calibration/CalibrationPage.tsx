import { ArrowLeft, Printer } from 'lucide-react'

export function CalibrationPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold text-text">Calibration test page</h1>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full bg-border/40 px-3 py-1.5 text-sm text-text transition-colors hover:bg-border/60"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to editor
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-surface p-5 print:hidden">
        <p className="text-sm text-text">
          Instant-film dimensions in this app are industry-common approximations, and every printer/browser
          combination can introduce its own small scaling error. Use this page to check yours:
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-text">
          <li>
            Print this page — make sure your print dialog is set to <strong>100% / actual size</strong> (not "fit
            to page" or "shrink to fit").
          </li>
          <li>Measure the square and the bar below with a ruler.</li>
          <li>
            If they don't measure exactly 50mm, your printer is scaling slightly. Divide 50 by your measured value
            to get a correction factor, and apply it to any Custom format dimensions you use.
          </li>
        </ol>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print this page
        </button>
      </div>

      <div className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-surface p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-[50mm] w-[50mm] border-2 border-text" />
          <p className="text-xs text-text-muted">This square should measure 50 × 50 mm</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="h-[2mm] w-[50mm] bg-text" />
          <p className="text-xs text-text-muted">This bar should measure 50 mm</p>
        </div>
      </div>
    </div>
  )
}
