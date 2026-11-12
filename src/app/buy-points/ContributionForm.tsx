'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { money } from '@/lib/format';
import { contribute, type ContributionState } from '@/server/actions/certificates';

interface ContributionFormProps {
  shortfall: number;
  cost: number;
}

export function ContributionForm({ shortfall, cost }: ContributionFormProps) {
  const [state, action, pending] = useActionState(contribute, {} as ContributionState);
  const amount = money(cost);

  if (state.donated) {
    return (
      <>
        <div className="alert alert-success mt-3" role="status">
          🎉 Thank you! Your certificate has been updated to <strong>Certificate of Gold 🥇</strong>.
        </div>
        <Link href={`/certificates/${state.donated.id}`} className="btn btn-success mt-3 me-2">
          📄 View Your Certificate
        </Link>
        <Link href="/certificates" className="btn btn-outline-secondary mt-3">
          📜 Certificate History
        </Link>
      </>
    );
  }

  return (
    <>
      {state.error && (
        <div className="alert alert-danger mt-3" role="alert">
          {state.error}
        </div>
      )}
      <p className="mt-3">
        You&apos;re currently <strong>{shortfall} points</strong> short of a perfect score.
      </p>
      <p>
        Contributing <strong>£{amount}</strong> will close the gap and upgrade your certificate to <strong>Gold 🥇</strong>.
      </p>

      <div className="alert alert-info mt-3 text-start">
        <strong>What you get:</strong>
        <ul className="mb-0 mt-1">
          <li>
            Your latest certificate upgraded to <strong>Gold</strong>
          </li>
          <li>£{amount} contributed to global sustainability initiatives</li>
          <li>Your score gap closed to zero</li>
        </ul>
      </div>

      <form action={action} className="mt-4">
        <p className="small text-muted">This is a demonstration — no payment is taken.</p>
        <button type="submit" className="btn btn-warning btn-lg px-5" disabled={pending}>
          ✅ Confirm £{amount} Contribution
        </button>
        <div className="mt-3">
          <Link href="/calculator" className="btn btn-outline-secondary">
            ⬅ Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
