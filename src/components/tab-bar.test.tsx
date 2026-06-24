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

  it('renders all 4 tab labels in Vietnamese by default', () => {
    renderAt('/');
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Khảo sát')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Cá nhân')).toBeInTheDocument();
  });

  it('renders English labels when language is en', () => {
    useSettingsStore.setState({ language: 'en' });
    renderAt('/');
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Survey')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('marks the matching tab as active via aria-current', () => {
    renderAt('/survey');
    const surveyLink = screen.getByText('Khảo sát').closest('a');
    expect(surveyLink?.getAttribute('aria-current')).toBe('page');
  });

  it('root tab is only active when on /', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <TabBar />
      </MemoryRouter>,
    );
    let chatLink = screen.getByText('Chat').closest('a');
    expect(chatLink?.getAttribute('aria-current')).toBe('page');
    unmount();

    render(
      <MemoryRouter initialEntries={['/survey']}>
        <TabBar />
      </MemoryRouter>,
    );
    chatLink = screen.getByText('Chat').closest('a');
    expect(chatLink?.getAttribute('aria-current')).toBeNull();
  });
});
