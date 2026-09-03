import { BRAND_DISCLAIMER } from '../../content/disclaimer'

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 px-4 py-4 text-xs leading-relaxed text-stone-500 sm:px-6">
      <p className="mx-auto max-w-3xl">{BRAND_DISCLAIMER}</p>
      <p className="mx-auto mt-2 max-w-3xl">
        Your photo is processed entirely in your browser — nothing is uploaded to a server.
      </p>
    </footer>
  )
}
