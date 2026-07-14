"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type HowItWorksStep = {
  title: string;
  body: string;
  screenSrc: string;
};

type HowItWorksSectionProps = {
  steps: HowItWorksStep[];
  intervalMs?: number;
};

export function HowItWorksSection({ steps, intervalMs = 2840 }: HowItWorksSectionProps) {
  const screenViewportRef = useRef<HTMLDivElement>(null);
  const screenScrollTimeoutRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      const shouldReduce = media.matches;
      console.log("[how-it-works-section] Motion preference resolved", {
        reduceMotion: shouldReduce,
      });
      setReduceMotion(shouldReduce);
    };

    applyPreference();
    media.addEventListener("change", applyPreference);

    return () => media.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (steps.length <= 1 || reduceMotion) {
      console.log("[how-it-works-section] Auto cycling disabled", {
        stepsCount: steps.length,
        reduceMotion,
      });
      return;
    }

    console.log("[how-it-works-section] Auto cycling started", {
      stepsCount: steps.length,
      intervalMs,
      activeIndex,
    });

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % steps.length;
        const viewport = screenViewportRef.current;

        console.log("[how-it-works-section] Active step changed", {
          previousIndex: current,
          nextIndex: next,
          title: steps[next]?.title,
          viewportWidth: viewport?.clientWidth ?? 0,
        });

        if (viewport) {
          viewport.scrollTo({
            left: next * viewport.clientWidth,
            behavior: "smooth",
          });
        } else {
          console.warn("[how-it-works-section] Automatic screen scroll skipped because viewport is missing");
        }

        return next;
      });
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
      console.log("[how-it-works-section] Auto cycling stopped");
    };
  }, [intervalMs, reduceMotion, steps]);

  useEffect(() => {
    return () => {
      if (screenScrollTimeoutRef.current !== null) {
        window.clearTimeout(screenScrollTimeoutRef.current);
        console.log("[how-it-works-section] Screen scroll synchronization timeout cleared");
      }
    };
  }, []);

  function handleStepSelect(index: number) {
    const viewport = screenViewportRef.current;

    console.log("[how-it-works-section] Step selected manually", {
      index,
      title: steps[index]?.title,
      viewportWidth: viewport?.clientWidth ?? 0,
    });
    setActiveIndex(index);

    if (!viewport) {
      console.warn("[how-it-works-section] Manual screen scroll skipped because viewport is missing");
      return;
    }

    viewport.scrollTo({
      left: index * viewport.clientWidth,
      behavior: "smooth",
    });
  }

  function handleScreenScroll(event: React.UIEvent<HTMLDivElement>) {
    const viewport = event.currentTarget;

    if (screenScrollTimeoutRef.current !== null) {
      window.clearTimeout(screenScrollTimeoutRef.current);
    }

    screenScrollTimeoutRef.current = window.setTimeout(() => {
      const width = viewport.clientWidth;
      if (width <= 0) {
        console.warn("[how-it-works-section] Screen scroll sync ignored because viewport width is zero");
        return;
      }

      const nextIndex = Math.max(
        0,
        Math.min(steps.length - 1, Math.round(viewport.scrollLeft / width)),
      );

      console.log("[how-it-works-section] Native phone swipe settled", {
        scrollLeft: Math.round(viewport.scrollLeft),
        viewportWidth: width,
        previousIndex: activeIndex,
        nextIndex,
        title: steps[nextIndex]?.title,
      });

      setActiveIndex(nextIndex);
    }, 90);
  }

  if (!steps.length) {
    console.warn("[how-it-works-section] No steps provided");
    return null;
  }

  console.log("[how-it-works-section] Rendering phone screens", {
    stepsCount: steps.length,
    screenSources: steps.map((step) => step.screenSrc),
    activeIndex,
  });

  return (
    <div className="howLinkedLayout">
      <div className="howLinkedPhoneColumn">
        <div className="iphone17ProMax iphone17ProMax--flat">
          <div className="iphone17ProMaxScreen iphone17ProMaxScreen--appPreview">
            <div
              aria-label="Workbook screens"
              className="iphone17ProMaxScreens"
              onScroll={handleScreenScroll}
              ref={screenViewportRef}
              role="region"
            >
              {steps.map((step, index) => (
                <article
                  className={index === activeIndex ? "iphone17ProMaxSlide isActive" : "iphone17ProMaxSlide"}
                  key={step.title}
                >
                    <Image
                      alt={step.title}
                      className="iphone17ProMaxSlideImage"
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 88vw, 300px"
                      src={step.screenSrc}
                      unoptimized
                    />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="howLinkedStepsColumn">
        <div className="howLinkedStepList" role="tablist" aria-label="How it works steps">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                aria-selected={isActive}
                className={isActive ? "howLinkedStep isActive" : "howLinkedStep"}
                key={step.title}
                onClick={() => handleStepSelect(index)}
                role="tab"
                type="button"
              >
                <span className="howLinkedStepIndex">step {index + 1}</span>
                <span className="howLinkedStepCopy">
                  <strong>{step.title}</strong>
                  <em>{step.body}</em>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
