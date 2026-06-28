import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectField } from './select-field';

describe('SelectField', () => {
  const stringOptions = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
  ];

  const numberOptions = [
    { value: 10, label: 'Ten' },
    { value: 11, label: 'Eleven' },
  ];

  it('renders label and options', () => {
    render(<SelectField label="Pick" value="" options={stringOptions} onChange={() => {}} />);
    expect(screen.getByText('Pick')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'B' })).toBeInTheDocument();
  });

  it('calls onChange with string value when V is string', () => {
    const onChange = vi.fn();
    render(<SelectField label="Pick" value="" options={stringOptions} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('coerces numeric value back to number when V is number', () => {
    const onChange = vi.fn();
    render(<SelectField<number> label="Grade" value={10} options={numberOptions} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '11' } });
    expect(onChange).toHaveBeenCalledWith(11);
  });

  it('shows error text when provided', () => {
    render(<SelectField label="Pick" value="" options={stringOptions} onChange={() => {}} error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
