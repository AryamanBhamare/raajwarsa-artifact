#!/usr/bin/env bash
# Restore a pg_dump custom-format backup produced by backup.sh.
#   ./scripts/restore.sh backups/raajwarasa-YYYYMMDD-HHMMSS.sql.gz
# Override connection via env: PGHOST PGPORT PGUSER PGDATABASE PGPASSWORD
set -euo pipefail

FILE="${1:?usage: ./scripts/restore.sh <backup-file.sql.gz>}"
[ -f "$FILE" ] || { echo "Backup file not found: $FILE"; exit 1; }

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5433}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-raajwarasa}"
export PGPASSWORD="${PGPASSWORD:-password}"

echo "Restoring $FILE into $PGDATABASE ..."
gunzip -c "$FILE" | pg_restore -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" \
    -d "$PGDATABASE" --no-owner --clean --if-exists
echo "Restore complete."