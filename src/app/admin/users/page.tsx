import type { Metadata } from 'next';
import Link from 'next/link';
import { ConfirmForm } from '@/components/ConfirmForm';
import { PageShell } from '@/components/PageShell';
import type { AccountStatus, Role } from '@/lib/auth';
import { dayMonthYear } from '@/lib/format';
import { deleteUser, updateRole, updateStatus } from '@/server/actions/admin';
import { query } from '@/server/db';
import { requireAdmin } from '@/server/session';

export const metadata: Metadata = { title: 'Manage Users' };

interface UserRow {
  id: number;
  username: string;
  email: string;
  created_at: string;
  role: Role;
  status: AccountStatus;
}

const sections: Array<{ label: string; status: AccountStatus; head: string; canDelete: boolean }> = [
  { label: '✅ Active Users', status: 'active', head: 'table-success', canDelete: false },
  { label: '🕓 Inactive Users', status: 'inactive', head: 'table-warning', canDelete: false },
  { label: '🗑️ Users Marked for Deletion', status: 'deactivated', head: 'table-danger', canDelete: true },
];

function RoleStatusForms({ user }: { user: UserRow }) {
  return (
    <>
      {/* Keyed by the stored value so the dropdown shows it again after a save. */}
      <form action={updateRole} className="d-inline-block me-2 mb-1" key={`role-${user.role}`}>
        <input type="hidden" name="user_id" value={user.id} />
        <select name="role" defaultValue={user.role} className="form-select form-select-sm d-inline-block w-auto" aria-label={`Role for ${user.username}`}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>{' '}
        <button className="btn btn-sm btn-outline-primary" type="submit" aria-label={`Save role for ${user.username}`}>
          Save
        </button>
      </form>
      <form action={updateStatus} className="d-inline-block" key={`status-${user.status}`}>
        <input type="hidden" name="user_id" value={user.id} />
        <select name="status" defaultValue={user.status} className="form-select form-select-sm d-inline-block w-auto" aria-label={`Status for ${user.username}`}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deactivated">Deactivated</option>
        </select>{' '}
        <button className="btn btn-sm btn-outline-primary" type="submit" aria-label={`Save status for ${user.username}`}>
          Save
        </button>
      </form>
    </>
  );
}

export default async function ManageUsersPage() {
  await requireAdmin();
  const users = await query<UserRow>('SELECT id, username, email, created_at, role, status FROM new_users ORDER BY username');

  return (
    <PageShell className="page-admin-users">
      <div className="container content-wrapper">
        <div className="auth-wrapper">
          <div className="auth-card">
            <h1 className="h2 text-success text-center mb-4">👥 Manage Users</h1>

            {sections.map((section) => {
              const rows = users.filter((u) => u.status === section.status);
              return (
                <section key={section.status} aria-label={section.label}>
                  <h2 className="section-title">
                    {section.label} <span className="badge bg-secondary fw-normal ms-1">{rows.length}</span>
                  </h2>

                  {rows.length === 0 ? (
                    <p className="text-muted small mb-3">No users in this category.</p>
                  ) : (
                    <div className="table-responsive mb-3">
                      <table className="table table-hover align-middle bg-white rounded shadow-sm">
                        <thead className={section.head}>
                          <tr>
                            <th scope="col">Username</th>
                            <th scope="col">Email</th>
                            <th scope="col">Registered</th>
                            <th scope="col">Role &amp; Status</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((user) => (
                            <tr key={user.id}>
                              <td>
                                <strong>{user.username}</strong>
                              </td>
                              <td className="text-muted">{user.email}</td>
                              <td className="text-muted">{dayMonthYear(user.created_at)}</td>
                              <td>
                                <RoleStatusForms user={user} />
                              </td>
                              <td className="text-nowrap">
                                <Link href={`/admin/users/${user.id}`} className="btn btn-sm btn-outline-secondary">
                                  ✏️ Edit Details
                                </Link>
                                {section.canDelete && (
                                  <ConfirmForm action={deleteUser} confirm="Permanently delete this user?" className="d-inline ms-2">
                                    <input type="hidden" name="user_id" value={user.id} />
                                    <button className="btn btn-sm btn-danger" type="submit">
                                      🗑 Delete
                                    </button>
                                  </ConfirmForm>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
