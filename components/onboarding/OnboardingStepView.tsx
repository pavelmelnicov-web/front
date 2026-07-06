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
    console.log("[onboarding] Loading workbook data for step view", { flow, step });
    api
      .getWorkbook()
      .then((data) => {
        console.log("[onboarding] Workbook loaded successfully", { flow, step, headline: data.headline });
        setWorkbook(data);
      })
      .catch((error) => {
        console.error("[onboarding] Workbook load failed, using fallback", { flow, step, error });
        setWorkbook(fallbackWorkbook);
      });
  }, [flow, step]);

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
    console.log("[onboarding] Back button clicked", { flow, step });
    const previousStep = getPreviousOnboardingStep(flow, step);
    if (previousStep === null) {
      console.log("[onboarding] Leaving onboarding to home", { flow, step });
      router.push("/");
      return;
    }

    router.push(getOnboardingPath(flow, previousStep));
  }

  function handleNext() {
    console.log("[onboarding] Next button clicked", { flow, step, canContinue });
    if (!canContinue) {
      console.warn("[onboarding] Continue blocked by validation", { flow, step, state });
      return;
    }

    if (isOnboardingFinishStep(flow, step)) {
      console.log("[onboarding] Finish step reached, redirecting to workbook", { flow, step });
      router.push("/#workbook");
      return;
    }

    const nextStep = getNextOnboardingStep(flow, step);
    if (nextStep === null) {
      console.error("[onboarding] Next onboarding step is missing", { flow, step });
      return;
    }

    console.log("[onboarding] Navigating to next step", { flow, step, nextStep });
    router.push(getOnboardingPath(flow, nextStep));
  }

  function handleClose() {
    console.log("[onboarding] Close button clicked", { flow, step });
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
            <span>Onboarding</span>
            <strong>{flow === "gift" ? "Gift the workbook" : "Start exploring"}</strong>
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
