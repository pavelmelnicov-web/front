"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { readOnboardingState, resetGiftOnboardingState, writeOnboardingState } from "../../../lib/onboarding/storage";

export default function GiftOnboardingEntryPage() {
  const router = useRouter();

  useEffect(() => {
    const currentState = readOnboardingState();
    writeOnboardingState(resetGiftOnboardingState(currentState));
    router.replace("/onboarding/gift/20");
  }, [router]);

  return (
    <main className="onboardingPage">
      <section className="onboardingCard onboardingCardPage">
        <p className="onboardingLoading">Loading gift onboarding...</p>
      </section>
    </main>
  );
}
