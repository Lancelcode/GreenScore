'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { charLength, field, positiveId } from '@/lib/validator';
import { execute, pool } from '../db';
import { flash } from '../flash';
import { requireAdmin, requireUser } from '../session';

const MAX_LENGTH = 2000;

export async function sendFeedback(form: FormData): Promise<void> {
  const user = await requireUser();
  const message = field(form, 'message').trim();
  if (message === '' || charLength(message) > MAX_LENGTH) {
    await flash('warning', `Please enter your feedback (up to ${MAX_LENGTH} characters) before submitting.`);
  } else {
    await execute('INSERT INTO feedback (user_id, name, email, message) VALUES (?, ?, ?, ?)', [
      user.id,
      user.username,
      user.email,
      message,
    ]);
    await flash('success', 'Thank you! Your feedback has been submitted and will be answered by one of our admins.');
  }
  redirect('/feedback');
}

/** Save every admin reply and visibility switch on the moderation page at once. */
export async function saveModeration(form: FormData): Promise<void> {
  const admin = await requireAdmin();
  const ids = form
    .getAll('id')
    .map((value) => positiveId(value))
    .filter((id): id is number => id !== null);

  const connection = await pool().getConnection();
  try {
    await connection.beginTransaction();
    for (const id of ids) {
      const response = field(form, `admin_response_${id}`).trim().slice(0, 5000);
      const isPublic = form.get(`visible_${id}`) === 'on' ? 1 : 0;
      await connection.execute(
        `UPDATE feedback
            SET visible_to_public = ?, admin_response = ?, admin_username = ?, admin_response_at = NOW()
          WHERE id = ?`,
        [isPublic, response, admin.username, id],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  await flash('success', 'Feedback changes saved successfully.');
  redirect('/admin/feedback');
}

export async function deleteFeedback(form: FormData): Promise<void> {
  await requireAdmin();
  const id = positiveId(form.get('id'));
  if (id !== null) {
    await execute('DELETE FROM feedback WHERE id = ? LIMIT 1', [id]);
  }
  revalidatePath('/admin/public-feedback');
}
