import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { longDateTime } from '@/lib/format';
import { sendFeedback } from '@/server/actions/feedback';
import { query } from '@/server/db';
import { requireUser } from '@/server/session';

export const metadata: Metadata = { title: 'Feedback' };

interface PublicFeedback {
  id: number;
  name: string;
  created_at: string;
  message: string;
  admin_response: string | null;
  admin_username: string | null;
  admin_response_at: string | null;
}

export default async function FeedbackPage() {
  const user = await requireUser();
  const published = await query<PublicFeedback>(
    `SELECT id, name, created_at, message, admin_response, admin_username, admin_response_at
       FROM feedback WHERE visible_to_public = 1 ORDER BY created_at DESC`,
  );

  return (
    <PageShell className="page-feedback">
      <div className="container content-wrapper">
        <h1 className="h2 text-white text-center mb-4">💬 We Value Your Feedback</h1>

        <form action={sendFeedback} className="card card-bg p-4 shadow-sm mb-5">
          <div className="form-group mb-3">
            <label htmlFor="fbName" className="form-label">
              Your Name:
            </label>
            <input type="text" id="fbName" className="form-control" value={user.username} disabled readOnly />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="fbEmail" className="form-label">
              Your Email:
            </label>
            <input type="email" id="fbEmail" className="form-control" value={user.email} disabled readOnly />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="fbMessage" className="form-label">
              Your Feedback:
            </label>
            <textarea className="form-control" name="message" id="fbMessage" rows={4} required maxLength={2000} />
          </div>
          <button type="submit" className="btn btn-success w-100">
            ✅ Submit Feedback
          </button>
        </form>

        <h2 className="h4 text-white mb-4">🗃 Public Feedback</h2>

        {published.length > 0 ? (
          published.map((row) => (
            <div className="card card-bg card-body mb-4 shadow-sm" key={row.id}>
              <p className="mb-1">
                <strong>{row.name}</strong>
              </p>
              <small className="text-muted">Asked {longDateTime(row.created_at)}</small>
              <p className="mt-2" style={{ whiteSpace: 'pre-line' }}>
                {row.message}
              </p>

              {row.admin_response && (
                <>
                  <hr />
                  <p className="mb-1">
                    <strong>Answered by {row.admin_username}</strong>{' '}
                    {row.admin_response_at && <small className="text-muted">{longDateTime(row.admin_response_at)}</small>}
                  </p>
                  <div className="alert alert-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>
                    {row.admin_response}
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="card card-bg p-5 text-center">
            <div style={{ fontSize: '3rem' }} aria-hidden="true">
              💬
            </div>
            <h3 className="h5 mt-3 mb-2">No public feedback yet</h3>
            <p className="text-muted mb-0">Be the first to submit feedback above.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
