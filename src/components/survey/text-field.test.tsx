import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { TextField } from './text-field'

describe('TextField', () => {
  it('renders label and controlled value', () => {
    render(<TextField label="Lesson" value="Hello" onChange={() => {}} />)
    expect(screen.getByText('Lesson')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument()
  })

  it('calls onChange with new value', () => {
    const onChange = vi.fn()
    render(<TextField label="Lesson" value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New' } })
    expect(onChange).toHaveBeenCalledWith('New')
  })

  it('shows error text when provided', () => {
    render(<TextField label="Lesson" value="" onChange={() => {}} error="Too short" />)
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })
})
