import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { DEACTIVATED, NOT_FOUND, WRONG_PASS, check, hashPassword, type UserRecord } from '@/lib/auth';
import { certificateRef, dayMonthYear, longDateTime, monthYear, shortDate } from '@/lib/format';
import { isEmail, offset, pageNumber, passwordError, positiveId, registration, tipMessage, totalPages } from '@/lib/validator';

const validRegistration = () =>
  new Map<string, unknown>([
    ['username', 'EcoPath Ltd'],
    ['email', 'contact@ecopath.co.uk'],
    ['company_name', 'EcoPath Ltd'],
    ['contact_person', 'Pat Jones'],
    ['phone_number', '+44 7700 900123'],
    ['pass1', 'Greener2026'],
    ['pass2', 'Greener2026'],
  ]);

describe('registration', () => {
  it('accepts a valid form', () => {
    const result = registration(validRegistration());
    expect(result.errors).toEqual([]);
    expect(result.data.email).toBe('contact@ecopath.co.uk');
  });

  it('trims text but not the password', () => {
    const input = validRegistration();
    input.set('email', '  contact@ecopath.co.uk  ');
    input.set('pass1', ' Greener2026 ');
    input.set('pass2', ' Greener2026 ');
    const result = registration(input);
    expect(result.data.email).toBe('contact@ecopath.co.uk');
    expect(result.data.password).toBe(' Greener2026 ');
  });

  it('strips unexpected characters from phone numbers', () => {
    const input = validRegistration();
    input.set('phone_number', '07700<script>900123');
    expect(registration(input).data.phoneNumber).toBe('07700900123');
  });

  it.each([
    ['username', '', 'Enter your name.'],
    ['username', 'a'.repeat(51), 'Name cannot exceed 50 characters.'],
    ['email', 'not-an-email', 'Enter a valid email address (e.g. name@example.com).'],
    ['email', 'user@localhost', 'Enter a valid email address (e.g. name@example.com).'],
    ['company_name', '', 'Enter your company name.'],
    ['contact_person', '', "Enter the contact person's name."],
    ['phone_number', '12345', 'Phone number must have at least 7 digits.'],
    ['phone_number', '1234567890123456', 'Phone number cannot exceed 15 digits (international standard).'],
    ['email', ['a@b.com'], 'Enter your email address.'],
  ])('rejects a bad %s', (name, value, error) => {
    const input = validRegistration();
    input.set(name, value);
    expect(registration(input).errors).toContain(error);
  });
});

describe('password policy', () => {
  it.each([
    ['valid', 'Greener2026', 'Greener2026', null],
    ['empty', '', '', 'Enter your password.'],
    ['too short', 'Ab1', 'Ab1', 'Password must be at least 8 characters.'],
    ['too long', 'Ab1'.repeat(25), 'Ab1'.repeat(25), 'Password cannot exceed 72 characters.'],
    ['no uppercase', 'greener2026', 'greener2026', 'Password must contain at least one uppercase letter.'],
    ['no lowercase', 'GREENER2026', 'GREENER2026', 'Password must contain at least one lowercase letter.'],
    ['no number', 'GreenerPlanet', 'GreenerPlanet', 'Password must contain at least one number.'],
    ['common', 'Password1', 'Password1', 'That password is too common. Please choose a stronger one.'],
    ['mismatch', 'Greener2026', 'Greener2027', 'Passwords do not match.'],
  ])('%s', (_label, password, confirm, expected) => {
    expect(passwordError(password, confirm)).toBe(expected);
  });
});

