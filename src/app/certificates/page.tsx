import type { Metadata } from 'next';
import Link from 'next/link';
import { ConfirmForm } from '@/components/ConfirmForm';
import { PageShell } from '@/components/PageShell';
import { certificateRef, shortDate } from '@/lib/format';
import { awardTier } from '@/lib/scoring';
import { pageNumber, totalPages } from '@/lib/validator';
import { query, queryOne } from '@/server/db';
import { clearHistory, deleteEntry, updateEntry } from '@/server/actions/certificates';
import { requireUser } from '@/server/session';
import { HistoryFilters } from './HistoryFilters';

export const metadata: Metadata = { title: 'Certificate History' };

const PER_PAGE = 8;

interface Entry {
  id: number;
  submitted_at: string;
  award_level: string;
  total_score: number;
  green_count: number;
  amber_count: number;
  red_count: number;
  feedback_message: string | null;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function CertificateHistoryPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const isAdmin = user.role === 'admin';
  const params = await searchParams;

  const levels = (
    await query<{ award_level: string }>('SELECT DISTINCT award_level FROM green_calculator_results WHERE user_id = ?', [user.id])
  ).map((row) => row.award_level);

  const page = pageNumber(one(params.page));
  const sort = one(params.sort) === 'oldest' ? 'oldest' : 'newest';
  const requestedLevel = one(params.level) ?? '';
  // Only filter by a level the user actually has; anything else means "all".
  const level = levels.includes(requestedLevel) ? requestedLevel : '';

  const where = level ? 'WHERE user_id = ? AND award_level = ?' : 'WHERE user_id = ?';
  const whereParams = level ? [user.id, level] : [user.id];

  const total = Number(
    (await queryOne<{ total: number }>(`SELECT COUNT(*) AS total FROM green_calculator_results ${where}`, whereParams))?.total ?? 0,
  );
  const pages = totalPages(total, PER_PAGE);
  // The direction comes from a fixed choice, never from user text.
  const direction = sort === 'oldest' ? 'ASC' : 'DESC';
  const entries = await query<Entry>(
    `SELECT id, submitted_at, award_level, total_score, green_count, amber_count, red_count, feedback_message
       FROM green_calculator_results ${where}
      ORDER BY submitted_at ${direction}, id ${direction}
      LIMIT ${PER_PAGE} OFFSET ${(page - 1) * PER_PAGE}`,
    whereParams,
  );

  const pageHref = (n: number) => {
    const q = new URLSearchParams({ page: String(n) });
    if (sort !== 'newest') q.set('sort', sort);
    if (level) q.set('level', level);
    return `/certificates?${q.toString()}`;
  };

  return (
    <PageShell className="page-history">
      <div className="container content-wrapper">
        <h1 className="text-white text-center mb-4">📜 Certificate History</h1>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <HistoryFilters sort={sort} level={level} levels={levels} />
          <ConfirmForm action={clearHistory} confirm="Clear all certificates? This cannot be undone.">
            <button type="submit" className="btn btn-sm btn-outline-danger bg-white">
              🧹 Clear All
            </button>
          </ConfirmForm>
        </div>

        {entries.length > 0 ? (
          <>
            <div className="row gy-4">
              {entries.map((row) => {
                const ref = certificateRef(row.id, row.submitted_at);
                const score = Math.min(100, row.total_score);
                const tier = awardTier(row.award_level);
                return (
                  <div className="col-md-6 col-xl-4" key={row.id}>
                    <div className={`cert-card award-${tier} h-100 d-flex flex-column`}>
                      <div className="p-3 d-flex flex-column h-100">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="cert-ref">{ref}</span>
                          <small className="text-muted">{shortDate(row.submitted_at)}</small>
                        </div>

                        <div className="mb-3">
                          <span className={`pill badge-${tier}`}>{row.award_level}</span>
                        </div>

                        <div className="mb-1 d-flex justify-content-between">
                          <small className="text-muted">Score</small>
                          <small className="fw-semibold">{score} / 100</small>
                        </div>
                        <div className="cert-score-bar mb-3">
                          <div className="cert-score-fill" style={{ width: `${score}%` }} />
                        </div>

                        <div className="d-flex gap-2 mb-3">
                          <span className="pill pill-green">🟢 {row.green_count}</span>
                          <span className="pill pill-amber">🟠 {row.amber_count}</span>
                          <span className="pill pill-red">🔴 {row.red_count}</span>
                        </div>

                        {isAdmin ? (
                          <form action={updateEntry} className="mb-3">
                            <input type="hidden" name="id" value={row.id} />
                            <input
                              type="text"
                              name="award_level"
                              defaultValue={row.award_level}
                              className="form-control form-control-sm mb-1"
                              placeholder="Award level"
                              aria-label={`Award level for ${ref}`}
                              maxLength={50}
                              required
                            />
                            <input
                              type="text"
                              name="feedback_message"
                              defaultValue={row.feedback_message ?? ''}
                              className="form-control form-control-sm mb-2"
                              placeholder="Feedback message"
                              aria-label={`Feedback message for ${ref}`}
                              required
                            />
                            <button type="submit" className="btn btn-sm btn-primary w-100">
                              💾 Save
                            </button>
                          </form>
                        ) : (
                          row.feedback_message && (
                            <p className="small text-muted mb-3 fst-italic">&ldquo;{row.feedback_message}&rdquo;</p>
                          )
                        )}

                        <div className="d-flex gap-2 mt-auto pt-2">
                          <Link
                            href={`/certificates/${row.id}`}
                            className="btn btn-sm btn-success flex-grow-1"
                            aria-label={`View certificate ${ref}`}
                          >
                            📄 View
                          </Link>
                          <ConfirmForm action={deleteEntry} confirm="Delete this entry?" className="d-inline">
                            <input type="hidden" name="id" value={row.id} />
                            <button
                              type="submit"
                              className="btn btn-sm btn-outline-danger icon-btn"
                              title="Delete"
                              aria-label={`Delete ${ref}`}
                            >
                              🗑️
                            </button>
                          </ConfirmForm>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pages > 1 && (
              <nav className="mt-4" aria-label="Certificate history pages">
                <ul className="pagination justify-content-center">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <li className={`page-item ${n === page ? 'active' : ''}`} key={n}>
                      <Link className="page-link" href={pageHref(n)} aria-current={n === page ? 'page' : undefined}>
                        {n}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </>
        ) : (
          <div className="card card-bg shadow-sm p-5 text-center">
            <div style={{ fontSize: '3rem' }} aria-hidden="true">
              📭
            </div>
            <h2 className="h4 mt-3 mb-2">No certificates yet</h2>
            <p className="text-muted mb-4">Complete the Green Calculator to earn your first certificate.</p>
            <Link href="/calculator" className="btn btn-success px-4">
              🧮 Take the Green Calculator
            </Link>
          </div>
        )}

        <div className="text-center mt-4">
          <Link href="/calculator" className="btn btn-outline-light">
            🧮 Take the Calculator Again
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
