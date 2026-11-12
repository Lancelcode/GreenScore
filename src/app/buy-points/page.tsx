import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { clampShortfall, donationCost } from '@/lib/scoring';
import { queryOne } from '@/server/db';
import { requireUser } from '@/server/session';
import { ContributionForm } from './ContributionForm';

export const metadata: Metadata = { title: 'Buy Sustainability Points' };

export default async function BuyPointsPage() {
  const user = await requireUser();

  // The amount always comes from the latest stored result, never the URL.
  const latest = await queryOne<{ id: number; shortfall: number }>(
    `SELECT id, shortfall FROM green_calculator_results
      WHERE user_id = ? ORDER BY submitted_at DESC, id DESC LIMIT 1`,
    [user.id],
  );
  const shortfall = latest ? clampShortfall(latest.shortfall) : 0;

  return (
    <PageShell className="page-buy">
      <div className="container content-wrapper">
        <div className="card-bg p-4 text-center buy-card">
          <h1 className="text-success mb-3">💸 Support Your Score</h1>
          <p className="lead">
            Hello <strong>{user.username}</strong>,
          </p>

          {latest === null ? (
            <div className="alert alert-danger mt-3">
              ⚠️ No previous certificate found to update. Please complete the{' '}
              <Link href="/calculator">Green Calculator</Link> first.
            </div>
          ) : shortfall === 0 ? (
            <>
              <div className="alert alert-success mt-3">✅ Your latest result has no shortfall — there is nothing to top up.</div>
              <Link href="/certificates" className="btn btn-outline-secondary mt-3">
                📜 Certificate History
              </Link>
            </>
          ) : (
            <ContributionForm shortfall={shortfall} cost={donationCost(shortfall)} />
          )}
        </div>
      </div>
    </PageShell>
  );
}
