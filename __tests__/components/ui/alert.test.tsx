import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

describe('Alert', () => {
  it('renders with alert role and content', () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>You can add components to your app.</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('You can add components to your app.')).toBeInTheDocument();
  });

  it('applies destructive variant classes', () => {
    render(
      <Alert variant="destructive" data-testid="destructive-alert">
        <AlertTitle>Error</AlertTitle>
      </Alert>
    );

    const alert = screen.getByTestId('destructive-alert');
    expect(alert.className).toContain('text-destructive');
  });

  it('forwards custom aria attributes', () => {
    render(
      <Alert aria-live="polite" aria-atomic="true">
        <AlertDescription>Sync complete.</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('merges custom class names', () => {
    render(
      <Alert className="custom-alert">
        <AlertDescription>Notice</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole('alert')).toHaveClass('custom-alert');
  });
});
