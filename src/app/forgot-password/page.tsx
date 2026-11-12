import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { currentUser } from '@/server/session';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your GreenScore account password.',
};

/**
 * Self-service password reset is deliberately disabled. A safe reset needs a
 * single-use, time-limited token sent by email, and GreenScore has no mail
 * delivery configured. Until it does, an administrator resets passwords from
 * Admin → Manage Users → Edit Details.
 */
export default async function ForgotPasswordPage() {
  if (await currentUser()) redirect('/');

  return (
    <PageShell className="page-auth">
      <div className="container content-wrapper">
        <div className="auth-wrapper">
          <div className="auth-card">
            <h1 className="h2 text-success text-center mb-4">🔄 Reset Your Password</h1>
            <div className="alert alert-info" role="status">
              <p className="mb-2">For your security, passwords can&apos;t be reset from this page.</p>
              <p className="mb-0">
                Please ask a GreenScore administrator to reset your password for you. They will confirm your identity
                before doing so.
              </p>
            </div>
            <div className="text-center mt-3">
              <Link href="/login" className="text-success">
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
