'use server';

import { revalidatePath } from 'next/cache';
import { positiveId, tipMessage } from '@/lib/validator';
import { execute } from '../db';
import { flash } from '../flash';
import { requireUser } from '../session';

// Every query includes `user_id = ?`, so members can only change their own tips.

export async function postTip(form: FormData): Promise<void> {
  const user = await requireUser();
  const message = tipMessage(form.get('message'));
  if (message === null) {
    await flash('warning', 'Please enter a tip of up to 500 characters.');
  } else {
    await execute('INSERT INTO community_tips (user_id, message) VALUES (?, ?)', [user.id, message]);
    await flash('success', 'Your tip has been posted!');
  }
  revalidatePath('/community');
}

export async function editTip(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = positiveId(form.get('tip_id'));
  const message = tipMessage(form.get('message'));
  if (id !== null && message !== null) {
    await execute('UPDATE community_tips SET message = ? WHERE id = ? AND user_id = ?', [message, id, user.id]);
    await flash('success', 'Your tip has been updated.');
  }
  revalidatePath('/community');
}

export async function deleteTip(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = positiveId(form.get('id'));
  if (id !== null) {
    await execute('DELETE FROM community_tips WHERE id = ? AND user_id = ? LIMIT 1', [id, user.id]);
  }
  revalidatePath('/community');
}

export async function clearMyTips(): Promise<void> {
  const user = await requireUser();
  await execute('DELETE FROM community_tips WHERE user_id = ?', [user.id]);
  await flash('success', 'All your tips have been cleared.');
  revalidatePath('/community');
}
