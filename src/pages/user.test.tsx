import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserPage from './user';
import { useSettingsStore } from '../stores/settings-store';

describe('UserPage', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi', preferredProvider: 'auto' });
  });

  it('renders the user title in Vietnamese by default', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cá nhân');
  });

  it('renders the user title in English when language is en', () => {
    useSettingsStore.setState({ language: 'en' });
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Profile');
  });

  it('shows the AI not configured warning when VITE_AI_API_KEY is empty', () => {
    // @ts-ignore
    import.meta.env.VITE_AI_API_KEY = '';
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText(/Chưa cấu hình/)).toBeInTheDocument();
  });

    it('renders the theme section with 3 buttons', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    expect(screen.getByText('Giao diện')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sáng' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tối' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hệ thống' })).toBeInTheDocument();
  });

  it('shows the system button as active by default', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    const systemBtn = screen.getByRole('button', { name: 'Hệ thống' });
    expect(systemBtn.className).toContain('bg-primary');
  });

  it('clicking the dark button changes the active state', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    const darkBtn = screen.getByRole('button', { name: 'Tối' });
    fireEvent.click(darkBtn);
    expect(darkBtn.className).toContain('bg-primary');
  });

  it('clicking the light button makes it active', () => {
    render(<MemoryRouter><UserPage /></MemoryRouter>);
    const lightBtn = screen.getByRole('button', { name: 'Sáng' });
    fireEvent.click(lightBtn);
    expect(lightBtn.className).toContain('bg-primary');
  });
});
