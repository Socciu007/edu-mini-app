import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTranslation } from './use-translation';
import { useSettingsStore } from '../stores/settings-store';

describe('useTranslation', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'vi' });
  });

  it('returns Vietnamese strings by default', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('home.title')).toBe('Trợ lý học tập');
  });

  it('returns English strings when language is en', () => {
    useSettingsStore.setState({ language: 'en' });
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('home.title')).toBe('Study Assistant');
  });

  it('falls back to other language when key missing', () => {
    useSettingsStore.setState({ language: 'en' });
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('nope.nada')).toBe('nope.nada');
  });

  it('interpolates {{var}} placeholders', () => {
    useSettingsStore.setState({ language: 'en' });
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('feedback.incorrect', { answer: 'x = 4' })).toBe('Not quite. Answer: x = 4');
  });

  it('tValue returns arrays for array keys', () => {
    const { result } = renderHook(() => useTranslation());
    expect(Array.isArray(result.current.tValue('chat.starterPrompts'))).toBe(true);
  });
});
