import { describe, expect, it } from 'vitest';
import {
  GREEN,
  MAX_SCORE,
  MEASURES,
  award,
  awardTier,
  clampShortfall,
  donationCost,
  evaluate,
  parseAnswers,
  shortfall,
  tally,
  type FieldSource,
} from '@/lib/scoring';

function answers(...points: unknown[]): Map<string, unknown> & FieldSource {
  return new Map(points.map((p, i) => [`measure_${i}`, typeof p === 'number' ? String(p) : p]));
}

describe('Green Calculator scoring', () => {
  it('has ten measures worth one hundred points', () => {
    expect(MEASURES).toHaveLength(10);
    expect(MEASURES.length * GREEN).toBe(MAX_SCORE);
  });

  it('parses a valid form', () => {
    expect(parseAnswers(answers(10, 5, 0, 10, 10, 5, 0, 0, 10, 5))).toEqual([10, 5, 0, 10, 10, 5, 0, 0, 10, 5]);
  });

  it('works with real FormData', () => {
    const form = new FormData();
    for (let i = 0; i < 10; i++) form.set(`measure_${i}`, '10');
    expect(parseAnswers(form)).toEqual(Array(10).fill(10));
  });

  it('rejects a missing answer', () => {
    expect(parseAnswers(answers(10, 10, 10, 10, 10, 10, 10, 10, 10))).toBeNull();
  });

  it.each([
    ['out-of-range number', '7'],
    ['too large', '100'],
    ['negative', '-10'],
    ['empty', ''],
    ['text', 'green'],
    ['array', ['10']],
    ['float string', '10.0'],
  ])('rejects a tampered value: %s', (_label, bad) => {
    const input = answers(10, 10, 10, 10, 10, 10, 10, 10, 10, 10);
    input.set('measure_4', bad);
    expect(parseAnswers(input)).toBeNull();
  });

  it('tallies each colour', () => {
    expect(tally([10, 10, 10, 10, 10, 5, 5, 5, 0, 0])).toEqual({ total: 65, green: 5, amber: 3, red: 2 });
  });

  it('rejects unknown points', () => {
    expect(() => tally([10, 3])).toThrow(RangeError);
  });

  it.each([
    [100, 'Certificate of Gold 🥇'],
    [80, 'Certificate of Gold 🥇'],
    [79, 'Certificate of Silver 🥈'],
    [65, 'Certificate of Silver 🥈'],
    [64, 'Certificate of Bronze 🥉'],
    [51, 'Certificate of Bronze 🥉'],
    [50, 'Certificate of Participation 👏'],
    [0, 'Certificate of Participation 👏'],
  ])('awards %i points a %s', (total, expected) => {
    expect(award(total).award).toBe(expected);
  });

  it.each([
    [50, '🌟'],
    [41, '🌟'],
    [40, '💪'],
    [26, '💪'],
    [25, '🌱'],
    [0, '🌱'],
  ])('encourages a participation score of %i with %s', (total, emoji) => {
    expect(award(total).emoji).toBe(emoji);
  });

  it('works out the shortfall and suggested contribution', () => {
    expect(shortfall(65)).toBe(35);
    expect(shortfall(100)).toBe(0);
    expect(shortfall(0)).toBe(100);
    expect(donationCost(35)).toBe(350);
    expect(donationCost(0)).toBe(0);
    expect(donationCost(100)).toBe(1000);
  });

  it('clamps the shortfall so a tampered value can never cost more than £1,000', () => {
    expect(clampShortfall(150)).toBe(100);
    expect(clampShortfall(-20)).toBe(0);
    expect(clampShortfall(45)).toBe(45);
    expect(donationCost(999)).toBe(1000);
    expect(donationCost(-5)).toBe(0);
  });

  it('evaluates a full set of answers', () => {
    expect(evaluate([10, 10, 10, 10, 10, 10, 10, 5, 5, 0])).toMatchObject({
      total: 80,
      green: 7,
      amber: 2,
      red: 1,
      award: 'Certificate of Gold 🥇',
      shortfall: 20,
      cost: 200,
    });
  });

  it('gives a perfect score no shortfall', () => {
    expect(evaluate(Array(10).fill(GREEN))).toMatchObject({ total: 100, shortfall: 0, cost: 0 });
  });

  it('maps award labels to colour tiers', () => {
    expect(awardTier('Certificate of Gold 🥇')).toBe('gold');
    expect(awardTier('Certificate of Silver 🥈')).toBe('silver');
    expect(awardTier('Certificate of Bronze 🥉')).toBe('bronze');
    expect(awardTier('Initial Registration 🎟️')).toBe('other');
  });
});
