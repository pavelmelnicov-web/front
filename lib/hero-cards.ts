/**
 * Hero floating cards on the landing page.
 * Edit titles, descriptions, colors, and progress here.
 */

/** Set to true to show cards 01–04 on the hero image again. */
export const heroFloatCardsVisible = false;

export type HeroCardPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type HeroCardVariant = "progress" | "plan" | "swatches" | "grid";

export type HeroFloatCard = {
  id: string;
  position: HeroCardPosition;
  number?: string;
  title: string;
  description?: string;
  variant: HeroCardVariant;
  /** Used when variant is "progress". How many of 5 segments are filled. */
  progressFilled?: number;
  /** Used when variant is "swatches". */
  swatches?: string[];
  /** Optional image path for swatches or grid cards, e.g. "/hero-card-chair.jpg". */
  image?: string;
};

export const heroFloatCards: HeroFloatCard[] = [
  {
    id: "understand-yourself",
    position: "top-left",
    number: "01",
    title: "Understand yourself",
    description: "Name your roles, habits, and real needs before choosing anything.",
    variant: "progress",
    progressFilled: 3,
  },
  {
    id: "plan-mindfully",
    position: "top-right",
    number: "02",
    title: "Plan mindfully",
    description: "Map scenarios, zones, and flow before you move a single object.",
    variant: "plan",
  },
  {
    id: "choose-with-meaning",
    position: "bottom-left",
    number: "03",
    title: "Choose with meaning",
    description: "Pick materials, colors, and objects that support the life you want.",
    variant: "swatches",
    swatches: ["#ddd5c8", "#c8bfb0", "#9a9488", "#2f2f2d"],
  },
  {
    id: "find-your-style",
    position: "bottom-right",
    number: "04",
    title: "Find your style",
    description: "Collect references that feel like you—not like a mood board template.",
    variant: "grid",
  },
];

export const heroCardPositionClass: Record<HeroCardPosition, string> = {
  "top-left": "heroFloatCard--tl",
  "top-right": "heroFloatCard--tr",
  "bottom-left": "heroFloatCard--bl",
  "bottom-right": "heroFloatCard--br",
};
