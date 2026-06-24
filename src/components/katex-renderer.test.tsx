import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import katex from 'katex';
import { KatexRenderer } from './katex-renderer';

describe('KatexRenderer', () => {
  it('renders plain text', () => {
    render(<KatexRenderer>{'Hello world'}</KatexRenderer>);
    expect(screen.getByText(/Hello world/)).toBeInTheDocument();
  });

  it('renders inline math', () => {
    const { container } = render(<KatexRenderer>{'Solve $2 + 2$'}</KatexRenderer>);
    expect(container.querySelector('.katex')).not.toBeNull();
  });

  it('renders block math', () => {
    const { container } = render(<KatexRenderer>{'$$x = 2$$'}</KatexRenderer>);
    expect(container.querySelector('.katex-display')).not.toBeNull();
  });

  it('falls back gracefully on bad LaTeX', () => {
    // Force a render error by stubbing katex.renderToString to throw
    const katexSpy = vi.spyOn(katex, 'renderToString').mockImplementation(() => { throw new Error('boom'); });
    const { container } = render(<KatexRenderer>{'$x$'}</KatexRenderer>);
    expect(container.textContent).toContain('x');
    katexSpy.mockRestore();
  });
});
