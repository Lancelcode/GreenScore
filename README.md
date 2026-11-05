
<div align="center">

<img src="assets/favicon.svg" alt="GreenScore Logo" width="90" height="90" />

# 🌱 GreenScore

**Sustainability Tracking & Certification Web Application**

[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-MariaDB-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![PHPUnit](https://img.shields.io/badge/PHPUnit-11.5-366488?style=for-the-badge&logo=php&logoColor=white)](https://phpunit.de/)
[![Tests](https://img.shields.io/badge/Tests-42%20passing-198754?style=for-the-badge)](#-testing)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

*Empowering organisations to measure, track, and showcase their environmental impact — with structured scoring, digital certificates, and community engagement.*

[🚀 Getting Started](#%EF%B8%8F-installation) · [✨ Features](#-key-features) · [🧪 Tests](#-testing) · [🛡️ Security](#%EF%B8%8F-security) · [🗄️ Database](#%EF%B8%8F-database)

</div>

---

## 📌 About the Project

**GreenScore** is a full-stack sustainability platform built with PHP and MySQL. Organisations complete a structured environmental assessment across **10 categories**, earn one of **14 progressive badge levels**, and receive official downloadable **certificates** — Gold, Silver, Bronze, or Participation — based on their cumulative performance.

The platform includes a community tip board, a user feedback system, a secure contribution flow for upgrading certificates, a comprehensive admin dashboard, dark mode, and a full toast notification system — all built with a strong emphasis on security best practices.

> 🎓 Developed as part of the **Graded Unit 2 Software Development** assessment at **Edinburgh College** — Academic Year 2024/2025.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Registration, login, logout, password reset, session-based role management |
| 🧮 Green Calculator | 10-category assessment rated RED / AMBER / GREEN — score out of 100 |
| 🏅 14 Badge Levels | Progressive badges from Green Starter to Champion of Sustainability |
| 📄 Certificates | Gold / Silver / Bronze / Participation — real submission date, company name, certificate ref number, print-to-PDF |
| 📜 Certificate History | Responsive card layout — colour-coded by award, score bar, filter by level, sort by date |
| 💸 Buy Points | Contribute to close a score gap and upgrade a certificate to Gold |
| 📊 My Impact | Personal dashboard — badge level, green answer count, contribution total, progress bar |
| 📝 Community Board | Paginated tip board with keyword search, character counter, create/edit/delete per user |
| 📬 Feedback System | User submission with admin response panel and public visibility toggle |
| 👥 Admin Dashboard | Role/status management, user editing, feedback moderation |
| 🌙 Dark Mode | Full dark mode with `localStorage` persistence across page navigation |
| 🔔 Toast Notifications | Dismissible floating toasts sitewide — success, error, warning, info |

---

## 🛡️ Security

Security was a core design priority throughout development:

| Protection | Implementation |
|---|---|
| Password hashing | `password_hash()` with bcrypt — auto-salted, unique per user |
| SQL injection | Prepared statements with bound parameters across all 44 PHP files |
| CSRF protection | Token generated once per session in `init.php`, validated on every state-changing form |
| Session fixation | `session_regenerate_id(true)` immediately on login; periodic regeneration every 15 min |
| Idle timeout | Session destroyed after 30 minutes of inactivity |
| Login rate limiting | IP blocked after 5 failed attempts in 15 minutes — recorded in `login_attempts` table |
| Password complexity | Min 8 chars, uppercase + lowercase + number required, common passwords blocked |
| Cookie flags | `HttpOnly`, `SameSite=Strict` on session cookie |
| Security headers | `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `X-XSS-Protection`, `Permissions-Policy` |
| Role-based access | Admin routes return HTTP 403 if accessed without correct session role |
| Output sanitisation | All user data escaped with `htmlspecialchars()` before rendering |
| `.htaccess` | Blocks direct GET to `includes/`, blocks `.sql/.env/.log` files, custom 403/404 pages |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.2 |
| Database | MySQL / MariaDB via XAMPP |
| Frontend | HTML5, CSS3, JavaScript (ES6) |
| UI Framework | Bootstrap 5.3 |
| Icons | Font Awesome 6.4 |
| Testing | PHPUnit 11.5 (via phar) |
| Dev Environment | XAMPP, phpMyAdmin, PHPStorm |

---

## Database

Six tables with foreign key constraints and cascading deletes:

| Table | Purpose |
|---|---|
| `new_users` | Accounts, roles (`admin`/`user`), statuses, company details |
| `green_calculator_results` | Scores, award levels, badge data, donation records |
| `community_tips` | User-submitted tips with ownership |
| `feedback` | Messages, admin responses, public visibility flag |
| `credit_cards` | Saved card details per user. **Demo only:** card numbers and CVVs are stored in plain text, so do not enter real card details. The schema has no seed data. |
| `login_attempts` | IP-based rate limiting records |

The full schema with seed data is available at [`database/gradedunit.sql`](database/gradedunit.sql).

---

## Project Structure

```
/
├── index.php                    ← Home page
├── style.css                    ← Global stylesheet (CSS variables, dark mode, responsive)
├── .htaccess                    ← Security rules, error routing
├── 403.php / 404.php            ← Custom error pages
├── assets/
│   ├── favicon.svg
│   ├── images/                  ← Backgrounds, 14 badge illustrations, partner logos
│   └── documents/               ← Downloadable PDF guides
├── includes/
│   ├── init.php                 ← Session bootstrap, security headers, CSRF, BASE_URL
│   ├── connect_db.php           ← Database connection
│   ├── nav.php                  ← Navigation (active highlighting, dark mode toggle)
│   ├── footer.php               ← Toast system, back-to-top, dark mode JS
│   ├── head.php                 ← Favicon, theme-color, stylesheet links
│   ├── helpers.php              ← isActive(), renderEditButton(), renderRoleStatusForms()
│   ├── login_tools.php          ← validate() with password_verify
│   ├── login_action.php         ← Login POST handler with rate limiting
│   └── modals.php               ← Register/login modal components
├── pages/
│   ├── auth/                    ← login, logout, register, register_action, forgot_password
│   ├── admin/                   ← admin_feedback, manage_users, edit_user, public_feedback, process_feedback_admin
│   ├── calculator/              ← green_calculator, certificate_history, certificate_preview, buy_points
│   ├── community/               ← community, post_tip, edit_tip, delete_tip, clear_tips
│   ├── user/                    ← user_account, my_impact, view_cards, manage_credit_card
│   └── info/                    ← about, partner, privacy, terms, green_resources, feedback, greenscore_copyright
├── database/
│   └── gradedunit.sql           ← Full schema with seed data
└── tests/
    ├── LoginTest.php
    ├── GreenCalculatorTest.php
    ├── CommunityTipsTest.php
    ├── PaymentTest.php
    └── fake_login_tools.php     ← Session simulation helper for testing
```

---

## Testing

**42 tests — 63 assertions — all passing**

| Test Class | What it covers |
|---|---|
| `LoginTest` | `password_verify()` path, correct session keys, wrong password, unknown email, admin role |
| `GreenCalculatorTest` | All 4 award thresholds by boundary value, all-green/amber/red scoring, shortfall and cost |
| `CommunityTipsTest` | Message validation, trimming, HTML escaping, auth guard, ownership check, pagination |
| `PaymentTest` | Cost from shortfall, clamping (min/max), formatting, float conversion, post-payment state |

A `fake_login_tools.php` helper simulates authenticated session state for testing protected routes without a live database connection.

```bash
php phpunit.phar --testdox --colors=never
```

---

## ⚙️ Installation

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) with Apache + MySQL
- PHP 8.2+

### 1. Clone

```bash
git clone https://github.com/Lancelcode/Graded-Unit-2-webpage.git
```

### 2. XAMPP Setup

- Start **Apache** and **MySQL** in the XAMPP control panel
- Place the project folder in `C:/xampp/htdocs/`

### 3. Database

- Open **phpMyAdmin** at `http://localhost/phpmyadmin`
- Create a database named `gradedunit`
- Import `database/gradedunit.sql`
- Default credentials in `includes/connect_db.php`: host `localhost`, user `root`, password empty

### 4. Open

```
http://localhost/Graded-Unit-2-webpage/
```

### Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@greenscore.com` | *(set in your DB)* |
| User | `joe@joe.com` | *(set in your DB)* |

---
##  Author

**Djiby Sow Rebollo**

[![GitHub](https://img.shields.io/badge/GitHub-@Lancelcode-181717?style=for-the-badge&logo=github)](https://github.com/Lancelcode)

Edinburgh College — Software Development
Graded Unit 2 — Academic Year 2024/2025

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

*Built with 💚 to make sustainability measurable.*

</div>
