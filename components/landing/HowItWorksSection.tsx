"use client";

import { useEffect, useState } from "react";

export type HowItWorksStep = {
  title: string;
  body: string;
};

type HowItWorksSectionProps = {
  steps: HowItWorksStep[];
  intervalMs?: number;
};

export function HowItWorksSection({ steps, intervalMs = 4800 }: HowItWorksSectionProps) {
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
        console.log("[how-it-works-section] Active step changed", {
          previousIndex: current,
          nextIndex: next,
          title: steps[next]?.title,
        });
        return next;
      });
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
      console.log("[how-it-works-section] Auto cycling stopped");
    };
  }, [intervalMs, reduceMotion, steps]);

  function handleStepSelect(index: number) {
    console.log("[how-it-works-section] Step selected manually", {
      index,
      title: steps[index]?.title,
    });
    setActiveIndex(index);
  }

  if (!steps.length) {
    console.warn("[how-it-works-section] No steps provided");
    return null;
  }

  const activeStep = steps[activeIndex] ?? steps[0];

  return (
    <div className="howLinkedLayout">
      <div className="howLinkedPhoneColumn" aria-hidden="true">
        <div className="iphone17ProMaxShadow" />
        <div className="iphone17ProMax">
          <div className="iphone17ProMaxAntenna iphone17ProMaxAntenna--top" />
          <div className="iphone17ProMaxAntenna iphone17ProMaxAntenna--bottom" />
          <div className="iphone17ProMaxButton iphone17ProMaxButton--action" />
          <div className="iphone17ProMaxButton iphone17ProMaxButton--volumeUp" />
          <div className="iphone17ProMaxButton iphone17ProMaxButton--volumeDown" />
          <div className="iphone17ProMaxButton iphone17ProMaxButton--power" />
          <div className="iphone17ProMaxBezel">
            <div className="iphone17ProMaxScreen">
              <div className="iphone17ProMaxIsland">
                <span className="iphone17ProMaxIslandSensor" />
                <span className="iphone17ProMaxIslandCamera" />
              </div>
              <div className="iphone17ProMaxStatus">
                <span>9:41</span>
                <span className="iphone17ProMaxStatusIcons" aria-hidden="true">
                  <span className="iphone17ProMaxSignal">
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="iphone17ProMaxWifi" />
                  <span className="iphone17ProMaxBattery">
                    <i />
                  </span>
                </span>
              </div>
              <div className="iphone17ProMaxScreens">
                {steps.map((step, index) => (
                  <article
                    className={index === activeIndex ? "iphone17ProMaxSlide isActive" : "iphone17ProMaxSlide"}
                    key={step.title}
                  >
                    <span className="iphone17ProMaxSlideIndex">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                    <div className="iphone17ProMaxSlideCard">
                      <span>Workbook step</span>
                      <strong>{step.title}</strong>
                    </div>
                  </article>
                ))}
              </div>
              <div className="iphone17ProMaxHomeIndicator" />
              <div className="iphone17ProMaxScreenGloss" />
            </div>
          </div>
          <div className="iphone17ProMaxFrameGloss" />
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
                <span className="howLinkedStepIndex">{String(index + 1).padStart(2, "0")}</span>
                <span className="howLinkedStepCopy">
                  <strong>{step.title}</strong>
                  <em>{step.body}</em>
                </span>
              </button>
            );
          })}
        </div>
        <article aria-live="polite" className="howLinkedActiveCopy">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <h3>{activeStep.title}</h3>
          <p>{activeStep.body}</p>
        </article>
      </div>
    </div>
  );
}
