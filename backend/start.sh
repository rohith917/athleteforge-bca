#!/usr/bin/env bash
# Render start script - do NOT run migrate here (build.sh already does it)
set -o errexit

if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set."
  echo "Fix: Render Dashboard -> athleteforge-bca -> Environment -> Add DATABASE_URL from athleteforge-db"
fi

exec gunicorn athlete_system.wsgi:application --bind 0.0.0.0:${PORT:-10000} --workers 2 --threads 2 --timeout 120