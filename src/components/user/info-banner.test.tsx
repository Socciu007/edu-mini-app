import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoBanner } from './info-banner';

const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="mock-icon" {...props} />
);

describe('InfoBanner', () => {
  it('renders title, subtitle, and cta', () => {
    render(
      <InfoBanner
        title="Title"
        subtitle="Sub"
        cta="Go"
        Icon={MockIcon as any}
        onCtaClick={() => {}}
      />,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('calls onCtaClick when CTA is clicked', () => {
    const onCtaClick = vi.fn();
    render(
      <InfoBanner
        title="T"
        subtitle="S"
        cta="Click"
        Icon={MockIcon as any}
        onCtaClick={onCtaClick}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Click' }));
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });
});