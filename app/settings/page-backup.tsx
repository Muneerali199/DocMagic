'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent"></div>
          <span className="font-medium">Loading your settings...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center">
            <div className="p-8 rounded-3xl border">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">
                  Access Your Settings
                </h1>
                <p className="text-muted-foreground">
                  Sign in to manage your profile, preferences, and account settings
                </p>
              </div>
              <Button 
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-gradient-to-r from-yellow-400 to-blue-600 text-white font-semibold"
                size="lg"
              >
                Sign In to DocMagic
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4">
            <Settings className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Account Settings</span>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            Your DocMagic Account
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, subscription, and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Settings page is working! User: {user.email}</p>
            <div className="mt-4">
              <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}