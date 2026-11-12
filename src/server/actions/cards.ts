'use server';

import { redirect } from 'next/navigation';
import { lastFour, parseExpiry, toSqlDate, validateDetails, validateNew } from '@/lib/card';
import { field, positiveId } from '@/lib/validator';
import { execute } from '../db';
import { flash } from '../flash';
import { requireUser } from '../session';

/*
 * Only the last four digits, the expiry month and the cardholder name are
 * stored. The full number is discarded after validation and the security
 * code (CVV) is never collected — storing it is forbidden by PCI DSS.
 */

export async function addCard(form: FormData): Promise<void> {
  const user = await requireUser();
  const number = field(form, 'card_number').trim();
  const expiry = field(form, 'expiry_date').trim();
  const holder = field(form, 'card_name').trim();

  const errors = validateNew(number, expiry, holder);
  if (errors.length > 0) {
    await flash('error', errors.join(' '));
    redirect('/account');
  }

  const last4 = lastFour(number);
  await execute('INSERT INTO credit_cards (user_id, card_last4, expiry_date, cardholder_name) VALUES (?, ?, ?, ?)', [
    user.id,
    last4,
    toSqlDate(parseExpiry(expiry)!),
    holder,
  ]);
  await flash('success', `Card ending ${last4} added.`);
  redirect('/account/cards');
}

export async function updateCard(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = positiveId(form.get('card_id'));
  const expiry = field(form, 'expiry_date').trim();
  const holder = field(form, 'card_name').trim();

  const errors = validateDetails(expiry, holder);
  if (id === null || errors.length > 0) {
    await flash('error', errors.join(' ') || 'Card not found.');
  } else {
    await execute('UPDATE credit_cards SET expiry_date = ?, cardholder_name = ? WHERE id = ? AND user_id = ?', [
      toSqlDate(parseExpiry(expiry)!),
      holder,
      id,
      user.id,
    ]);
    await flash('success', 'Card updated successfully.');
  }
  redirect('/account/cards');
}

export async function deleteCard(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = positiveId(form.get('card_id'));
  if (id !== null) {
    await execute('DELETE FROM credit_cards WHERE id = ? AND user_id = ?', [id, user.id]);
    await flash('success', 'Card deleted.');
  }
  redirect('/account/cards');
}
