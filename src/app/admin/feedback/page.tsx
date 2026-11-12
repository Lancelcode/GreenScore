import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { longDateTime } from '@/lib/format';
import { saveModeration } from '@/server/actions/feedback';
import { query } from '@/server/db';
import { requireAdmin } from '@/server/session';

export const metadata: Metadata = { title: 'Admin Feedback Panel' };

interface FeedbackRow {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  visible_to_public: number;
  admin_response: string | null;
}

export default async function AdminFeedbackPage() {
  await requireAdmin();
  const rows = await query<FeedbackRow>(
    `SELECT id, name, email, message, created_at, visible_to_public, admin_response
       FROM feedback ORDER BY created_at DESC`,
  );

  return (
    <PageShell className="page-admin-feedback">
      <div className="container content-wrapper">
        <div className="auth-wrapper">
          <div className="auth-card">
            <h1 className="h2 text-success text-center mb-4">🛠 Admin Feedback Panel</h1>

            {rows.length > 0 ? (
              <form action={saveModeration}>
                {rows.map((row) => (
                  <div className="feedback-item" key={row.id}>
                    <input type="hidden" name="id" value={row.id} />
                    <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                      <strong>{row.name}</strong>
                      <small className="text-muted">{longDateTime(row.created_at)}</small>
                    </div>
                    <small className="text-muted">{row.email}</small>
                    <p className="mt-2 mb-2" style={{ whiteSpace: 'pre-line' }}>
                      {row.message}
                    </p>

                    <div className="form-check form-switch mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name={`visible_${row.id}`}
                        id={`vis${row.id}`}
                        defaultChecked={Boolean(row.visible_to_public)}
                      />
                      <label className="form-check-label fw-semibold" htmlFor={`vis${row.id}`}>
                        Publicly Visible
                      </label>
                    </div>

                    <label htmlFor={`resp${row.id}`} className="form-label small fw-semibold">
                      ✍️ Admin Response
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      name={`admin_response_${row.id}`}
                      id={`resp${row.id}`}
                      rows={2}
                      defaultValue={row.admin_response ?? ''}
                    />
                  </div>
                ))}

                <div className="text-end mt-3">
                  <button type="submit" className="btn btn-success px-4 fw-bold">
                    <i className="fas fa-save me-2" aria-hidden="true" /> Save All Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <div style={{ fontSize: '3rem' }} aria-hidden="true">
                  💬
                </div>
                <h2 className="h5 mt-3 mb-1">No feedback yet</h2>
                <p className="text-muted">Feedback submitted by users will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
