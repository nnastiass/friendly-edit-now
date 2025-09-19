// src/lib/challengeSets.ts

// ✅ KEEP: This type is used across your application.
export type Challenge = {
  id: number;
  title: string;
  description: string;
  points: number;
  emoji?: string;
};

// 🗑️ REMOVE: The large MAIN_CHALLENGES and CONF_CHALLENGES arrays are gone.

// ✅ KEEP: These helper functions are still used for localStorage management.
export const todayKey = () => new Date().toDateString();

export const storageKeys = (variantKey: 'main' | 'conf') => ({
  current: (d: string) => `current-challenge-${variantKey}-${d}`,
  completed: (d: string) => `challenge-completed-${variantKey}-${d}`,
});