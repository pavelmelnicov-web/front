"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type UIEvent } from "react";
import { Workbook } from "../../lib/api";
import { friendSituationCopy } from "../../lib/onboarding/friend-copy";
import { OnboardingFlow, OnboardingState } from "../../lib/onboarding/types";
import { formatCardExpiry, formatCardNumber } from "../../lib/onboarding/validation";

const ONBOARDING_EXTRA_SIGNALS = [
  { example: "something else", situationId: "other" },
] as const;

type OnboardingStepContentProps = {
  flow: OnboardingFlow;
  step: number;
  workbook: Workbook;
  state: OnboardingState;
  onUpdate: (patch: Partial<OnboardingState>) => void;
  onToggleSubSituation: (value: string) => void;
};

export function OnboardingStepContent({
  flow,
  step,
  workbook,
  state,
  onUpdate,
  onToggleSubSituation,
}: OnboardingStepContentProps) {
  if (flow === "regular") {
    switch (step) {
      case 0:
        return (
          <div>
            <h2>Tell us a little about yourself</h2>
            <p>Your name and age help personalize the quiz.</p>
            <div className="onboardingProfileFields">
              <label>
                <input
                  aria-label="Name"
                  value={state.name}
                  onChange={(event) => onUpdate({ name: event.target.value })}
                  placeholder="Your name"
                />
              </label>
              <label>
                <input
                  aria-label="Age"
                  value={state.age}
                  onChange={(event) => onUpdate({ age: event.target.value })}
                  placeholder="Your age"
                  inputMode="numeric"
                />
              </label>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <h2>While others postpone, you move forward</h2>
            <div className="onboardingStats">
              <div
                className="onboardingStat onboardingStat--men"
                style={{ "--onboarding-stat-fill": "72%" } as CSSProperties}
              >
                <strong>72%</strong>
                <p>of people never start a renovation</p>
              </div>
              <div
                className="onboardingStat onboardingStat--women"
                style={{ "--onboarding-stat-fill": "58%" } as CSSProperties}
              >
                <strong>58%</strong>
                <p>are unhappy with renovation results</p>
              </div>
              <div
                className="onboardingStat onboardingStat--men"
                style={{ "--onboarding-stat-fill": "65%" } as CSSProperties}
              >
                <strong>65%</strong>
                <p>start changes without a clear plan</p>
              </div>
            </div>
          </div>
        );
      case 2: {
        const situationSignals = [
          ...workbook.situations.flatMap((situation) =>
            situation.examples.map((example) => ({
              example,
              situationId: situation.id,
            })),
          ),
          ...ONBOARDING_EXTRA_SIGNALS,
        ];

        console.log("[onboarding] Rendering situation signals step", {
          signalCount: situationSignals.length,
          selectedCount: state.selectedSubSituations.length,
          selectedSignals: state.selectedSubSituations,
        });

        return (
          <div className="onboardingStep onboardingStep--signals">
            <h2>Choose the signals that feel true</h2>
            <p>Select everything that matches your situation right now.</p>
            <div
              aria-label="Situation signals"
              className="onboardingSignalWrap"
              role="list"
            >
              {situationSignals.map(({ example, situationId }) => {
                const isSelected = state.selectedSubSituations.includes(example);

                return (
                  <button
                    key={example}
                    type="button"
                    aria-pressed={isSelected}
                    className={getOnboardingSignalChipClass(situationId, isSelected)}
                    onClick={() => onToggleSubSituation(example)}
                    role="listitem"
                  >
                    {example}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }
      case 3:
        return (
          <div className="onboardingStep onboardingStep--gender">
            <h2>Who is this best for</h2>
            <p>Choose the option that feels closest.</p>
            <div aria-label="Gender options" className="onboardingGenderOptions" role="list">
              {[
                { value: "male", label: "For men", tone: "men" },
                { value: "female", label: "For women", tone: "women" },
                { value: "other", label: "I prefer a neutral version", tone: "neutral" },
              ].map((item) => {
                const isSelected = state.selectedGender === item.value;

                return (
                  <button
                    type="button"
                    key={item.value}
                    role="listitem"
                    aria-pressed={isSelected}
                    className={[
                      "onboardingGenderOption",
                      `onboardingGenderOption--${item.tone}`,
                      isSelected ? "active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      console.log("[onboarding] Gender option selected", {
                        value: item.value,
                        tone: item.tone,
                        previousValue: state.selectedGender,
                      });
                      onUpdate({ selectedGender: item.value as OnboardingState["selectedGender"] });
                    }}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 4: {
        const selectedResearchFacts = state.selectedSubSituations
          .map((signal) => {
            const researchFact = onboardingResearchFacts[signal];

            if (!researchFact) {
              console.warn("[onboarding] Research fact is missing for selected signal", {
                signal,
              });
              return null;
            }

            return {
              signal,
              ...researchFact,
            };
          })
          .filter((item): item is OnboardingResearchFactWithSignal => item !== null);

        console.log("[onboarding] Rendering personalized research facts", {
          selectedSignals: state.selectedSubSituations,
          renderedFactCount: selectedResearchFacts.length,
        });

        return (
          <div className="onboardingStep onboardingStep--research">
            <h2>Your answers reflect real patterns</h2>
            <p>
              {state.name ? `${state.name}, here is` : "Here is"} what research says about each
              signal you selected.
            </p>
            <div className="onboardingResearchStats">
              {selectedResearchFacts.map((fact) => (
                <article
                  className={`onboardingResearchStat onboardingResearchStat--${fact.tone}`}
                  key={fact.signal}
                  style={{ "--onboarding-research-fill": `${fact.percent}%` } as CSSProperties}
                >
                  <div className="onboardingResearchStatContent">
                    <span className="onboardingResearchSignal">{fact.signal}</span>
                    <strong>{fact.percent}%</strong>
                    <p>{fact.fact}</p>
                    <a
                      href={fact.sourceUrl}
                      onClick={() => {
                        console.log("[onboarding] Research source opened", {
                          signal: fact.signal,
                          source: fact.source,
                          sourceUrl: fact.sourceUrl,
                        });
                      }}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Source: {fact.source}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        );
      }
      case 5:
        return (
          <div className="onboardingStep onboardingStep--how">
            <h2>How it will work</h2>
            <div className="onboardingCards">
              <article>
                <OnboardingHowImage
                  alt="Illustration of answering questions about life at home"
                  src="/onboarding/questions.png"
                />
                <strong>There will be questions</strong>
                <p>We will ask about your rhythm, goals, and how you live.</p>
              </article>
              <article>
                <OnboardingHowImage
                  alt="Illustration of uploading photos of a home"
                  src="/onboarding/photos.png"
                />
                <strong>You can send photos</strong>
                <p>Show your current space and the details that matter to you.</p>
              </article>
              <article>
                <OnboardingHowImage
                  alt="Illustration of recording a voice note"
                  src="/onboarding/voice-note.png"
                />
                <strong>You can record voice notes</strong>
                <p>Share however feels easier—text or voice.</p>
              </article>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="onboardingStep onboardingStep--workbookPreview">
            <div className="onboardingWorkbookPreviewCopy">
              <h2>Bring all steps together</h2>
              <p>See how your answers become one clear, cohesive concept for your home.</p>
            </div>
            <div className="onboardingWorkbookPhone">
              <OnboardingWorkbookPhonePreview />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="onboardingStep onboardingStep--lifestyle">
            <h2>How to fill it out</h2>
            <article className="onboardingLifestyleCard">
              <Image
                alt="A person completing the workbook at a specialty coffee shop"
                className="onboardingLifestyleCardImage"
                fill
                onLoad={() => {
                  console.log("[onboarding] Coffee shop lifestyle image loaded", {
                    src: "/onboarding/coffee-shop-workbook.png",
                  });
                }}
                priority
                sizes="(max-width: 640px) calc(100vw - 32px), 440px"
                src="/onboarding/coffee-shop-workbook.png"
                unoptimized
              />
              <div className="onboardingLifestyleCardScrim" aria-hidden="true" />
              <p>
                Start at a specialty coffee shop and capture your first thoughts about home and your
                life.
              </p>
            </article>
          </div>
        );
      case 8:
        return (
          <div className="onboardingStep onboardingStep--lifestyle">
            <h2>How to fill it out</h2>
            <article className="onboardingLifestyleCard onboardingLifestyleCard--weekend">
              <Image
                alt="A person relaxing with headphones and a phone on a weekend morning"
                className="onboardingLifestyleCardImage onboardingLifestyleCardImage--weekend"
                fill
                onLoad={() => {
                  console.log("[onboarding] Weekend morning lifestyle image loaded", {
                    src: "/onboarding/weekend-morning-workbook.png",
                  });
                }}
                priority
                sizes="(max-width: 640px) calc(100vw - 32px), 440px"
                src="/onboarding/weekend-morning-workbook.png"
                unoptimized
              />
              <div className="onboardingLifestyleCardScrim" aria-hidden="true" />
              <p>
                On a weekend morning, relax in bed and imagine how you want home to work for you.
              </p>
            </article>
          </div>
        );
      case 9:
        return (
          <div>
            <h2>How to fill it out</h2>
            <p>Finalize your thoughts later, when ideas are clearer and there is no rush.</p>
          </div>
        );
      case 10:
        return (
          <div>
            <h2>You will understand yourself better</h2>
            <p>At this stage you will see what matters to you and why you are changing your space.</p>
          </div>
        );
      case 11:
        return (
          <div>
            <h2>You will know if you need a renovation or a reset</h2>
            <p>We help you see where rearranging is enough and where renovation is worth considering.</p>
          </div>
        );
      case 12:
        return (
          <div>
            <h2>You will get material for a designer</h2>
            <p>The result becomes clear context you can hand to a specialist.</p>
          </div>
        );
      case 13:
        return (
          <div>
            <h2>Your space will reflect you</h2>
            <p>We bring it together so home starts working for your rhythm and how you feel.</p>
          </div>
        );
      case 14:
        return (
          <PaywallStep
            title="Workbook access payment"
            description="Enter your card details to start exploring your space."
            state={state}
            onUpdate={onUpdate}
          />
        );
      default:
        return null;
    }
  }

  switch (step) {
    case 20:
      return (
        <div>
          <h2>The workbook is a thoughtful gift</h2>
          <p>
            We will send a beautiful message by email or social DM. You can mention your name or
            send it anonymously.
          </p>
          <div className="onboardingOptions">
            <button
              type="button"
              className={state.giftMention === "mention" ? "active" : ""}
              onClick={() => onUpdate({ giftMention: "mention" })}
            >
              With your name
            </button>
            <button
              type="button"
              className={state.giftMention === "anonymous" ? "active" : ""}
              onClick={() => onUpdate({ giftMention: "anonymous" })}
            >
              Anonymous
            </button>
          </div>
          {state.giftMention === "mention" && (
            <label>
              How should we introduce you?
              <input
                value={state.giftMentionText}
                onChange={(event) => onUpdate({ giftMentionText: event.target.value })}
                placeholder="For example: Your friend from architecture school"
              />
            </label>
          )}
        </div>
      );
    case 21:
      return (
        <div>
          <h2>What situation is your friend in?</h2>
          <p>Pick one option so the message feels more precise.</p>
          <div className="onboardingOptions">
            {workbook.situations.map((item) => {
              const friendText = friendSituationCopy[item.id] ?? {
                title: item.title,
                description: item.description,
              };

              return (
                <button
                  key={item.id}
                  type="button"
                  className={state.giftSituationId === item.id ? "active" : ""}
                  onClick={() => onUpdate({ giftSituationId: item.id })}
                >
                  <strong>{friendText.title}</strong>
                  <small>{friendText.description}</small>
                </button>
              );
            })}
          </div>
        </div>
      );
    case 22:
      return (
        <div>
          <h2>Where should we send the message and link?</h2>
          <p>Enter an email or social handle so we can deliver the gift.</p>
          <label>
            Email or social handle
            <input
              value={state.giftContact}
              onChange={(event) => onUpdate({ giftContact: event.target.value })}
              placeholder="example@domain.com or @username"
            />
          </label>
        </div>
      );
    case 23:
      return (
        <PaywallStep
          title="Gift payment"
          description="Enter your card details to send access to your friend."
          state={state}
          onUpdate={onUpdate}
        />
      );
    case 24:
      return (
        <div>
          <h2>Your gift is ready</h2>
          <p>
            We prepared a message for your friend. After payment they will get workbook access and
            a beautiful link.
          </p>
        </div>
      );
    default:
      return null;
  }
}

type OnboardingResearchTone = "orange" | "green" | "blue" | "cream" | "neutral";

type OnboardingResearchFact = {
  percent: number;
  fact: string;
  source: string;
  sourceUrl: string;
  tone: OnboardingResearchTone;
};

type OnboardingResearchFactWithSignal = OnboardingResearchFact & {
  signal: string;
};

const onboardingResearchFacts: Record<string, OnboardingResearchFact> = {
  "new apartment": {
    percent: 40,
    fact: "of recent U.S. renters said searching for a new place caused them to lose sleep.",
    source: "Zillow and The Harris Poll, 2022",
    sourceUrl:
      "https://zillow.mediaroom.com/2022-09-08-Up-all-night-40-of-renters-report-losing-sleep-when-trying-to-find-a-new-place",
    tone: "orange",
  },
  "breakup or divorce": {
    percent: 57,
    fact: "of separated people in Canada had moved within the previous five years.",
    source: "Department of Justice Canada",
    sourceUrl:
      "https://www.justice.gc.ca/eng/rp-pr/fl-lf/divorce/spsdpr-edpads/p5.html",
    tone: "orange",
  },
  "new partner": {
    percent: 59,
    fact: "of U.S. adults ages 18–44 have lived with an unmarried partner.",
    source: "Pew Research Center, 2019",
    sourceUrl:
      "https://www.pewresearch.org/short-reads/2019/11/06/key-findings-on-marriage-and-cohabitation-in-the-u-s/",
    tone: "orange",
  },
  "remote work": {
    percent: 35,
    fact: "of U.S. workers with remote-capable jobs worked from home all of the time.",
    source: "Pew Research Center, 2023",
    sourceUrl:
      "https://www.pewresearch.org/short-read/2023/03/30/about-a-third-of-us-workers-who-can-work-from-home-now-do-so-all-the-time/",
    tone: "orange",
  },
  relocation: {
    percent: 77,
    fact: "of recent U.S. renters made compromises to afford their most recent rental.",
    source: "Zillow and The Harris Poll, 2022",
    sourceUrl:
      "https://zillow.mediaroom.com/2022-09-08-Up-all-night-40-of-renters-report-losing-sleep-when-trying-to-find-a-new-place",
    tone: "orange",
  },
  "home content": {
    percent: 14,
    fact: "of renovating Houzz users used the platform to find educational content.",
    source: "2025 U.S. Houzz & Home Study",
    sourceUrl: "https://st.hzcdn.com/static/econ/2025-US-Houzz-and-Home--Study.pdf",
    tone: "green",
  },
  "space speaks about me": {
    percent: 78,
    fact: "of surveyed U.S. homeowners see their home as an extension of themselves.",
    source: "Talker Research, 2025",
    sourceUrl:
      "https://talkerresearch.com/how-homeowners-see-their-home-as-an-extension-of-themselves/",
    tone: "green",
  },
  "afraid of wrong choices": {
    percent: 74,
    fact: "of surveyed U.S. homeowners who remodeled reported at least one renovation regret.",
    source: "Clever Real Estate, 2024",
    sourceUrl: "https://listwithclever.com/research/home-renovation-trends/",
    tone: "blue",
  },
  "unclear renovation priorities": {
    percent: 52,
    fact: "of surveyed homeowners prioritize the most necessary repairs when choosing projects.",
    source: "Clever Real Estate, 2024",
    sourceUrl: "https://listwithclever.com/research/home-renovation-trends/",
    tone: "blue",
  },
  "need a plan before spending": {
    percent: 76,
    fact: "of renovating homeowners set a budget for their home improvements.",
    source: "2024 U.S. Houzz & Home Study",
    sourceUrl:
      "https://www.houzz.com/magazine/homeowners-spend-more-on-remodels-despite-slight-dip-in-activity-stsetivw-vs~174333393",
    tone: "blue",
  },
  "designer is expensive": {
    percent: 53,
    fact: "of renovating homeowners said price was the most important factor when hiring.",
    source: "Houzz Industry Review",
    sourceUrl:
      "https://pro.houzz.com/pro-learn/blog/2022-industry-review-offers-insights-for-2023",
    tone: "cream",
  },
  "project is expensive": {
    percent: 61,
    fact: "of U.S. homeowners were concerned about affording maintenance or repairs.",
    source: "Angi State of Home Spending, 2024",
    sourceUrl: "https://www.angi.com/press/2024-state-of-home-spending-report",
    tone: "cream",
  },
  "renovation is expensive": {
    percent: 39,
    fact: "of renovating homeowners exceeded their home-improvement budget.",
    source: "2024 U.S. Houzz & Home Study",
    sourceUrl:
      "https://www.houzz.com/magazine/homeowners-spend-more-on-remodels-despite-slight-dip-in-activity-stsetivw-vs~174333393",
    tone: "cream",
  },
  "something else": {
    percent: 67,
    fact: "of U.S. homeowners said they would rather renovate their current home than move.",
    source: "Angi State of Home Spending, 2024",
    sourceUrl: "https://www.angi.com/press/2024-state-of-home-spending-report",
    tone: "neutral",
  },
};

function getOnboardingSignalChipClass(situationId: string, isActive: boolean) {
  const toneClass =
    situationId === "new-stage"
      ? "onboardingSignalChip--newStage"
      : situationId === "self-expression"
        ? "onboardingSignalChip--selfExpression"
        : situationId === "renovation-fear"
          ? "onboardingSignalChip--renovationFear"
          : situationId === "no-designer-budget"
            ? "onboardingSignalChip--noDesignerBudget"
            : situationId === "other"
              ? "onboardingSignalChip--other"
              : "";

  return ["onboardingSignalChip", toneClass, isActive ? "active" : ""].filter(Boolean).join(" ");
}

const onboardingWorkbookScreens = [
  {
    alt: "Workbook screen for defining personal roles",
    src: "/how-it-works/01.png?v=center01",
  },
  {
    alt: "Workbook screen for mapping life scenarios",
    src: "/how-it-works/02.png?v=center01",
  },
  {
    alt: "Workbook screen for defining desired states",
    src: "/how-it-works/03.png?v=center01",
  },
  {
    alt: "Workbook screen for choosing meaningful objects",
    src: "/how-it-works/04.png?v=center01",
  },
  {
    alt: "Final workbook screen bringing roles, scenarios, states, and objects together",
    src: "/how-it-works/05.png?v=center01",
  },
] as const;

function OnboardingWorkbookPhonePreview() {
  const screensRef = useRef<HTMLDivElement>(null);
  const [activeScreenIndex, setActiveScreenIndex] = useState(onboardingWorkbookScreens.length - 1);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const screens = screensRef.current;

      if (!screens) {
        console.warn("[onboarding] Workbook phone preview could not start at screen five");
        return;
      }

      const initialIndex = onboardingWorkbookScreens.length - 1;
      const targetScrollLeft = screens.clientWidth * initialIndex;
      screens.scrollTo({ left: targetScrollLeft, behavior: "auto" });

      console.log("[onboarding] Workbook phone preview initialized", {
        initialIndex,
        screenCount: onboardingWorkbookScreens.length,
        targetScrollLeft,
        viewportWidth: screens.clientWidth,
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function handleScreenScroll(event: UIEvent<HTMLDivElement>) {
    const screens = event.currentTarget;

    if (screens.clientWidth <= 0) {
      console.warn("[onboarding] Workbook phone scroll ignored because viewport width is zero");
      return;
    }

    const nextIndex = Math.max(
      0,
      Math.min(
        onboardingWorkbookScreens.length - 1,
        Math.round(screens.scrollLeft / screens.clientWidth),
      ),
    );

    setActiveScreenIndex((currentIndex) => {
      if (currentIndex === nextIndex) {
        return currentIndex;
      }

      console.log("[onboarding] Workbook phone screen changed", {
        previousIndex: currentIndex,
        nextIndex,
        scrollLeft: Math.round(screens.scrollLeft),
        viewportWidth: screens.clientWidth,
      });

      return nextIndex;
    });
  }

  return (
    <>
      <div className="iphone17ProMax iphone17ProMax--flat">
        <div className="iphone17ProMaxScreen iphone17ProMaxScreen--appPreview">
          <div
            aria-label="Workbook preview screens"
            className="iphone17ProMaxScreens"
            onScroll={handleScreenScroll}
            ref={screensRef}
            role="region"
          >
            {onboardingWorkbookScreens.map((screen, index) => (
              <article className="iphone17ProMaxSlide" key={screen.src}>
                <Image
                  alt={screen.alt}
                  className="iphone17ProMaxSlideImage"
                  fill
                  onLoad={() => {
                    console.log("[onboarding] Workbook phone screen image loaded", {
                      index,
                      src: screen.src,
                    });
                  }}
                  priority={index === onboardingWorkbookScreens.length - 1}
                  sizes="(max-width: 640px) 190px, 230px"
                  src={screen.src}
                  unoptimized
                />
              </article>
            ))}
          </div>
        </div>
        <div className="onboardingWorkbookPhonePagination" aria-hidden="true">
          {onboardingWorkbookScreens.map((screen, index) => (
            <span className={index === activeScreenIndex ? "active" : ""} key={screen.src} />
          ))}
        </div>
      </div>
      <span className="onboardingWorkbookSwipeHint">Swipe to explore all five screens</span>
    </>
  );
}

function OnboardingHowImage({ alt, src }: { alt: string; src: string }) {
  return (
    <div className="onboardingCardVisual">
      <Image
        alt={alt}
        className="onboardingCardVisualImage"
        fill
        onLoad={() => {
          console.log("[onboarding] How-it-works preview image loaded", { src });
        }}
        sizes="(max-width: 640px) calc(100vw - 64px), 300px"
        src={src}
        unoptimized
      />
    </div>
  );
}

function PaywallStep({
  title,
  description,
  state,
  onUpdate,
}: {
  title: string;
  description: string;
  state: OnboardingState;
  onUpdate: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="paywallForm">
        <label>
          Card number
          <input
            value={state.cardNumber}
            onChange={(event) => onUpdate({ cardNumber: formatCardNumber(event.target.value) })}
            placeholder="0000 0000 0000 0000"
          />
        </label>
        <div className="paywallRow">
          <label>
            Expiration
            <input
              value={state.cardExpiry}
              onChange={(event) => onUpdate({ cardExpiry: formatCardExpiry(event.target.value) })}
              placeholder="MM/YY"
            />
          </label>
          <label>
            CVC
            <input
              value={state.cardCvc}
              onChange={(event) =>
                onUpdate({ cardCvc: event.target.value.replace(/\D/g, "").slice(0, 4) })
              }
              placeholder="000"
            />
          </label>
        </div>
        <label>
          Name on card
          <input
            value={state.cardName}
            onChange={(event) => onUpdate({ cardName: event.target.value })}
            placeholder="Alex Johnson"
          />
        </label>
        <div className="paywallSummary">
          <span>Start Exploring plan</span>
          <strong>$7</strong>
        </div>
      </div>
    </div>
  );
}
