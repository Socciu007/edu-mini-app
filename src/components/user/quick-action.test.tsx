import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QuickAction } from './quick-action';

const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="mock-icon" {...props} />
);

describe('QuickAction', () => {
  it('renders label', () => {
    render(
      <MemoryRouter>
        <QuickAction label="Test" to="/test" Icon={MockIcon as any} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('navigates to the given route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickAction label="Go" to="/target" Icon={MockIcon as any} />
      </MemoryRouter>,
    );
    const link = screen.getByText('Go').closest('a');
    expect(link).toHaveAttribute('href', '/target');
  });
});