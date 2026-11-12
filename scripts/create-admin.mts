/**
 * Create an admin account, or promote and reset the password of an existing
 * account with that email. Command line only.
 *
 *   docker compose exec app node scripts/create-admin.mts admin@example.com "Site Admin"
 *   npm run create-admin -- admin@example.com "Site Admin"      (local, reads .env)
 *
 * The password is read from the ADMIN_PASSWORD environment variable if set,
 * otherwise prompted for (hidden) twice. Runs directly on Node.js 22.18+,
 * which understands TypeScript type annotations natively.
 */
import { createInterface } from 'node:readline';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { isEmail, passwordError } from '../src/lib/validator.ts';

function promptHidden(label: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
    const output = rl as unknown as { _writeToOutput: (text: string) => void };
    process.stdout.write(label);
    // Echo nothing while the password is typed.
    output._writeToOutput = () => {};
    rl.question('', (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

function fail(message: string, code = 1): never {
  console.error(message);
  process.exit(code);
}

const [email = '', name = ''] = process.argv.slice(2).map((arg) => arg.trim());
if (!email || !name) {
  fail('Usage: node scripts/create-admin.mts <email> <display name>', 2);
}
if (!isEmail(email) || [...name].length > 50) {
  fail('Give a valid email address and a display name of up to 50 characters.', 2);
}

let password = process.env.ADMIN_PASSWORD ?? '';
let confirm = password;
if (password === '') {
  password = await promptHidden('Password: ');
  confirm = await promptHidden('Confirm password: ');
}
const problem = passwordError(password, confirm);
if (problem) fail(problem);

const connection = await mysql.createConnection({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'greenscore',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'gradedunit',
  charset: 'utf8mb4',
});

try {
  const [result] = await connection.execute<mysql.ResultSetHeader>(
    `INSERT INTO new_users (username, email, password, role, status, company_name, contact_person)
     VALUES (?, ?, ?, 'admin', 'active', 'GreenScore', ?)
     ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'admin', status = 'active'`,
    [name, email, await bcrypt.hash(password, 10), name],
  );
  console.log(`${result.affectedRows === 1 ? 'Created admin' : 'Updated existing account as admin:'} ${email}`);
} finally {
  await connection.end();
}
