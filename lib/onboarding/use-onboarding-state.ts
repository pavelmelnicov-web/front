"use client";

import { useCallback, useEffect, useState } from "react";
import { readOnboardingState, resetGiftOnboardingState, writeOnboardingState } from "./storage";
import { defaultOnboardingState, OnboardingState } from "./types";

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(defaultOnboardingState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setState(readOnboardingState());
    setIsReady(true);
  }, []);

  const updateState = useCallback((patch: Partial<OnboardingState>) => {
    setState((current) => {
      const next = { ...current, ...patch };
      writeOnboardingState(next);
      return next;
    });
  }, []);

  const resetGiftFlow = useCallback(() => {
    setState((current) => {
      const next = resetGiftOnboardingState(current);
      writeOnboardingState(next);
      return next;
    });
  }, []);

  return {
    state,
    updateState,
    resetGiftFlow,
    isReady,
  };
}
