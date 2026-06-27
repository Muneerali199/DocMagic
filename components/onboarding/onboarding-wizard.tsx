"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  LayoutTemplate,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "@/hooks/use-onboarding";

const steps = [
  {
    title: "Set up your profile",
    description:
      "Add your name and role so generated documents start with better context.",
    icon: UserRound,
    action: "Open Profile",
    href: "/profile",
  },
  {
    title: "Choose a template",
    description:
      "Browse resume, presentation, and document templates before creating your first draft.",
    icon: LayoutTemplate,
    action: "Browse Templates",
    href: "/templates",
  },
  {
    title: "Create your first document",
    description:
      "Start with a resume, letter, presentation, or diagram and let DraftDeckAI guide the draft.",
    icon: FileText,
    action: "Create Document",
    href: "/dashboard/history",
  },
  {
    title: "Tour the workflow",
    description:
      "Use export, templates, analytics, and settings to manage your document workspace.",
    icon: Sparkles,
    action: "Go to Dashboard",
    href: "/dashboard/history",
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const [busy, setBusy] = useState(false);
  const activeStep = steps[onboarding.currentStep] || steps[0];
  const Icon = activeStep.icon;
  const progress = ((onboarding.currentStep + 1) / steps.length) * 100;

  const moveTo = async (step: number) => {
    setBusy(true);
    try {
      await onboarding.setCurrentStep(
        Math.max(0, Math.min(step, steps.length - 1)),
      );
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    try {
      await onboarding.complete();
      router.push("/dashboard/history");
    } finally {
      setBusy(false);
    }
  };

  const skip = async () => {
    setBusy(true);
    try {
      await onboarding.skip();
      router.push("/dashboard/history");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Welcome to DraftDeckAI
        </CardTitle>
        <CardDescription>
          Complete these steps to personalize your workspace and create your
          first document.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {onboarding.currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => moveTo(index)}
                className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  index === onboarding.currentStep
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "hover:bg-muted/50"
                }`}
              >
                {index < onboarding.currentStep ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <step.icon className="h-4 w-4 text-blue-500" />
                )}
                {step.title}
              </button>
            ))}
          </div>

          <div className="rounded-lg border p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/40">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">{activeStep.title}</h2>
            <p className="mb-6 text-muted-foreground">
              {activeStep.description}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(activeStep.href)}
            >
              {activeStep.action}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={skip} disabled={busy}>
            Skip for now
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => moveTo(onboarding.currentStep - 1)}
              disabled={busy || onboarding.currentStep === 0}
            >
              Back
            </Button>
            {onboarding.currentStep === steps.length - 1 ? (
              <Button onClick={finish} disabled={busy}>
                Finish
              </Button>
            ) : (
              <Button
                onClick={() => moveTo(onboarding.currentStep + 1)}
                disabled={busy}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
