import type { ChatMessage, CommunityPost, Workbook } from "./api";

export const fallbackWorkbook: Workbook = {
  brand: "Space, Self.",
  tagline: "Design a home that activates the life you want.",
  headline: "A digital workbook for building a home environment that works for you",
  method: "Roles -> Scenarios -> States -> Objects -> New life",
  intro: [
    {
      title: "We pick other people's pictures—and lose ourselves",
      body: "Beautiful mood boards inspire, but they do not answer the question of how you actually want to live.",
    },
    {
      title: "You do not always need a renovation",
      body: "Sometimes it is enough to edit what you own, rethink storage, and see your home with fresh eyes.",
    },
    {
      title: "A good interior starts with understanding yourself",
      body: "It is not only about style and materials—it is about rhythm, roles, habits, and real needs.",
    },
    {
      title: "Home is not a place—home is a feeling",
      body: "The world changes fast, we move often, and we think we miss a place. But the feeling of home can be built wherever you are, with the people you are with.",
    },
  ],
  situations: [
    {
      id: "new-stage",
      title: "I am moving or starting a new chapter",
      description: "The old space no longer fits.",
      examples: ["new apartment", "remote work", "relocation"],
    },
    {
      id: "self-expression",
      title: "I want my space to reflect me",
      description: "Home should speak about you and support the life you are building.",
      examples: ["home content", "guests", "self-expression"],
    },
    {
      id: "renovation-fear",
      title: "I want a renovation but fear getting it wrong",
      description: "You want clarity on what you actually need before spending big.",
      examples: ["style", "needs", "outcome"],
    },
    {
      id: "no-designer-budget",
      title: "I do not have budget for a designer",
      description: "You need a clear way to start on your own.",
      examples: ["no project", "no renovation", "start now"],
    },
  ],
  steps: [
    {
      id: "roles",
      title: "Roles",
      question: "Who are you now—and who do you want to be at home?",
      hint: "Name the roles your space should support.",
    },
    {
      id: "scenarios",
      title: "Scenarios",
      question: "Which life scenarios should happen here?",
      hint: "Work, rest, guests, solitude, creativity, recovery.",
    },
    {
      id: "states",
      title: "States",
      question: "What do you want to feel more often?",
      hint: "Calm, focus, lightness, energy, steadiness.",
    },
    {
      id: "objects",
      title: "Objects",
      question: "What in the environment helps activate those states?",
      hint: "Light, materials, storage, desk, chair, plants, order.",
    },
    {
      id: "plan",
      title: "Plan",
      question: "What 3 changes can you make in the next two weeks?",
      hint: "Start with small actions that immediately change how home feels.",
    },
  ],
  versions: [
    {
      id: "system",
      title: "role -> action -> outcome",
      audience: "For people who start with goals and efficiency.",
    },
    {
      id: "atmosphere",
      title: "state -> atmosphere -> experience",
      audience: "For people who start with feelings and self-expression.",
    },
  ],
  community: [
    "Blog of someone who reshaped their space",
    "Photos of people who look like their apartments",
    "Quiz: guess someone's job from their home",
  ],
};

export const fallbackPosts: CommunityPost[] = [
  {
    id: "post-1",
    author: "Anna",
    title: "From storage-room living room to a place for friends",
    excerpt: "I removed visual noise and gave the table back its role as the center of the home.",
  },
  {
    id: "post-2",
    author: "Mark",
    title: "A work zone that does not eat the bedroom",
    excerpt: "I separated light scenarios and stopped living inside every deadline.",
  },
  {
    id: "post-3",
    author: "Nika",
    title: "My home started speaking for me",
    excerpt: "Marker objects appeared: ceramics, books, and a spot for flowers.",
  },
];

export const fallbackChat: ChatMessage[] = [
  {
    id: "local-1",
    author: "Space, Self.",
    message: "Show us one thing you changed at home today.",
    created_at: new Date().toISOString(),
  },
];
