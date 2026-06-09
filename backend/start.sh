#!/usr/bin/env bash
# Render start script — migrate/seed then serve SPA + API
set -o errexit

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "Fix: Render Dashboard -> athleteforge-bca -> Environment"
  echo "     Add DATABASE_URL from PostgreSQL database athleteforge-db"
  exit 1
fi

echo "[AthleteForge] Running migrations..."
python manage.py migrate --no-input

echo "[AthleteForge] Loading demo data..."
python manage.py seed_data

echo "[AthleteForge] Ensuring demo accounts..."
python manage.py setup_admin

echo "[AthleteForge] Starting gunicorn on port ${PORT:-10000}..."
exec gunicorn athlete_system.wsgi:application \
  --bind "0.0.0.0:${PORT:-10000}" \
  --workers 2 \
  --threads 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -