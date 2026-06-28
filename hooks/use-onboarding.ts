"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "draftdeckai:onboarding";
const supabase = createClient();

export interface OnboardingState {
  completed: boolean;
  skipped: boolean;
  currentStep: number;
}

const defaultState: OnboardingState = {
  completed: false,
  skipped: false,
  currentStep: 0,
};

function readLocalState(): OnboardingState {
  if (typeof window === "undefined") return defaultState;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
  } catch {
    return defaultState;
  }
}

function writeLocalState(state: OnboardingState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useOnboarding() {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>(() => {
    const metadata = user?.user_metadata?.onboarding as
      | Partial<OnboardingState>
      | undefined;
    return { ...readLocalState(), ...metadata };
  });
  const stateRef = useRef(state);
  const userRef = useRef(user);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const metadata = user?.user_metadata?.onboarding as
      | Partial<OnboardingState>
      | undefined;

    if (!metadata) return;

    setState((current) => {
      const nextState = { ...current, ...metadata };
      const isSameState =
        current.completed === nextState.completed &&
        current.skipped === nextState.skipped &&
        current.currentStep === nextState.currentStep;

      if (isSameState) return current;

      stateRef.current = nextState;
      writeLocalState(nextState);
      return nextState;
    });
  }, [user]);

  const persist = useCallback(async (nextState: OnboardingState) => {
    const activeUser = userRef.current;

    if (activeUser && supabase.auth.updateUser) {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...(activeUser.user_metadata || {}),
          onboarding: nextState,
        },
      });

      if (error) {
        logger.error(
          { component: "useOnboarding" },
          "Failed to persist onboarding state",
          error,
        );
        throw error;
      }
    }

    setState(nextState);
    stateRef.current = nextState;
    writeLocalState(nextState);
  }, []);

  const setCurrentStep = useCallback(
    async (currentStep: number) =>
      persist({ ...stateRef.current, currentStep }),
    [persist],
  );

  const complete = useCallback(
    async () => persist({ completed: true, skipped: false, currentStep: 3 }),
    [persist],
  );

  const skip = useCallback(
    async () =>
      persist({
        completed: false,
        skipped: true,
        currentStep: stateRef.current.currentStep,
      }),
    [persist],
  );

  const reset = useCallback(async () => persist(defaultState), [persist]);

  return {
    ...state,
    setCurrentStep,
    complete,
    skip,
    reset,
  };
}
