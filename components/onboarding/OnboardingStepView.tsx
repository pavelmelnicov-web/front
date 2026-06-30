"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, Workbook } from "../../lib/api";
import { fallbackWorkbook } from "../../lib/fallback";
import {
  getNextOnboardingStep,
  getOnboardingBackLabel,
  getOnboardingNextLabel,
  getOnboardingPath,
  getPreviousOnboardingStep,
  isGiftOnboardingStep,
  isOnboardingFinishStep,
  isRegularOnboardingStep,
} from "../../lib/onboarding/navigation";
import { OnboardingFlow } from "../../lib/onboarding/types";
import { useOnboardingState } from "../../lib/onboarding/use-onboarding-state";
import { canContinueOnboardingStep } from "../../lib/onboarding/validation";
import { OnboardingStepContent } from "./OnboardingStepContent";

type OnboardingStepViewProps = {
  flow: OnboardingFlow;
  step: number;
};

export function OnboardingStepView({ flow, step }: OnboardingStepViewProps) {
  const router = useRouter();
  const { state, updateState, isReady } = useOnboardingState();
  const [workbook, setWorkbook] = useState<Workbook>(fallbackWorkbook);

  useEffect(() => {
    api.getWorkbook().then(setWorkbook).catch(() => setWorkbook(fallbackWorkbook));
  }, []);

  const isValidStep = flow === "gift" ? isGiftOnboardingStep(step) : isRegularOnboardingStep(step);

  useEffect(() => {
    if (!isValidStep) {
      console.error("Invalid onboarding step requested:", { flow, step });
      router.replace(flow === "gift" ? "/onboarding/gift/20" : "/onboarding/0");
    }
  }, [flow, isValidStep, router, step]);

  const canContinue = useMemo(
    () => canContinueOnboardingStep(flow, step, state),
    [flow, step, state],
  );

  function toggleSubSituation(value: string) {
    updateState({
      selectedSubSituations: state.selectedSubSituations.includes(value)
        ? state.selectedSubSituations.filter((item) => item !== value)
        : [...state.selectedSubSituations, value],
    });
  }

  function handleBack() {
    const previousStep = getPreviousOnboardingStep(flow, step);
    if (previousStep === null) {
      router.push("/");
      return;
    }

    router.push(getOnboardingPath(flow, previousStep));
  }

  function handleNext() {
    if (!canContinue) {
      return;
    }

    if (isOnboardingFinishStep(flow, step)) {
      router.push("/#workbook");
      return;
    }

    const nextStep = getNextOnboardingStep(flow, step);
    if (nextStep === null) {
      console.error("Next onboarding step is missing:", { flow, step });
      return;
    }

    router.push(getOnboardingPath(flow, nextStep));
  }

  function handleClose() {
    router.push("/");
  }

  if (!isReady || !isValidStep) {
    return (
      <main className="onboardingPage">
        <section className="onboardingCard onboardingCardPage">
          <p className="onboardingLoading">Loading onboarding step...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="onboardingPage">
      <section className="onboardingCard onboardingCardPage">
        <div className="onboardingHeader">
          <div>
            <span>Онбординг</span>
            <strong>{flow === "gift" ? "Подарить воркбук" : "Начни исследование"}</strong>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close onboarding">
            ✕
          </button>
        </div>
        <div className="onboardingBody">
          <OnboardingStepContent
            flow={flow}
            step={step}
            workbook={workbook}
            state={state}
            onUpdate={updateState}
            onToggleSubSituation={toggleSubSituation}
          />
        </div>
        <div className="onboardingNav">
          <button type="button" onClick={handleBack}>
            {getOnboardingBackLabel(flow, step)}
          </button>
          <button type="button" onClick={handleNext} disabled={!canContinue}>
            {getOnboardingNextLabel(flow, step)}
          </button>
        </div>
      </section>
    </main>
  );
}
