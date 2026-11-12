'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { check, hashPassword, type UserRecord } from '@/lib/auth';
import { clientIp } from '@/lib/http';
import { field, registration } from '@/lib/validator';
import { execute, queryOne } from '../db';
import { flash } from '../flash';
import { LOCKED_OUT, clearFailures, isLockedOut, recordFailure } from '../rate-limit';
import { createSession, destroySession, purgeExpiredSessions } from '../session';

export interface LoginState {
  errors: string[];
  warning?: string;
  email?: string;
}

export async function login(_previous: LoginState, form: FormData): Promise<LoginState> {
  const email = field(form, 'email').trim();
  // Passwords are not trimmed: leading/trailing spaces are part of the password.
  const password = field(form, 'password');

  const errors: string[] = [];
  if (email === '') errors.push('Email is required.');
  if (password === '') errors.push('Password is required.');
  if (errors.length > 0) return { errors, email };

  const ip = clientIp((await headers()).get('x-forwarded-for'));
  if (await isLockedOut(ip, email)) {
    return { errors: [LOCKED_OUT], email };
  }

  const user = await queryOne<UserRecord>(
    'SELECT id, username, email, password, role, status FROM new_users WHERE email = ? LIMIT 1',
    [email],
  );
  const result = await check(user, email, password);

  if (!result.ok) {
    const left = await recordFailure(ip, email);
    const warning = left >= 1 && left <= 2 ? `⚠️ ${left} attempt(s) remaining before lockout.` : undefined;
    return { errors: result.errors, warning, email };
  }

  await clearFailures(ip, email);
  // A brand-new session token on every login also rules out session fixation.
  await createSession(result.user.id);
  if (Math.random() < 0.05) await purgeExpiredSessions();
  redirect('/');
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect('/');
}

export interface RegisterState {
  errors: string[];
  values: Record<string, string>;
}

export async function register(_previous: RegisterState, form: FormData): Promise<RegisterState> {
  const { errors, data } = registration(form);
  const values = {
    username: data.username,
    email: data.email,
    company_name: data.companyName,
    contact_person: data.contactPerson,
    phone_number: data.phoneNumber,
  };

  if (errors.length === 0) {
    const existing = await queryOne<{ id: number }>('SELECT id FROM new_users WHERE email = ?', [data.email]);
    if (existing) errors.push('That email address is already registered.');
  }
  if (errors.length > 0) return { errors, values };

  const created = await execute(
    `INSERT INTO new_users (username, email, password, company_name, contact_person, phone_number)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.username, data.email, await hashPassword(data.password), data.companyName, data.contactPerson, data.phoneNumber],
  );

  // A zero-score "welcome" entry, so the certificate history is never empty.
  await execute(
    `INSERT INTO green_calculator_results
        (user_id, total_score, green_count, amber_count, red_count,
         award_level, emoji, feedback_message, shortfall, donation_cost)
     VALUES (?, 0, 0, 0, 0, 'Initial Registration 🎟️', '🎟️', 'Thank you for joining GreenScore!', 0, 0.00)`,
    [created.insertId],
  );

  await flash('success', 'Account created successfully. You can now log in.');
  redirect('/login');
}
