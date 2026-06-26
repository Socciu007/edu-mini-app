import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GradientHeader } from './gradient-header';

describe('GradientHeader', () => {
  it('renders title, subtitle, and button', () => {
    render(
      <GradientHeader
        title="Login"
        subtitle="Info"
        buttonText="Go"
        onButtonClick={() => {}}
      />,
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('calls onButtonClick when button is clicked', () => {
    const onButtonClick = vi.fn();
    render(
      <GradientHeader
        title="T"
        subtitle="S"
        buttonText="Go"
        onButtonClick={onButtonClick}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onButtonClick).toHaveBeenCalledTimes(1);
  });
});