import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { CSSProperties } from 'react';
import { PageShell } from '@/components/PageShell';
import { certificateRef, longDate } from '@/lib/format';
import { awardTier } from '@/lib/scoring';
import { positiveId } from '@/lib/validator';
import { queryOne } from '@/server/db';
import { requireUser } from '@/server/session';
import { PrintButton } from './PrintButton';

export const metadata: Metadata = {
  title: { absolute: 'GreenScore Certificate' },
  description: 'Your official GreenScore sustainability certificate.',
};

interface Certificate {
  id: number;
  award_level: string;
  total_score: number;
  submitted_at: string;
  username: string;
  company_name: string | null;
}

// Border colour and a darker shade of it for text (WCAG AA contrast on white).
const COLOURS = {
  gold: ['#d4a017', '#7a5c00'],
  silver: ['#8a9ba8', '#4f5b63'],
  bronze: ['#a0522d', '#8a4524'],
  other: ['#4caf50', '#2e7d32'],
} as const;

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = positiveId((await params).id);
  if (id === null) redirect('/certificates');

  // Admins can view any certificate; everyone else only their own. The award
  // shown always comes from the database, never from the URL.
  const cert = await queryOne<Certificate>(
    `SELECT gcr.id, gcr.award_level, gcr.total_score, gcr.submitted_at, u.username, u.company_name
       FROM green_calculator_results gcr
       JOIN new_users u ON gcr.user_id = u.id
      WHERE gcr.id = ? ${user.role === 'admin' ? '' : 'AND gcr.user_id = ?'}`,
    user.role === 'admin' ? [id] : [id, user.id],
  );
  if (!cert) redirect('/certificates');

  const ref = certificateRef(cert.id, cert.submitted_at);
  const [colour, text] = COLOURS[awardTier(cert.award_level)];
  const style = { '--award-colour': colour, '--award-text': text } as CSSProperties;

  return (
    <PageShell className="page-certificate">
      <div className="cert-page">
        <div>
          <div className="certificate" style={style}>
            <h1 className="visually-hidden">GreenScore certificate {ref}</h1>
            <div className="cert-watermark" aria-hidden="true">
              🌿
            </div>

            <div className="cert-logo" aria-hidden="true">
              🌿
            </div>
            <div className="cert-title">GreenScore — Official Certificate of Achievement</div>

            <div className="cert-body">
              <p>This certifies that</p>
              <div className="cert-name">{cert.username}</div>
              <div className="cert-company">{cert.company_name ?? 'Independent'}</div>
              <p>has achieved the award level of</p>
              <div className="cert-award">{cert.award_level}</div>
              <div className="cert-score">Assessment Score: {cert.total_score} / 100</div>
            </div>

            <div className="cert-footer">
              <div>
                <strong>GreenScore</strong>
                <br />
                Sustainability Certification Programme
                <br />
                <span className="ref">{ref}</span>
              </div>
              <div className="text-end">
                Issued on
                <br />
                <strong>{longDate(cert.submitted_at)}</strong>
              </div>
            </div>
          </div>

          <div className="action-bar">
            <PrintButton />
            <Link href="/certificates" className="btn btn-outline-light btn-lg px-4">
              ⬅ Back to History
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
