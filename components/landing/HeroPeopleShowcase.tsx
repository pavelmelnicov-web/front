"use client";

import Image from "next/image";

const heroProfile = {
  id: "creative-space",
  imageSrc: "/hero-people/profile-04.png",
  title: "Your character",
  theme: "olive",
} as const;

const heroWorkbookCards = [
  {
    id: "roles",
    label: "Roles",
    screenSrc: "/how-it-works/01.png?v=center01",
    positionClassName: "heroPeopleWorkbookCard--roles",
  },
  {
    id: "scenarios",
    label: "Scenarios",
    screenSrc: "/how-it-works/02.png?v=center01",
    positionClassName: "heroPeopleWorkbookCard--scenarios",
  },
  {
    id: "states",
    label: "States",
    screenSrc: "/how-it-works/03.png?v=center01",
    positionClassName: "heroPeopleWorkbookCard--states",
  },
  {
    id: "objects",
    label: "Objects",
    screenSrc: "/how-it-works/04.png?v=center01",
    positionClassName: "heroPeopleWorkbookCard--objects",
  },
] as const;

export function HeroPeopleShowcase() {
  console.log("[hero-people-showcase] Rendering single hero image", {
    profileId: heroProfile.id,
    imageSrc: heroProfile.imageSrc,
    workbookCardCount: heroWorkbookCards.length,
  });

  return (
    <div className="heroPeopleShowcase">
      <div aria-label="Person in a characterful home" className="heroPeopleStage" role="img">
        <article
          className={[
            "heroPeopleProfile",
            `heroPeopleProfile--${heroProfile.theme}`,
            "isActive",
          ].join(" ")}
        >
          <div className="heroPeopleBackdrop">
            <Image
              alt="Person standing in a characterful home interior"
              className="heroPeopleBackdropImage"
              fill
              onError={() => {
                console.error("[hero-people-showcase] Hero image failed to load", {
                  profileId: heroProfile.id,
                  imageSrc: heroProfile.imageSrc,
                });
              }}
              onLoad={() => {
                console.log("[hero-people-showcase] Hero image loaded", {
                  profileId: heroProfile.id,
                  imageSrc: heroProfile.imageSrc,
                });
              }}
              priority
              sizes="(max-width: 640px) 69vw, 430px"
              src={heroProfile.imageSrc}
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
                    alt={`${card.label} workbook screen`}
                    className="heroPeopleWorkbookPreviewImage"
                    fill
                    onError={() => {
                      console.error("[hero-people-showcase] Workbook card image failed to load", {
                        cardId: card.id,
                        screenSrc: card.screenSrc,
                      });
                    }}
                    onLoad={() => {
                      console.log("[hero-people-showcase] Workbook card image loaded", {
                        cardId: card.id,
                        screenSrc: card.screenSrc,
                      });
                    }}
                    sizes="(max-width: 640px) 28vw, 132px"
                    src={card.screenSrc}
                    unoptimized
                  />
                </div>
                <div className="heroPeopleWorkbookCopy">
                  <strong>{card.label}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
