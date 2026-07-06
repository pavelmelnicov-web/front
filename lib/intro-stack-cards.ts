/**
 * Background images for intro stack cards (second landing screen).
 * Edit paths and focal points here.
 */

export type IntroStackCardVisual = {
  id: string;
  image: string;
  objectPosition: string;
};

export const INTRO_SCROLL_STEP_VH = 128;

/** Request max sharpness for intro card photos (matches hero settings). */
export const INTRO_IMAGE_QUALITY = 100;

export const introStackCardVisuals: IntroStackCardVisual[] = [
  {
    id: "intro-01",
    image: "/intro/card-01.jpg",
    objectPosition: "center 42%",
  },
  {
    id: "intro-02",
    image: "/intro/card-02.jpg",
    objectPosition: "center 38%",
  },
  {
    id: "intro-03",
    image: "/intro/card-03.jpg",
    objectPosition: "center 46%",
  },
  {
    id: "intro-04",
    image: "/intro/card-04.jpg",
    objectPosition: "center 40%",
  },
];
