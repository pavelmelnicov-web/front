"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const HERO_PROFILE_INTERVAL_MS = 5200;

const heroProfiles = [
  {
    id: "your-space",
    imageSrc: "/hero-visual.jpg",
    imageClassName: "heroPeoplePortraitImage--full",
    eyebrow: "Your roles",
    title: "Your space",
    theme: "blue",
  },
  {
    id: "mark",
    imageSrc: "/testimonials/mark-r-avatar.png",
    imageClassName: "",
    eyebrow: "Your scenarios",
    title: "Your rhythm",
    theme: "sage",
  },
  {
    id: "nika",
    imageSrc: "/testimonials/nika-s-avatar.png",
    imageClassName: "",
    eyebrow: "Your objects",
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
        console.log("[hero-people-showcase] Active profile changed automatically", {
          previousProfileId: heroProfiles[currentIndex].id,
          nextProfileId: heroProfiles[nextIndex].id,
        });
        return nextIndex;
      });
    }, HERO_PROFILE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      console.log("[hero-people-showcase] Automatic profile cycling stopped");
    };
  }, [reduceMotion]);

  function selectProfile(index: number) {
    console.log("[hero-people-showcase] Profile selected manually", {
      previousProfileId: heroProfiles[activeProfileIndex].id,
      nextProfileId: heroProfiles[index].id,
      nextProfileIndex: index,
    });
    setActiveProfileIndex(index);
  }

  return (
    <div className="heroPeopleShowcase">
      <div className="heroPeopleStage">
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
                <span>{profile.eyebrow}</span>
                <strong>{profile.title}</strong>
              </div>

              <div className="heroPeoplePortrait">
                <Image
                  alt=""
                  className={["heroPeoplePortraitImage", profile.imageClassName]
                    .filter(Boolean)
                    .join(" ")}
                  fill
                  onError={() => {
                    console.error("[hero-people-showcase] Portrait failed to load", {
                      profileId: profile.id,
                      imageSrc: profile.imageSrc,
                    });
                  }}
                  onLoad={() => {
                    console.log("[hero-people-showcase] Portrait loaded", {
                      profileId: profile.id,
                      imageSrc: profile.imageSrc,
                    });
                  }}
                  priority={index === 0}
                  sizes="(max-width: 640px) 44vw, 230px"
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
