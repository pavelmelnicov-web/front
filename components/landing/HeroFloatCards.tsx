"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  heroCardOrbitMotion,
  heroCardPositionClass,
  heroFloatCards,
  heroFloatCardsVisible,
  type HeroFloatCard,
} from "../../lib/hero-cards";

const HERO_CARD_IMAGE_QUALITY = 100;

type PointerOffset = {
  x: number;
  y: number;
};

function HeroCardVisual({ card }: { card: HeroFloatCard }) {
  if (card.variant === "objects") {
    const items = card.gridImages ?? [];

    if (!items.length) {
      console.warn("[hero-float-cards] Objects card is missing grid images", { cardId: card.id });
      return null;
    }

    return (
      <div className="heroFloatObjects" aria-hidden="true">
        {items.map((item) => (
          <div className="heroFloatObjectCell" key={item.id}>
            <Image
              src={item.src}
              alt=""
              fill
              sizes="84px"
              quality={HERO_CARD_IMAGE_QUALITY}
              unoptimized
              className="heroFloatObjectImage"
              onLoad={() => {
                console.log("[hero-float-cards] Object image loaded", {
                  cardId: card.id,
                  objectId: item.id,
                  src: item.src,
                });
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!card.image) {
    console.warn("[hero-float-cards] Cover image is missing", {
      cardId: card.id,
      variant: card.variant,
    });
    return null;
  }

  return (
    <div className={`heroFloatCover heroFloatCover--${card.variant}`} aria-hidden="true">
      <Image
        src={card.image}
        alt=""
        fill
        sizes="(max-width: 640px) 34vw, 180px"
        quality={HERO_CARD_IMAGE_QUALITY}
        unoptimized
        className="heroFloatCoverImage"
        onLoad={() => {
          console.log("[hero-float-cards] Cover image loaded", {
            cardId: card.id,
            variant: card.variant,
            src: card.image,
          });
        }}
      />
    </div>
  );
}

export function HeroFloatCards() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [pointerOffset, setPointerOffset] = useState<PointerOffset>({ x: 0, y: 0 });
  const [reduceMotion, setReduceMotion] = useState(false);

  const updatePointerOffset = useCallback((clientX: number, clientY: number) => {
    const field = fieldRef.current;
    if (!field) {
      console.warn("[hero-float-cards] Orbit field ref is not available for pointer tracking");
      return;
    }

    const rect = field.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normalizedX = (clientX - centerX) / (rect.width / 2);
    const normalizedY = (clientY - centerY) / (rect.height / 2);

    const nextOffset = {
      x: Math.max(-1, Math.min(1, normalizedX)) * 14,
      y: Math.max(-1, Math.min(1, normalizedY)) * 10,
    };

    setPointerOffset((current) => {
      if (Math.abs(current.x - nextOffset.x) < 0.2 && Math.abs(current.y - nextOffset.y) < 0.2) {
        return current;
      }

      console.log("[hero-float-cards] Pointer parallax updated", {
        x: Number(nextOffset.x.toFixed(2)),
        y: Number(nextOffset.y.toFixed(2)),
      });
      return nextOffset;
    });
  }, []);

  useEffect(() => {
    if (!heroFloatCardsVisible) {
      console.log("[hero-float-cards] Cards are hidden by config flag");
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      const shouldReduce = media.matches;
      console.log("[hero-float-cards] Motion preference resolved", { reduceMotion: shouldReduce });
      setReduceMotion(shouldReduce);
    };

    applyPreference();
    media.addEventListener("change", applyPreference);

    console.log("[hero-float-cards] Orbital cards mounted", { count: heroFloatCards.length });

    return () => {
      console.log("[hero-float-cards] Orbital cards unmounted");
      media.removeEventListener("change", applyPreference);
    };
  }, []);

  useEffect(() => {
    if (!heroFloatCardsVisible || reduceMotion) {
      console.log("[hero-float-cards] Pointer parallax disabled", { reduceMotion });
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      updatePointerOffset(event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
      console.log("[hero-float-cards] Pointer left hero field, resetting parallax");
      setPointerOffset({ x: 0, y: 0 });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [reduceMotion, updatePointerOffset]);

  if (!heroFloatCardsVisible) {
    return null;
  }

  return (
    <div
      className="heroFloatCards"
      ref={fieldRef}
      style={
        reduceMotion
          ? undefined
          : ({
              "--hero-parallax-x": `${pointerOffset.x}px`,
              "--hero-parallax-y": `${pointerOffset.y}px`,
            } as React.CSSProperties)
      }
    >
      {heroFloatCards.map((card) => {
        const motion = heroCardOrbitMotion[card.id];

        if (!motion) {
          console.warn("[hero-float-cards] Missing orbit motion config", { cardId: card.id });
        }

        return (
          <div
            className={[
              "heroFloatCardOrbit",
              heroCardPositionClass[card.position],
              motion ? `heroFloatCardOrbit--${motion.direction}` : "",
              reduceMotion ? "isStatic" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-hero-card-orbit={card.id}
            key={card.id}
            style={
              motion
                ? ({
                    "--orbit-duration": motion.duration,
                    "--orbit-delay": motion.delay,
                    "--orbit-radius": motion.radius,
                    "--bob-duration": motion.bobDuration,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <article
              className={`heroFloatCard heroFloatCard--${card.variant}`}
              data-hero-card={card.id}
            >
              {card.number ? <span className="heroFloatCardNumber">{card.number}</span> : null}
              <h2>{card.title}</h2>
              {card.description ? <p>{card.description}</p> : null}
              <HeroCardVisual card={card} />
            </article>
          </div>
        );
      })}
    </div>
  );
}
