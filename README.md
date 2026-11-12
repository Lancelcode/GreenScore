<div align="center">

<img src="public/assets/favicon.svg" alt="GreenScore logo" width="90" height="90" />

# GreenScore

**Sustainability scoring and certification for organisations**

[![CI](https://github.com/Lancelcode/GreenScore/actions/workflows/ci.yml/badge.svg)](https://github.com/Lancelcode/GreenScore/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MariaDB](https://img.shields.io/badge/MariaDB-11.4-003545?logo=mariadb&logoColor=white)
![Bootstrap 5.3](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)
[![Licence: MIT](https://img.shields.io/badge/Licence-MIT-blue)](LICENSE)

</div>

---

## What GreenScore does

GreenScore helps an organisation measure how sustainable its everyday practices are and
shows its progress over time.

- **Green Calculator.** A ten-question assessment covering waste, energy, water, supply
  chain, products, buildings, transport, community, carbon offsetting and reporting. Each
  answer is rated Green (10 points), Amber (5) or Red (0), giving a score out of 100.
- **Certificates.** Each assessment earns Gold (80+), Silver (65–79), Bronze (51–64) or
  Participation, issued as a printable certificate with a reference number.
- **Badges.** Fourteen badge levels, from *Green Starter* to *Champion of Sustainability*,
  based on the total number of Green answers across all assessments.
- **Community board.** Members share practical tips; the board can be searched and paged.
- **Feedback.** Members send feedback, and admins reply and choose what is published.
- **Admin area.** Manage user roles and account status, edit details, reset passwords and
  moderate feedback.

> Originally built in PHP for the Graded Unit 2 Software Development assessment at
> Edinburgh College (2024/25), then containerised, security-reviewed, given automated
> tests and, in version 2.0, rewritten in TypeScript.

## From PHP to TypeScript

GreenScore started life as a classic PHP application: about forty PHP scripts, each one
handling its own form, running its own SQL and printing its own HTML. It worked, and it
was hardened and tested over time, but version 2.0 is a complete port to **TypeScript**
with **Next.js** and **React**. Every feature, page and rule was carried across; only
the language and the architecture underneath changed. These are the reasons.

### 1. One language from the database to the browser

The PHP version was really two codebases in two languages: PHP on the server, and
JavaScript in `<script>` tags for the password-strength meter, character counters, dark
mode and the "delete without reloading" buttons. The end-to-end tests were a third,
written in TypeScript. Now the pages, the server logic, the browser interactions, the
unit tests, the end-to-end tests and the build configuration are all TypeScript. A rule
written once can be used everywhere: the password meter in the browser and the password
check on the server read the same list of banned passwords from the same file.

### 2. Mistakes are caught before the code runs

PHP only discovers most errors when a page is actually visited. TypeScript checks the
whole program every time it is built. Every database row, form field and component has a
declared shape, so the compiler refuses to build if, for example, a page forgets that a
company name may be empty, passes a score where a certificate id is expected, or misspells
a column. The project uses TypeScript's strictest settings, and the continuous
integration pipeline will not pass a change that fails the type check.

### 3. Shared building blocks instead of copy and paste

Every PHP page repeated the same opening: start the session, check the login, include the
header and navigation, add a CSRF field to every form, include the footer. Changing the
layout meant editing dozens of files. In React each of these is a component written once:
`<PageShell>` provides the navigation, footer, toast messages and background; a single
`requireUser()` call protects a member page; `<ConfirmForm>` is reused for every
"are you sure?" action. The same goes for SQL: it now goes through one small database module
instead of `mysqli_prepare` boilerplate repeated on every page.

### 4. Safer by default

In PHP, security depended on remembering to do the right thing every time: escape every
value with `htmlspecialchars`, add the CSRF token to every form, check it in every handler.
Forgetting once opened a hole. In the new version the safe behaviour is automatic:

- **Output escaping.** React escapes everything it renders, so a tip containing `<script>`
  is shown as text, never run.
- **Cross-site request forgery.** Forms submit to Next.js *Server Actions*, which reject
  requests coming from other websites. On top of that, the session cookie is `SameSite=Strict`.
- **Sessions you can revoke.** Sessions are now stored in the database (only a SHA-256
  hash of each token). Deactivating an account, demoting an admin or resetting a password
  takes effect on that user's very next click, instead of when their PHP session happens
  to expire.

### 5. Modern, reproducible tooling

The PHP version shipped minified copies of Bootstrap and Font Awesome inside the
repository. Now every dependency is an npm package with an exact version recorded in
`package-lock.json`, so anyone can rebuild exactly the same app. Code quality is checked
by ESLint, the business rules by 85 Vitest unit tests, and the whole site in a real browser by
Playwright, all on every push.

### 6. Simpler to run

Instead of Apache, PHP extensions and `.htaccess` rewrite rules, the app is a single Node.js
process. Next.js builds a self-contained server that goes into a small Docker image running
as a non-root user. Only files in `public/` are ever served, so source code, configuration
and the database dump can't be downloaded by mistake.

### What stayed the same, and how we know it works

- **The database.** The same MariaDB schema and demo data. The only addition is a
  `sessions` table, which the app creates by itself on an existing database.
- **Accounts.** Existing bcrypt password hashes created by PHP are accepted, so nobody
  has to reset their password.
- **The look and every feature.** The same Bootstrap design, photos, badges and
  certificates.
- **Old links.** Every old address (for example `/pages/auth/login.php`) permanently
  redirects to its new page, so bookmarks and printed links keep working.
- **The proof.** The Playwright suite that checked the PHP site was pointed at the new
  one, changing only the addresses. It covers sign-up, login, the calculator, certificates,
  Buy Points, the community board, the admin pages, phone layouts, keyboard use and a
  WCAG 2.1 AA accessibility scan of every page, and it passes in full (51 tests). The PHP
  unit tests were ported to Vitest case by case (85 tests).

## Screenshots

> _Screenshots to be added._
>
> | Home | Green Calculator | Certificate |
> |---|---|---|
> | `docs/screenshots/home.png` | `docs/screenshots/calculator.png` | `docs/screenshots/certificate.png` |

## Tech stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.9 (strict mode) |
| Framework | Next.js 16 (App Router, Server Components, Server Actions) on Node.js 22 |
| UI | React 19, Bootstrap 5.3, Font Awesome 6, animate.css |
| Database | MariaDB 11.4 (MySQL 8 also works) via `mysql2` prepared statements |
| Passwords | bcrypt (`bcryptjs`), compatible with hashes created by the PHP version |
| Tests | Vitest (unit), Playwright with axe-core (end-to-end, accessibility, mobile) |
| Tooling | ESLint, Docker and Docker Compose, Caddy, GitHub Actions |

## Architecture

```
Browser ──► Next.js server ──► src/proxy.ts           (admin pages: 403 unless admin)
                 │
                 ├─► src/app/**/page.tsx               (Server Components: read data, render HTML)
                 ├─► src/server/actions/*.ts           (Server Actions: handle form submissions)
                 │        │
                 │        ├─► src/server/             (database, sessions, rate limiting, toasts)
                 │        └─► src/lib/                (business rules, unit tested, no I/O)
                 │                 │
                 └──────────────── MariaDB
```

- **`src/app/`**: one folder per page (`calculator/`, `certificates/[id]/`, `admin/users/`
  and so on). Pages are React Server Components: they run on the server, query the
  database and send finished HTML, so the site works and is fast even before any
  JavaScript loads. Small interactive pieces (the calculator result, the password meter,
  the tip editor) are client components.
- **`src/server/actions/`**: Server Actions, the functions forms submit to. Each one
  checks who is signed in, validates its input and only then touches the database.
- **`src/server/`**: the database pool (`db.ts`), database-backed sessions
  (`session.ts`), login rate limiting (`rate-limit.ts`) and one-off toast messages
  (`flash.ts`).
- **`src/lib/`**: plain TypeScript holding the rules that matter, with no database or
  framework code so they can be unit tested:
  - `scoring.ts`: calculator answers, totals, award levels, shortfall and suggested contribution
  - `badges.ts`: the fourteen badge levels
  - `validator.ts`: registration, password policy, community tips and pagination
  - `auth.ts`: credential and account-status checks
  - `card.ts`: saved-card validation (Luhn check, expiry); only the last four digits are kept
  - `format.ts`: dates and certificate references
- **`src/components/`**: the shared page frame, navigation, footer and small reusable pieces.
- **`database/gradedunit.sql`**: schema plus demo data.

### Security measures

- All SQL uses `?` placeholders (prepared statements); sort orders come from fixed choices.
- React escapes all rendered output.
- Forms post to Server Actions, which reject cross-site requests; the session cookie is
  `HttpOnly`, `SameSite=Strict`, and `Secure` when served over HTTPS.
- Sessions live in the database as SHA-256 hashes of random 256-bit tokens, with a 30-minute
  idle timeout and a 12-hour maximum. A new token is issued at every login, and role and
  status are re-read on every request.
- Admin pages are blocked with HTTP 403 before they render, and every admin action checks the
  role again.
- Passwords are hashed with bcrypt and must meet a password policy. Logins are rate limited
  (5 failures per IP address and 10 per account in 15 minutes).
- Credentials come from environment variables. Nothing secret is stored in the code.
- Saved cards store only the last four digits, expiry and name, never a full number or CVV.
  Contributions are a **demo**: no payment is taken.
- Security headers on every response (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`); front-end libraries are bundled, so pages make
  no third-party requests.

## Running with Docker (recommended)

You need Docker with the Compose plugin.

```bash
git clone https://github.com/Lancelcode/GreenScore.git
cd GreenScore
docker compose up
```

Then open <http://localhost:8080>. The first start creates the database and loads the
demo data. Stop with <kbd>Ctrl</kbd>+<kbd>C</kbd>, or run `docker compose down -v` to also
delete the database volume and start fresh next time.

No configuration is needed. To change the port or passwords, copy `.env.example` to `.env`
and edit it before starting.

### Demo accounts

These accounts exist only in the demo data. Change or remove them on any public server.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@greenscore.com` | `GreenAdmin2026` |
| User | `hello@ecoventures.com` | `GreenDemo2026` |

All other seeded users have the password `GreenDemo2026`, and all seeded admins have
`GreenAdmin2026`. `info@blueplanet.co.uk` is deactivated, to show that blocked accounts
can't sign in. You can also register a new account.

## Running without Docker

You need Node.js 22.18 or newer, and MariaDB 10.6+ or MySQL 8.

1. Create a database and a user, then import the schema:

   ```bash
   mysql -u root -p -e "CREATE DATABASE gradedunit CHARACTER SET utf8mb4;
     CREATE USER 'greenscore'@'localhost' IDENTIFIED BY 'choose-a-password';
     GRANT ALL ON gradedunit.* TO 'greenscore'@'localhost';"
   mysql -u root -p gradedunit < database/gradedunit.sql
   ```

2. Configure the connection:

   ```bash
   cp .env.example .env
   # then set DB_HOST=127.0.0.1 and DB_PASSWORD=choose-a-password
   ```

3. Install the dependencies and start the development server:

   ```bash
   npm ci
   npm run dev
   ```

   Open <http://localhost:3000>. For a production build, run `npm run build` and then
   `npm start`.

### Creating an admin account

```bash
npm run create-admin -- you@example.com "Your Name"
```

You'll be asked for the password twice. Running the same command for an existing email
promotes that account to admin and resets its password. With Docker, use
`docker compose exec app node scripts/create-admin.mts you@example.com "Your Name"`.

## Running the tests

```bash
npm test             # unit tests (Vitest)
npm run lint         # ESLint
npm run typecheck    # TypeScript
```

The unit tests cover the scoring rules and award boundaries, badge levels, registration
and password validation, credential and account-status checks (including PHP-era password
hashes), card validation, client IP handling and date formatting.

### End-to-end, accessibility and mobile tests

Playwright drives a real browser against the running site. It covers:

- sign-up, login and logout;
- the calculator, certificates and Buy Points;
- community tips and the admin pages;
- an [axe](https://github.com/dequelabs/axe-core) WCAG 2.1 AA scan of every page;
- keyboard navigation;
- layout checks on a phone-sized screen;
- redirects from the old PHP addresses.

```bash
docker compose up -d --wait
npx playwright install chromium   # first time only
npm run e2e
npx playwright show-report        # HTML report with traces of any failures
```

Set `E2E_BASE_URL` to test a different address. The tests create their own users and
tips, so run them against a disposable database (`docker compose down -v` resets it).

GitHub Actions runs lint, the type check, the unit tests and a production build on every
push and pull request, smoke-tests the Docker stack, then runs the Playwright suite against it.

## Deploying

[DEPLOY.md](DEPLOY.md) walks through running GreenScore on a small Debian home server
reached over Tailscale. It covers the production Compose profile, Caddy with HTTPS,
healthchecks, restart policies, nightly database backups and restores, and upgrading a
server that ran the PHP version.

## Project structure

```
.
├── src/
│   ├── app/            pages and routes (one folder per page), global and page styles
│   ├── components/     page frame, navigation, footer, shared UI
│   ├── lib/            business rules (unit tested)
│   ├── server/         database, sessions, rate limiting, toasts, Server Actions
│   ├── proxy.ts        admin-only gate (HTTP 403)
│   └── instrumentation.ts  start-up schema check
├── public/assets/      images, badge illustrations, PDF guides
├── tests/unit/         Vitest unit tests
├── e2e/                Playwright end-to-end and accessibility tests
├── database/           schema, demo data and production init script
├── scripts/            create-admin, backup and restore tools
├── deploy/             Caddyfile and systemd backup timer
├── Dockerfile, docker-compose.yml, docker-compose.prod.yml, .env.example
└── .github/workflows/  CI
```

## Author

**Djiby Sow Rebollo** · [GitHub @Lancelcode](https://github.com/Lancelcode)

## Licence

Released under the [MIT Licence](LICENSE).
