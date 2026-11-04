#!/usr/bin/env bash
# Restore the GreenScore database from a backup made by backup-db.sh.
# This REPLACES the current data.
#
#   scripts/restore-db.sh backups/greenscore-2026-01-31_023000.sql.gz
set -euo pipefail

if [ $# -ne 1 ] || [ ! -f "$1" ]; then
    echo "Usage: $0 <backup.sql.gz>" >&2
    exit 2
fi
backup="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ "${ASSUME_YES:-0}" != "1" ]; then
    read -r -p "Replace the current GreenScore database with $(basename "$backup")? Type 'restore' to continue: " answer
    [ "$answer" = "restore" ] || { echo "Cancelled."; exit 1; }
fi

gzip -dc "$backup" | docker compose exec -T db sh -c \
    'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" exec mariadb -uroot'

echo "Restored from $(basename "$backup")."
