import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../config/appConfig', () => ({
  appConfig: { gaMeasurementId: 'G-TEST123' },
}))

import { ConsentBanner } from '../ConsentBanner'

describe('ConsentBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    document.querySelectorAll('script[data-ga-loader]').forEach((el) => el.remove())
  })

  it('shows the banner when GA is configured and no consent decision exists yet', () => {
    render(<ConsentBanner />)
    expect(screen.getByRole('dialog', { name: /analytics consent/i })).toBeInTheDocument()
  })

  it('hides the banner and stores the decision once Accept is clicked', async () => {
    const user = userEvent.setup()
    render(<ConsentBanner />)
    const dialog = screen.getByRole('dialog', { name: /analytics consent/i })
    await user.click(screen.getByRole('button', { name: /accept/i }))
    await waitForElementToBeRemoved(dialog)
    expect(localStorage.getItem('framosaic-analytics-consent')).toBe('granted')
  })

  it('hides the banner and stores the decision once Decline is clicked', async () => {
    const user = userEvent.setup()
    render(<ConsentBanner />)
    const dialog = screen.getByRole('dialog', { name: /analytics consent/i })
    await user.click(screen.getByRole('button', { name: /decline/i }))
    await waitForElementToBeRemoved(dialog)
    expect(localStorage.getItem('framosaic-analytics-consent')).toBe('denied')
  })

  it('does not render once a stored decision already exists', () => {
    localStorage.setItem('framosaic-analytics-consent', 'granted')
    render(<ConsentBanner />)
    expect(screen.queryByRole('dialog', { name: /analytics consent/i })).not.toBeInTheDocument()
  })
})
