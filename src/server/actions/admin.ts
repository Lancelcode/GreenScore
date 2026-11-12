'use server';

import { revalidatePath } from 'next/cache';
import type { AccountStatus, Role } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { charLength, field, isEmail, passwordError, positiveId } from '@/lib/validator';
import { execute, queryOne } from '../db';
import { flash } from '../flash';
import { requireAdmin } from '../session';

const STATUSES: readonly AccountStatus[] = ['active', 'inactive', 'deactivated'];
const toRole = (value: unknown): Role => (value === 'admin' ? 'admin' : 'user');
const toStatus = (value: unknown): AccountStatus =>
  STATUSES.includes(value as AccountStatus) ? (value as AccountStatus) : 'active';

export async function updateRole(form: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = positiveId(form.get('user_id'));
  if (id === null) return;
  if (id === admin.id) {
    await flash('error', 'Cannot change your own role.');
  } else {
    await execute('UPDATE new_users SET role = ? WHERE id = ?', [toRole(form.get('role')), id]);
    await flash('success', 'Role updated.');
  }
  revalidatePath('/admin/users');
}

export async function updateStatus(form: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = positiveId(form.get('user_id'));
  if (id === null) return;
  if (id === admin.id) {
    await flash('error', 'Cannot change your own status.');
  } else {
    await execute('UPDATE new_users SET status = ? WHERE id = ?', [toStatus(form.get('status')), id]);
    await flash('success', 'Status updated.');
  }
  revalidatePath('/admin/users');
}

export async function deleteUser(form: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = positiveId(form.get('user_id'));
  if (id === null) return;
  if (id === admin.id) {
    await flash('error', 'You cannot delete your own account.');
  } else {
    // Cascades to the user's results, tips, cards and sessions.
    await execute('DELETE FROM new_users WHERE id = ?', [id]);
    await flash('success', 'User deleted.');
  }
  revalidatePath('/admin/users');
}

export interface EditUserState {
  error?: string;
  success?: string;
  /** What was submitted, so the form can show it again after an error. */
  values?: Record<string, string>;
}

export async function editUser(_previous: EditUserState, form: FormData): Promise<EditUserState> {
  const admin = await requireAdmin();
  const id = positiveId(form.get('id'));
  if (id === null) return { error: 'User not found.' };

  const username = field(form, 'username').trim();
  const email = field(form, 'email').trim();
  const company = field(form, 'company_name').trim();
  const contact = field(form, 'contact_person').trim();
  const phone = field(form, 'phone_number').trim();
  const role = toRole(form.get('role'));
  const status = toStatus(form.get('status'));
  const newPassword = field(form, 'new_password');

  const values = { username, email, company_name: company, contact_person: contact, phone_number: phone, role, status };
  const fail = (error: string): EditUserState => ({ error, values });

  if (username === '' || email === '') return fail('Username and email cannot be empty.');
  if (charLength(username) > 50 || email.length > 100 || charLength(company) > 100 || charLength(contact) > 100 || phone.length > 20) {
    return fail('One of the fields is too long.');
  }
  if (!isEmail(email)) return fail('Enter a valid email address.');
  if (id === admin.id && (role !== 'admin' || status !== 'active')) {
    return fail('You cannot remove your own admin role or deactivate your own account.');
  }
  if (newPassword !== '') {
    const problem = passwordError(newPassword, newPassword);
    if (problem) return fail(problem);
  }

  const taken = await queryOne<{ id: number }>('SELECT id FROM new_users WHERE email = ? AND id <> ?', [email, id]);
  if (taken) return fail('Another account already uses that email address.');

  await execute(
    `UPDATE new_users
        SET username = ?, email = ?, role = ?, status = ?, company_name = ?, contact_person = ?, phone_number = ?
      WHERE id = ?`,
    [username, email, role, status, company, contact, phone, id],
  );

  if (newPassword !== '') {
    await execute('UPDATE new_users SET password = ? WHERE id = ?', [await hashPassword(newPassword), id]);
    // Sign the user out everywhere, so an old session can't outlive the reset.
    if (id !== admin.id) await execute('DELETE FROM sessions WHERE user_id = ?', [id]);
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${id}`);
  return {
    success: newPassword !== '' ? 'User and password updated successfully.' : 'User updated successfully.',
    values,
  };
}
