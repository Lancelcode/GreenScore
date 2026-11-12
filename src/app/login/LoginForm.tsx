'use client';

import { useActionState, useRef } from 'react';
import type { DemoAccount } from '@/lib/demo';
import { login, type LoginState } from '@/server/actions/auth';

const initial: LoginState = { errors: [] };

export function LoginForm({ demoAccounts }: { demoAccounts: DemoAccount[] }) {
  const [state, action, pending] = useActionState(login, initial);
  const formRef = useRef<HTMLFormElement>(null);

  // Fill in a demo account and sign straight in.
  function signInAs(account: DemoAccount) {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem('email') as HTMLInputElement).value = account.email;
    (form.elements.namedItem('password') as HTMLInputElement).value = account.password;
    form.requestSubmit();
  }

  return (
    <form action={action} autoComplete="on" ref={formRef}>
      {demoAccounts.length > 0 && (
        <div className="demo-accounts p-3 mb-4">
          <p className="fw-semibold mb-2">Just looking around? Use a demo account:</p>
          <div className="d-flex flex-wrap gap-2">
            {demoAccounts.map((account) => (
              <button
                type="button"
                className="btn btn-outline-success btn-sm"
                key={account.email}
                disabled={pending}
                onClick={() => signInAs(account)}
              >
                {account.label}
              </button>
            ))}
          </div>
          <p className="small text-muted mb-0 mt-2">
            {demoAccounts.map((account) => `${account.label}: ${account.email} / ${account.password}`).join(' · ')}
          </p>
        </div>
      )}

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
