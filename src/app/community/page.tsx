import type { Metadata } from 'next';
import Link from 'next/link';
import { ConfirmForm } from '@/components/ConfirmForm';
import { PageShell } from '@/components/PageShell';
import { longDateTime } from '@/lib/format';
import { offset, pageNumber, totalPages } from '@/lib/validator';
import { clearMyTips, deleteTip } from '@/server/actions/community';
import { query, queryOne } from '@/server/db';
import { currentUser } from '@/server/session';
import { EditTipDialog, TipComposer } from './TipForms';

export const metadata: Metadata = { title: 'Community Board' };

const PER_PAGE = 5;

interface Tip {
  id: number;
  user_id: number;
  message: string;
  created_at: string;
  username: string;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Escape LIKE wildcards so a search for "100%" means the text "100%". */
const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export default async function CommunityPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await currentUser();
  const params = await searchParams;
  const page = pageNumber(one(params.page));
  const search = [...(one(params.search) ?? '').trim()].slice(0, 100).join('');

  const where = search ? 'WHERE ct.message LIKE ?' : '';
  const whereParams = search ? [likePattern(search)] : [];

  const total = Number(
    (await queryOne<{ total: number }>(`SELECT COUNT(*) AS total FROM community_tips ct ${where}`, whereParams))?.total ?? 0,
  );
  // Only the author's display name is selected — never their email address.
  const tips = await query<Tip>(
    `SELECT ct.id, ct.user_id, ct.message, ct.created_at, u.username
       FROM community_tips ct
       JOIN new_users u ON ct.user_id = u.id
       ${where}
      ORDER BY ct.created_at DESC, ct.id DESC
      LIMIT ${PER_PAGE} OFFSET ${offset(page, PER_PAGE)}`,
    whereParams,
  );
  const pages = totalPages(total, PER_PAGE);

  const pageHref = (n: number) => {
    const q = new URLSearchParams({ page: String(n) });
    if (search) q.set('search', search);
    return `/community?${q.toString()}`;
  };

  return (
    <PageShell className="page-community">
      <div className="container content-wrapper">
        <h1 className="text-white text-center mb-4">📝 Sustainability Community Board</h1>
        <p className="lead text-center text-white mb-4">Share your eco-friendly tips 💚</p>

        <form method="get" action="/community" className="mb-4" role="search" aria-label="Search community tips">
          <div className="input-group">
            <label htmlFor="tipSearch" className="visually-hidden">
              Search tips
            </label>
            <input
              type="search"
              name="search"
              id="tipSearch"
              className="form-control"
              placeholder="🔍 Search tips..."
              defaultValue={search}
              key={search}
              maxLength={100}
            />
            <button className="btn btn-success" type="submit">
              Search
            </button>
            {search && (
              <Link href="/community" className="btn btn-outline-light">
                ✕ Clear search
              </Link>
            )}
          </div>
          {search && (
            <small className="text-white mt-1 d-block" role="status">
              {total} result{total !== 1 ? 's' : ''} for &ldquo;<strong>{search}</strong>&rdquo;
            </small>
          )}
        </form>

        <div className="card card-bg shadow-sm mb-4">
          <div className="card-body">
            {user ? (
              <>
                <TipComposer />
                <div className="mt-3">
                  <ConfirmForm action={clearMyTips} confirm="⚠️ Clear all your tips? This cannot be undone.">
                    <button type="submit" className="btn btn-danger">
                      🧹 Clear My Tips
                    </button>
                  </ConfirmForm>
                </div>
                <div className="mt-3">
                  <Link href="/account" className="btn btn-outline-dark">
                    👤 Back to My Profile
                  </Link>
                </div>
              </>
            ) : (
              <p className="mb-0">
                <Link href="/login" className="fw-semibold text-success">
                  Log in
                </Link>{' '}
                or{' '}
                <Link href="/register" className="fw-semibold text-success">
                  create an account
                </Link>{' '}
                to share your own tips. 🌱
              </p>
            )}
          </div>
        </div>

        <div className="card card-bg shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h4 mb-4">💬 Latest Tips</h2>

            {tips.length > 0 ? (
              tips.map((tip) => (
                <div className="mb-4 border-bottom pb-3" id={`tip-${tip.id}`} key={tip.id}>
                  <p className="mb-1">🟢 {tip.message}</p>
                  <small className="text-muted">
                    By {tip.username} • {longDateTime(tip.created_at)}
                  </small>

                  {user?.id === tip.user_id && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-1"
                        data-bs-toggle="modal"
                        data-bs-target="#editModal"
                        data-id={tip.id}
                        data-message={tip.message}
                      >
                        ✏️ Edit
                      </button>
                      <form action={deleteTip} className="d-inline">
                        <input type="hidden" name="id" value={tip.id} />
                        <button type="submit" className="btn btn-sm btn-outline-danger">
                          🗑 Delete
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-3">
                {search ? 'No tips match your search.' : 'No tips shared yet. Be the first! 🌱'}
              </p>
            )}
          </div>
        </div>

        {pages > 1 && (
          <nav className="mt-4" aria-label="Community tips pagination">
            <ul className="pagination justify-content-center">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <li className={`page-item ${n === page ? 'active' : ''}`} key={n}>
                  <Link className="page-link" href={pageHref(n)} aria-label={`Page ${n}`} aria-current={n === page ? 'page' : undefined}>
                    {n}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {user && <EditTipDialog />}
    </PageShell>
  );
}
