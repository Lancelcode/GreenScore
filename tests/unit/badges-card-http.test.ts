import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LEVELS, forGreenCount, progressPercent } from '@/lib/badges';
import { isExpired, lastFour, mask, parseExpiry, passesLuhn, toSqlDate, validateNew } from '@/lib/card';
import { clientIp } from '@/lib/http';

describe('badges', () => {
  it('has fourteen levels, each with an illustration', () => {
    expect(LEVELS).toHaveLength(14);
    for (const badge of LEVELS) {
      expect(existsSync(join(process.cwd(), 'public/assets/images/illustrations', `${badge.slug}.jpg`)), badge.slug).toBe(true);
    }
  });

  it.each([
    [0, 'green_starter', 1],
    [4, 'green_starter', 1],
    [5, 'eco_explorer', 2],
    [29, 'renewable_rookie', 6],
    [30, 'sustainability_scout', 7],
    [99, 'green_warrior', 13],
    [100, 'champion_of_sustainability', 14],
    [250, 'champion_of_sustainability', 14],
  ])('%i green answers earn %s (level %i)', (green, slug, level) => {
    const badge = forGreenCount(green);
    expect(badge.slug).toBe(slug);
    expect(badge.level).toBe(level);
    expect(badge.text).not.toBe('');
  });

  it('falls back to the starter badge for a negative count', () => {
    expect(forGreenCount(-3).slug).toBe('green_starter');
  });

  it('clamps progress to a percentage', () => {
    expect(progressPercent(-1)).toBe(0);
    expect(progressPercent(42)).toBe(42);
    expect(progressPercent(140)).toBe(100);
  });
});

describe('saved cards', () => {
  const now = new Date(2026, 5, 15); // 15 June 2026

  it('checks the Luhn checksum', () => {
    expect(passesLuhn('4111111111111111')).toBe(true);
    expect(passesLuhn('5555555555554444')).toBe(true);
    expect(passesLuhn('4111111111111112')).toBe(false);
    expect(passesLuhn('')).toBe(false);
    expect(passesLuhn('41x1')).toBe(false);
  });

  it('keeps only the last four digits', () => {
    expect(lastFour('4111 1111 1111 1111')).toBe('1111');
    expect(mask('4444')).toBe('•••• •••• •••• 4444');
  });

  it('parses expiry months', () => {
    expect(toSqlDate(parseExpiry('2027-03')!)).toBe('2027-03-01');
    expect(toSqlDate(parseExpiry('2027-03-28')!)).toBe('2027-03-01');
    expect(parseExpiry('2027-13')).toBeNull();
    expect(parseExpiry('03/27')).toBeNull();
  });

  it('treats a card as valid until the end of its expiry month', () => {
    expect(isExpired({ year: 2026, month: 6 }, now)).toBe(false);
    expect(isExpired({ year: 2026, month: 5 }, now)).toBe(true);
  });

  it('validates a new card', () => {
    expect(validateNew('4111 1111 1111 1111', '2027-01', 'Pat Jones', now)).toEqual([]);
    const errors = validateNew('1234', '2020-01', '', now);
    expect(errors).toContain('Enter a valid card number.');
    expect(errors).toContain('That card has expired.');
    expect(errors).toContain('Enter the cardholder name (up to 100 characters).');
  });
});

describe('client IP for rate limiting', () => {
  it('uses the right-most forwarded address, which the proxy appends', () => {
    expect(clientIp('1.2.3.4, 100.101.102.103')).toBe('100.101.102.103');
    expect(clientIp('203.0.113.7')).toBe('203.0.113.7');
  });

  it('falls back when the header is missing or invalid', () => {
    expect(clientIp(null)).toBe('0.0.0.0');
    expect(clientIp('not-an-ip')).toBe('0.0.0.0');
  });

  it('accepts IPv6', () => {
    expect(clientIp('fd7a:115c:a1e0::1')).toBe('fd7a:115c:a1e0::1');
  });
});
