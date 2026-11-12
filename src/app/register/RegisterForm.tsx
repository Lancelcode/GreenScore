'use client';

import { useActionState, useState } from 'react';
import { COMMON_PASSWORDS } from '@/lib/validator';
import { register, type RegisterState } from '@/server/actions/auth';

const initial: RegisterState = { errors: [], values: {} };

interface Strength {
  label: string;
  colour: string;
  text: string;
  width: string;
}

const HINT: Strength = { label: 'Min 8 chars · uppercase · lowercase · number', colour: '#999', text: '#595959', width: '0%' };

/** A rough guide for the user; the real rules are enforced on the server. */
function strength(password: string): Strength {
  if (password.length === 0) return HINT;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) score = 1;

  if (score <= 2) return { label: 'Weak', colour: '#dc3545', text: '#b02a37', width: '25%' };
  if (score === 3) return { label: 'Fair', colour: '#fd7e14', text: '#9a4a00', width: '50%' };
  if (score === 4) return { label: 'Good', colour: '#ffc107', text: '#6d5200', width: '75%' };
  return { label: 'Strong ✅', colour: '#198754', text: '#146c43', width: '100%' };
}

const fields = [
  { name: 'username', label: 'Name:', type: 'text', maxLength: 50, autoComplete: 'name' },
  { name: 'email', label: 'Email address:', type: 'email', maxLength: 100, autoComplete: 'email' },
  { name: 'company_name', label: 'Company Name:', type: 'text', maxLength: 100, autoComplete: 'organization' },
  { name: 'contact_person', label: 'Contact Person:', type: 'text', maxLength: 100, autoComplete: 'off' },
  {
    name: 'phone_number',
    label: 'Phone Number:',
    type: 'tel',
    maxLength: 20,
    autoComplete: 'tel',
    placeholder: 'e.g. +44 7911 123456',
  },
] as const;

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, initial);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const meter = strength(password);

  return (
    <>
      {state.errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <ul className="mb-0">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form action={action} autoComplete="on">
        {fields.map((f) => (
          <div className="mb-3" key={f.name}>
            <label htmlFor={f.name} className="form-label">
              {f.label}
            </label>
            <input
              type={f.type}
              name={f.name}
              id={f.name}
              className="form-control"
              required
              maxLength={f.maxLength}
              autoComplete={f.autoComplete}
              placeholder={'placeholder' in f ? f.placeholder : undefined}
              defaultValue={state.values[f.name] ?? ''}
              key={`${f.name}-${state.values[f.name] ?? ''}`}
            />
          </div>
        ))}

        <div className="mb-3">
          <label htmlFor="pass1" className="form-label">
            Password:
          </label>
          <input
            type="password"
            name="pass1"
            id="pass1"
            className="form-control"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="strength-bar-wrap">
            <div className="strength-bar" style={{ width: meter.width, background: meter.colour }} />
          </div>
          <div className="strength-label" style={{ color: meter.text }} aria-live="polite">
            {meter.label}
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="pass2" className="form-label">
            Confirm Password:
          </label>
          <input
            type="password"
            name="pass2"
            id="pass2"
            className="form-control"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <div className="match-indicator" style={{ color: password === confirm ? '#146c43' : '#b02a37' }}>
            {confirm.length > 0 && (password === confirm ? '✅ Passwords match' : '❌ Passwords do not match')}
          </div>
        </div>

        <button type="submit" className="btn btn-success w-100 py-2" disabled={pending}>
          Create account
        </button>
      </form>
    </>
  );
}
