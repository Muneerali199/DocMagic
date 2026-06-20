import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

describe('Tabs', () => {
  it('renders tab triggers and shows the default tab panel', () => {
    render(
      <Tabs defaultValue="account">
        <TabsList aria-label="Account settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings content</TabsContent>
        <TabsContent value="password">Password settings content</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole('tablist', { name: 'Account settings' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account settings content');
  });

  it('switches panels when another tab is selected', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings content</TabsContent>
        <TabsContent value="password">Password settings content</TabsContent>
      </Tabs>
    );

    await user.click(screen.getByRole('tab', { name: 'Password' }));

    expect(screen.getByRole('tab', { name: 'Password' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Password settings content');
  });

  it('supports keyboard navigation between tabs', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings content</TabsContent>
        <TabsContent value="password">Password settings content</TabsContent>
      </Tabs>
    );

    const accountTab = screen.getByRole('tab', { name: 'Account' });
    accountTab.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Password' })).toHaveFocus();
  });

  it('does not activate disabled tabs', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password" disabled>
            Password
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings content</TabsContent>
        <TabsContent value="password">Password settings content</TabsContent>
      </Tabs>
    );

    const disabledTab = screen.getByRole('tab', { name: 'Password' });
    expect(disabledTab).toBeDisabled();

    await user.click(disabledTab);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account settings content');
  });
});
