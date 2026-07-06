"use client";

import { Workbook } from "../../lib/api";
import { friendSituationCopy } from "../../lib/onboarding/friend-copy";
import { OnboardingFlow, OnboardingState } from "../../lib/onboarding/types";
import { formatCardExpiry, formatCardNumber } from "../../lib/onboarding/validation";

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
  const selectedSituation = workbook.situations.find((item) => item.id === state.selectedSituationId);

  if (flow === "regular") {
    switch (step) {
      case 0:
        return (
          <div>
            <h2>Tell us a little about yourself</h2>
            <p>Your name and age help personalize the quiz.</p>
            <label>
              Name
              <input
                value={state.name}
                onChange={(event) => onUpdate({ name: event.target.value })}
                placeholder="Your name"
              />
            </label>
            <label>
              Age
              <input
                value={state.age}
                onChange={(event) => onUpdate({ age: event.target.value })}
                placeholder="Your age"
                inputMode="numeric"
              />
            </label>
          </div>
        );
      case 1:
        return (
          <div>
            <h2>While others postpone, you move forward</h2>
            <div className="onboardingStats">
              <div>
                <strong>72%</strong>
                <p>of people never start a renovation</p>
              </div>
              <div>
                <strong>58%</strong>
                <p>are unhappy with renovation results</p>
              </div>
              <div>
                <strong>65%</strong>
                <p>start changes without a clear plan</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>What situation are you in?</h2>
            <p>Pick one category so we understand your starting point.</p>
            <div className="onboardingOptions">
              {workbook.situations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === state.selectedSituationId ? "active" : ""}
                  onClick={() => onUpdate({ selectedSituationId: item.id, selectedSubSituations: [] })}
                >
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Choose the specific signals</h2>
            <p>Which of these best describe your context?</p>
            <div className="onboardingOptions">
              {selectedSituation?.examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  className={state.selectedSubSituations.includes(example) ? "active" : ""}
                  onClick={() => onToggleSubSituation(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2>Who is this best for</h2>
            <p>Choose the option that feels closest.</p>
            <div className="onboardingOptions">
              {[
                { value: "male", label: "For men" },
                { value: "female", label: "For women" },
                { value: "other", label: "I prefer a neutral version" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={state.selectedGender === item.value ? "active" : ""}
                  onClick={() =>
                    onUpdate({ selectedGender: item.value as OnboardingState["selectedGender"] })
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h2>We understand your context</h2>
            <p>
              {state.name
                ? `${state.name}, you are moving into a new chapter and reshaping your space.`
                : "It looks like you are moving into a new chapter and reshaping your space."}
            </p>
            <p>
              Remote work changes what home needs to do: it has to support both work and rest. Now
              is the time to shape a space that supports your rhythm and helps you focus.
            </p>
          </div>
        );
      case 6:
        return (
          <div>
            <h2>How it will work</h2>
            <div className="onboardingCards">
              <article>
                <strong>There will be questions</strong>
                <p>We will ask about your rhythm, goals, and how you live.</p>
              </article>
              <article>
                <strong>You can send photos</strong>
                <p>Show your current space and the details that matter to you.</p>
              </article>
              <article>
                <strong>You can record voice notes</strong>
                <p>Share however feels easier—text or voice.</p>
              </article>
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <h2>How to fill it out</h2>
            <p>Start at a specialty coffee shop and capture your first thoughts about home and your life.</p>
          </div>
        );
      case 8:
        return (
          <div>
            <h2>How to fill it out</h2>
            <p>
              On a weekend morning, relax in bed and imagine how you want home to work for you.
            </p>
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
