/**
 * Credential checks, independent of the database so they can be unit tested.
 */
import bcrypt from 'bcryptjs';

export const NOT_FOUND = 'Email address and password not found.';
export const WRONG_PASS = 'Incorrect password.';
export const DEACTIVATED = 'This account has been deactivated. Please contact an administrator.';

/** bcrypt cost factor for new hashes (same as PHP's PASSWORD_DEFAULT). */
const COST = 10;

// Hash of a random throwaway string, used only to equalise response times.
const DUMMY_HASH = '$2y$10$CbW1KJnEJ72vsZzBGZodm.PdssHTyMWPzigNPg0Ru0dlpedDMpSgW';

export type AccountStatus = 'active' | 'inactive' | 'deactivated';
export type Role = 'admin' | 'user';

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  role: Role;
  status: AccountStatus;
  password: string;
}

export type PublicUser = Omit<UserRecord, 'password'>;

export type CheckResult = { ok: true; user: PublicUser } | { ok: false; errors: string[] };

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

/**
 * Check a submitted password against the user row loaded by email (or null if
 * no account has that email). Hashes created by PHP (`$2y$`) and by this app
 * (`$2b$`) are both accepted.
 */
export async function check(user: UserRecord | null, email: string, password: string): Promise<CheckResult> {
  const errors: string[] = [];
  if (email === '') errors.push('Enter your email address.');
  if (password === '') errors.push('Enter your password.');
  if (errors.length > 0) return { ok: false, errors };

  if (user === null) {
    // Still run a hash check so response time does not reveal whether the email exists.
    await bcrypt.compare(password, DUMMY_HASH);
    return { ok: false, errors: [NOT_FOUND] };
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return { ok: false, errors: [WRONG_PASS] };
  }

  // Only reveal that an account is blocked to someone who knows its password.
  if (user.status === 'deactivated') {
    return { ok: false, errors: [DEACTIVATED] };
  }

  const { password: _hash, ...publicUser } = user;
  void _hash;
  return { ok: true, user: publicUser };
}
