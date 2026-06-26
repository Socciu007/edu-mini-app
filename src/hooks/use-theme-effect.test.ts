import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useThemeEffect } from './use-theme-effect';
import { useThemeStore } from '../stores/theme-store';

function stubMatchMedia(darkPreferred: boolean) {
  const mql = {
    matches: darkPreferred,
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql));
  return mql;
}

describe('useThemeEffect', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ mode: 'system' });
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds dark class to html when mode is dark', () => {
    stubMatchMedia(false);
    useThemeStore.setState({ mode: 'dark' });
    renderHook(() => useThemeEffect());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('does not add dark class when mode is light', () => {
    stubMatchMedia(false);
    useThemeStore.setState({ mode: 'light' });
    renderHook(() => useThemeEffect());
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('adds dark class in system mode when OS prefers dark', () => {
    stubMatchMedia(true);
    useThemeStore.setState({ mode: 'system' });
    renderHook(() => useThemeEffect());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('does not add dark class in system mode when OS prefers light', () => {
    stubMatchMedia(false);
    useThemeStore.setState({ mode: 'system' });
    renderHook(() => useThemeEffect());
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('listens to matchMedia changes when in system mode', () => {
    const mql = stubMatchMedia(false);
    useThemeStore.setState({ mode: 'system' });
    renderHook(() => useThemeEffect());
    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('does not listen to matchMedia changes when mode is explicit', () => {
    const mql = stubMatchMedia(false);
    useThemeStore.setState({ mode: 'dark' });
    renderHook(() => useThemeEffect());
    expect(mql.addEventListener).not.toHaveBeenCalled();
  });
});
