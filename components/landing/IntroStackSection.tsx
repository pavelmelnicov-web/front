"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { INTRO_IMAGE_QUALITY, INTRO_SCROLL_STEP_VH, introStackCardVisuals } from "../../lib/intro-stack-cards";

type IntroItem = {
  title: string;
  body: string;
};

type IntroStackSectionProps = {
  items: IntroItem[];
};

type CardMotion = {
  opacity: number;
  scale: number;
  translateY: number;
  imageScale: number;
  zIndex: number;
  isActive: boolean;
};

const INTRO_CARD_ACCENTS = ["var(--accent)", "var(--sage)", "var(--blue)", "var(--rust)"] as const;

const MOTION = {
  enterPortion: 0.28,
  activeUntil: 0.74,
  exitPortion: 0.26,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOutQuint(value: number) {
  return 1 - Math.pow(1 - value, 5);
}

function getCardMotion(index: number, total: number, progress: number): CardMotion {
  const segment = 1 / total;
  const local = (progress - index * segment) / segment;

  if (local < 0) {
    return {
      opacity: 0,
      scale: 0.94,
      translateY: 52,
      imageScale: 1.03,
      zIndex: index,
      isActive: false,
    };
  }

  if (local <= 1) {
    const enterRaw =
      index === 0 ? clamp(1 - local * 0.12, 0, 1) : easeOutQuint(clamp(local / MOTION.enterPortion, 0, 1));
    const exitPrep = easeOutQuint(clamp((local - MOTION.activeUntil) / MOTION.exitPortion, 0, 1));
    const enter = enterRaw * (1 - exitPrep * 0.08);

    return {
      opacity: enter,
      scale: 0.94 + enter * 0.06 - exitPrep * 0.05,
      translateY: (1 - enter) * 44 - exitPrep * 16,
      imageScale: 1.02 - enter * 0.02 + exitPrep * 0.015,
      zIndex: 20 + index,
      isActive: local < MOTION.activeUntil,
    };
  }

  const past = local - 1;
  const depth = easeOutQuint(clamp(past, 0, 1));

  return {
    opacity: clamp(1 - depth * 0.78, 0.14, 1),
    scale: clamp(1 - depth * 0.09, 0.84, 1),
    translateY: -depth * 36,
      imageScale: 1.01 + depth * 0.02,
    zIndex: total - index,
    isActive: false,
  };
}

export function IntroStackSection({ items }: IntroStackSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const updateProgress = useCallback(() => {
    const node = sectionRef.current;
    if (!node) {
      console.warn("[intro-stack] Section ref is not available for scroll progress");
      return;
    }

    const rect = node.getBoundingClientRect();
    const viewport = window.innerHeight;
    const scrollable = node.offsetHeight - viewport;

    if (scrollable <= 0) {
      console.log("[intro-stack] Scrollable height is zero, pinning progress to 0", {
        offsetHeight: node.offsetHeight,
        viewport,
      });
      setProgress(0);
      return;
    }

    const distance = -rect.top;
    const nextProgress = clamp(distance / scrollable, 0, 1);

    setProgress((current) => {
      if (Math.abs(current - nextProgress) < 0.0008) {
        return current;
      }

      console.log("[intro-stack] Scroll progress updated", {
        progress: Number(nextProgress.toFixed(3)),
        distance: Math.round(distance),
        scrollable: Math.round(scrollable),
        scrollStepVh: INTRO_SCROLL_STEP_VH,
      });
      return nextProgress;
    });
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      const shouldReduce = media.matches;
      console.log("[intro-stack] Motion preference resolved", { reduceMotion: shouldReduce });
      setReduceMotion(shouldReduce);
    };

    applyPreference();
    media.addEventListener("change", applyPreference);

    return () => media.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      console.log("[intro-stack] Reduced motion enabled, skipping scroll listener");
      return;
    }

    console.log("[intro-stack] Attaching scroll listener", {
      itemCount: items.length,
      scrollStepVh: INTRO_SCROLL_STEP_VH,
    });
    updateProgress();

    let frame = 0;
    const onScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateProgress();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      console.log("[intro-stack] Detaching scroll listener");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [items.length, reduceMotion, updateProgress]);

  const activeIndex = reduceMotion
    ? items.length - 1
    : clamp(Math.floor(progress * items.length), 0, items.length - 1);

  return (
    <section
      className="introStackSection"
      ref={sectionRef}
      id="intro"
      style={
        {
          "--intro-stack-count": items.length,
          "--intro-scroll-step-vh": INTRO_SCROLL_STEP_VH,
        } as React.CSSProperties
      }
      aria-label="Why this workbook exists"
    >
      <div className="introStackSticky">
        <header className="introStackHeader">
          <p className="introStackEyebrow">Before you start</p>
          <h2 className="introStackTitle">Every answer opens a new way to live at home.</h2>
        </header>

        <div className="introStackStage" aria-live="polite">
          {items.map((item, index) => {
            const visual = introStackCardVisuals[index];
            const motion = reduceMotion
              ? {
                  opacity: 1,
                  scale: 1,
                  translateY: index * 14,
                  imageScale: 1,
                  zIndex: items.length - index,
                  isActive: index === items.length - 1,
                }
              : getCardMotion(index, items.length, progress);

            if (!visual) {
              console.warn("[intro-stack] Missing visual config for card", { index, title: item.title });
            }

            return (
              <article
                className={[
                  "introStackCard",
                  motion.isActive ? "isActive" : "",
                  index < activeIndex ? "isPast" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={item.title}
                style={
                  {
                    "--intro-card-accent": INTRO_CARD_ACCENTS[index % INTRO_CARD_ACCENTS.length],
                    opacity: motion.opacity,
                    transform: `translate3d(0, ${motion.translateY}px, 0) scale(${motion.scale})`,
                    zIndex: motion.zIndex,
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
                        transform: `scale3d(${motion.imageScale}, ${motion.imageScale}, 1)`,
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
