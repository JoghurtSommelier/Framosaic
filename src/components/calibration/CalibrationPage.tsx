export function CalibrationPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold text-stone-900">Calibration test page</h1>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md bg-stone-100 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-200"
        >
          ← Back to editor
        </button>
      </div>

      <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4 print:hidden">
        <p className="text-sm text-stone-700">
          Instant-film dimensions in this app are industry-common approximations, and every printer/browser
          combination can introduce its own small scaling error. Use this page to check yours:
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-stone-700">
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
          className="rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
        >
          Print this page
        </button>
      </div>

      <div className="flex flex-col items-center gap-8 rounded-lg border border-stone-200 bg-white p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-[50mm] w-[50mm] border-2 border-stone-900" />
          <p className="text-xs text-stone-500">This square should measure 50 × 50 mm</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="h-[2mm] w-[50mm] bg-stone-900" />
          <p className="text-xs text-stone-500">This bar should measure 50 mm</p>
        </div>
      </div>
    </div>
  )
}
