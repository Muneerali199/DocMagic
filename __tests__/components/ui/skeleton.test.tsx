import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  DocumentCardSkeleton,
  Skeleton,
} from '@/components/ui/skeleton';

describe('Skeleton', () => {
  it('renders a placeholder element', () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton.tagName).toBe('DIV');
    expect(skeleton.className).toContain('animate-pulse');
    expect(skeleton.className).toContain('bg-muted');
  });

  it('forwards aria attributes for screen readers', () => {
    render(
      <Skeleton
        aria-hidden="true"
        aria-label="Loading content"
        data-testid="skeleton"
      />
    );

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });

  it('merges custom class names', () => {
    render(<Skeleton className="h-8 w-24" data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-8');
    expect(skeleton).toHaveClass('w-24');
  });
});

describe('DocumentCardSkeleton', () => {
  it('renders multiple skeleton placeholders', () => {
    const { container } = render(<DocumentCardSkeleton />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });
});
