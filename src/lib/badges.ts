/**
 * Fourteen badge levels earned from the cumulative number of "Green" answers
 * across all of a user's assessments.
 */

export interface BadgeLevel {
  /** Minimum number of green answers needed. */
  threshold: number;
  slug: string;
  label: string;
  text: string;
}

export const LEVELS: readonly BadgeLevel[] = [
  { threshold: 0, slug: 'green_starter', label: '🌱 Green Starter', text: 'Great start — keep growing green habits! 🌱' },
  { threshold: 5, slug: 'eco_explorer', label: '🌿 Eco Explorer', text: 'Exploring the world of sustainability. 🌍' },
  { threshold: 10, slug: 'climate_cadet', label: '🎖 Climate Cadet', text: 'In training to save the planet! 🎖️' },
  { threshold: 15, slug: 'forest_friend', label: '🌳 Forest Friend', text: 'Nature thanks you for your dedication! 🌳' },
  { threshold: 20, slug: 'carbon_cutter', label: '✂️ Carbon Cutter', text: 'Cutting down emissions daily. ✂️' },
  { threshold: 25, slug: 'renewable_rookie', label: '⚡ Renewable Rookie', text: 'Just getting started with renewables. ⚡' },
  { threshold: 30, slug: 'sustainability_scout', label: '🧭 Sustainability Scout', text: 'Navigating the path to sustainability. 🧭' },
  { threshold: 40, slug: 'leaf_leader', label: '🍃 Leaf Leader', text: 'A natural-born leader in the green movement. 🍃' },
  { threshold: 50, slug: 'green_visionary', label: '👁 Green Visionary', text: 'You envision a cleaner world and act on it! 👁🌱' },
  { threshold: 60, slug: 'eco_hero', label: '🦸 Eco Hero', text: 'Heroic actions, greener future! 🦸' },
  { threshold: 70, slug: 'planet_paladin', label: '🪐 Planet Paladin', text: "You've pledged loyalty to the planet! 🌎" },
  { threshold: 80, slug: 'guardian_of_earth', label: '🛡 Guardian of Earth', text: 'Defending the Earth one choice at a time. 🛡️' },
  { threshold: 90, slug: 'green_warrior', label: '🌟 Green Warrior', text: "You're a fierce champion of the environment! 🌿⚔️" },
  {
    threshold: 100,
    slug: 'champion_of_sustainability',
    label: '🏆 Champion of Sustainability',
    text: "You've reached the highest honour in sustainability! 🌍👑",
  },
];

export interface Badge extends BadgeLevel {
  /** 1-based position in the ladder. */
  level: number;
}

export function forGreenCount(green: number): Badge {
  let current: Badge = { ...LEVELS[0]!, level: 1 };
  LEVELS.forEach((badge, index) => {
    if (green >= badge.threshold) {
      current = { ...badge, level: index + 1 };
    }
  });
  return current;
}

/** Progress towards the top badge as a 0–100 percentage. */
export function progressPercent(green: number): number {
  return Math.max(0, Math.min(100, Math.trunc(green)));
}
