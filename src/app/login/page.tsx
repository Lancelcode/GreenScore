import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { currentUser } from '@/server/session';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to your GreenScore account to access your sustainability dashboard and certificates.',
};

export default async function LoginPage() {
  if (await currentUser()) redirect('/');

  return (
    <PageShell className="page-auth">
      <div className="container content-wrapper">
        <div className="auth-wrapper">
          <div className="auth-card">
            <h1 className="h2 text-success text-center mb-4">Login to GreenScore</h1>
            <LoginForm />
            <div className="text-center mt-3">
              <Link href="/forgot-password" className="text-success">
                Forgot your password?
              </Link>
            </div>
            <div className="text-center mt-2">
              <Link href="/register" className="text-muted">
                Don&apos;t have an account? Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
