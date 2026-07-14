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
import {
  GIFT_ONBOARDING_STEPS,
  OnboardingFlow,
  REGULAR_ONBOARDING_STEPS,
} from "../../lib/onboarding/types";
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
  const flowSteps = flow === "gift" ? GIFT_ONBOARDING_STEPS : REGULAR_ONBOARDING_STEPS;
  const currentStepIndex = flowSteps.indexOf(step as never);
  const visibleStepNumber = Math.max(currentStepIndex + 1, 1);
  const progressPercent = Math.max(
    0,
    Math.min(100, (visibleStepNumber / flowSteps.length) * 100),
  );
  const onboardingPageClassName =
    flow === "regular" && step === 5
      ? "onboardingPage onboardingPage--how"
      : "onboardingPage";

  function toggleSubSituation(value: string) {
    const matchingSituation = workbook.situations.find((item) => item.examples.includes(value));
    const nextSelectedSubSituations = state.selectedSubSituations.includes(value)
      ? state.selectedSubSituations.filter((item) => item !== value)
      : [...state.selectedSubSituations, value];

    const inferredSituationId = inferSelectedSituationId(
      workbook.situations,
      nextSelectedSubSituations,
    );

    console.log("[onboarding] Situation signal toggled", {
      value,
      matchingSituationId: matchingSituation?.id ?? null,
      nextSelectedSubSituations,
      inferredSituationId,
    });

    updateState({
      selectedSubSituations: nextSelectedSubSituations,
      selectedSituationId: inferredSituationId,
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
    <main className={onboardingPageClassName}>
      <section className="onboardingCard onboardingCardPage">
        <div className="onboardingHeader">
          <div className="onboardingHeaderBrand">
            <span>Space, Self.</span>
            <strong>{flow === "gift" ? "Gift the workbook" : "Start exploring"}</strong>
          </div>
          <div className="onboardingHeaderActions">
            <span className="onboardingStepCount">
              Step {visibleStepNumber} of {flowSteps.length}
            </span>
            <button type="button" onClick={handleClose} aria-label="Close onboarding">
              ×
            </button>
          </div>
        </div>
        <div
          aria-label={`Onboarding progress: ${Math.round(progressPercent)}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progressPercent)}
          className="onboardingProgress"
          role="progressbar"
        >
          <span style={{ width: `${progressPercent}%` }} />
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

function inferSelectedSituationId(
  situations: Workbook["situations"],
  selectedSignals: string[],
) {
  if (selectedSignals.length === 0) {
    return "";
  }

  const rankedSituations = situations
    .map((situation) => ({
      id: situation.id,
      score: situation.examples.filter((example) => selectedSignals.includes(example)).length,
    }))
    .sort((left, right) => right.score - left.score);

  const bestMatch = rankedSituations[0];

  if (!bestMatch || bestMatch.score <= 0) {
    console.warn("[onboarding] Could not infer situation from selected signals", {
      selectedSignals,
    });
    return "";
  }

  return bestMatch.id;
}
