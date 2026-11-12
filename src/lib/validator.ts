/**
 * Input validation rules shared by the registration form, the admin user
 * editor, the community board and anywhere else user input is accepted.
 */
import type { FieldSource } from './scoring';

export const COMMON_PASSWORDS: readonly string[] = [
  'password', 'password1', '12345678', '123456789', 'qwerty123',
  'iloveyou', 'sunshine', 'princess', 'letmein1', 'welcome1',
  'monkey123', 'dragon12', 'football', 'baseball', 'abc12345',
];

export const TIP_MAX_LENGTH = 500;

/** Length in characters (Unicode code points), not UTF-16 units or bytes. */
export function charLength(value: string): number {
  return [...value].length;
}

const byteLength = (value: string): number => new TextEncoder().encode(value).length;

/** A form value as a string, or '' when it is missing or not a string (e.g. a file). */
export function field(input: FieldSource, name: string): string {
  const value = input.get(name);
  return typeof value === 'string' ? value : '';
}

/**
 * Returns the first password rule that fails, or null if the password is
 * acceptable. Passwords are not trimmed: spaces are significant.
 */
export function passwordError(password: string, confirm: string): string | null {
  if (password === '') return 'Enter your password.';
  if (byteLength(password) < 8) return 'Password must be at least 8 characters.';
  // bcrypt silently ignores everything after 72 bytes, so reject longer passwords.
  if (byteLength(password) > 72) return 'Password cannot exceed 72 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return 'That password is too common. Please choose a stronger one.';
  }
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

const EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

/** A well-formed address whose domain ends in a real-looking TLD (2+ letters). */
export function isEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_PATTERN.test(email) && /\.[a-zA-Z]{2,}$/.test(email);
}

export interface RegistrationData {
  username: string;
  email: string;
  companyName: string;
  contactPerson: string;
  phoneNumber: string;
  password: string;
}

export function registration(input: FieldSource): { errors: string[]; data: RegistrationData } {
  const data: RegistrationData = {
    username: field(input, 'username').trim(),
    email: field(input, 'email').trim(),
    companyName: field(input, 'company_name').trim(),
    contactPerson: field(input, 'contact_person').trim(),
    phoneNumber: field(input, 'phone_number').trim().replace(/[^\d+\-\s()]/g, '').trim(),
    password: field(input, 'pass1'),
  };
  const confirm = field(input, 'pass2');
  const errors: string[] = [];

  // Length limits match the new_users column sizes.
  if (data.username === '') errors.push('Enter your name.');
  else if (charLength(data.username) > 50) errors.push('Name cannot exceed 50 characters.');

  if (data.email === '') errors.push('Enter your email address.');
  else if (data.email.length > 100) errors.push('Email cannot exceed 100 characters.');
  else if (!isEmail(data.email)) errors.push('Enter a valid email address (e.g. name@example.com).');

  if (data.companyName === '') errors.push('Enter your company name.');
  else if (charLength(data.companyName) > 100) errors.push('Company name cannot exceed 100 characters.');

  if (data.contactPerson === '') errors.push("Enter the contact person's name.");
  else if (charLength(data.contactPerson) > 100) errors.push("Contact person's name cannot exceed 100 characters.");

  const digits = data.phoneNumber.replace(/\D/g, '');
  if (data.phoneNumber === '') errors.push('Enter a phone number.');
  else if (digits.length < 7) errors.push('Phone number must have at least 7 digits.');
  else if (digits.length > 15) errors.push('Phone number cannot exceed 15 digits (international standard).');
  else if (data.phoneNumber.length > 20) errors.push('Phone number cannot exceed 20 characters.');

  const pwError = passwordError(data.password, confirm);
  if (pwError !== null) errors.push(pwError);

  return { errors, data };
}

/** Normalise a community tip: the trimmed message, or null if empty or too long. */
export function tipMessage(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const message = raw.trim();
  if (message === '' || charLength(message) > TIP_MAX_LENGTH) return null;
  return message;
}

/** Page number from a query-string value: always an integer >= 1. */
export function pageNumber(raw: unknown): number {
  const value = typeof raw === 'string' && /^-?\d+$/.test(raw.trim()) ? Number.parseInt(raw, 10) : 1;
  return Math.max(1, value);
}

export function offset(page: number, perPage: number): number {
  return (Math.max(1, page) - 1) * perPage;
}

export function totalPages(total: number, perPage: number): number {
  return perPage > 0 ? Math.ceil(total / perPage) : 0;
}

/** A positive integer id from a form field or URL segment, or null. */
export function positiveId(raw: unknown): number | null {
  if (typeof raw !== 'string' || !/^\d{1,10}$/.test(raw)) return null;
  const id = Number.parseInt(raw, 10);
  return id > 0 && id <= 4_294_967_295 ? id : null;
}
