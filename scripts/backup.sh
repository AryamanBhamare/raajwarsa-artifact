#!/usr/bin/env bash
# pg_dump backup for the Raajwarasa PostgreSQL database.
#   ./scripts/backup.sh [output-dir]      (default: ./backups)
# Override connection via env: PGHOST PGPORT PGUSER PGDATABASE PGPASSWORD
set -euo pipefail

OUT="${1:-./backups}"
mkdir -p "$OUT"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5433}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-raajwarasa}"
export PGPASSWORD="${PGPASSWORD:-password}"

STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$OUT/raajwarasa-$STAMP.sql.gz"

pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -Fc | gzip > "$FILE"
echo "Backup written: $FILE"
echo "Restore with:   ./scripts/restore.sh $FILE"

# Keep the 15 most recent backups.
ls -1t "$OUT"/raajwarasa-*.sql.gz 2>/dev/null | tail -n +16 | xargs -r rm --