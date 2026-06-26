import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  it('renders a circular placeholder', () => {
    const { container } = render(<UserAvatar />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('rounded-full');
    expect(div.className).toContain('bg-white/30');
  });
});