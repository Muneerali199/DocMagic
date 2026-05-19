"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Calendar, Timer, Info } from "lucide-react";
import { useBudgetMode } from "@/hooks/use-budget-mode";

export function BudgetModeCard() {
  const budget = useBudgetMode();
  const { settings } = budget;

  const handleDailyCap = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) budget.setDailyCap(n);
  };

  const handleSessionCap = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) budget.setSessionCap(n);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          Budget Mode
          {settings.enabled && (
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Cap how many credits can be used per day or session to prevent
          unexpected usage.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="budget-toggle" className="text-sm font-medium cursor-pointer">
            Enable Budget Mode
          </Label>
          <Switch
            id="budget-toggle"
            checked={settings.enabled}
            onCheckedChange={budget.setEnabled}
          />
        </div>

        <div
          className={`space-y-4 transition-opacity ${settings.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}
        >
          {/* Daily cap */}
          <div className="space-y-1.5">
            <Label htmlFor="daily-cap" className="text-sm flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Daily Credit Cap
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="daily-cap"
                type="number"
                min={0}
                max={9999}
                value={settings.dailyCap}
                onChange={(e) => handleDailyCap(e.target.value)}
                className="w-28"
              />
              <span className="text-xs text-muted-foreground">
                0 = unlimited
              </span>
            </div>
            {settings.enabled && settings.dailyCap > 0 && (
              <p className="text-xs text-muted-foreground">
                Used today:{" "}
                <span
                  className={
                    settings.dailyUsed >= settings.dailyCap
                      ? "text-red-600 font-medium"
                      : "font-medium"
                  }
                >
                  {settings.dailyUsed} / {settings.dailyCap}
                </span>
              </p>
            )}
          </div>

          {/* Session cap */}
          <div className="space-y-1.5">
            <Label htmlFor="session-cap" className="text-sm flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" />
              Session Credit Cap
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="session-cap"
                type="number"
                min={0}
                max={9999}
                value={settings.sessionCap}
                onChange={(e) => handleSessionCap(e.target.value)}
                className="w-28"
              />
              <span className="text-xs text-muted-foreground">
                0 = unlimited
              </span>
            </div>
            {settings.enabled && settings.sessionCap > 0 && (
              <p className="text-xs text-muted-foreground">
                Used this session:{" "}
                <span
                  className={
                    settings.sessionUsed >= settings.sessionCap
                      ? "text-red-600 font-medium"
                      : "font-medium"
                  }
                >
                  {settings.sessionUsed} / {settings.sessionCap}
                </span>
              </p>
            )}
          </div>

          {/* Info note */}
          <div className="flex gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              When a generation would exceed your cap, you will see a warning
              before proceeding. The daily counter resets at midnight UTC. The
              session counter resets when you reload the page.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
