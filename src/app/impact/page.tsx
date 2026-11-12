import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { forGreenCount, progressPercent } from '@/lib/badges';
import { money } from '@/lib/format';
import { queryOne } from '@/server/db';
import { requireUser } from '@/server/session';

export const metadata: Metadata = { title: 'My Impact Report' };

export default async function ImpactPage() {
  const user = await requireUser();
  const totals = await queryOne<{ total: number; green: number | null; donation: number | null }>(
    `SELECT COUNT(*) AS total, SUM(green_count) AS green, SUM(donation_cost) AS donation
       FROM green_calculator_results WHERE user_id = ?`,
    [user.id],
  );
  const submissions = Number(totals?.total ?? 0);
  const green = Number(totals?.green ?? 0);
  const donation = Number(totals?.donation ?? 0);

  const badge = forGreenCount(green);
  const progress = progressPercent(green);
  const image = `/assets/images/illustrations/${badge.slug}.jpg`;
  const hasImage = existsSync(join(process.cwd(), 'public', image));

  return (
    <PageShell overlay={60} className="page-impact">
      <div className="container content-wrapper">
        <h1 className="text-white text-center mb-5">📊 My Sustainability Impact</h1>

        <div className="card-bg p-4 shadow mb-5" style={{ color: '#333' }}>
          <h2 className="h3 mb-3 text-success">🧾 Report Summary</h2>
          <p>
            <strong>Total Submissions:</strong> {submissions}
          </p>
          <p>
            <strong>Green Answers Earned:</strong> {green} / 100
          </p>
          <p>
            <strong>Total Contributions (demo):</strong> £{money(donation)}
          </p>
          <div className="mb-3">
            <p className="form-label fw-semibold mb-1" id="journeyLabel">
              Your Green Journey Progress
            </p>
            <div className="progress">
              <div
                className="progress-bar bg-success"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-labelledby="journeyLabel"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {progress}%
              </div>
            </div>
          </div>
          <p className="fs-5 fw-bold mb-0">
            🏅 Current Badge:{' '}
            <span className="text-success">
              Level {badge.level} — {badge.label}
            </span>
          </p>
        </div>

        <div className="text-center d-flex flex-wrap justify-content-center gap-3">
          <Link href="/certificates" className="btn btn-lg btn-outline-light fw-bold px-4 py-2 shadow-sm">
            📄 View Certificates
          </Link>
          <Link href="/calculator" className="btn btn-lg btn-success fw-bold px-4 py-2 shadow-sm">
            🧮 Take the Calculator Again
          </Link>
          <Link href="/account" className="btn btn-lg btn-outline-light fw-bold px-4 py-2 shadow-sm">
            👤 Back to My Profile
          </Link>
        </div>

        <div className="card-bg p-4 shadow mt-5 mb-5" style={{ color: '#333' }}>
          <div className="text-center px-md-4">
            <h2 className="h3 text-success mb-2">🏆 Your Current Title</h2>
            <p className="text-secondary mb-1">Level {badge.level}</p>
            <p className="h2 fw-bold mb-4">{badge.label}</p>
            {hasImage && (
              <div className="d-flex justify-content-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- local illustration */}
                <img
                  src={image}
                  alt={badge.label}
                  className="img-fluid my-3"
                  style={{ maxWidth: 560, borderRadius: '1rem', boxShadow: '0 0 16px rgba(0,0,0,0.25)' }}
                />
              </div>
            )}
            <p className="lead text-secondary mt-3 mb-0">
              <em>{badge.text}</em>
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
