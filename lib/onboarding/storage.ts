import { defaultOnboardingState, OnboardingState } from "./types";

export const ONBOARDING_STORAGE_KEY = "space-self-onboarding";

const LEGACY_SITUATION_SIGNAL_LABELS: Record<string, string> = {
  "what I like": "afraid of wrong choices",
  "what I need": "unclear renovation priorities",
  "how I will live": "need a plan before spending",
};

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
    const storedSignals = Array.isArray(parsed.selectedSubSituations)
      ? parsed.selectedSubSituations.filter((signal): signal is string => typeof signal === "string")
      : [];
    const normalizedSignals = Array.from(
      new Set(storedSignals.map((signal) => LEGACY_SITUATION_SIGNAL_LABELS[signal] ?? signal)),
    );

    if (normalizedSignals.some((signal, index) => signal !== storedSignals[index])) {
      console.log("[onboarding] Migrated legacy situation signal labels", {
        previousSignals: storedSignals,
        normalizedSignals,
      });
    }

    const nextState = {
      ...defaultOnboardingState,
      ...parsed,
      selectedSubSituations: normalizedSignals,
    };

    console.log("[onboarding] State loaded from localStorage", {
      selectedSignalCount: normalizedSignals.length,
      selectedSituationId: nextState.selectedSituationId,
      selectedGender: nextState.selectedGender,
    });

    return nextState;
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
