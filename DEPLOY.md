# Deploying GreenScore to a home server

This walkthrough puts GreenScore on a small Debian server that you reach over
[Tailscale](https://tailscale.com). Nothing is exposed to your LAN or the internet:
Caddy listens only on the server's Tailscale address, and the app and database
have no published ports at all.

```
 your laptop/phone ──(Tailscale, WireGuard)──► server 100.x.y.z:443
                                                   │
                                     ┌─────────────┴─────────────┐
                                     │  caddy  (HTTPS, headers)  │
                                     │    └─► app (Next.js/Node) │
                                     │          └─► db (MariaDB) │
                                     └───────────────────────────┘
                                         docker compose, prod profile
```

**What you get**
- Docker Compose production profile (`docker-compose.prod.yml`) with Caddy as the reverse proxy.
- HTTPS using a certificate issued by Tailscale, or plain HTTP inside the tailnet.
- Healthchecks on every container, and `restart: unless-stopped` so the stack comes back after a crash or reboot.
- Log rotation.
- A nightly database backup with retention, plus a restore script.

---

## 1. Prerequisites

- Debian 12 (bookworm) or newer, with `sudo` access. 1 GB RAM and 5 GB disk is plenty.
- A Tailscale account.

### Install Docker Engine and the Compose plugin

Use Docker's own repository. Debian's `docker.io` package ships an older Compose that
lacks features this setup needs, and **Compose v2.24 or newer is required**.

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
docker compose version     # must be v2.24 or newer
```

### Install Tailscale

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
tailscale ip -4            # note this 100.x.y.z address
```

For automatic HTTPS, open the Tailscale admin console → **DNS** and make sure
**MagicDNS** is on and **HTTPS Certificates** is enabled. Your server's name is then
`<machine-name>.<tailnet-name>.ts.net`; `tailscale status` shows it.

---

## 2. Get the code

Run GreenScore as a dedicated user, so the backups and the checkout aren't owned by
your own login:

```bash
sudo adduser --system --group --home /opt/greenscore greenscore
sudo usermod -aG docker greenscore
sudo -u greenscore git clone https://github.com/Lancelcode/GreenScore.git /opt/greenscore
cd /opt/greenscore
```

> Membership of the `docker` group is effectively root on that machine. That's normal
> for a single-purpose home server, but don't give it to accounts you don't trust.

---

## 3. Configure

```bash
sudo -u greenscore cp .env.production.example .env
sudo -u greenscore chmod 600 .env
sudo -u greenscore nano .env
```

Fill in:

| Setting | Value |
|---|---|
| `BIND_ADDRESS` | The output of `tailscale ip -4`, e.g. `100.101.102.103` |
| `SITE_ADDRESS` | `greenscore.tailXXXX.ts.net` (your MagicDNS name) for HTTPS, or `http://<machine-name>` for plain HTTP over the tailnet |
| `DB_PASSWORD`, `DB_ROOT_PASSWORD` | Two different long random values: `openssl rand -base64 32 \| tr -d '/+=' \| cut -c1-32` |
| `KEEP_DEMO_DATA` | `0` for a real site (demo accounts are removed). `1` to keep them for a private portfolio demo; if so, change their passwords afterwards. |
| `BACKUP_DIR` | Where nightly backups go, e.g. `/var/backups/greenscore` |

`COMPOSE_FILE` is already set in that file, so every `docker compose` command in
`/opt/greenscore` uses the production profile automatically.

If you choose a `.ts.net` name for HTTPS, Caddy needs the Tailscale socket, which is
mounted from `/var/run/tailscale`. Set `TAILSCALE_SOCKET_DIR` only if it lives
somewhere else.

---

## 4. Start it

```bash
cd /opt/greenscore
sudo -u greenscore docker compose up -d --build --wait
sudo -u greenscore docker compose ps
```

All three services should show `healthy`. On first start the database is created from
`database/gradedunit.sql`. Unless you kept the demo data, it is then emptied by
`database/init-prod/02-production.sh`.

### Create your admin account

```bash
sudo -u greenscore docker compose exec app node scripts/create-admin.mts you@example.com "Your Name"
```

You'll be prompted for the password twice. It must have at least 8 characters,
upper- and lower-case letters and a number. Run the same command later to reset an
admin's password.

### Check it

From any device on your tailnet, open `https://greenscore.tailXXXX.ts.net` (or the
HTTP address you configured). The first HTTPS request can take a few seconds while
Caddy fetches the certificate.

```bash
curl -fsS https://greenscore.tailXXXX.ts.net/health     # → ok
```

From a machine **not** on the tailnet, the site must not respond.

### Optional: firewall

Nothing listens on the LAN, but a default-deny firewall is good hygiene:

```bash
sudo apt-get install -y ufw
sudo ufw default deny incoming
sudo ufw allow in on tailscale0
sudo ufw allow OpenSSH          # if you also SSH over the LAN
sudo ufw enable
```

---

## 5. Nightly backups

`scripts/backup-db.sh` runs `mariadb-dump` inside the database container. It writes a
compressed, timestamped file to `BACKUP_DIR`, checks that the dump is complete, and
deletes backups older than `RETENTION_DAYS` (default 14).

```bash
sudo install -d -o greenscore -g greenscore -m 700 /var/backups/greenscore
sudo -u greenscore /opt/greenscore/scripts/backup-db.sh      # try it once by hand
```

Schedule it with the systemd timer (02:30 each night, with a little random delay; it
also runs at the next boot if the server was off):

```bash
sudo cp /opt/greenscore/deploy/systemd/greenscore-backup.{service,timer} /etc/systemd/system/
# edit User= / paths in the .service file if you didn't use /opt/greenscore
sudo systemctl daemon-reload
sudo systemctl enable --now greenscore-backup.timer
systemctl list-timers greenscore-backup.timer
journalctl -u greenscore-backup.service     # output of past runs
```

Prefer cron? Use this instead of the timer:

```bash
30 2 * * * /opt/greenscore/scripts/backup-db.sh >> /var/log/greenscore-backup.log 2>&1
```

Backups on the same disk don't protect against disk failure. Copy `BACKUP_DIR`
somewhere else from time to time, for example with `rsync` to another machine on your
tailnet.

### Restore

```bash
sudo -u greenscore /opt/greenscore/scripts/restore-db.sh /var/backups/greenscore/greenscore-YYYY-MM-DD_HHMMSS.sql.gz
```

You'll be asked to type `restore` to confirm, because this replaces the current data.
Test a restore once after setting up backups. A backup you have never restored is only
a hope.

---

## 6. Day-to-day

| Task | Command (from `/opt/greenscore`, as `greenscore`) |
|---|---|
| Status | `docker compose ps` |
| Logs | `docker compose logs -f --tail=100 app` (or `caddy`, `db`) |
| Update to the latest code | `git pull && docker compose up -d --build --wait` |
| Restart | `docker compose restart` |
| Stop | `docker compose down` (data is kept in the `db-data` volume) |

Containers restart automatically after a crash, and after a reboot because Docker
starts on boot. Logs are rotated (5 × 10 MB per container).

**Updating MariaDB:** `MARIADB_AUTO_UPGRADE=1` upgrades the system tables when the
image changes. Take a backup first.

**Upgrading a server that ran the PHP version:** take a backup, then run the usual
update command. The database is reused as it is: existing passwords keep working,
and the one new table (`sessions`) is created automatically when the app starts.
Everyone is signed out once, because PHP sessions don't carry over. Old addresses
such as `/pages/auth/login.php` permanently redirect to their new pages.

---

## 7. Troubleshooting

| Symptom | Check |
|---|---|
| `required variable … is missing a value` | A setting in `.env` is empty. See step 3. |
| `ports: !reset` errors | Docker Compose is older than v2.24. Install it from Docker's repository (step 1). |
| Caddy logs `tailscale: … permission denied` or no certificate | HTTPS Certificates must be enabled in the Tailscale admin console, and `/var/run/tailscale/tailscaled.sock` must exist. Or switch `SITE_ADDRESS` to `http://<machine-name>`. |
| `bind: cannot assign requested address` | `BIND_ADDRESS` isn't this machine's current Tailscale IP. Check `tailscale ip -4`. |
| Site shows "temporarily unavailable" | `docker compose logs db app`. Usually the database is still starting, or `DB_PASSWORD` changed after the volume was created (the password is fixed when the volume is first initialised). |
| Locked out after failed logins | Wait 15 minutes, or clear the table: `docker compose exec db sh -c 'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" mariadb -uroot gradedunit -e "DELETE FROM login_attempts"'` |
