<div align="center">

<img src="assets/favicon.svg" alt="GreenScore logo" width="90" height="90" />

# GreenScore

**Sustainability scoring and certification for organisations**

[![CI](https://github.com/Lancelcode/GreenScore/actions/workflows/ci.yml/badge.svg)](https://github.com/Lancelcode/GreenScore/actions/workflows/ci.yml)
![PHP 8.2+](https://img.shields.io/badge/PHP-8.2%2B-777BB4?logo=php&logoColor=white)
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

> Originally built for the Graded Unit 2 Software Development assessment at Edinburgh
> College (2024/25), then containerised, security-reviewed and given automated tests.

## Screenshots

> _Screenshots to be added._
>
> | Home | Green Calculator | Certificate |
> |---|---|---|
> | `docs/screenshots/home.png` | `docs/screenshots/calculator.png` | `docs/screenshots/certificate.png` |

## Tech stack

| Layer | Technology |
|---|---|
| Language | PHP 8.2+ (developed and containerised on 8.3) |
| Database | MariaDB 11.4 (MySQL 8 also works) via `mysqli` prepared statements |
| Web server | Apache 2.4 with `mod_rewrite` |
| Front end | HTML5, CSS3, vanilla JavaScript, Bootstrap 5.3, Font Awesome 6 |
| Tests | PHPUnit 11 |
| Tooling | Docker and Docker Compose, GitHub Actions |

## Architecture

GreenScore is a classic multi-page PHP application: each page is a PHP script that handles
its own form submission and renders HTML. There is no framework; shared behaviour lives in
two places:

```
Browser ──► Apache (.htaccess rules) ──► pages/*.php ──► includes/  (bootstrap, layout, DB connection)
                                                  │
                                                  └──► src/       (business rules, unit tested)
                                                          │
                                                       MariaDB
```

- **`includes/`**: request bootstrap (`init.php`: session hardening, security headers,
  CSRF token, configuration), the database connection and the shared layout (`head`, `nav`,
  `footer`).
- **`src/`**: framework-free classes holding the rules that matter, kept apart from HTML
  and SQL so they can be unit tested:
  - `Scoring`: calculator answers, totals, award levels, shortfall and suggested contribution
  - `Badges`: the fourteen badge levels
  - `Validator`: registration, password policy, community tips and pagination
  - `Auth`: credential and account-status checks
  - `Card`: saved-card validation (Luhn check, expiry); only the last four digits are kept
  - `Csrf`, `Env`: CSRF tokens and environment configuration
- **`pages/`**: one folder per area: `auth`, `calculator`, `community`, `user`, `admin`, `info`.
- **`database/gradedunit.sql`**: schema plus demo data.

### Security measures

- All SQL uses prepared statements; dynamic `ORDER BY` values come from a fixed whitelist.
- All user-supplied output is escaped with `htmlspecialchars`.
- Every state-changing form, logout included, carries a per-session CSRF token.
- Passwords are hashed with bcrypt (`password_hash`), with a password policy and login rate
  limiting (5 failed attempts per IP in 15 minutes).
- Session cookies are `HttpOnly`, `SameSite=Strict`, and `Secure` when served over HTTPS.
  Session IDs are regenerated on login and every 15 minutes, with a 30-minute idle timeout.
- Credentials come from environment variables. Nothing secret is stored in the code.
- Saved cards store only the last four digits, expiry and name, never a full number or CVV.
  Contributions are a **demo**: no payment is taken.
- Apache blocks direct access to `includes/`, `src/`, `database/`, `tests/`, `vendor/` and
  dotfiles.

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

You need PHP 8.2+ with the `mysqli` and `mbstring` extensions, and MariaDB 10.6+ or
MySQL 8.

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

3. Start a server from the project root:

   ```bash
   php -S localhost:8000
   ```

   Open <http://localhost:8000>. PHP's built-in server ignores `.htaccess`, so use it for
   local development only. For Apache (for example XAMPP), put the project in the web root
   with `AllowOverride All`. If it is served from a sub-folder, update the `ErrorDocument`
   paths in `.htaccess` to match.

No `composer install` is needed to run the site. Composer is only used for the tests.

## Running the tests

```bash
composer install
vendor/bin/phpunit            # or: composer test
composer lint                 # php -l on every file
```

The unit tests cover the scoring rules and award boundaries, badge levels, registration
and password validation, credential and account-status checks, CSRF tokens, card
validation and configuration parsing.

GitHub Actions runs the lint and the tests on PHP 8.2 and 8.3 for every push and pull
request, then builds the Docker stack and smoke-tests it.

## Project structure

```
.
├── index.php, 403.php, 404.php, health.php, style.css, .htaccess
├── pages/              auth, calculator, community, user, admin, info
├── includes/           bootstrap, DB connection, layout partials
├── src/                business rules (unit tested)
├── tests/Unit/         PHPUnit tests
├── database/           schema and demo data
├── assets/             images, badge illustrations, PDF guides
├── docker/             PHP and Apache configuration for the image
├── Dockerfile, docker-compose.yml, .env.example
└── .github/workflows/  CI
```

## Author

**Djiby Sow Rebollo** · [GitHub @Lancelcode](https://github.com/Lancelcode)

## Licence

Released under the [MIT Licence](LICENSE).
