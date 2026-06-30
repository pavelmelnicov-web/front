export type OnboardingGender = "male" | "female" | "other" | "";

export type OnboardingGiftMention = "mention" | "anonymous" | "";

export type OnboardingFlow = "regular" | "gift";

export type OnboardingState = {
  name: string;
  age: string;
  selectedSituationId: string;
  selectedSubSituations: string[];
  selectedGender: OnboardingGender;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
  giftMention: OnboardingGiftMention;
  giftMentionText: string;
  giftSituationId: string;
  giftContact: string;
};

export const defaultOnboardingState: OnboardingState = {
  name: "",
  age: "",
  selectedSituationId: "",
  selectedSubSituations: [],
  selectedGender: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardName: "",
  giftMention: "",
  giftMentionText: "",
  giftSituationId: "",
  giftContact: "",
};

export const REGULAR_ONBOARDING_STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;

export const GIFT_ONBOARDING_STEPS = [20, 21, 22, 23, 24] as const;

export type RegularOnboardingStep = (typeof REGULAR_ONBOARDING_STEPS)[number];

export type GiftOnboardingStep = (typeof GIFT_ONBOARDING_STEPS)[number];
