# Deploying GreenScore to Vercel (public demo)

This puts GreenScore online as a public demo: always available, free, with
one-click demo logins and all data reset every night. It is the setup behind
the live link in the README.

Vercel runs the Next.js app; the data lives in a hosted MySQL-compatible
database, because Vercel does not host MySQL itself.

```
 visitors ──► Vercel (Next.js, HTTPS) ──TLS──► hosted MySQL-compatible database
                    │
                    └── Vercel Cron, 03:00 UTC ──► /api/cron/reset-demo
```

For a private server you control, see [DEPLOY.md](DEPLOY.md) instead.

---

## 1. Create the database

Any MySQL 8-compatible service with a free tier works, for example
[TiDB Cloud Serverless](https://www.pingcap.com/tidb-cloud-serverless/) or
[Aiven for MySQL](https://aiven.io/mysql). Free tiers change over time, so check
the current limits when you sign up. GreenScore's demo data is tiny.

1. Create a free instance. Any empty database on it will do, including the
   `test` database most providers create for you.
2. Note the connection details: host, port, user, password and database name.
   Hosted databases require encrypted connections. If the provider offers a
   **CA certificate**, download it too (TiDB Cloud doesn't need one; Aiven does).

You don't need to import anything by hand. The first run of the reset job
(step 3) creates the tables and loads the demo data.

## 2. Create the Vercel project

1. In Vercel, choose **Add New → Project** and import the `GreenScore` repository.
   Vercel detects Next.js; keep the default build settings.
2. Before the first deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `DB_HOST` | the database host |
   | `DB_PORT` | the database port (often `3306` or `4000`) |
   | `DB_USER` | the database user |
   | `DB_PASSWORD` | the database password |
   | `DB_NAME` | the database name, e.g. `test` |
   | `DB_SSL` | `1` |
   | `DB_SSL_CA` | the CA certificate's contents, only if your provider gave you one |
   | `DB_POOL_SIZE` | `3` (free databases allow few connections) |
   | `TRUST_PROXY` | `1` (Vercel serves HTTPS, so session cookies are marked Secure) |
   | `DEMO_MODE` | `1` |
   | `CRON_SECRET` | a long random string, e.g. from `openssl rand -hex 32` |

3. Deploy. The site is live at `https://<project-name>.vercel.app`. Every push to
   `main` redeploys it automatically.

## 3. Check it

- `https://<project-name>.vercel.app/health` answers `ok` when the database is reachable.
- In Vercel, **Settings → Cron Jobs** lists `/api/cron/reset-demo` (from
  `vercel.json`), running daily at 03:00 UTC. **Run** it once by hand. On an
  empty database this first run creates the tables and loads the demo data, and
  answers `{"ok":true,"installed":true,…}`. Until then the pages show
  "Temporarily unavailable".
- The login page shows **Demo member** and **Demo admin** buttons.

## How the demo protects itself

- **Nightly reset.** Every table is restored to `database/gradedunit.sql`, so
  anything visitors add, change or delete is gone by the morning, and everyone
  is signed out.
- **Locked demo accounts.** On the demo site the two shared accounts can't be
  edited, demoted, deactivated, deleted or given a new password, so one visitor
  can't lock the next one out. Other accounts, including ones visitors register,
  behave normally.
- **The reset endpoint is closed by default.** It answers 404 unless both
  `DEMO_MODE=1` and `CRON_SECRET` are set, and 401 without the secret.

## Using the demo mode elsewhere

Demo mode isn't tied to Vercel. On the Docker setup, add `DEMO_MODE=1` and
`CRON_SECRET` to the `app` service's environment, and call the reset from any
scheduler, e.g. a crontab line on the server:

```bash
0 3 * * * curl -fsS -H "Authorization: Bearer <CRON_SECRET>" https://<your-site>/api/cron/reset-demo
```
