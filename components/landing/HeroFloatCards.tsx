import Image from "next/image";
import {
  heroCardPositionClass,
  heroFloatCards,
  heroFloatCardsVisible,
  type HeroFloatCard,
} from "../../lib/hero-cards";

function HeroCardVisual({ card }: { card: HeroFloatCard }) {
  if (card.variant === "progress") {
    const filled = card.progressFilled ?? 3;

    return (
      <div className="heroFloatProgress" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index < filled ? undefined : "isMuted"} />
        ))}
      </div>
    );
  }

  if (card.variant === "plan") {
    return (
      <div className="heroFloatPlan" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (card.variant === "swatches") {
    return (
      <>
        {card.image ? (
          <div className="heroFloatThumb">
            <Image src={card.image} alt="" fill sizes="168px" className="heroFloatThumbImage" />
          </div>
        ) : (
          <div className="heroFloatThumb" aria-hidden="true" />
        )}
        <div className="heroFloatSwatches" aria-hidden="true">
          {(card.swatches ?? []).map((color) => (
            <span key={color} style={{ background: color }} />
          ))}
        </div>
      </>
    );
  }

  if (card.image) {
    return (
      <div className="heroFloatGrid heroFloatGrid--image">
        <Image src={card.image} alt="" fill sizes="168px" className="heroFloatGridImage" />
      </div>
    );
  }

  return (
    <div className="heroFloatGrid" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

export function HeroFloatCards() {
  if (!heroFloatCardsVisible) {
    return null;
  }

  return (
    <div className="heroFloatCards">
      {heroFloatCards.map((card) => (
        <article
          key={card.id}
          className={`heroFloatCard ${heroCardPositionClass[card.position]} heroFloatCard--${card.variant}`}
          data-hero-card={card.id}
        >
          {card.number ? <span className="heroFloatCardNumber">{card.number}</span> : null}
          <h2>{card.title}</h2>
          {card.description ? <p>{card.description}</p> : null}
          <HeroCardVisual card={card} />
        </article>
      ))}
    </div>
  );
}
