/**
 * The Green Calculator rules: ten measures, each rated Green (10 points),
 * Amber (5) or Red (0), giving a score out of 100 and an award level.
 *
 * Pure functions with no I/O, so they run anywhere (server, browser, tests).
 */

export const MEASURES = [
  'Waste Reduction',
  'Renewable Energy Usage',
  'Water Conservation',
  'Sustainable Supply Chain',
  'Eco-friendly Products/Services',
  'Energy-Efficient Infrastructure',
  'Transportation Sustainability',
  'Community Engagement',
  'Carbon Offsetting',
  'Transparency and Reporting',
] as const;

export type Measure = (typeof MEASURES)[number];

export const GREEN = 10;
export const AMBER = 5;
export const RED = 0;

export type Points = typeof GREEN | typeof AMBER | typeof RED;

export const MAX_SCORE = 100;
/** Suggested contribution in £ per missing point. */
export const COST_PER_POINT = 10;

export const GOLD_THRESHOLD = 80;
export const SILVER_THRESHOLD = 65;
export const BRONZE_THRESHOLD = 51;

export const AWARDS = {
  gold: 'Certificate of Gold 🥇',
  silver: 'Certificate of Silver 🥈',
  bronze: 'Certificate of Bronze 🥉',
  participation: 'Certificate of Participation 👏',
} as const;

export interface Tally {
  total: number;
  green: number;
  amber: number;
  red: number;
}

export interface Award {
  award: string;
  emoji: string;
  message: string;
}

export interface Evaluation extends Tally, Award {
  shortfall: number;
  cost: number;
}

/** Anything with a `get(name)` method: FormData, URLSearchParams or a plain lookup. */
export interface FieldSource {
  get(name: string): unknown;
}

const ALLOWED = new Map<string, Points>([
  [String(GREEN), GREEN],
  [String(AMBER), AMBER],
  [String(RED), RED],
]);

/**
 * Read one answer per measure from submitted form data (fields measure_0 …
 * measure_9). Returns the list of points, or null if any answer is missing or
 * not one of the allowed values.
 */
export function parseAnswers(input: FieldSource, count: number = MEASURES.length): Points[] | null {
  const points: Points[] = [];
  for (let i = 0; i < count; i++) {
    const raw = input.get(`measure_${i}`);
    if (typeof raw !== 'string' && typeof raw !== 'number') {
      return null;
    }
    const value = ALLOWED.get(String(raw).trim());
    if (value === undefined) {
      return null;
    }
    points.push(value);
  }
  return points;
}

export function tally(points: readonly number[]): Tally {
  const result: Tally = { total: 0, green: 0, amber: 0, red: 0 };
  for (const p of points) {
    if (p === GREEN) result.green++;
    else if (p === AMBER) result.amber++;
    else if (p === RED) result.red++;
    else throw new RangeError(`Invalid points value: ${p}`);
    result.total += p;
  }
  return result;
}

export function award(total: number): Award {
  if (total >= GOLD_THRESHOLD) {
    return { award: AWARDS.gold, emoji: '🥇', message: "Outstanding! You're leading the way in sustainability." };
  }
  if (total >= SILVER_THRESHOLD) {
    return { award: AWARDS.silver, emoji: '🥈', message: "Great job! You're making a positive environmental impact." };
  }
  if (total >= BRONZE_THRESHOLD) {
    return { award: AWARDS.bronze, emoji: '🥉', message: 'Nice effort! Keep building sustainable habits.' };
  }
  if (total >= 41) {
    return {
      award: AWARDS.participation,
      emoji: '🌟',
      message: "You're almost there! Just a few more changes will go a long way.",
    };
  }
  if (total >= 26) {
    return { award: AWARDS.participation, emoji: '💪', message: "You're making progress. Small steps matter — keep going!" };
  }
  return { award: AWARDS.participation, emoji: '🌱', message: "Every journey starts somewhere — you've taken that first step!" };
}

export function clampShortfall(shortfall: number): number {
  return Math.max(0, Math.min(MAX_SCORE, Math.trunc(shortfall)));
}

/** Points missing from a perfect score, clamped to 0–100. */
export function shortfall(total: number): number {
  return clampShortfall(MAX_SCORE - total);
}

/** Suggested contribution in pounds to close a shortfall. */
export function donationCost(missing: number): number {
  return clampShortfall(missing) * COST_PER_POINT;
}

/** Full result for a set of answers, ready to store and display. */
export function evaluate(points: readonly number[]): Evaluation {
  const counts = tally(points);
  const missing = shortfall(counts.total);
  return { ...counts, ...award(counts.total), shortfall: missing, cost: donationCost(missing) };
}

/** Visual tier of an award label, used for colours on certificates and cards. */
export function awardTier(label: string): 'gold' | 'silver' | 'bronze' | 'other' {
  if (label.includes('Gold')) return 'gold';
  if (label.includes('Silver')) return 'silver';
  if (label.includes('Bronze')) return 'bronze';
  return 'other';
}
