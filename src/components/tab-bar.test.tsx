import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TabBar } from './tab-bar';
import { useSettingsStore } from '../stores/settings-store';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <TabBar />
    </MemoryRouter>,
  );
}

describe('TabBar', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi' });
  });

  it('hides the active tab label and shows the others', () => {
    // On `/`, the Chat tab is active — its label should be hidden
    renderAt('/');
    expect(screen.queryByText('Chat')).not.toBeInTheDocument();
    expect(screen.getByText('Khảo sát')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Cá nhân')).toBeInTheDocument();
  });

  it('renders English labels on inactive tabs', () => {
    useSettingsStore.setState({ language: 'en' });
    renderAt('/'); // Chat tab active — hidden
    expect(screen.queryByText('Chat')).not.toBeInTheDocument();
    expect(screen.getByText('Survey')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('marks the matching tab as active via aria-current', () => {
    renderAt('/survey');
    // Khảo sát label is hidden because survey tab is active — check via emoji link instead
    const links = screen.getAllByRole('link');
    const surveyLink = links.find((a) => a.getAttribute('href') === '/survey');
    expect(surveyLink?.getAttribute('aria-current')).toBe('page');
    // And the inactive Chat tab label IS shown
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('root tab is only active when on /', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <TabBar />
      </MemoryRouter>,
    );
    let links = screen.getAllByRole('link');
    let chatLink = links.find((a) => a.getAttribute('href') === '/');
    expect(chatLink?.getAttribute('aria-current')).toBe('page');
    unmount();

    render(
      <MemoryRouter initialEntries={['/survey']}>
        <TabBar />
      </MemoryRouter>,
    );
    links = screen.getAllByRole('link');
    chatLink = links.find((a) => a.getAttribute('href') === '/');
    expect(chatLink?.getAttribute('aria-current')).toBeNull();
  });
});