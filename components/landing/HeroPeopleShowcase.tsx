"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const HERO_PROFILE_INTERVAL_MS = 5200;

const heroProfiles = [
  {
    id: "creative-space",
    imageSrc: "/hero-people/profile-04.png",
    title: "Your character",
    theme: "olive",
  },
  {
    id: "your-space",
    imageSrc: "/hero-people/profile-01.png",
    title: "Your space",
    theme: "blue",
  },
  {
    id: "mark",
    imageSrc: "/hero-people/profile-02.png",
    title: "Your rhythm",
    theme: "sage",
  },
  {
    id: "nika",
    imageSrc: "/hero-people/profile-03.png",
    title: "Your states",
    theme: "terracotta",
  },
] as const;

const heroWorkbookCards = [
  {
    id: "roles",
    label: "Roles",
    description: "Worker · Partner · Host",
    screenSrc: "/how-it-works/01.png",
    positionClassName: "heroPeopleWorkbookCard--roles",
  },
  {
    id: "scenarios",
    label: "Scenarios",
    description: "Work · Rest · Recharge",
    screenSrc: "/how-it-works/02.png",
    positionClassName: "heroPeopleWorkbookCard--scenarios",
  },
  {
    id: "objects",
    label: "Interior objects",
    description: "Light · Chair · Art",
    screenSrc: "/how-it-works/04.png",
    positionClassName: "heroPeopleWorkbookCard--objects",
  },
] as const;

export function HeroPeopleShowcase() {
  const stageRef = useRef<HTMLDivElement>(null);
  const stageScrollTimeoutRef = useRef<number | null>(null);
  const [activeProfileIndex, setActiveProfileIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      console.log("[hero-people-showcase] Motion preference resolved", {
        reduceMotion: media.matches,
      });
      setReduceMotion(media.matches);
    };

    applyPreference();
    media.addEventListener("change", applyPreference);

    return () => {
      media.removeEventListener("change", applyPreference);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      console.log("[hero-people-showcase] Automatic profile cycling disabled");
      return;
    }

    console.log("[hero-people-showcase] Automatic profile cycling started", {
      intervalMs: HERO_PROFILE_INTERVAL_MS,
      profileCount: heroProfiles.length,
    });

    const intervalId = window.setInterval(() => {
      setActiveProfileIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % heroProfiles.length;
        const stage = stageRef.current;

        console.log("[hero-people-showcase] Active profile changed automatically", {
          previousProfileId: heroProfiles[currentIndex].id,
          nextProfileId: heroProfiles[nextIndex].id,
          stageWidth: stage?.clientWidth ?? 0,
        });

        if (stage) {
          stage.scrollTo({
            left: nextIndex * stage.clientWidth,
            behavior: "smooth",
          });
        } else {
          console.warn("[hero-people-showcase] Automatic profile scroll skipped because stage is missing");
        }

        return nextIndex;
      });
    }, HERO_PROFILE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      console.log("[hero-people-showcase] Automatic profile cycling stopped");
    };
  }, [reduceMotion]);

  useEffect(() => {
    return () => {
      if (stageScrollTimeoutRef.current !== null) {
        window.clearTimeout(stageScrollTimeoutRef.current);
        console.log("[hero-people-showcase] Stage scroll synchronization timeout cleared");
      }
    };
  }, []);

  function selectProfile(index: number) {
    const stage = stageRef.current;

    console.log("[hero-people-showcase] Profile selected manually", {
      previousProfileId: heroProfiles[activeProfileIndex].id,
      nextProfileId: heroProfiles[index].id,
      nextProfileIndex: index,
      stageWidth: stage?.clientWidth ?? 0,
    });
    setActiveProfileIndex(index);

    if (!stage) {
      console.warn("[hero-people-showcase] Manual profile scroll skipped because stage is missing");
      return;
    }

    stage.scrollTo({
      left: index * stage.clientWidth,
      behavior: "smooth",
    });
  }

  function handleStageScroll(event: React.UIEvent<HTMLDivElement>) {
    const stage = event.currentTarget;

    if (stageScrollTimeoutRef.current !== null) {
      window.clearTimeout(stageScrollTimeoutRef.current);
    }

    stageScrollTimeoutRef.current = window.setTimeout(() => {
      const width = stage.clientWidth;
      if (width <= 0) {
        console.warn("[hero-people-showcase] Stage scroll sync ignored because width is zero");
        return;
      }

      const nextIndex = Math.max(
        0,
        Math.min(heroProfiles.length - 1, Math.round(stage.scrollLeft / width)),
      );

      console.log("[hero-people-showcase] Native profile swipe settled", {
        scrollLeft: Math.round(stage.scrollLeft),
        stageWidth: width,
        previousProfileId: heroProfiles[activeProfileIndex].id,
        nextProfileId: heroProfiles[nextIndex].id,
        nextProfileIndex: nextIndex,
      });

      setActiveProfileIndex(nextIndex);
    }, 90);
  }

  return (
    <div className="heroPeopleShowcase">
      <div
        aria-label="People and their spaces"
        className="heroPeopleStage"
        onScroll={handleStageScroll}
        ref={stageRef}
        role="region"
      >
        {heroProfiles.map((profile, index) => {
          const isActive = index === activeProfileIndex;

          return (
            <article
              aria-hidden={!isActive}
              className={[
                "heroPeopleProfile",
                `heroPeopleProfile--${profile.theme}`,
                isActive ? "isActive" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={profile.id}
            >
              <div className="heroPeopleBackdrop">
                <Image
                  alt=""
                  className="heroPeopleBackdropImage"
                  fill
                  onError={() => {
                    console.error("[hero-people-showcase] Profile image failed to load", {
                      profileId: profile.id,
                      imageSrc: profile.imageSrc,
                    });
                  }}
                  onLoad={() => {
                    console.log("[hero-people-showcase] Profile image loaded", {
                      profileId: profile.id,
                      imageSrc: profile.imageSrc,
                    });
                  }}
                  priority={index === 0}
                  sizes="(max-width: 640px) 69vw, 430px"
                  src={profile.imageSrc}
                  unoptimized
                />
              </div>

              <div className="heroPeopleWorkbookCards">
                {heroWorkbookCards.map((card, cardIndex) => (
                  <div
                    className={[
                      "heroPeopleWorkbookCard",
                      card.positionClassName,
                      `heroPeopleWorkbookCard--delay${cardIndex + 1}`,
                    ].join(" ")}
                    key={card.id}
                  >
                    <div className="heroPeopleWorkbookPreview">
                      <Image
                        alt=""
                        className="heroPeopleWorkbookPreviewImage"
                        fill
                        onError={() => {
                          console.error("[hero-people-showcase] Workbook preview failed to load", {
                            cardId: card.id,
                            screenSrc: card.screenSrc,
                          });
                        }}
                        onLoad={() => {
                          console.log("[hero-people-showcase] Workbook preview loaded", {
                            cardId: card.id,
                            screenSrc: card.screenSrc,
                          });
                        }}
                        sizes="(max-width: 640px) 28vw, 150px"
                        src={card.screenSrc}
                        unoptimized
                      />
                    </div>
                    <div className="heroPeopleWorkbookCopy">
                      <strong>{card.label}</strong>
                      <span>{card.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className="heroPeoplePagination" aria-label="Choose a story" role="tablist">
        {heroProfiles.map((profile, index) => (
          <button
            aria-label={`Show ${profile.title}`}
            aria-selected={index === activeProfileIndex}
            className={index === activeProfileIndex ? "isActive" : ""}
            key={profile.id}
            onClick={() => selectProfile(index)}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
