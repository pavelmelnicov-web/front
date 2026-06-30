import { defaultOnboardingState, OnboardingState } from "./types";

export const ONBOARDING_STORAGE_KEY = "space-self-onboarding";

export function readOnboardingState(): OnboardingState {
  if (typeof window === "undefined") {
    return defaultOnboardingState;
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) {
      return defaultOnboardingState;
    }

    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return { ...defaultOnboardingState, ...parsed };
  } catch (error) {
    console.error("Failed to read onboarding state from localStorage:", error);
    return defaultOnboardingState;
  }
}

export function writeOnboardingState(state: OnboardingState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to write onboarding state to localStorage:", error);
  }
}

export function resetGiftOnboardingState(state: OnboardingState): OnboardingState {
  return {
    ...state,
    giftMention: "",
    giftMentionText: "",
    giftSituationId: "",
    giftContact: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  };
}
