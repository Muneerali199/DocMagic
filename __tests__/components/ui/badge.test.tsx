import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders badge text', () => {
    render(<Badge>New</Badge>);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Badge data-testid="badge">Default</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge.className).toContain('bg-primary');
  });

  it('applies secondary variant classes', () => {
    render(
      <Badge variant="secondary" data-testid="badge">
        Secondary
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge.className).toContain('bg-secondary');
  });

  it('forwards aria attributes for accessibility', () => {
    render(
      <Badge aria-label="Status: active" role="status">
        Active
      </Badge>
    );

    const badge = screen.getByRole('status', { name: 'Status: active' });
    expect(badge).toBeInTheDocument();
  });

  it('merges custom class names', () => {
    render(
      <Badge className="custom-badge" data-testid="badge">
        Custom
      </Badge>
    );

    expect(screen.getByTestId('badge')).toHaveClass('custom-badge');
  });
});
