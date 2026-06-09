#!/bin/sh
set -e

PORT="${PORT:-8000}"

echo "[AthleteForge] Running database migrations..."
python manage.py migrate --no-input

echo "[AthleteForge] Loading demo data..."
python manage.py seed_data

echo "[AthleteForge] Ensuring demo admin/coach/student accounts..."
python manage.py setup_admin

echo "[AthleteForge] Starting gunicorn on 0.0.0.0:${PORT}..."
exec gunicorn athlete_system.wsgi:application \
  --bind "0.0.0.0:${PORT}" \
  --workers 2 \
  --threads 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -