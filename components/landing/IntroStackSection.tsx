"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { INTRO_IMAGE_QUALITY, introStackCardVisuals } from "../../lib/intro-stack-cards";

type IntroItem = {
  title: string;
  body: string;
};

type IntroStackSectionProps = {
  items: IntroItem[];
};

const INTRO_CARD_ACCENTS = ["var(--accent)", "var(--sage)", "var(--blue)", "var(--rust)"] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function IntroStackSection({ items }: IntroStackSectionProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    console.log("[intro-stack] Native horizontal swipe initialized", {
      itemCount: items.length,
    });

    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
        console.log("[intro-stack] Swipe synchronization timeout cleared");
      }
    };
  }, [items.length]);

  function handleStageScroll(event: React.UIEvent<HTMLDivElement>) {
    const stage = event.currentTarget;

    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      const firstCard = stage.querySelector<HTMLElement>(".introStackCard");
      if (!firstCard) {
        console.warn("[intro-stack] Swipe synchronization skipped because no card was found");
        return;
      }

      const cardStep = firstCard.offsetWidth + 12;
      const nextIndex = clamp(Math.round(stage.scrollLeft / cardStep), 0, items.length - 1);

      console.log("[intro-stack] Native card swipe settled", {
        previousIndex: activeIndex,
        nextIndex,
        scrollLeft: Math.round(stage.scrollLeft),
        cardWidth: firstCard.offsetWidth,
        cardStep,
      });
      setActiveIndex(nextIndex);
    }, 90);
  }

  return (
    <section
      className="introStackSection"
      id="intro"
      style={
        {
          "--intro-stack-count": items.length,
        } as React.CSSProperties
      }
      aria-label="Why this workbook exists"
    >
      <div className="introStackSticky">
        <header className="introStackHeader">
          <p className="introStackEyebrow">Before you start</p>
          <h2 className="introStackTitle">Every answer opens a new way to live at home.</h2>
        </header>

        <div
          aria-label="Reasons to start the workbook"
          className="introStackStage"
          onScroll={handleStageScroll}
          ref={stageRef}
          role="list"
        >
          {items.map((item, index) => {
            const visual = introStackCardVisuals[index];

            if (!visual) {
              console.warn("[intro-stack] Missing visual config for card", { index, title: item.title });
            }

            return (
              <article
                className={`introStackCard${index === activeIndex ? " isActive" : ""}`}
                key={item.title}
                role="listitem"
                style={
                  {
                    "--intro-card-accent": INTRO_CARD_ACCENTS[index % INTRO_CARD_ACCENTS.length],
                  } as React.CSSProperties
                }
              >
                <div className="introStackCardMedia" aria-hidden="true">
                  {visual ? (
                    <Image
                      src={visual.image}
                      alt=""
                      fill
                      priority={index === 0}
                      quality={INTRO_IMAGE_QUALITY}
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1200px) 92vw, 1200px"
                      className="introStackCardImage"
                      style={{
                        objectPosition: visual.objectPosition,
                      }}
                      onLoad={() => {
                        console.log("[intro-stack] Card image loaded", {
                          index,
                          src: visual.image,
                          quality: INTRO_IMAGE_QUALITY,
                        });
                      }}
                    />
                  ) : null}
                  <div className="introStackCardScrim" />
                  <div className="introStackCardGlow" />
                </div>

                <div className="introStackCardContent">
                  <span className="introStackCardIndex">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="introStackProgress" aria-hidden="true">
          {items.map((item, index) => (
            <span
              className={index <= activeIndex ? "isFilled" : ""}
              key={`progress-${item.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
