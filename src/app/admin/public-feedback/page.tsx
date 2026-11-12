import type { Metadata } from 'next';
import { ConfirmForm } from '@/components/ConfirmForm';
import { PageShell } from '@/components/PageShell';
import { longDateTime } from '@/lib/format';
import { deleteFeedback } from '@/server/actions/feedback';
import { query } from '@/server/db';
import { requireAdmin } from '@/server/session';

export const metadata: Metadata = { title: 'Community Feedback' };

interface PublicRow {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  admin_response: string | null;
  admin_username: string | null;
  admin_response_at: string | null;
}

export default async function PublicFeedbackPage() {
  await requireAdmin();
  const rows = await query<PublicRow>(
    `SELECT id, name, email, message, created_at, admin_response, admin_username, admin_response_at
       FROM feedback WHERE visible_to_public = 1 ORDER BY created_at DESC`,
  );

  return (
    <PageShell overlay={60} className="page-public-feedback">
      <div className="container content-wrapper">
        <h1 className="h2 text-white text-center mb-5">💬 Community Feedback</h1>
        {rows.length === 0 && (
          <div className="feedback-card text-center">No feedback is published yet. Choose what to publish in the Admin Feedback Panel.</div>
        )}
        {rows.map((row) => (
          <div className="feedback-card" id={`feedback-${row.id}`} key={row.id}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <strong>{row.name}</strong>
                <span className="feedback-meta ms-1">({row.email})</span>
              </div>
              <ConfirmForm action={deleteFeedback} confirm="Delete this feedback?" className="d-inline ms-2 flex-shrink-0">
                <input type="hidden" name="id" value={row.id} />
                <button type="submit" className="btn btn-sm btn-outline-danger" aria-label={`Delete feedback from ${row.name}`}>
                  🗑
                </button>
              </ConfirmForm>
            </div>

            <div className="feedback-meta mb-2">{longDateTime(row.created_at)}</div>
            <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
              {row.message}
            </p>

            {row.admin_response && (
              <>
                <hr />
                <div className="admin-response">
                  <div className="admin-meta mb-1">
                    <strong>Answered by {row.admin_username}</strong>
                    {row.admin_response_at && <> · {longDateTime(row.admin_response_at)}</>}
                  </div>
                  <div style={{ whiteSpace: 'pre-line' }}>{row.admin_response}</div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
