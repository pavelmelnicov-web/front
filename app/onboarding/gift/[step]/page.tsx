"use client";

import { useParams } from "next/navigation";
import { OnboardingStepView } from "../../../../components/onboarding/OnboardingStepView";

export default function GiftOnboardingStepPage() {
  const params = useParams<{ step: string }>();
  const step = Number(params.step);

  return <OnboardingStepView flow="gift" step={step} />;
}
