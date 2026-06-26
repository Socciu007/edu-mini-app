import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore, type ThemeMode } from './theme-store';

describe('theme-store', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ mode: 'system' });
  });

  it('defaults to system mode', () => {
    expect(useThemeStore.getState().mode).toBe('system');
  });

  it('setMode updates the mode', () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('setMode can set light', () => {
    useThemeStore.getState().setMode('light');
    expect(useThemeStore.getState().mode).toBe('light');
  });

  it('persists mode to localStorage', () => {
    useThemeStore.getState().setMode('dark');
    const raw = localStorage.getItem('edu-theme-v1');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.mode).toBe('dark');
  });

  it('accepts all valid modes', () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    modes.forEach((m) => {
      useThemeStore.getState().setMode(m);
      expect(useThemeStore.getState().mode).toBe(m);
    });
  });
});
