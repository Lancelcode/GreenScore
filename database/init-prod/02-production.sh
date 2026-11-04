#!/bin/bash
# Runs once, when the production database volume is first created, after the
# schema and demo data in 01-gradedunit.sql have been loaded.
#
# The demo data contains accounts with publicly documented passwords, so it is
# removed unless KEEP_DEMO_DATA=1 (useful for a private portfolio demo — change
# the demo passwords if you keep it). Create the first real admin afterwards
# with scripts/create-admin.php (see DEPLOY.md).
set -euo pipefail

if [ "${KEEP_DEMO_DATA:-0}" = "1" ]; then
    echo "[greenscore] KEEP_DEMO_DATA=1: keeping demo accounts and data"
    exit 0
fi

echo "[greenscore] Removing demo accounts and data"
# Executable init scripts run in their own shell, so use the client directly
# (the server is only listening on its local socket at this point).
MYSQL_PWD="$MARIADB_ROOT_PASSWORD" mariadb --protocol=socket -uroot "$MARIADB_DATABASE" <<'SQL'
DELETE FROM feedback;
DELETE FROM login_attempts;
-- Cascades to community_tips, green_calculator_results and credit_cards
DELETE FROM new_users;
SQL
