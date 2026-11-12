'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AWARDS, clampShortfall, donationCost, evaluate, parseAnswers, type Evaluation } from '@/lib/scoring';
import { charLength, field, positiveId } from '@/lib/validator';
import { execute, queryOne } from '../db';
import { flash } from '../flash';
import { requireAdmin, requireUser } from '../session';

export interface AssessmentState {
  error?: string;
  result?: Evaluation & { id: number };
}

export async function submitAssessment(_previous: AssessmentState, form: FormData): Promise<AssessmentState> {
  const user = await requireUser();
  const points = parseAnswers(form);
  if (points === null) {
    return { error: 'Please choose Green, Amber or Red for every measure.' };
  }

  const result = evaluate(points);
  const saved = await execute(
    `INSERT INTO green_calculator_results
        (user_id, total_score, green_count, amber_count, red_count,
         award_level, emoji, feedback_message, shortfall, donation_cost, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [user.id, result.total, result.green, result.amber, result.red, result.award, result.emoji, result.message, result.shortfall, result.cost],
  );
  return { result: { ...result, id: saved.insertId } };
}

export interface ContributionState {
  donated?: { id: number };
  error?: string;
}

/**
 * Demo only: no money changes hands. A real deployment would confirm a
 * payment with a payment provider before upgrading the certificate.
 */
export async function contribute(): Promise<ContributionState> {
  const user = await requireUser();

  // The shortfall always comes from the user's latest stored result — never
  // from the browser, which could be edited to pay less.
  const latest = await queryOne<{ id: number; shortfall: number }>(
    `SELECT id, shortfall FROM green_calculator_results
      WHERE user_id = ? ORDER BY submitted_at DESC, id DESC LIMIT 1`,
    [user.id],
  );
  if (!latest) return { error: 'No previous certificate found to update.' };

  const shortfall = clampShortfall(latest.shortfall);
  if (shortfall === 0) return { error: 'Your latest result has no shortfall.' };

  await execute(
    `UPDATE green_calculator_results
        SET award_level = ?, emoji = '🥇', feedback_message = ?,
            shortfall = 0, donation_cost = ?, submitted_at = NOW()
      WHERE id = ? AND user_id = ?`,
    [AWARDS.gold, "Thank you for your contribution! You've unlocked full recognition!", donationCost(shortfall), latest.id, user.id],
  );
  return { donated: { id: latest.id } };
}

export async function deleteEntry(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = positiveId(form.get('id'));
  if (id !== null) {
    await execute('DELETE FROM green_calculator_results WHERE id = ? AND user_id = ?', [id, user.id]);
    await flash('success', 'Entry deleted successfully.');
  }
  revalidatePath('/certificates');
}

export async function clearHistory(): Promise<void> {
  const user = await requireUser();
  await execute('DELETE FROM green_calculator_results WHERE user_id = ?', [user.id]);
  await flash('success', 'All certificates cleared.');
  revalidatePath('/certificates');
}

/** Admins can relabel their own entries (e.g. to correct an award by hand). */
export async function updateEntry(form: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = positiveId(form.get('id'));
  const award = field(form, 'award_level').trim();
  const message = field(form, 'feedback_message').trim();

  if (id === null || award === '' || charLength(award) > 50 || charLength(message) > 2000) {
    await flash('error', 'Enter an award level of up to 50 characters.');
  } else {
    await execute(
      'UPDATE green_calculator_results SET award_level = ?, feedback_message = ? WHERE id = ? AND user_id = ?',
      [award, message, id, admin.id],
    );
    await flash('success', 'Entry updated successfully.');
  }
  redirect('/certificates');
}
