import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SelectField } from './select-field'

describe('SelectField', () => {
  const stringOptions = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
  ]

  const numberOptions = [
    { value: 10, label: 'Ten' },
    { value: 11, label: 'Eleven' },
  ]

  it('renders label and trigger; options are hidden until opened', () => {
    render(<SelectField label="Pick" value="" options={stringOptions} onChange={() => {}} />)
    expect(screen.getByText('Pick')).toBeInTheDocument()
    // Trigger is a button; options exist in DOM but are not visible until popover opens.
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'A' })).not.toBeInTheDocument()
  })

  it('calls onChange with string value when an option is selected', () => {
    const onChange = vi.fn()
    render(<SelectField label="Pick" value="" options={stringOptions} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('option', { name: 'B' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('passes numeric value through (no string coercion) when V is number', () => {
    const onChange = vi.fn()
    render(<SelectField<number> label="Grade" value={10} options={numberOptions} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('option', { name: 'Eleven' }))
    expect(onChange).toHaveBeenCalledWith(11)
  })

  it('shows error text when provided', () => {
    render(<SelectField label="Pick" value="" options={stringOptions} onChange={() => {}} error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })
})
