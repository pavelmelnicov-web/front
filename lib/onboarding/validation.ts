import { OnboardingFlow, OnboardingState } from "./types";

function isValidCardPayment(state: OnboardingState) {
  return (
    state.cardNumber.replace(/\s+/g, "").length >= 16 &&
    /^\d{2}\/\d{2}$/.test(state.cardExpiry) &&
    /^(\d{3,4})$/.test(state.cardCvc) &&
    state.cardName.trim().length > 2
  );
}

export function canContinueOnboardingStep(flow: OnboardingFlow, step: number, state: OnboardingState) {
  if (flow === "regular") {
    switch (step) {
      case 0:
        return state.name.trim().length > 1 && Number(state.age) > 0;
      case 2:
        return Boolean(state.selectedSituationId);
      case 3:
        return state.selectedSubSituations.length > 0;
      case 4:
        return Boolean(state.selectedGender);
      case 14:
        return isValidCardPayment(state);
      default:
        return true;
    }
  }

  switch (step) {
    case 20:
      return Boolean(state.giftMention);
    case 21:
      return Boolean(state.giftSituationId);
    case 22:
      return state.giftContact.trim().length > 5;
    case 23:
      return isValidCardPayment(state);
    default:
      return true;
  }
}

export function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatCardExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.replace(/(.{2})/, "$1/").trim();
}
