import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { FORMAT_PRESETS } from '../../../data/formats'
import { useProjectStore } from '../../../store/projectStore'
import { FormatPicker } from '../FormatPicker'

beforeEach(() => {
  useProjectStore.setState({ format: FORMAT_PRESETS[0] })
})

describe('FormatPicker', () => {
  it('lists every preset plus Custom', () => {
    render(<FormatPicker />)
    const select = screen.getByLabelText(/instant film format/i) as HTMLSelectElement
    const optionLabels = Array.from(select.options).map((o) => o.value)
    for (const preset of FORMAT_PRESETS) {
      expect(optionLabels).toContain(preset.id)
    }
    expect(optionLabels).toContain('custom')
  })

  it('switches the store format when a preset is selected', async () => {
    const user = userEvent.setup()
    render(<FormatPicker />)
    const select = screen.getByLabelText(/instant film format/i)
    await user.selectOptions(select, 'instax-square')
    expect(useProjectStore.getState().format.id).toBe('instax-square')
  })

  it('shows custom fields and a validation error for an inconsistent custom format', async () => {
    const user = userEvent.setup()
    render(<FormatPicker />)
    const select = screen.getByLabelText(/instant film format/i)
    await user.selectOptions(select, 'custom')

    const imageWidthInput = screen.getByLabelText(/image width/i);
    await user.clear(imageWidthInput)
    await user.type(imageWidthInput, '999')

    expect(await screen.findByRole('alert')).toHaveTextContent(/width/i)
  })
})
