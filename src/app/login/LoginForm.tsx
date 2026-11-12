'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '@/server/actions/auth';

const initial: LoginState = { errors: [] };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} autoComplete="on">
      {state.errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          {state.errors.join(' ')}
        </div>
      )}
      {state.warning && (
        <div className="alert alert-warning" role="status">
          {state.warning}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control"
          required
          placeholder="Enter your email"
          autoComplete="email"
          defaultValue={state.email}
          key={state.email ?? ''}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control"
          required
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </div>

      <button type="submit" className="btn btn-success w-100 py-2" disabled={pending}>
        Log in
      </button>
    </form>
  );
}
