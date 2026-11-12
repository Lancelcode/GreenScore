import Link from 'next/link';
import { currentUser } from '@/server/session';
import { PageShell } from './PageShell';

interface ErrorCardProps {
  code: 403 | 404;
}

/** The custom "Page Not Found" and "Access Denied" pages. */
export async function ErrorCard({ code }: ErrorCardProps) {
  const user = await currentUser();

  return (
    <PageShell overlay={60} className="page-error">
      <div className="error-page">
        <div className="error-code" aria-hidden="true">
          {code}
        </div>
        <div className="error-card">
          {code === 404 ? (
            <>
              <div className="error-emoji mb-3">🌿</div>
              <h1 className="h3 text-success fw-bold mb-2">Page Not Found</h1>
              <p className="text-muted mb-4">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
            </>
          ) : (
            <>
              <div className="error-emoji mb-3">🔒</div>
              <h1 className="h3 fw-bold mb-2 text-denied">Access Denied</h1>
              <p className="text-muted mb-4">
                You don&apos;t have permission to view this page.{' '}
                {user ? 'This area is restricted to administrators.' : 'Please log in first.'}
              </p>
            </>
          )}
          <div className="d-flex flex-column gap-2">
            <Link href="/" className="btn btn-success">
              🏠 Go to Home
            </Link>
            {user ? (
              <Link href="/account" className="btn btn-outline-secondary">
                👤 My Profile
              </Link>
            ) : (
              <Link href="/login" className="btn btn-outline-secondary">
                🔐 Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
