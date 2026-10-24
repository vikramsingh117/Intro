export const NOTEBOOK_PAGES = [
  {
    title: 'From question to product', subtitle: 'AI × PRODUCT × ENGINEERING', doodle: 'loop',
    text: 'My work at Upliance spans product decisions and implementation: chatbot integrations, recipe discovery, preferences, and tools for understanding AI behavior.',
    question: 'What should happen next for the person using this?',
    notes: ['Shape the interaction: when should a chat offer recipe generation?', 'Build the integration: connect the UI to the AI backend.', 'Make behavior clear: archived conversations should be view-only.'],
    caption: 'A product loop: understand → decide → build → observe.',
  },
  {
    title: 'Small details, real context', subtitle: 'COOKING / PREFERENCES / DISCOVERY', doodle: 'recipe',
    text: 'I helped shape diet and allergen behavior and worked on device-aware recipe discovery. Reliability also lives in small details, like keeping your place when you return to a recipe list.',
    question: 'What context should the product remember?',
    notes: ['A changed diet can affect which allergens remain selected.', 'An unset preference is different from a saved selection.', 'Recipe discovery should reflect the selected appliance.'],
    caption: 'Recipe cards, preference checks, and a bookmark for your place.',
  },
  {
    title: 'Make the invisible visible', subtitle: 'AI OPERATIONS / INTERNAL TOOLS', doodle: 'signals',
    text: 'For Frodo Recipe Admin, I built interfaces for chatbot-session inspection, recipe-generation timing, and resource-document synchronization. My role was frontend and API integration over separate backend services.',
    question: 'Can the team understand what just happened?',
    notes: ['Bring session data and useful user context together.', 'Handle inconsistent message formats and embedded recipe results.', 'Keep asynchronous sync state consistent across components.'],
    caption: 'A conversation, a timing trace, and documents moving into sync.',
  },
];
