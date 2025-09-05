// src/lib/challengeSets.ts
export type Challenge = {
  id: number;
  title: string;
  description: string;
  points: number;
  emoji?: string;
};

/** Normal app list */
export const MAIN_CHALLENGES: Challenge[] = [
  { id: 1, title: 'Say hi to a stranger', description: 'Greet someone you don’t know with a smile and a friendly hello', points: 10, emoji: '👋' },
  { id: 2, title: 'Compliment someone', description: 'Give someone a genuine compliment today', points: 10, emoji: '😊' },
  { id: 3, title: 'Start a conversation', description: 'Initiate a conversation with someone new', points: 15, emoji: '💬' },
  // ...add the rest of the "normal" list here...
];

/** Testing United Conference list */
export const CONF_CHALLENGES: Challenge[] = [
 { id: 1,  title: "Take a photo of your desk",                description: "Snap your current testing workstation.", points: 10, emoji: "💻" },
  { id: 2,  title: "Take a photo of your pet tester",          description: "Show your pet ‘helping’ you test.", points: 10, emoji: "🐾" },
  { id: 3,  title: "Capture a real-world UI/UX bug",           description: "Find a funny bug in the wild and snap it.", points: 15, emoji: "🐞" },
  { id: 4,  title: "Take a selfie with your top tool",         description: "Pose with the testing tool you use most.", points: 10, emoji: "🧪" },
  { id: 5,  title: "Show your coffee/tea setup",               description: "Share your go-to caffeine station.", points: 5,  emoji: "☕" },
  { id: 6,  title: "Show a testing book you’re reading",       description: "Post the book that’s on your desk now.", points: 10, emoji: "📚" },
  { id: 7,  title: "Find a funny AI error (screenshot)",       description: "Grab a screenshot of an AI fail.", points: 15, emoji: "🤖" },
  { id: 8,  title: "Snap your conference alarm",               description: "Photo of your alarm set for the event.", points: 5,  emoji: "⏰" },
  { id: 9,  title: "Share something that works perfectly",     description: "Post a thing that sparks joy by working.", points: 10, emoji: "✨" },
  { id: 10, title: "Post a networking selfie",                 description: "Selfie to find a conference buddy.", points: 10, emoji: "🤝" },
  { id: 11, title: "Show tickets or route map",                description: "Photo of your travel plan to the event.", points: 10, emoji: "🗺️" },
  { id: 12, title: "Record a hello video",                     description: "Say hi to the community in a short clip.", points: 15, emoji: "🎥" },
  { id: 13, title: "Post your morning stand-up selfie",        description: "Share that just-woke-up sprint face.", points: 10, emoji: "🥱" },
  { id: 14, title: "Share your travel prep",                   description: "Suitcase, passport, gear—show it off.", points: 10, emoji: "🧳" },
  { id: 15, title: "Snap a bug-themed item",                   description: "Toy, shirt, sticker, meme—your choice.", points: 10, emoji: "🐞" },
  { id: 16, title: "Show your messy desk",                     description: "AKA the ‘bug production environment’.", points: 10, emoji: "🌀" },
  { id: 17, title: "Take a ready-to-board selfie",             description: "Plane, train, or bus—capture the moment.", points: 10, emoji: "✈️" },
  { id: 18, title: "Doodle a conference bug (photo)",          description: "Draw a quick bug and post a pic.", points: 15, emoji: "✏️" },
  { id: 19, title: "Show your testing mascot",                 description: "Plush, sticker, doodle—introduce them.", points: 10, emoji: "🧸" },
  { id: 20, title: "Take a coffee selfie",                     description: "You + coffee = productivity.", points: 5,  emoji: "☕️" },
  { id: 21, title: "Share a real-life ‘bug’",                  description: "Pretend-found glitch (broken sign, odd UI).", points: 15, emoji: "🔍" },
  { id: 22, title: "Strike a TU victory pose",                 description: "Show you’re ready for Testing United!", points: 10, emoji: "💪" },
  { id: 23, title: "Show outfit or conference swag",           description: "Today’s look or favorite swag item.", points: 10, emoji: "👕" },
  { id: 24, title: "Generate your QA superhero (AI)",          description: "Create your superhero alter ego.", points: 20, emoji: "🦸" },
  { id: 25, title: "Create a testing meme",                    description: "Make us laugh with a testing meme.", points: 15, emoji: "😂" },
  { id: 26, title: "Show a side project",                      description: "Photo of a build you’re tinkering with.", points: 10, emoji: "🧩" },
  { id: 27, title: "Illustrate a testing term (photo)",        description: "A funny pic that explains a concept.", points: 15, emoji: "🗣️" },
  { id: 28, title: "Take a packing photo",                     description: "Share your bag-packing moment.", points: 5,  emoji: "🧳" },
  { id: 29, title: "Share your team photo",                    description: "Your conference crew together.", points: 10, emoji: "👥" },
  { id: 30, title: "Show your keyboard setup",                 description: "Post your trusty keys.", points: 5,  emoji: "⌨️" },
  { id: 31, title: "Share a podcast moment",                   description: "Photo of you listening to a testing pod.", points: 10, emoji: "🎧" },
  { id: 32, title: "Share your coding/testing playlist",       description: "Screenshot your focus tracks.", points: 10, emoji: "🎶" },
  { id: 33, title: "Share a favorite testing quote",           description: "Photo or screenshot of the quote.", points: 10, emoji: "📝" },
  { id: 34, title: "Show your testing snacks",                 description: "Fuel for long sessions.", points: 5,  emoji: "🍫" },
  { id: 35, title: "Show an unsung tool/process",              description: "Helpful but unnoticed? Spotlight it.", points: 15, emoji: "🛠️" },
  { id: 36, title: "Record your learning goals (video)",       description: "What do you hope to learn here?", points: 15, emoji: "🎯" },
  { id: 37, title: "Make a ‘days left’ photo",                 description: "Creative way to show the countdown.", points: 10, emoji: "📅" },
  { id: 38, title: "Record how you use AI (video)",            description: "Quick clip of AI in your workflow.", points: 20, emoji: "🤖" },
  { id: 39, title: "Share a ‘Wait, what?’ bug",                description: "A bug that truly puzzled you.", points: 15, emoji: "🤔" },
  { id: 40, title: "Show your bag essentials",                 description: "A few must-have items for the day.", points: 10, emoji: "🎒" },
  { id: 41, title: "Share a testing hero read",                description: "Book or article by a testing hero.", points: 10, emoji: "📖" },
  { id: 42, title: "Take another boarding selfie",             description: "New angle or next leg of travel.", points: 10, emoji: "🛫" },
  { id: 43, title: "Selfie with your AI tester twin",          description: "You + your AI-generated version.", points: 20, emoji: "🤳" },
  { id: 44, title: "Design a new TU logo (AI)",                description: "Generate and share a fresh logo idea.", points: 20, emoji: "🎨" },
  { id: 45, title: "Show Milan in 3025 (AI)",                  description: "Imagine future Milan with AI.", points: 20, emoji: "🚀" },
  { id: 46, title: "Post your ‘Landed in Milan’ photo",        description: "First snap after touchdown.", points: 10, emoji: "🛬" },
  { id: 47, title: "Create an AI travel buddy",                description: "Generate a companion for the trip.", points: 15, emoji: "🧑‍🤝‍🧑" },
  { id: 48, title: "Take a photo of a top session",            description: "Show the talk you’re most excited about.", points: 10, emoji: "🗓️" }
];

export const todayKey = () => new Date().toDateString();

export const storageKeys = (variantKey: 'main' | 'conf') => ({
  current: (d: string) => `current-challenge-${variantKey}-${d}`,
  completed: (d: string) => `challenge-completed-${variantKey}-${d}`,
});

export function pickInitialChallenge(list: Challenge[], variantKey: 'main' | 'conf'): Challenge {
  const today = todayKey();
  const { current } = storageKeys(variantKey);
  const savedId = localStorage.getItem(current(today));
  if (savedId) {
    const found = list.find((c) => c.id === Number(savedId));
    if (found) return found;
  }
  const idx = new Date().getDate() % list.length;
  const chosen = list[idx];
  localStorage.setItem(current(today), String(chosen.id));
  return chosen;
}

export function pickNextChallenge(list: Challenge[], prevId: number): Challenge {
  const idx = Math.max(0, list.findIndex((c) => c.id === prevId));
  return list[(idx + 1) % list.length];
}