describe('other input rules', () => {
  it('normalises community tips', () => {
    expect(tipMessage('  Switch to reusable bags.  ')).toBe('Switch to reusable bags.');
    expect(tipMessage('   ')).toBeNull();
    expect(tipMessage('x'.repeat(501))).toBeNull();
    expect(tipMessage('é'.repeat(500))).toBe('é'.repeat(500)); // counts characters, not bytes
    expect(tipMessage(['array'])).toBeNull();
    // Markup is stored as typed and escaped on output, never silently stripped.
    expect(tipMessage('<b>hi</b>')).toBe('<b>hi</b>');
  });

  it('paginates', () => {
    expect(pageNumber(null)).toBe(1);
    expect(pageNumber('-4')).toBe(1);
    expect(pageNumber('abc')).toBe(1);
    expect(pageNumber('3')).toBe(3);
    expect(offset(1, 5)).toBe(0);
    expect(offset(3, 5)).toBe(10);
    expect(totalPages(6, 5)).toBe(2);
    expect(totalPages(5, 5)).toBe(1);
    expect(totalPages(0, 5)).toBe(0);
  });

  it('validates email addresses', () => {
    expect(isEmail('hello@ecoventures.com')).toBe(true);
    expect(isEmail('first.last+tag@sub.example.co.uk')).toBe(true);
    expect(isEmail('a..b@example.com')).toBe(false);
    expect(isEmail('a@b')).toBe(false);
    expect(isEmail('a@b.c1')).toBe(false);
  });

  it('accepts only positive integer ids', () => {
    expect(positiveId('42')).toBe(42);
    expect(positiveId('0')).toBeNull();
    expect(positiveId('-1')).toBeNull();
    expect(positiveId('1e3')).toBeNull();
    expect(positiveId(null)).toBeNull();
  });
});

describe('credential checks', () => {
  const user = async (status: UserRecord['status'] = 'active'): Promise<UserRecord> => ({
    id: 2,
    username: 'Test User',
    email: 'user@example.com',
    password: await hashPassword('Userpass123'),
    role: 'user',
    status,
  });

  it('accepts the correct password and never returns the hash', async () => {
    const result = await check(await user(), 'user@example.com', 'Userpass123');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.id).toBe(2);
      expect(result.user).not.toHaveProperty('password');
    }
  });

  it('accepts password hashes created by the old PHP version', async () => {
    const phpHash = bcrypt.hashSync('Userpass123', 4).replace(/^\$2b\$/, '$2y$');
    const result = await check({ ...(await user()), password: phpHash }, 'user@example.com', 'Userpass123');
    expect(result.ok).toBe(true);
  });

  it('rejects a wrong password (case-sensitive)', async () => {
    expect(await check(await user(), 'user@example.com', 'userpass123')).toEqual({ ok: false, errors: [WRONG_PASS] });
  });

  it('rejects an unknown email', async () => {
    expect(await check(null, 'nobody@example.com', 'Whatever123')).toEqual({ ok: false, errors: [NOT_FOUND] });
  });

  it('reports empty fields', async () => {
    expect(await check(null, '', '')).toEqual({ ok: false, errors: ['Enter your email address.', 'Enter your password.'] });
  });

  it('blocks deactivated accounts, without revealing that to someone who lacks the password', async () => {
    expect(await check(await user('deactivated'), 'user@example.com', 'Userpass123')).toEqual({ ok: false, errors: [DEACTIVATED] });
    expect(await check(await user('deactivated'), 'user@example.com', 'nope')).toEqual({ ok: false, errors: [WRONG_PASS] });
  });

  it('lets inactive accounts log in', async () => {
    expect((await check(await user('inactive'), 'user@example.com', 'Userpass123')).ok).toBe(true);
  });
});

describe('date formatting', () => {
  it('formats database timestamps without time-zone shifts', () => {
    expect(longDateTime('2026-05-01 19:17:11')).toBe('May 1, 2026, 7:17 pm');
    expect(longDateTime('2026-05-01 00:05:00')).toBe('May 1, 2026, 12:05 am');
    expect(dayMonthYear('2026-05-01 19:17:11')).toBe('01/05/2026');
    expect(shortDate('2026-05-01 19:17:11')).toBe('01 May 2026');
    expect(monthYear('2027-03-01')).toBe('03/2027');
  });

  it('builds certificate references', () => {
    expect(certificateRef(123, '2026-05-01 19:17:11')).toBe('GS-2026-000123');
  });
});
