import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageHeader } from './page-header';

function renderAt(path: string, props: React.ComponentProps<typeof PageHeader>) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PageHeader {...props} />
    </MemoryRouter>,
  );
}

describe('PageHeader', () => {
  it('renders the title', () => {
    renderAt('/', { title: 'My Title' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Title');
  });

  it('shows back button by default and calls nav(-1) when clicked', () => {
    const { container } = renderAt('/', { title: 'Chat' });
    const btn = screen.getByLabelText('Back');
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  it('hides back button when onBack is omitted', () => {
    renderAt('/', { title: 'NoBack' });
    expect(screen.queryByLabelText('Back')).not.toBeInTheDocument();
  });

  it('calls custom onBack when provided', () => {
    const onBack = vi.fn();
    renderAt('/', { title: 'X', onBack });
    fireEvent.click(screen.getByLabelText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders the right slot', () => {
    renderAt('/', { title: 'Chat', right: <button>New</button> });
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });
});