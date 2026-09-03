import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_GAPS } from '../../../types/project'
import { useProjectStore } from '../../../store/projectStore'
import { GapControls } from '../GapControls'

beforeEach(() => {
  useProjectStore.setState({ gaps: DEFAULT_GAPS, units: 'mm' })
})

describe('GapControls', () => {
  it('shows gap values in mm by default', () => {
    render(<GapControls />)
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    expect(Number(inputs[0].value)).toBeCloseTo(DEFAULT_GAPS.x, 5)
  })

  it('converts the displayed value when switching units to cm', async () => {
    const user = userEvent.setup()
    render(<GapControls />)
    await user.click(screen.getByRole('button', { name: 'cm' }))

    expect(useProjectStore.getState().units).toBe('cm')
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[]
    expect(Number(inputs[0].value)).toBeCloseTo(DEFAULT_GAPS.x / 10, 5)
  })

  it('writes back to the store in mm when a value is entered in cm', async () => {
    const user = userEvent.setup()
    render(<GapControls />)
    await user.click(screen.getByRole('button', { name: 'cm' }))

    const gapXInput = screen.getAllByRole('spinbutton')[0]
    await user.clear(gapXInput)
    await user.type(gapXInput, '2')

    expect(useProjectStore.getState().gaps.x).toBeCloseTo(20, 5)
  })
})
