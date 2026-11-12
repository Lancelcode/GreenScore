import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { currentUser } from '@/server/session';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Register',
  description: "Create a GreenScore account to start measuring your organisation's sustainability impact.",
};

export default async function RegisterPage() {
  if (await currentUser()) redirect('/');

  return (
    <PageShell className="page-auth">
      <div className="container content-wrapper">
        <div className="auth-wrapper">
          <div className="auth-card">
            <h1 className="h2 text-success text-center mb-4">Create Your Account</h1>
            <RegisterForm />
            <div className="text-center mt-3">
              <Link href="/login" className="text-muted">
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
