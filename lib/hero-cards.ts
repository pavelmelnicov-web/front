/**
 * Hero floating cards on the landing page.
 * Edit titles, descriptions, colors, and progress here.
 */

/** Set to true to show cards 01–04 on the hero image again. */
export const heroFloatCardsVisible = true;

export type HeroCardPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type HeroCardVariant = "quiz" | "plan" | "states" | "objects";

export type HeroGridImage = {
  id: string;
  src: string;
};

export type HeroFloatCard = {
  id: string;
  position: HeroCardPosition;
  number?: string;
  title: string;
  description?: string;
  variant: HeroCardVariant;
  /** Single cover image for quiz, plan, and states cards. */
  image?: string;
  /** 2x2 object grid for card 04. */
  gridImages?: HeroGridImage[];
};

export const heroFloatCards: HeroFloatCard[] = [
  {
    id: "understand-yourself",
    position: "top-left",
    number: "01",
    title: "Understand yourself",
    description: "Start with a short psychological quiz about how you live at home.",
    variant: "quiz",
    image: "/hero-cards/card-01-quiz.jpg",
  },
  {
    id: "plan-mindfully",
    position: "top-right",
    number: "02",
    title: "Plan mindfully",
    description: "Map zones for work, rest, sleep, and everyday rituals.",
    variant: "plan",
    image: "/hero-cards/card-02-plan.jpg",
  },
  {
    id: "choose-with-meaning",
    position: "bottom-left",
    number: "03",
    title: "Choose states",
    description: "Name the feelings each room should support before you change anything.",
    variant: "states",
    image: "/hero-cards/card-03-states.jpg",
  },
  {
    id: "find-your-style",
    position: "bottom-right",
    number: "04",
    title: "Pick your objects",
    description: "Choose items that activate the life you want in your space.",
    variant: "objects",
    gridImages: [
      { id: "ball", src: "/hero-cards/card-04-ball.jpg" },
      { id: "coffee", src: "/hero-cards/card-04-coffee.jpg" },
      { id: "sneaker", src: "/hero-cards/card-04-sneaker.jpg" },
      { id: "candle", src: "/hero-cards/card-04-candle.jpg" },
    ],
  },
];

export const heroCardPositionClass: Record<HeroCardPosition, string> = {
  "top-left": "heroFloatCardOrbit--tl",
  "top-right": "heroFloatCardOrbit--tr",
  "bottom-left": "heroFloatCardOrbit--bl",
  "bottom-right": "heroFloatCardOrbit--br",
};

export type HeroCardOrbitDirection = "cw" | "ccw";

export type HeroCardOrbitMotion = {
  duration: string;
  delay: string;
  radius: string;
  direction: HeroCardOrbitDirection;
  bobDuration: string;
};

/** Per-card orbital motion tuned to feel like Cosmos hero drift. */
export const heroCardOrbitMotion: Record<string, HeroCardOrbitMotion> = {
  "understand-yourself": {
    duration: "24s",
    delay: "0s",
    radius: "clamp(16px, 3.6vw, 28px)",
    direction: "cw",
    bobDuration: "7s",
  },
  "plan-mindfully": {
    duration: "28s",
    delay: "-6s",
    radius: "clamp(18px, 4vw, 32px)",
    direction: "ccw",
    bobDuration: "8.5s",
  },
  "choose-with-meaning": {
    duration: "26s",
    delay: "-11s",
    radius: "clamp(14px, 3.2vw, 26px)",
    direction: "ccw",
    bobDuration: "6.5s",
  },
  "find-your-style": {
    duration: "30s",
    delay: "-4s",
    radius: "clamp(20px, 4.4vw, 34px)",
    direction: "cw",
    bobDuration: "9s",
  },
};
