import {
  GIFT_ONBOARDING_STEPS,
  OnboardingFlow,
  REGULAR_ONBOARDING_STEPS,
} from "./types";

export function isRegularOnboardingStep(step: number) {
  return REGULAR_ONBOARDING_STEPS.includes(step as (typeof REGULAR_ONBOARDING_STEPS)[number]);
}

export function isGiftOnboardingStep(step: number) {
  return GIFT_ONBOARDING_STEPS.includes(step as (typeof GIFT_ONBOARDING_STEPS)[number]);
}

export function getOnboardingPath(flow: OnboardingFlow, step: number) {
  if (flow === "gift") {
    return `/onboarding/gift/${step}`;
  }

  return `/onboarding/${step}`;
}

export function getPreviousOnboardingStep(flow: OnboardingFlow, step: number) {
  const steps = flow === "gift" ? GIFT_ONBOARDING_STEPS : REGULAR_ONBOARDING_STEPS;
  const index = steps.indexOf(step as never);

  if (index <= 0) {
    return null;
  }

  return steps[index - 1];
}

export function getNextOnboardingStep(flow: OnboardingFlow, step: number) {
  const steps = flow === "gift" ? GIFT_ONBOARDING_STEPS : REGULAR_ONBOARDING_STEPS;
  const index = steps.indexOf(step as never);

  if (index === -1 || index >= steps.length - 1) {
    return null;
  }

  return steps[index + 1];
}

export function getOnboardingNextLabel(flow: OnboardingFlow, step: number) {
  if (flow === "gift" && step === 24) {
    return "Готово";
  }

  if (flow === "regular" && step === 14) {
    return "Оплатить и перейти к воркбуку";
  }

  return "Дальше";
}

export function getOnboardingBackLabel(flow: OnboardingFlow, step: number) {
  const isFirstStep = flow === "gift" ? step === 20 : step === 0;
  return isFirstStep ? "Отмена" : "Назад";
}

export function isOnboardingFinishStep(flow: OnboardingFlow, step: number) {
  return (flow === "gift" && step === 24) || (flow === "regular" && step === 14);
}
