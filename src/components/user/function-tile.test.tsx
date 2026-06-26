import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FunctionTile } from './function-tile';

const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="mock-icon" {...props} />
);

describe('FunctionTile', () => {
  it('renders label', () => {
    render(<FunctionTile label="Settings" Icon={MockIcon as any} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<FunctionTile label="X" Icon={MockIcon as any} onClick={onClick} />);
    fireEvent.click(screen.getByText('X').closest('button')!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});