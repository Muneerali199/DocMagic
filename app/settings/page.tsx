"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useTheme } from '@/hooks/use-theme';
import { useUsageStats } from '@/hooks/use-usage-stats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Sparkles, Zap, Sun, Moon, Laptop, BarChart3, FileText, Layout, TrendingUp, Upload, Rocket, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff } from 'lucide-react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useToast } from '@/hooks/use-toast';
import { logger } from "@/lib/logger";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const {
    theme,
    setTheme,
    resolvedTheme,
    isDark,
    isUsingSystemTheme,
    systemPreference,
    mounted: themeMounted,
  } = useTheme();
  const router = useRouter();
  const {
    documentsCreated,
    templatesUsed,
    templatesCreated,
    successRate,
    loading: statsLoading,
    error: statsError,
  } = useUsageStats();
  const onboarding = useOnboarding();
  const { toast } = useToast();
  const [isRestartingOnboarding, setIsRestartingOnboarding] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check local storage for notification preference
    const prefs = localStorage.getItem('documentGenerationNotifications');
    if (prefs !== null) {
      setNotificationsEnabled(prefs === 'true');
    } else {
      // Default to true if not set, but respect Notification permission if denied
      setNotificationsEnabled(typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'denied');
    }
  }, []);

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('documentGenerationNotifications', 'true');
        setNotificationsEnabled(true);
      } else {
        localStorage.setItem('documentGenerationNotifications', 'false');
        setNotificationsEnabled(false);
      }
    } else {
      localStorage.setItem('documentGenerationNotifications', 'false');
      setNotificationsEnabled(false);
    }
  };

  const restartOnboarding = async () => {
    try {
      await onboarding.reset();
      router.push("/onboarding");
    } catch (error) {
      logger.error(
        { component: "SettingsPage" },
        "Failed to restart onboarding",
        error,
      );
      toast({
        title: "Could not restart onboarding",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsRestartingOnboarding(false);
    }
  };

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
                  Sign in to manage your profile, preferences, and account
                  settings
                </p>
              </div>
              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full bg-gradient-to-r from-yellow-400 to-blue-600 text-white font-semibold"
                size="lg"
              >
                <Zap className="h-5 w-5 mr-2" />
                Sign In to DraftDeckAI
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
            Your{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-blue-600 bg-clip-text text-transparent">
              DraftDeckAI
            </span>{" "}
            Account
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, subscription, and preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Welcome, {user.email}!</p>
              <p className="text-sm text-muted-foreground">
                Member since: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  {!themeMounted ? (
                    <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <div className="space-y-3">
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="h-4 w-4" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="h-4 w-4" />
                              Dark
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center gap-2">
                              <Laptop className="h-4 w-4" />
                              System
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* System preference info */}
                      {isUsingSystemTheme && systemPreference && (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg flex items-center gap-2">
                          <Laptop className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            Your system prefers{" "}
                            <span className="font-semibold">
                              {systemPreference}
                            </span>{" "}
                            mode
                          </span>
                        </div>
                      )}

                      {/* Theme quick-select buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={theme === "light" ? "default" : "outline"}
                          onClick={() => setTheme("light")}
                        >
                          <Sun className="h-4 w-4 mr-1" />
                          Light
                        </Button>
                        <Button
                          size="sm"
                          variant={theme === "dark" ? "default" : "outline"}
                          onClick={() => setTheme("dark")}
                        >
                          <Moon className="h-4 w-4 mr-1" />
                          Dark
                        </Button>
                        <Button
                          size="sm"
                          variant={theme === "system" ? "default" : "outline"}
                          onClick={() => setTheme("system")}
                        >
                          <Laptop className="h-4 w-4 mr-1" />
                          System
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your preference is saved automatically and persists across
                    sessions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Portability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Data Import
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Restore from export</p>
                  <p className="text-sm text-muted-foreground">
                    Import documents, presentations, diagrams, and letters from
                    a DraftDeckAI JSON export.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/settings/import")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Restart product tour</p>
                  <p className="text-sm text-muted-foreground">
                    Revisit profile setup, templates, first document creation,
                    and workspace tips.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={restartOnboarding}
                  disabled={isRestartingOnboarding}
                  aria-busy={isRestartingOnboarding}
                >
                  {isRestartingOnboarding ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Rocket className="h-4 w-4 mr-2" />
                  )}
                  {isRestartingOnboarding
                    ? "Opening Onboarding..."
                    : "Open Onboarding"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    {notificationsEnabled ? <Bell className="w-4 h-4 text-blue-500" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
                    Document Generation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications when long-running AI generation completes
                  </p>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={toggleNotifications} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Free Plan</p>
                  <p className="text-sm text-muted-foreground">
                    5 documents per month
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-yellow-400 to-blue-600 text-white">
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center p-4 border rounded-lg">
                      <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : statsError ? (
                <div className="text-center p-4 text-muted-foreground">
                  <p className="text-sm">Unable to load usage statistics</p>
                  <p className="text-xs mt-1">{statsError}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center mb-2">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {documentsCreated}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Documents Created
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center mb-2">
                      <Layout className="h-5 w-5 text-green-600 mr-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {templatesUsed}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Templates Used
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        {successRate}%
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Success Rate
                    </div>
                  </div>
                </div>
              )}
              {templatesCreated > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Templates Created by You
                    </span>
                    <span className="font-medium text-orange-600">
                      {templatesCreated}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center">
            <Button onClick={() => router.push("/")} variant="outline">
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
