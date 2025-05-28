// src/data/quizQuestions.js

export const questions = [
  {
    id: 1,
    text: "How committed are you to being a plant parent?",
    type: "multiple",
    options: [
      { text: "Not at all, I am a plant assassin.", tags: ["plant_assassin"] },
      { text: "I will occasionally remember they exist.", tags: ["low_maintenance"] },
      { text: "100%, that's my leafy little baby!", tags: ["high_maintenance"] },
    ],
  },
  {
    id: 2,
    text: "Where will your plant live?",
    type: "multiple",
    options: [
      { text: "Bright and airy windowsill.", tags: ["bright"] },
      { text: "Shady sad corner of death.", tags: ["shady"] },
      { text: "A bookshelf, purely for the vibes.", tags: ["no_fuss"] },
    ],
  },
  {
    id: 3,
    text: "Do you even like plants?",
    type: "slider",
    range: [
      { label: "Honestly, no.", tags: ["plant_assassin"] },
      { label: "I don't know, it's a plant?", tags: ["passive"] },
      { label: "Of course!", tags: ["confident"] },
    ],
  },
  {
    id: 4,
    text: "What's your personal aesthetic?",
    type: "multiple",
    options: [
      { text: "Cute and fun! Matching sets and matcha lattes in my selfies.", tags: ["cute", "confident"] },
      { text: "Moody, dramatic, halfway to becoming a bond villain.", tags: ["moody", "dramatic"] },
      { text: "Chaos gremlin who forgot their laundry again.", tags: ["chaos"] },
    ],
  },
];