import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import type { AccountStatus, Role } from '@/lib/auth';
import { positiveId } from '@/lib/validator';
import { queryOne } from '@/server/db';
import { requireAdmin } from '@/server/session';
import { EditUserForm } from './EditUserForm';

export const metadata: Metadata = { title: 'Edit User' };

export interface EditableUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  status: AccountStatus;
  company_name: string | null;
  contact_person: string | null;
  phone_number: string | null;
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = positiveId((await params).id);
  if (id === null) notFound();

  const user = await queryOne<EditableUser>(
    `SELECT id, username, email, role, status, company_name, contact_person, phone_number
       FROM new_users WHERE id = ?`,
    [id],
  );
  if (!user) notFound();

  return (
    <PageShell overlay={60} className="page-admin-edit">
      <div className="container content-wrapper">
        <div className="auth-wrapper">
          <div className="auth-card">
            <h1 className="h2 text-success text-center mb-4">✏️ Edit User</h1>
            <EditUserForm user={user} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
