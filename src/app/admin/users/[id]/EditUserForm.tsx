'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { editUser, type EditUserState } from '@/server/actions/admin';
import type { EditableUser } from './page';

const text = [
  { name: 'username', label: 'Username:', type: 'text', maxLength: 50, required: true },
  { name: 'email', label: 'Email:', type: 'email', maxLength: 100, required: true },
  { name: 'company_name', label: 'Company Name:', type: 'text', maxLength: 100, required: false },
  { name: 'contact_person', label: 'Contact Person:', type: 'text', maxLength: 100, required: false },
  { name: 'phone_number', label: 'Phone Number:', type: 'tel', maxLength: 20, required: false },
] as const;

export function EditUserForm({ user }: { user: EditableUser }) {
  const [state, action, pending] = useActionState(editUser, {} as EditUserState);
  // After a save attempt, show what was submitted (React clears the form once the action finishes).
  const value = (name: keyof EditableUser): string => state.values?.[name] ?? String(user[name] ?? '');

  return (
    <>
      {state.error && (
        <div className="alert alert-danger" role="alert">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="alert alert-success" role="status">
          {state.success}
        </div>
      )}

      {/* Re-created after every save attempt so the fields pick up `value()`. */}
      <form action={action} key={JSON.stringify(state)}>
        <input type="hidden" name="id" value={user.id} />

        {text.map((f) => (
          <div className="mb-3" key={f.name}>
            <label htmlFor={f.name} className="form-label">
              {f.label}
            </label>
            <input
              type={f.type}
              name={f.name}
              id={f.name}
              className="form-control"
              defaultValue={value(f.name)}
              required={f.required}
              maxLength={f.maxLength}
            />
          </div>
        ))}

        <div className="mb-3">
          <label htmlFor="role" className="form-label">
            Role:
          </label>
          <select name="role" id="role" className="form-select" defaultValue={value('role')}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="status" className="form-label">
            Status:
          </label>
          <select name="status" id="status" className="form-select" defaultValue={value('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="new_password" className="form-label">
            New password (optional):
          </label>
          <input
            type="password"
            name="new_password"
            id="new_password"
            className="form-control"
            autoComplete="new-password"
            maxLength={72}
            aria-describedby="newPasswordHelp"
          />
          <div id="newPasswordHelp" className="form-text">
            Leave blank to keep the current password. At least 8 characters with upper- and lower-case letters and a
            number.
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <Link href="/admin/users" className="btn btn-secondary">
            ← Back
          </Link>
          <button type="submit" className="btn btn-success" disabled={pending}>
            💾 Update User
          </button>
        </div>
      </form>
    </>
  );
}
