#!/usr/bin/env bash
# Render start — runs from repo ROOT (Root Directory = blank)
set -o errexit
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT/backend"

if [ -n "$DATABASE_URL" ]; then
  echo "[AthleteForge] Running migrations..."
  python manage.py migrate --no-input
  echo "[AthleteForge] Resetting demo accounts (admin/coach/student)..."
  python manage.py setup_admin
else
  echo "WARNING: DATABASE_URL not set — skipping migrate/setup_admin"
fi

echo "[AthleteForge] Starting gunicorn on port ${PORT:-10000}..."
exec gunicorn athlete_system.wsgi:application \
  --bind "0.0.0.0:${PORT:-10000}" \
  --workers 2 \
  --threads 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -