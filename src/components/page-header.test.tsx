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

  it('shows back button when onBack is provided and clicking it calls onBack', () => {
    const onBack = vi.fn();
    renderAt('/', { title: 'Chat', onBack });
    const btn = screen.getByLabelText('Back');
    fireEvent.click(btn);
    expect(onBack).toHaveBeenCalledTimes(1);
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
