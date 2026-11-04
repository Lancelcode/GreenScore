#!/usr/bin/env bash
# Back up the GreenScore database to a compressed, timestamped SQL file and
# delete backups older than RETENTION_DAYS. Run nightly from systemd (see
# deploy/systemd/) or cron.
#
#   scripts/backup-db.sh
#
# Settings (environment, or the project's .env file):
#   BACKUP_DIR       where to write backups   (default: <project>/backups)
#   RETENTION_DAYS   days of backups to keep  (default: 14)
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Pick up BACKUP_DIR / RETENTION_DAYS from .env without exporting secrets.
if [ -f .env ]; then
    BACKUP_DIR="${BACKUP_DIR:-$(sed -n 's/^BACKUP_DIR=//p' .env | tail -n1)}"
    RETENTION_DAYS="${RETENTION_DAYS:-$(sed -n 's/^RETENTION_DAYS=//p' .env | tail -n1)}"
fi
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

umask 077
mkdir -p "$BACKUP_DIR"

stamp="$(date +%Y-%m-%d_%H%M%S)"
target="$BACKUP_DIR/greenscore-$stamp.sql.gz"
partial="$target.part"
trap 'rm -f "$partial"' EXIT

# The dump runs inside the db container using its own root password, so the
# password never appears in the host's process list or shell history.
docker compose exec -T db sh -c \
    'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" exec mariadb-dump -uroot \
        --single-transaction --routines --triggers --events \
        --default-character-set=utf8mb4 --databases "$MARIADB_DATABASE"' \
    | gzip -9 > "$partial"

# A complete dump always ends with this marker.
if ! gzip -dc "$partial" | tail -n 1 | grep -q 'Dump completed'; then
    echo "ERROR: backup looks incomplete; not keeping it." >&2
    exit 1
fi

mv "$partial" "$target"
trap - EXIT

find "$BACKUP_DIR" -maxdepth 1 -type f -name 'greenscore-*.sql.gz' -mtime +"$RETENTION_DAYS" -print -delete \
    | sed 's/^/Deleted old backup: /'

echo "Backup written: $target ($(du -h "$target" | cut -f1))"
